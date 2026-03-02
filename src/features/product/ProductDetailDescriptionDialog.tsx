import { RiArrowsArrowRightSLine } from 'solid-icons/ri';
import type { JSXElement } from 'solid-js';
import { Drawer } from '~/components/ui/Drawer.tsx';

export function ProductDetailDescriptionDialog(props: { title: string; children: JSXElement }) {
	return (
		<Drawer
			{...props}
			trigger={
				<div class="flex h-14 cursor-pointer list-none items-center justify-between border-y border-theme-base-200 px-3 font-bold text-theme-base-600">
					{props.title}
					<RiArrowsArrowRightSLine class="!size-6" />
				</div>
			}
		/>
	);
}
