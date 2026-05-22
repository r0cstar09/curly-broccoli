/**
 * Storefront client with persistent cart and order storage via Turso (libSQL). When
 * TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set, carts and orders persist in the database.
 * Catalog products/collections remain local source-of-truth.
 */
import type { Options, RequestResult } from '@hey-api/client-fetch';
import type {
	Address,
	CreateCustomerData,
	CreateCustomerError,
	CreateCustomerResponse,
	CreateOrderData,
	CreateOrderError,
	CreateOrderResponse,
	GetCollectionByIdData,
	GetCollectionByIdError,
	GetCollectionByIdResponse,
	GetCollectionsData,
	GetCollectionsError,
	GetCollectionsResponse,
	GetOrderByIdData,
	GetOrderByIdError,
	GetOrderByIdResponse,
	GetProductByIdData,
	GetProductByIdError,
	GetProductByIdResponse,
	GetProductsData,
	GetProductsError,
	GetProductsResponse,
	LineItem,
	Order,
} from './client.types.ts';
import { collections, getProductVariantById, products } from './catalog.ts';
import { getDb } from './db.ts';

export * from './client.types.ts';

type Db = NonNullable<ReturnType<typeof getDb>>;
type DbRow = Record<string, unknown>;
type OrderAddress = NonNullable<Address>;

function asResult<T, E = never, ThrowOnError extends boolean = false>(
	data: T,
): RequestResult<T, E, ThrowOnError> {
	return Promise.resolve({
		data,
		error: undefined,
		request: new Request('https://example.com'),
		response: new Response(),
	}) as RequestResult<T, E, ThrowOnError>;
}

function asError<T, E, ThrowOnError extends boolean = false>(
	error: E,
): RequestResult<T, E, ThrowOnError> {
	return Promise.resolve({
		data: undefined,
		error,
		request: new Request('https://example.com'),
		response: new Response(),
	}) as RequestResult<T, E, ThrowOnError>;
}

function normalizeAddress(addr: Address | undefined): Address | undefined {
	if (!addr) return undefined;
	return {
		line1: addr.line1 ?? '',
		line2: addr.line2 ?? '',
		city: addr.city ?? '',
		country: addr.country ?? '',
		province: addr.province ?? '',
		postal: addr.postal ?? '',
		phone: addr.phone ?? null,
		company: addr.company ?? null,
		firstName: addr.firstName ?? null,
		lastName: addr.lastName ?? null,
	};
}

function toAddressJson(addr: Address | undefined) {
	const normalized = normalizeAddress(addr);
	return normalized ? JSON.stringify(normalized) : null;
}

function fromAddressJson(json: string | null): Address {
	if (!json) return null;
	const o = JSON.parse(json) as Partial<OrderAddress>;
	return {
		line1: o.line1 ?? '',
		line2: o.line2 ?? '',
		city: o.city ?? '',
		country: o.country ?? '',
		province: o.province ?? '',
		postal: o.postal ?? '',
		phone: o.phone ?? null,
		company: o.company ?? null,
		firstName: o.firstName ?? null,
		lastName: o.lastName ?? null,
	};
}

function rowString(row: DbRow, key: string) {
	const value = row[key];
	return typeof value === 'string' ? value : '';
}

function rowNullableString(row: DbRow, key: string) {
	const value = row[key];
	return typeof value === 'string' ? value : null;
}

function rowNumber(row: DbRow | undefined, key: string) {
	const value = row?.[key];
	return typeof value === 'number' ? value : Number(value ?? 0);
}

function getLineItemsFromInputs(body: NonNullable<CreateOrderData['body']>): LineItem[] {
	return body.lineItems.map((li) => {
		const { variant, product } = getProductVariantById(li.productVariantId);
		return {
			id: crypto.randomUUID(),
			quantity: li.quantity,
			productVariantId: li.productVariantId,
			productVariant: { ...variant, product },
		};
	});
}

async function hydrateOrderFromDb(db: Db, row: DbRow): Promise<Order> {
	const itemsRes = await db.execute({
		sql: 'SELECT * FROM order_line_items WHERE order_id = ? ORDER BY created_at ASC',
		args: [rowString(row, 'id')],
	});
	const lineItems: LineItem[] = itemsRes.rows.map((item) => {
		const itemRow = item as DbRow;
		const { variant, product } = getProductVariantById(rowString(itemRow, 'product_variant_id'));
		return {
			id: rowString(itemRow, 'id'),
			quantity: rowNumber(itemRow, 'quantity'),
			productVariantId: rowString(itemRow, 'product_variant_id'),
			productVariant: { ...variant, product },
		};
	});

	return {
		id: rowString(row, 'id'),
		number: rowNumber(row, 'number'),
		stripeSessionId: rowNullableString(row, 'stripe_session_id'),
		status: (rowNullableString(row, 'status') ?? 'paid') as Order['status'],
		customerId: rowString(row, 'customer_id'),
		customerName: rowString(row, 'customer_name'),
		totalPrice: rowNumber(row, 'total_price'),
		shippingPrice: rowNumber(row, 'shipping_price'),
		billingAddress: fromAddressJson(rowNullableString(row, 'billing_address')),
		shippingAddress: fromAddressJson(rowNullableString(row, 'shipping_address')),
		lineItems,
		createdAt: rowString(row, 'created_at'),
		updatedAt: rowString(row, 'updated_at'),
		deletedAt: null,
	};
}

export const getProducts = <ThrowOnError extends boolean = false>(
	options?: Options<GetProductsData, ThrowOnError>,
): RequestResult<GetProductsResponse, GetProductsError, ThrowOnError> => {
	let items = Object.values(products);
	if (options?.query?.collectionId) {
		const collectionId = options.query.collectionId;
		items = items.filter((product) => product.collectionIds?.includes(collectionId));
	}
	if (options?.query?.ids) {
		const ids = Array.isArray(options.query.ids) ? options.query.ids : [options.query.ids];
		items = items.filter((product) => ids.includes(product.id));
	}
	if (options?.query?.sort && options?.query?.order) {
		const { sort, order } = options.query;
		if (sort === 'price') {
			items = items.sort((a, b) => (order === 'asc' ? a.price - b.price : b.price - a.price));
		} else if (sort === 'name') {
			items = items.sort((a, b) =>
				order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
			);
		}
	}
	return asResult<GetProductsResponse, GetProductsError, ThrowOnError>({ items, next: null });
};

export const getProductById = <ThrowOnError extends boolean = false>(
	options: Options<GetProductByIdData, ThrowOnError>,
): RequestResult<GetProductByIdResponse, GetProductByIdError, ThrowOnError> => {
	const product = products[options.path.id];
	if (!product) {
		const error: GetProductByIdError = { error: 'not-found' };
		if (options.throwOnError) throw error;
		return asError<GetProductByIdResponse, GetProductByIdError, ThrowOnError>(error);
	}
	return asResult<GetProductByIdResponse, GetProductByIdError, ThrowOnError>(product);
};

export const getCollections = <ThrowOnError extends boolean = false>(
	_options?: Options<GetCollectionsData, ThrowOnError>,
): RequestResult<GetCollectionsResponse, GetCollectionsError, ThrowOnError> => {
	return asResult<GetCollectionsResponse, GetCollectionsError, ThrowOnError>({
		items: Object.values(collections),
		next: null,
	});
};

export const getCollectionById = <ThrowOnError extends boolean = false>(
	options: Options<GetCollectionByIdData, ThrowOnError>,
): RequestResult<GetCollectionByIdResponse, GetCollectionByIdError, ThrowOnError> => {
	const collection = collections[options.path.id];
	if (!collection) {
		const error: GetCollectionByIdError = { error: 'not-found' };
		if (options.throwOnError) throw error;
		return asError<GetCollectionByIdResponse, GetCollectionByIdError, ThrowOnError>(error);
	}
	const productsForCollection =
		options.query?.expand === 'products'
			? Object.values(products).filter((product) => product.collectionIds?.includes(collection.id))
			: [];
	return asResult<GetCollectionByIdResponse, GetCollectionByIdError, ThrowOnError>({
		...collection,
		products: productsForCollection,
	});
};

const memoryOrders = new Map<string, Order>();
const memoryOrdersByStripeSession = new Map<string, Order>();
let memoryOrderNumber = 1000;

export const createCustomer = <ThrowOnError extends boolean = false>(
	options?: Options<CreateCustomerData, ThrowOnError>,
): RequestResult<CreateCustomerResponse, CreateCustomerError, ThrowOnError> => {
	if (!options?.body) throw new Error('No body provided');
	const body = options.body;
	const now = new Date().toISOString();
	const customerId = body.id ?? `customer-${crypto.randomUUID()}`;
	const customer = {
		...body,
		id: customerId,
		createdAt: now,
		updatedAt: now,
		deletedAt: null,
	};

	const db = getDb();
	if (!db) {
		return asResult<CreateCustomerResponse, CreateCustomerError, ThrowOnError>(customer);
	}

	return (async () => {
		await db.execute({
			sql: `INSERT OR REPLACE INTO customers (id, name, email, location, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?)`,
			args: [customerId, customer.name, customer.email, customer.location, now, now],
		});
		return {
			data: customer,
			error: undefined,
			request: new Request('https://example.com'),
			response: new Response(),
		};
	})() as unknown as RequestResult<CreateCustomerResponse, CreateCustomerError, ThrowOnError>;
};

export const createOrder = <ThrowOnError extends boolean = false>(
	options?: Options<CreateOrderData, ThrowOnError>,
): RequestResult<CreateOrderResponse, CreateOrderError, ThrowOnError> => {
	if (!options?.body) throw new Error('No body provided');
	const body = options.body;
	const now = new Date().toISOString();
	const orderId = crypto.randomUUID();
	const lineItems = getLineItemsFromInputs(body);

	const order: Order = {
		...body,
		id: orderId,
		number: 0,
		status: body.status ?? 'paid',
		stripeSessionId: body.stripeSessionId ?? null,
		lineItems,
		billingAddress: normalizeAddress(body.billingAddress),
		shippingAddress: normalizeAddress(body.shippingAddress),
		createdAt: now,
		updatedAt: now,
		deletedAt: null,
	};

	const db = getDb();
	if (!db) {
		if (body.stripeSessionId) {
			const existing = memoryOrdersByStripeSession.get(body.stripeSessionId);
			if (existing) {
				return asResult<CreateOrderResponse, CreateOrderError, ThrowOnError>(existing);
			}
		}
		memoryOrderNumber += 1;
		order.number = memoryOrderNumber;
		memoryOrders.set(orderId, order);
		if (body.stripeSessionId) {
			memoryOrdersByStripeSession.set(body.stripeSessionId, order);
		}
		return asResult<CreateOrderResponse, CreateOrderError, ThrowOnError>(order);
	}

	return (async () => {
		if (body.stripeSessionId) {
			const existing = await db.execute({
				sql: 'SELECT * FROM orders WHERE stripe_session_id = ?',
				args: [body.stripeSessionId],
			});
			const existingRow = existing.rows[0] as DbRow | undefined;
			if (existingRow) {
				return asResult<CreateOrderResponse, CreateOrderError, ThrowOnError>(
					await hydrateOrderFromDb(db, existingRow),
				);
			}
		}

		const numberResult = await db.execute(
			'SELECT COALESCE(MAX(number), 1000) + 1 AS next_num FROM orders',
		);
		const nextNum = rowNumber(numberResult.rows[0] as DbRow | undefined, 'next_num') || 1001;
		order.number = nextNum;

		try {
			await db.execute({
				sql: `INSERT INTO orders (
						id, number, stripe_session_id, status, customer_id, customer_name, total_price,
						shipping_price, billing_address, shipping_address, created_at, updated_at
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				args: [
					orderId,
					nextNum,
					body.stripeSessionId ?? null,
					order.status ?? 'paid',
					body.customerId,
					body.customerName,
					body.totalPrice,
					body.shippingPrice,
					toAddressJson(body.billingAddress),
					toAddressJson(body.shippingAddress),
					now,
					now,
				],
			});
		} catch (error) {
			if (!body.stripeSessionId) throw error;
			const existing = await db.execute({
				sql: 'SELECT * FROM orders WHERE stripe_session_id = ?',
				args: [body.stripeSessionId],
			});
			const existingRow = existing.rows[0] as DbRow | undefined;
			if (!existingRow) throw error;
			return asResult<CreateOrderResponse, CreateOrderError, ThrowOnError>(
				await hydrateOrderFromDb(db, existingRow),
			);
		}

		await Promise.all(
			lineItems.map((li) =>
				db.execute({
					sql: `INSERT INTO order_line_items (id, order_id, product_variant_id, quantity, created_at)
						VALUES (?, ?, ?, ?, ?)`,
					args: [li.id, orderId, li.productVariantId, li.quantity, now],
				}),
			),
		);

		return asResult<CreateOrderResponse, CreateOrderError, ThrowOnError>(order);
	})() as unknown as RequestResult<CreateOrderResponse, CreateOrderError, ThrowOnError>;
};

export const getOrderById = <ThrowOnError extends boolean = false>(
	options: Options<GetOrderByIdData, ThrowOnError>,
): RequestResult<GetOrderByIdResponse, GetOrderByIdError, ThrowOnError> => {
	const orderId = options.path.id;
	const db = getDb();

	if (db) {
		return (async () => {
			const result = await db.execute({
				sql: 'SELECT * FROM orders WHERE id = ?',
				args: [orderId],
			});
			const row = result.rows[0] as DbRow | undefined;
			if (!row) {
				const error: GetOrderByIdError = { error: 'not-found' };
				if (options.throwOnError) throw error;
				return {
					data: undefined,
					error,
					request: new Request('https://example.com'),
					response: new Response(),
				};
			}
			return {
				data: await hydrateOrderFromDb(db, row),
				error: undefined,
				request: new Request('https://example.com'),
				response: new Response(),
			};
		})() as unknown as RequestResult<GetOrderByIdResponse, GetOrderByIdError, ThrowOnError>;
	}

	const order = memoryOrders.get(orderId);
	if (!order) {
		const error: GetOrderByIdError = { error: 'not-found' };
		if (options.throwOnError) throw error;
		return asError<GetOrderByIdResponse, GetOrderByIdError, ThrowOnError>(error);
	}
	return asResult<GetOrderByIdResponse, GetOrderByIdError, ThrowOnError>(order);
};
