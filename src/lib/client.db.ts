/**
 * Storefront client with persistent order storage via Turso (libSQL).
 * When TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set, orders persist in the database.
 * Otherwise falls back to in-memory storage (same as mock).
 */
import type { Options, RequestResult } from '@hey-api/client-fetch';
import type {
	Collection,
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
	Order,
	Product,
} from './client.types.ts';
import { collections, getProductVariantById, products } from './catalog.ts';
import { getDb } from './db.ts';

export * from './client.types.ts';

function asResult<T>(data: T): RequestResult<T, never, false> {
	return Promise.resolve({
		data,
		error: undefined,
		request: new Request('https://example.com'),
		response: new Response(),
	});
}

function asError<T, E>(error: E): RequestResult<T, E, false> {
	return Promise.resolve({
		data: undefined,
		error,
		request: new Request('https://example.com'),
		response: new Response(),
	});
}

function toAddressJson(addr: CreateOrderData['body'] extends { shippingAddress?: infer A } ? A : never) {
	if (!addr) return null;
	return JSON.stringify({
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
	});
}

function fromAddressJson(json: string | null): Order['shippingAddress'] {
	if (!json) return null;
	const o = JSON.parse(json);
	return {
		line1: o.line1,
		line2: o.line2,
		city: o.city,
		country: o.country,
		province: o.province,
		postal: o.postal,
		phone: o.phone ?? null,
		company: o.company ?? null,
		firstName: o.firstName ?? null,
		lastName: o.lastName ?? null,
	};
}

// --- Products & Collections (from catalog) ---

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
	return asResult({ items, next: null });
};

export const getProductById = <ThrowOnError extends boolean = false>(
	options: Options<GetProductByIdData, ThrowOnError>,
): RequestResult<GetProductByIdResponse, GetProductByIdError, ThrowOnError> => {
	const product = products[options.path.id];
	if (!product) {
		const error = asError<GetProductByIdResponse, GetProductByIdError>({ error: 'not-found' });
		if (options.throwOnError) throw error;
		return error as RequestResult<GetProductByIdResponse, GetProductByIdError, ThrowOnError>;
	}
	return asResult(product);
};

export const getCollections = <ThrowOnError extends boolean = false>(
	_options?: Options<GetCollectionsData, ThrowOnError>,
): RequestResult<GetCollectionsResponse, GetCollectionsError, ThrowOnError> => {
	return asResult({ items: Object.values(collections), next: null });
};

export const getCollectionById = <ThrowOnError extends boolean = false>(
	options: Options<GetCollectionByIdData, ThrowOnError>,
): RequestResult<GetCollectionByIdResponse, GetCollectionByIdError, ThrowOnError> => {
	const collection = collections[options.path.id];
	if (!collection) {
		const error = asError<GetCollectionByIdResponse, GetCollectionByIdError>({ error: 'not-found' });
		if (options.throwOnError) throw error;
		return error as RequestResult<GetCollectionByIdResponse, GetCollectionByIdError, ThrowOnError>;
	}
	return asResult({ ...collection, products: [] });
};

// --- Customers & Orders (DB or in-memory) ---

const memoryOrders = new Map<string, Order>();
let memoryOrderNumber = 1000;

export const createCustomer = <ThrowOnError extends boolean = false>(
	options?: Options<CreateCustomerData, ThrowOnError>,
): RequestResult<CreateCustomerResponse, CreateCustomerError, ThrowOnError> => {
	if (!options?.body) throw new Error('No body provided');
	const body = options.body;
	const now = new Date().toISOString();
	const customer = {
		...body,
		id: body.id ?? `customer-${crypto.randomUUID()}`,
		createdAt: now,
		updatedAt: now,
		deletedAt: null,
	};

	const db = getDb();
	if (db) {
		return db
			.execute({
				sql: `INSERT OR REPLACE INTO customers (id, name, email, location, created_at, updated_at)
					VALUES (?, ?, ?, ?, ?, ?)`,
				args: [customer.id, customer.name, customer.email, customer.location, now, now],
			})
			.then(() => asResult(customer));
	}

	return asResult(customer);
};

export const createOrder = <ThrowOnError extends boolean = false>(
	options?: Options<CreateOrderData, ThrowOnError>,
): RequestResult<CreateOrderResponse, CreateOrderError, ThrowOnError> => {
	if (!options?.body) throw new Error('No body provided');
	const body = options.body;
	const now = new Date().toISOString();
	const orderId = crypto.randomUUID();

	const lineItems = body.lineItems.map((li) => {
		const { variant, product } = getProductVariantById(li.productVariantId);
		return {
			id: crypto.randomUUID(),
			quantity: li.quantity,
			productVariantId: li.productVariantId,
			productVariant: { ...variant, product },
		};
	});

	const order: Order = {
		...body,
		id: orderId,
		number: 0, // set below
		lineItems,
		billingAddress: body.billingAddress
			? {
					line1: body.billingAddress.line1 ?? '',
					line2: body.billingAddress.line2 ?? '',
					city: body.billingAddress.city ?? '',
					country: body.billingAddress.country ?? '',
					province: body.billingAddress.province ?? '',
					postal: body.billingAddress.postal ?? '',
					phone: body.billingAddress.phone ?? null,
					company: body.billingAddress.company ?? null,
					firstName: body.billingAddress.firstName ?? null,
					lastName: body.billingAddress.lastName ?? null,
				}
			: undefined,
		shippingAddress: body.shippingAddress
			? {
					line1: body.shippingAddress.line1 ?? '',
					line2: body.shippingAddress.line2 ?? '',
					city: body.shippingAddress.city ?? '',
					country: body.shippingAddress.country ?? '',
					province: body.shippingAddress.province ?? '',
					postal: body.shippingAddress.postal ?? '',
					phone: body.shippingAddress.phone ?? null,
					company: body.shippingAddress.company ?? null,
					firstName: body.shippingAddress.firstName ?? null,
					lastName: body.shippingAddress.lastName ?? null,
				}
			: undefined,
		createdAt: now,
		updatedAt: now,
		deletedAt: null,
	};

	const db = getDb();
	if (db) {
		return db
			.execute('SELECT COALESCE(MAX(number), 1000) + 1 AS next_num FROM orders')
			.then((r) => {
				const nextNum = (r.rows[0]?.next_num as number) ?? 1001;
				order.number = nextNum;
				return db.execute({
					sql: `INSERT INTO orders (id, number, customer_id, customer_name, total_price, shipping_price, billing_address, shipping_address, created_at, updated_at)
						VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					args: [
						orderId,
						nextNum,
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
			})
			.then(() =>
				Promise.all(
					lineItems.map((li) =>
						db.execute({
							sql: `INSERT INTO order_line_items (id, order_id, product_variant_id, quantity, created_at)
								VALUES (?, ?, ?, ?, ?)`,
							args: [li.id, orderId, li.productVariantId, li.quantity, now],
						}),
					),
				),
			)
			.then(() => asResult(order));
	}

	memoryOrderNumber += 1;
	order.number = memoryOrderNumber;
	memoryOrders.set(orderId, order);
	return asResult(order);
};

export const getOrderById = <ThrowOnError extends boolean = false>(
	options: Options<GetOrderByIdData, ThrowOnError>,
): RequestResult<GetOrderByIdResponse, GetOrderByIdError, ThrowOnError> => {
	const orderId = options.path.id;
	const db = getDb();

	if (db) {
		return db
			.execute({ sql: 'SELECT * FROM orders WHERE id = ?', args: [orderId] })
			.then((r) => {
				const row = r.rows[0];
				if (!row) {
					const err = asError<GetOrderByIdResponse, GetOrderByIdError>({ error: 'not-found' });
					if (options.throwOnError) throw { error: 'not-found' };
					return err;
				}
				return db
					.execute({
						sql: 'SELECT * FROM order_line_items WHERE order_id = ?',
						args: [orderId],
					})
					.then((itemsRes) => {
						const lineItems: Order['lineItems'] = itemsRes.rows.map((item) => {
							const { variant, product } = getProductVariantById(
								item.product_variant_id as string,
							);
							return {
								id: item.id as string,
								quantity: item.quantity as number,
								productVariantId: item.product_variant_id as string,
								productVariant: { ...variant, product },
							};
						});
						const order: Order = {
							id: row.id as string,
							number: row.number as number,
							customerId: row.customer_id as string,
							customerName: row.customer_name as string,
							totalPrice: row.total_price as number,
							shippingPrice: row.shipping_price as number,
							billingAddress: fromAddressJson(row.billing_address as string | null),
							shippingAddress: fromAddressJson(row.shipping_address as string | null),
							lineItems,
							createdAt: row.created_at as string,
							updatedAt: row.updated_at as string,
							deletedAt: null,
						};
						return asResult(order);
					});
			});
	}

	const order = memoryOrders.get(orderId);
	if (!order) {
		const err = asError<GetOrderByIdResponse, GetOrderByIdError>({ error: 'not-found' });
		if (options.throwOnError) throw { error: 'not-found' };
		return err as RequestResult<GetOrderByIdResponse, GetOrderByIdError, ThrowOnError>;
	}
	return asResult(order);
};
