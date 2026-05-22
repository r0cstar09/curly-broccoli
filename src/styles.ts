import { type ClassNameValue, twMerge } from 'tailwind-merge';

export function button({
	theme = 'dark',
	className,
}: {
	theme?: 'light' | 'dark';
	className?: ClassNameValue;
} = {}) {
	return twMerge(
		theme === 'dark' &&
			'bg-gradient-to-r from-theme-accent-600 via-fuchsia-600 to-rose-500 text-white shadow-[0_14px_34px_-18px_rgb(168_85_247_/_0.95)] hover:shadow-[0_18px_46px_-18px_rgb(244_63_94_/_0.9)]',
		theme === 'light' &&
			'border border-white/50 bg-white text-theme-accent-800 shadow-[0_18px_40px_-24px_rgb(255_255_255_/_0.8)] hover:bg-theme-accent-50',
		'h-9 rounded-full px-4 text-sm font-semibold uppercase tracking-[0.12em] transition-all duration-300 ease-out flex items-center justify-center gap-1.5 hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]',
		className,
	);
}

export function input({
	theme = 'light',
	className,
}: {
	theme?: 'light' | 'dark';
	className?: ClassNameValue;
} = {}) {
	return twMerge(
		'border px-3 min-h-9 min-w-0 block w-64',
		theme === 'dark' && 'bg-theme-base-800 text-white border-theme-base-700',
		theme === 'light' && 'bg-theme-base-100 text-theme-base-600 border-theme-base-200',
		className,
	);
}

export function card({ className }: { className?: ClassNameValue } = {}) {
	return twMerge(
		'relative flex border border-white/10 bg-theme-base-900/80 backdrop-blur',
		className,
	);
}
