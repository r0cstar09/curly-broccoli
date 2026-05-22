import { type Product, getProducts } from 'storefront:client';
import type { AstroCookies } from 'astro';
import { getDb } from '~/lib/db.ts';
import { type Cart, type CartData, cartDataSchema, expandLineItem } from './cart.ts';

const CART_COOKIE_NAME = 'cart';
const CART_ID_COOKIE_NAME = 'cart_id';

export function parseCartData(input: unknown): CartData {
	return cartDataSchema.catch(() => ({ items: [] })).parse(input);
}

export async function expandCartData(cartData: CartData): Promise<Cart> {
	const productsResponse = await getProducts({
		query: {},
	});
	if (!productsResponse.data) {
		throw new Error('Failed to fetch products', { cause: productsResponse.error });
	}

	const items = expandCartDataFromProducts(cartData, productsResponse.data.items);

	return { items };
}

export function expandCartDataFromProducts(cartData: CartData, products: Product[]) {
	return cartData.items
		.map((item) => {
			const product = products.find((product) =>
				product.variants.some((variant) => variant.id === item.productVariantId),
			);
			if (!product) {
				console.warn(`Product not found for variant ${item.productVariantId}`);
				return;
			}
			return expandLineItem(item, product);
		})
		.filter((item): item is Cart['items'][number] => Boolean(item));
}

export function toCartData(cart: Cart): CartData {
	return {
		items: cart.items.map((item) => ({
			id: item.id,
			quantity: item.quantity,
			productVariantId: item.productVariantId,
		})),
	};
}

export async function loadCartFromCookies(cookies: AstroCookies) {
	const db = getDb();
	const cartId = cookies.get(CART_ID_COOKIE_NAME)?.value;
	if (db && cartId) {
		const rows = await db.execute({
			sql: `SELECT id, product_variant_id, quantity
				FROM cart_line_items
				WHERE cart_id = ?
				ORDER BY created_at ASC`,
			args: [cartId],
		});
		return expandCartData(
			parseCartData({
				items: rows.rows.map((row) => ({
					id: String(row.id),
					quantity: Number(row.quantity),
					productVariantId: String(row.product_variant_id),
				})),
			}),
		);
	}

	const json = cookies.get(CART_COOKIE_NAME)?.json();
	return await expandCartData(parseCartData(json));
}

export async function saveCartToCookies(cart: Cart, cookies: AstroCookies) {
	const db = getDb();
	const cartData = toCartData(cart);
	const now = new Date().toISOString();

	cookies.set(CART_COOKIE_NAME, cartData, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
	});

	if (!db) return;

	const cartId = cookies.get(CART_ID_COOKIE_NAME)?.value ?? crypto.randomUUID();
	cookies.set(CART_ID_COOKIE_NAME, cartId, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 30,
	});

	await db.execute({
		sql: `INSERT INTO carts (id, created_at, updated_at)
			VALUES (?, ?, ?)
			ON CONFLICT(id) DO UPDATE SET updated_at = excluded.updated_at`,
		args: [cartId, now, now],
	});

	const currentItems = await db.execute({
		sql: 'SELECT id FROM cart_line_items WHERE cart_id = ?',
		args: [cartId],
	});
	const incomingIds = new Set(cartData.items.map((item) => item.id));
	await Promise.all(
		currentItems.rows
			.filter((row) => !incomingIds.has(String(row.id)))
			.map((row) =>
				db.execute({
					sql: 'DELETE FROM cart_line_items WHERE id = ? AND cart_id = ?',
					args: [String(row.id), cartId],
				}),
			),
	);

	await Promise.all(
		cartData.items.map((item) =>
			db.execute({
				sql: `INSERT INTO cart_line_items (
						id, cart_id, product_variant_id, quantity, created_at, updated_at
					) VALUES (?, ?, ?, ?, ?, ?)
					ON CONFLICT(cart_id, product_variant_id) DO UPDATE SET
						id = excluded.id,
						quantity = excluded.quantity,
						updated_at = excluded.updated_at`,
				args: [item.id, cartId, item.productVariantId, item.quantity, now, now],
			}),
		),
	);
}

export async function clearCartCookies(cookies: AstroCookies) {
	const db = getDb();
	const cartId = cookies.get(CART_ID_COOKIE_NAME)?.value;
	if (db && cartId) {
		await db.execute({
			sql: 'DELETE FROM cart_line_items WHERE cart_id = ?',
			args: [cartId],
		});
	}
	await saveCartToCookies({ items: [] }, cookies);
}
