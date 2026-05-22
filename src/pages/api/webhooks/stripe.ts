import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from 'astro:env/server';
import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { createOrderFromStripe, retrieveCheckoutSession } from '~/lib/stripe-orders.ts';

export const POST: APIRoute = async ({ request }) => {
	if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
		return new Response('Stripe webhook is not configured.', { status: 503 });
	}

	const stripe = new Stripe(STRIPE_SECRET_KEY);
	const signature = request.headers.get('stripe-signature');
	if (!signature) {
		return new Response('Missing Stripe signature.', { status: 400 });
	}

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(await request.text(), signature, STRIPE_WEBHOOK_SECRET);
	} catch (error) {
		console.error('Failed to verify Stripe webhook signature:', error);
		return new Response('Invalid Stripe signature.', { status: 400 });
	}

	if (event.type === 'checkout.session.completed') {
		const checkoutSession = event.data.object as Stripe.Checkout.Session;
		const session = await retrieveCheckoutSession(stripe, checkoutSession.id);
		if (!session.line_items) {
			return new Response('Session line items not found.', { status: 400 });
		}
		await createOrderFromStripe(session, session.line_items.data);
	}

	return Response.json({ received: true });
};
