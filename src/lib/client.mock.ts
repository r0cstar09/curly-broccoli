// This file contains mock functions for all storefront services.
// You can use this as a template to connect your own ecommerce provider.

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

export * from './client.types.ts';

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
			items = items.sort((a, b) => {
				return order === 'asc' ? a.price - b.price : b.price - a.price;
			});
		} else if (sort === 'name') {
			items = items.sort((a, b) => {
				return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
			});
		}
	}
	return asResult({ items, next: null });
};

export const getProductById = <ThrowOnError extends boolean = false>(
	options: Options<GetProductByIdData, ThrowOnError>,
): RequestResult<GetProductByIdResponse, GetProductByIdError, ThrowOnError> => {
	const product = products[options.path.id];
	if (!product) {
		const error = asError<GetProductByIdError>({ error: 'not-found' });
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
		const error = asError<GetCollectionByIdError>({ error: 'not-found' });
		if (options.throwOnError) throw error;
		return error as RequestResult<GetCollectionByIdResponse, GetCollectionByIdError, ThrowOnError>;
	}
	return asResult({ ...collection, products: [] });
};

export const createCustomer = <ThrowOnError extends boolean = false>(
	options?: Options<CreateCustomerData, ThrowOnError>,
): RequestResult<CreateCustomerResponse, CreateCustomerError, ThrowOnError> => {
	if (!options?.body) throw new Error('No body provided');
	return asResult({
		...options.body,
		id: options.body.id ?? 'customer-1',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		deletedAt: null,
	});
};

const orders: Record<string, Order> = {};

export const createOrder = <ThrowOnError extends boolean = false>(
	options?: Options<CreateOrderData, ThrowOnError>,
): RequestResult<CreateOrderResponse, CreateOrderError, ThrowOnError> => {
	if (!options?.body) throw new Error('No body provided');
	const order: Order = {
		...options.body,
		id: 'dk3fd0sak3d',
		number: 1001,
		lineItems: options.body.lineItems.map((lineItem) => ({
			...lineItem,
			id: crypto.randomUUID(),
			productVariant: getProductVariantFromLineItemInput(lineItem.productVariantId),
		})),
		billingAddress: getAddress(options.body.billingAddress),
		shippingAddress: getAddress(options.body.shippingAddress),
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		deletedAt: null,
	};
	orders[order.id] = order;
	return asResult(order);
};

export const getOrderById = <ThrowOnError extends boolean = false>(
	options: Options<GetOrderByIdData, ThrowOnError>,
): RequestResult<GetOrderByIdResponse, GetOrderByIdError, ThrowOnError> => {
	const order = orders[options.path.id];
	if (!order) {
		const error = asError<GetOrderByIdError>({ error: 'not-found' });
		if (options.throwOnError) throw error;
		return error as RequestResult<GetOrderByIdResponse, GetOrderByIdError, ThrowOnError>;
	}
	return asResult(order);
};

const collectionDefaults = {
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	deletedAt: null,
};

const collections: Record<string, Collection> = {
	creativeCloud: {
		id: 'creativeCloud',
		name: 'Creative Cloud',
		description: 'Professional creative apps for design, photo, video, and more.',
		slug: 'creative-cloud',
		imageUrl: 'https://placehold.co/400x300/1a1a2e/00d4ff?text=Creative+Cloud',
		...collectionDefaults,
	},
	documentCloud: {
		id: 'documentCloud',
		name: 'Document Cloud',
		description: 'Create, edit, and sign PDFs with Acrobat.',
		slug: 'document-cloud',
		imageUrl: 'https://placehold.co/400x300/1a1a2e/ff0000?text=Document+Cloud',
		...collectionDefaults,
	},
	bestSellers: {
		id: 'bestSellers',
		name: 'Best Sellers',
		description: 'Our most popular software subscriptions.',
		slug: 'best-sellers',
		imageUrl: 'https://placehold.co/400x300/1a1a2e/7b2cbf?text=Best+Sellers',
		...collectionDefaults,
	},
};

const defaultVariant = {
	id: 'default',
	name: 'Default',
	stock: 20,
	options: {},
};


const productDefaults = {
	description: '',
	images: [],
	variants: [defaultVariant],
	discount: 0,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	deletedAt: null,
};

const products: Record<string, Product> = {
	photoshop: {
		...productDefaults,
		id: 'photoshop',
		name: 'Adobe Photoshop',
		slug: 'photoshop',
		tagline: 'The world\'s most powerful image editing and graphic design software.',
		price: 2299,
		imageUrl: 'https://placehold.co/400x400/2d1b69/00d4ff?text=Photoshop',
		collectionIds: ['creativeCloud', 'bestSellers'],
		variants: [defaultVariant],
	},
	illustrator: {
		...productDefaults,
		id: 'illustrator',
		name: 'Adobe Illustrator',
		slug: 'illustrator',
		tagline: 'Create logos, icons, illustrations, and graphics with vector precision.',
		price: 2299,
		imageUrl: 'https://placehold.co/400x400/ff9a00/1a1a1a?text=Illustrator',
		collectionIds: ['creativeCloud', 'bestSellers'],
		variants: [defaultVariant],
	},
	indesign: {
		...productDefaults,
		id: 'indesign',
		name: 'Adobe InDesign',
		slug: 'indesign',
		tagline: 'Professional page layout and design for print and digital publishing.',
		price: 2299,
		imageUrl: 'https://placehold.co/400x400/ff3366/ffffff?text=InDesign',
		collectionIds: ['creativeCloud'],
		variants: [defaultVariant],
	},
	'acrobat-pro': {
		...productDefaults,
		id: 'acrobat-pro',
		name: 'Adobe Acrobat Pro',
		slug: 'acrobat-pro',
		tagline: 'Create, edit, and sign PDF documents with the industry standard.',
		price: 2299,
		imageUrl: 'https://placehold.co/400x400/ff0000/ffffff?text=Acrobat+Pro',
		collectionIds: ['documentCloud', 'bestSellers'],
		variants: [defaultVariant],
	},
	'premiere-pro': {
		...productDefaults,
		id: 'premiere-pro',
		name: 'Adobe Premiere Pro',
		slug: 'premiere-pro',
		tagline: 'Professional video editing for film, TV, and the web.',
		price: 2299,
		imageUrl: 'https://placehold.co/400x400/9999ff/1a1a1a?text=Premiere+Pro',
		collectionIds: ['creativeCloud'],
		variants: [defaultVariant],
	},
	'after-effects': {
		...productDefaults,
		id: 'after-effects',
		name: 'Adobe After Effects',
		slug: 'after-effects',
		tagline: 'Create cinematic movie titles, intros, and motion graphics.',
		price: 2299,
		imageUrl: 'https://placehold.co/400x400/9999ff/1a1a1a?text=After+Effects',
		collectionIds: ['creativeCloud'],
		variants: [defaultVariant],
	},
	lightroom: {
		...productDefaults,
		id: 'lightroom',
		name: 'Adobe Lightroom',
		slug: 'lightroom',
		tagline: 'Edit, organize, store, and share photos from anywhere.',
		price: 999,
		imageUrl: 'https://placehold.co/400x400/2d1b69/00d4ff?text=Lightroom',
		collectionIds: ['creativeCloud', 'bestSellers'],
		variants: [defaultVariant],
	},
	'creative-cloud-all-apps': {
		...productDefaults,
		id: 'creative-cloud-all-apps',
		name: 'Adobe Creative Cloud All Apps',
		slug: 'creative-cloud-all-apps',
		tagline: 'Get 20+ creative apps including Photoshop, Illustrator, and more.',
		price: 5499,
		discount: 500,
		imageUrl: 'https://placehold.co/400x400/1a1a2e/00d4ff?text=All+Apps',
		collectionIds: ['creativeCloud', 'bestSellers'],
		variants: [defaultVariant],
	},
};

function asResult<T>(data: T) {
	return Promise.resolve({
		data,
		error: undefined,
		request: new Request('https://example.com'),
		response: new Response(),
	});
}

function asError<T>(error: T) {
	return Promise.resolve({
		data: undefined,
		error,
		request: new Request('https://example.com'),
		response: new Response(),
	});
}

function getAddress(address: Required<CreateOrderData>['body']['shippingAddress']) {
	return {
		line1: address?.line1 ?? '',
		line2: address?.line2 ?? '',
		city: address?.city ?? '',
		country: address?.country ?? '',
		province: address?.province ?? '',
		postal: address?.postal ?? '',
		phone: address?.phone ?? null,
		company: address?.company ?? null,
		firstName: address?.firstName ?? null,
		lastName: address?.lastName ?? null,
	};
}

function getProductVariantFromLineItemInput(
	variantId: string,
): NonNullable<Order['lineItems']>[number]['productVariant'] {
	for (const product of Object.values(products)) {
		for (const variant of product.variants) {
			if (variant.id === variantId) {
				return { ...variant, product };
			}
		}
	}
	throw new Error(`Product variant ${variantId} not found`);
}
