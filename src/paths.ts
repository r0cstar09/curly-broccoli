import type { Product } from 'storefront:client';

export const productPath = (slug: Product['slug']) => `/products/${slug}`;
