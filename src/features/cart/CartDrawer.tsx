import { createQuery } from '@tanstack/solid-query';
import { RiFinanceShoppingCartLine } from 'solid-icons/ri';
import { Show } from 'solid-js';
import { Button } from '~/components/ui/Button.tsx';
import { Drawer } from '~/components/ui/Drawer.tsx';
import { CartSummary } from '~/features/cart/CartSummary.tsx';
import { cartQueryOptions } from '~/features/cart/cart.queries.ts';
import { queryClient } from '~/lib/query.ts';
import { CartStore } from './store.ts';

export function CartDrawer() {
	const query = createQuery(
		() => cartQueryOptions(),
		() => queryClient,
	);

	const itemCount = () => query.data?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

	return (
		<Drawer
			title="Cart"
			open={CartStore.drawerOpen}
			onOpenChange={CartStore.setDrawerOpen}
			trigger={
				<button
					type="button"
					onClick={() => CartStore.setDrawerOpen(true)}
					class="flex items-center gap-2 rounded border border-theme-accent-600 bg-theme-accent-600 px-4 py-2 text-white transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-theme-accent-700 hover:border-theme-accent-700 active:scale-[0.98]"
				>
					<RiFinanceShoppingCartLine class="size-5" />
					<span>Cart {itemCount()}</span>
				</button>
			}
		>
			<div class="flex h-full flex-col py-4">
				<CartSummary />
				<Show when={query.data.items.length > 0}>
					<form method="post" action="/api/checkout" class="contents" data-astro-reload>
						<Button type="submit">Checkout</Button>
					</form>
				</Show>
				<aside class="mt-3 text-balance text-center text-sm font-medium text-theme-base-400">
					Discount and shipping will be calculated on the checkout page.
				</aside>
			</div>
		</Drawer>
	);
}
