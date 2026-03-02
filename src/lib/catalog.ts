import type { Collection, Product } from './client.types.ts';

const collectionDefaults = {
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	deletedAt: null,
};

const defaultVariant = {
	id: 'default',
	name: 'Default',
	stock: 20,
	options: {} as Record<string, string>,
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

const asset = (path: string) => `/assets/${path}`;

export const collections: Record<string, Collection> = {
	apparel: {
		id: 'apparel',
		name: 'Apparel',
		description: 'T-shirts, hoodies, beanies, and caps.',
		slug: 'apparel',
		imageUrl: asset('astro-unisex-tshirt.png'),
		...collectionDefaults,
	},
	stickers: {
		id: 'stickers',
		name: 'Stickers',
		description: 'Decals and sticker packs for your laptop, water bottle, and more.',
		slug: 'stickers',
		imageUrl: asset('astro-sticker-pack.png'),
		...collectionDefaults,
	},
	bestSellers: {
		id: 'bestSellers',
		name: 'Best Sellers',
		description: 'Our most popular items.',
		slug: 'best-sellers',
		imageUrl: asset('astro-beanie.png'),
		...collectionDefaults,
	},
};

export const products: Record<string, Product> = {
	'astro-unisex-tshirt': {
		...productDefaults,
		id: 'astro-unisex-tshirt',
		name: 'Astro Logo T-Shirt',
		slug: 'astro-unisex-tshirt',
		tagline: 'Classic Astro logotype on the left chest.',
		price: 2200,
		imageUrl: asset('astro-unisex-tshirt.png'),
		collectionIds: ['apparel', 'bestSellers'],
		variants: [defaultVariant],
	},
	'astro-beanie': {
		...productDefaults,
		id: 'astro-beanie',
		name: 'Astro Logo Beanie',
		slug: 'astro-beanie',
		tagline: 'Embroidered Astro logo on the cuff.',
		price: 2400,
		imageUrl: asset('astro-beanie.png'),
		collectionIds: ['apparel', 'bestSellers'],
		variants: [defaultVariant],
	},
	'astro-zip-up-hoodie': {
		...productDefaults,
		id: 'astro-zip-up-hoodie',
		name: 'Astronaut Blue Zip-up Hoodie',
		slug: 'astro-zip-up-hoodie',
		tagline: 'Printed Astro logo mark on the left chest.',
		price: 4500,
		imageUrl: asset('astro-zip-up-hoodie.png'),
		collectionIds: ['apparel', 'bestSellers'],
		variants: [defaultVariant],
	},
	'astro-cap': {
		...productDefaults,
		id: 'astro-cap',
		name: 'Happy Houston Organic Cap',
		slug: 'astro-cap',
		tagline: 'Smiling Houston embroidered in white on the front.',
		price: 3000,
		imageUrl: asset('astro-cap.png'),
		collectionIds: ['apparel'],
		variants: [defaultVariant],
	},
	'astro-sticker-pack': {
		...productDefaults,
		id: 'astro-sticker-pack',
		name: 'Houston Sticker Sheet',
		slug: 'astro-sticker-pack',
		tagline: '15 variations of Houston with different expressions and costumes.',
		price: 800,
		imageUrl: asset('astro-sticker-pack.png'),
		collectionIds: ['stickers', 'bestSellers'],
		variants: [defaultVariant],
	},
	'astro-houston-sticker': {
		...productDefaults,
		id: 'astro-houston-sticker',
		name: 'Astro Houston Sticker',
		slug: 'astro-houston-sticker',
		tagline: 'Single Houston mascot sticker.',
		price: 400,
		imageUrl: asset('astro-houston-sticker.png'),
		collectionIds: ['stickers'],
		variants: [defaultVariant],
	},
	'astro-universe-stickers': {
		...productDefaults,
		id: 'astro-universe-stickers',
		name: 'Holographic Astronaut Sticker Pack',
		slug: 'astro-universe-stickers',
		tagline: 'Iridescent stickers with astronaut illustrations.',
		price: 800,
		imageUrl: asset('astro-universe-stickers.png'),
		collectionIds: ['stickers', 'bestSellers'],
		variants: [defaultVariant],
	},
	'astro-lighthouse-sticker': {
		...productDefaults,
		id: 'astro-lighthouse-sticker',
		name: 'Astro Lighthouse Sticker',
		slug: 'astro-lighthouse-sticker',
		tagline: 'Lighthouse-themed Astro sticker.',
		price: 400,
		imageUrl: asset('astro-lighthouse-sticker.png'),
		collectionIds: ['stickers'],
		variants: [defaultVariant],
	},
};

export function getProductVariantById(variantId: string): {
	variant: Product['variants'][number];
	product: Product;
} {
	for (const product of Object.values(products)) {
		for (const variant of product.variants) {
			if (variant.id === variantId) {
				return { variant, product };
			}
		}
	}
	throw new Error(`Product variant ${variantId} not found`);
}
