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

export const collections: Record<string, Collection> = {
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

export const products: Record<string, Product> = {
	photoshop: {
		...productDefaults,
		id: 'photoshop',
		name: 'Adobe Photoshop',
		slug: 'photoshop',
		tagline: "The world's most powerful image editing and graphic design software.",
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
