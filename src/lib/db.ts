import { createClient } from '@libsql/client/web';
import { TURSO_AUTH_TOKEN, TURSO_DATABASE_URL } from 'astro:env/server';

let client: ReturnType<typeof createClient> | null = null;

export function getDb() {
	if (!TURSO_DATABASE_URL?.trim() || !TURSO_AUTH_TOKEN?.trim()) {
		return null;
	}
	if (!client) {
		client = createClient({
			url: TURSO_DATABASE_URL,
			authToken: TURSO_AUTH_TOKEN,
		});
	}
	return client;
}
