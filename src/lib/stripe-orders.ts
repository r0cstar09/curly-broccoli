import { createCustomer, createOrder } from 'storefront:client';
import Stripe from 'stripe';
import { formatOneLineAddress } from '~/lib/address';
import { stripeProductMetadataSchema } from '~/lib/products.ts';

export async function createOrderFromStripe(
	session: Stripe.Checkout.Session,
	lineItems: Stripe.LineItem[],
) {
	const customerId =
		typeof session.customer === 'string'
			? session.customer
			: session.customer != null
				? session.customer.id
				: undefined;

	const customerResponse = await createCustomer({
		body: {
			id: customerId,
			name: session.customer_details?.name ?? '',
			email: session.customer_details?.email ?? '',
			location: session.customer_details?.address
				? formatOneLineAddress({
						line1: session.customer_details.address.line1,
						line2: session.customer_details.address.line2,
						city: session.customer_details.address.city,
						province: session.customer_details.address.state,
					})
				: '',
		},
	});

	if (!customerResponse.data) {
		throw new Error(`Unexpected error creating customer. ${customerResponse.response.status}`);
	}
	const customer = customerResponse.data;

	const { shipping_details, customer_details } = session;
	const customerAddressDetails = {
		phone: session.customer_details?.phone ?? undefined,
		company: session.customer_details?.name ?? undefined,
		firstName: session.customer_details?.name ?? undefined,
		lastName: session.customer_details?.name ?? undefined,
	};

	const orderResponse = await createOrder({
		body: {
			stripeSessionId: session.id,
			status: session.payment_status === 'paid' ? 'paid' : 'pending',
			customerId: customer.id,
			customerName: customer.name,
			totalPrice: session.amount_total ?? 0,
			shippingPrice:
				typeof session.shipping_cost === 'number'
					? session.shipping_cost
					: session.shipping_cost?.amount_total ?? 0,
			lineItems: lineItems.map((item) => {
				const metadata = stripeProductMetadataSchema.parse(
					// verbose checks for a clearer error message
					typeof item.price === 'object' &&
						typeof item.price?.product === 'object' &&
						'metadata' in item.price.product &&
						item.price?.product.metadata,
				);
				return {
					quantity: item.quantity ?? 1,
					productVariantId: metadata.productVariantId,
				};
			}),
			shippingAddress: shipping_details
				? {
						line1: shipping_details.address?.line1 ?? '',
						line2: shipping_details.address?.line2 ?? '',
						city: shipping_details.address?.city ?? '',
						province: shipping_details.address?.state ?? '',
						country: shipping_details.address?.country ?? '',
						postal: shipping_details.address?.postal_code ?? '',
						...customerAddressDetails,
					}
				: undefined,
			billingAddress: customer_details
				? {
						line1: session.customer_details?.address?.line1 ?? '',
						line2: session.customer_details?.address?.line2 ?? '',
						city: session.customer_details?.address?.city ?? '',
						province: session.customer_details?.address?.state ?? '',
						country: session.customer_details?.address?.country ?? '',
						postal: session.customer_details?.address?.postal_code ?? '',
						...customerAddressDetails,
					}
				: undefined,
		},
	});

	const order = orderResponse.data;
	if (!order) {
		throw new Error(`Unexpected error creating order. ${orderResponse.response.status}`);
	}

	return order;
}

export async function retrieveCheckoutSession(stripe: Stripe, sessionId: string) {
	return stripe.checkout.sessions.retrieve(sessionId, {
		expand: ['line_items', 'line_items.data.price.product'],
	});
}
