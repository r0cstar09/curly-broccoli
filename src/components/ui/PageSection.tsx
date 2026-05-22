import { type JSX, type ParentProps, splitProps } from 'solid-js';
import { twMerge } from 'tailwind-merge';

interface PageSectionProps extends JSX.HTMLAttributes<HTMLElement> {
	children?: JSX.Element;
}

export function PageSection(props: PageSectionProps) {
	const [local, others] = splitProps(props, ['children', 'class']);

	return (
		<section class={`relative flex flex-col gap-5 ${local.class || ''}`} {...others}>
			{local.children}
		</section>
	);
}

export function PageHeading(props: ParentProps<JSX.HTMLAttributes<HTMLHeadingElement>>) {
	const [local, others] = splitProps(props, ['children', 'class']);
	return (
		<h2
			{...others}
			class={twMerge(
				'relative inline-flex w-fit items-center gap-3 font-display text-2xl font-extrabold tracking-[-0.03em] text-theme-base-100 after:h-px after:w-16 after:bg-gradient-to-r after:from-theme-accent-400 after:to-transparent md:text-4xl',
				local.class,
			)}
		>
			{local.children}
		</h2>
	);
}
