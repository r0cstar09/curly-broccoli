import { STRIPE_SECRET_KEY } from 'astro:env/server';
import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { clearCartCookies } from '~/features/cart/cart.server.ts';
import { sendCheckoutSuccessEmail } from '~/lib/emails.ts';
import { createOrderFromStripe, retrieveCheckoutSession } from '~/lib/stripe-orders.ts';

export const GET: APIRoute = async (context) => {
	if (!STRIPE_SECRET_KEY) {
		return new Response('Checkout is not configured. Set STRIPE_SECRET_KEY in your environment.', {
			status: 503,
		});
	}

	const sessionId = context.url.searchParams.get('session_id');
	if (!sessionId) {
		return new Response('Bad request', { status: 400 });
	}

	const stripe = new Stripe(STRIPE_SECRET_KEY);
	const session = await retrieveCheckoutSession(stripe, sessionId);

	if (session.status !== 'complete') {
		return new Response('Session not complete', { status: 400 });
	}

	if (session.line_items == null) {
		return new Response('Session line items not found', { status: 400 });
	}

	try {
		const order = await createOrderFromStripe(session, session.line_items.data);
		if (!import.meta.env.DEV && session.customer_details?.email) {
			await sendCheckoutSuccessEmail(
				session.customer_details.email,
				order.id,
				session.line_items.data,
				session,
			).catch((error) => {
				console.error('Failed to send checkout success email:', error);
			});
		}
		return context.redirect(`/orders/${order.id}`);
	} catch (e) {
		console.error(e);
		return context.redirect('/500', 307);
	} finally {
		await clearCartCookies(context.cookies);
	}
};
