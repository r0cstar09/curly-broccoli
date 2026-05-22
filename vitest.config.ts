import tsconfigPaths from 'vite-plugin-tsconfig-paths';
import { fileURLToPath } from 'node:url';
import { defaultExclude, defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tsconfigPaths()],
	resolve: {
		alias: {
			'astro:schema': fileURLToPath(new URL('./src/test/astro-schema.ts', import.meta.url)),
			'astro:env/server': fileURLToPath(new URL('./src/test/astro-env-server.ts', import.meta.url)),
		},
	},
	test: {
		exclude: [...defaultExclude, 'e2e/**/*'],
	},
});
