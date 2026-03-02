import type { Cart } from '../cart.ts';

const photoshop = {
	id: 'c930f512-8b41-4dd3-94de-baf06686e1d6',
	quantity: 5,
	productVariantId: 'default',
	productVariant: {
		id: 'default',
		name: 'Default',
		stock: 999,
		options: {},
		product: {
			id: 'photoshop',
			name: 'Adobe Photoshop',
			slug: 'photoshop',
			tagline: "The world's most powerful image editing and graphic design software.",
			price: 2299,
			imageUrl: 'https://placehold.co/400x400/2d1b69/00d4ff?text=Photoshop',
			variants: [{ id: 'default', name: 'Default', stock: 999, options: {} }],
			collectionIds: ['creativeCloud', 'bestSellers'],
			description: '',
			images: [],
			discount: 0,
			createdAt: '2024-09-20T20:09:51.523Z',
			updatedAt: '2024-09-20T20:09:51.523Z',
			deletedAt: null,
		},
	},
};

export const kitchenSinkFixture: Cart = {
	items: [
		{ ...photoshop, quantity: 5 },
		{ ...photoshop, quantity: 3 },
		{ ...photoshop, quantity: 1 },
		{
			id: 'e436c975-21a2-49e3-96c2-f543361d00d9',
			quantity: 1,
			productVariantId: 'default',
			productVariant: {
				id: 'default',
				name: 'Default',
				stock: 999,
				options: {},
				product: {
					id: 'illustrator',
					name: 'Adobe Illustrator',
					slug: 'illustrator',
					tagline: 'Create logos, icons, illustrations, and graphics with vector precision.',
					price: 2299,
					imageUrl: 'https://placehold.co/400x400/ff9a00/1a1a1a?text=Illustrator',
					collectionIds: ['creativeCloud', 'bestSellers'],
					description: '',
					images: [],
					discount: 0,
					createdAt: '2024-09-20T20:09:51.523Z',
					updatedAt: '2024-09-20T20:09:51.523Z',
					deletedAt: null,
					variants: [{ id: 'default', name: 'Default', stock: 999, options: {} }],
				},
			},
		},
	],
};
