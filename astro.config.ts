import vercel from '@astrojs/vercel';
import solidJs from '@astrojs/solid-js';
import tailwind from '@astrojs/tailwind';
import icon from 'astro-icon';
import { defineConfig, envField } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	integrations: [tailwind({ applyBaseStyles: false }), icon(), solidJs()],
	// Update to your storefront URL
	site: 'https://gitmo.com',
	output: 'server',
	adapter: vercel(),
	vite: {
		build: {
			assetsInlineLimit(filePath) {
				return filePath.endsWith('css');
			},
		},
	},
	image: {
		// Update to your own image domains
		domains: [
			'localhost',
			'gitmo.com',
			'placehold.co',
		],
	},
	env: {
		schema: {
				STRIPE_SECRET_KEY: envField.string({
					context: 'server',
					access: 'secret',
					optional: true,
					// Set in .env - never commit real keys. Use Stripe test keys for dev.
				}),
				FATHOM_SITE_ID: envField.string({
					context: 'client',
					access: 'public',
					optional: true,
				}),
				GOOGLE_GEOLOCATION_SERVER_KEY: envField.string({
					context: 'server',
					access: 'secret',
					optional: true,
				}),
				GOOGLE_MAPS_BROWSER_KEY: envField.string({
					context: 'client',
					access: 'public',
					optional: true,
				}),
				LOOPS_API_KEY: envField.string({
					context: 'server',
					access: 'secret',
					optional: true,
				}),
				LOOPS_SHOP_TRANSACTIONAL_ID: envField.string({
					context: 'server',
					access: 'public',
					optional: true,
				}),
				LOOPS_FULFILLMENT_TRANSACTIONAL_ID: envField.string({
					context: 'server',
					access: 'public',
					optional: true,
				}),
				LOOPS_FULFILLMENT_EMAIL: envField.string({
					context: 'server',
					access: 'public',
					optional: true,
				}),
				// Used by the Astro team for our internal backend
				SHOP_API_URL: envField.string({
					context: 'server',
					access: 'public',
					optional: true,
				}),
				SHOP_API_KEY: envField.string({
					context: 'server',
					access: 'secret',
					optional: true,
				}),
				US_SHIPPING_RATE_ID: envField.string({
					context: 'server',
					access: 'secret',
					optional: true,
				}),
				INTERNATIONAL_SHIPPING_RATE_ID: envField.string({
					context: 'server',
					access: 'secret',
					optional: true,
				}),
				// Turso (libSQL) for persistent order storage
				TURSO_DATABASE_URL: envField.string({
					context: 'server',
					access: 'secret',
					optional: true,
				}),
				TURSO_AUTH_TOKEN: envField.string({
					context: 'server',
					access: 'secret',
					optional: true,
				}),
		},
	},
});
