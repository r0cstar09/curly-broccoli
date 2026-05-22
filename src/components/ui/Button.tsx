import { RiSystemLoader2Line } from 'solid-icons/ri';
import type { ComponentProps, JSX, JSXElement } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { twMerge } from 'tailwind-merge';

interface Props extends ComponentProps<'button'> {
	pending?: boolean;
}

export function Button(props: Props) {
	return (
		<button
			{...props}
			type={props.type ?? 'button'}
			class={twMerge(
				'flex h-12 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-theme-accent-600 via-fuchsia-600 to-rose-500 px-5 text-sm font-semibold uppercase tracking-[0.12em] text-white shadow-[0_18px_42px_-24px_rgb(168_85_247_/_0.95)] transition-all duration-300 ease-out',
				props.class,
				(props.disabled || props.pending) && 'opacity-50',
				!props.disabled &&
					'hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]',
			)}
		>
			{props.pending ? <RiSystemLoader2Line class="animate-spin" /> : props.children}
		</button>
	);
}

interface SquareIconButtonProps {
	as?: 'button' | 'div';
	type?: 'button' | 'submit' | 'reset';
	class?: string;
	children?: JSXElement;
	theme?: 'light' | 'dark';
	onClick?: JSX.EventHandler<HTMLElement, MouseEvent>;
	disabled?: boolean;
}

export function SquareIconButton(props: SquareIconButtonProps) {
	const theme = () => props.theme ?? 'light';
	return (
		<Dynamic
			component={props.as ?? 'button'}
			type={props.type ?? 'button'}
			onClick={props.onClick}
			disabled={props.disabled}
			classList={{
				'border-theme-base-200 bg-theme-base-100 text-theme-base-900 hover:enabled:border-theme-base-400 hover:enabled:bg-theme-base-300 disabled:text-theme-base-400':
					theme() === 'light',
				'border-white/10 bg-white/[0.06] text-theme-base-100 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.08)] backdrop-blur hover:enabled:border-theme-accent-400/50 hover:enabled:bg-theme-accent-500/15':
					theme() === 'dark',
			}}
			class={`size-10 rounded-full border transition-all duration-300 grid-center hover:enabled:-translate-y-0.5 hover:enabled:scale-105 disabled:cursor-not-allowed disabled:opacity-40 data-[icon]:*:size-6 ${
				props.class ?? ''
			}`}
		>
			{props.children}
		</Dynamic>
	);
}
