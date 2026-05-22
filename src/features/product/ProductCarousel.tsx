import { RiArrowsArrowLeftLine, RiArrowsArrowRightLine } from 'solid-icons/ri';
import { type ParentProps, createSignal, createUniqueId } from 'solid-js';
import { SquareIconButton } from '~/components/ui/Button.tsx';
import { PageHeading, PageSection } from '~/components/ui/PageSection.tsx';

export const MEASURED_ITEM_ID = 'measured-li';
export const GAP = 16; // gap-4

export default function ProductCarouselSection(
	props: ParentProps<{
		heading: string;
	}>,
) {
	let list: HTMLDivElement | undefined;
	const headingId = createUniqueId();
	const [scrollStatus, setScrollStatus] = createSignal<'start' | 'end' | 'middle'>('start');

	const scroll = (delta: number) => {
		if (!list) return;

		const item = document.getElementById(MEASURED_ITEM_ID);
		const itemWidth = (item?.getBoundingClientRect().width ?? 300) + GAP;
		const containerWidth = list.getBoundingClientRect().width;
		const numCardsToScrollBy = Math.max(Math.floor(containerWidth / itemWidth), 1);

		list.scrollBy({
			left: numCardsToScrollBy * itemWidth * delta,
			behavior: 'smooth',
		});
	};

	return (
		<PageSection aria-labelledby={headingId}>
			<div class="flex items-center justify-between gap-2">
				<PageHeading id={headingId}>{props.heading}</PageHeading>
				<div class="flex gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1 backdrop-blur">
					<SquareIconButton
						theme="dark"
						onClick={() => scroll(-1)}
						disabled={scrollStatus() === 'start'}
					>
						<RiArrowsArrowLeftLine />
						<span class="sr-only">Scroll left</span>
					</SquareIconButton>
					<SquareIconButton
						theme="dark"
						onClick={() => scroll(1)}
						disabled={scrollStatus() === 'end'}
					>
						<RiArrowsArrowRightLine />
						<span class="sr-only">Scroll right</span>
					</SquareIconButton>
				</div>
			</div>
			<div
				onScroll={() => {
					if (!list) return;
					const listWidth = list.getBoundingClientRect().width;
					setScrollStatus(() => {
						if (!list || list.scrollLeft <= 0) return 'start';
						if (Math.ceil(list.scrollLeft + listWidth) >= list.scrollWidth) return 'end';
						return 'middle';
					});
				}}
				class="no-scrollbar -mx-4 snap-x snap-mandatory overflow-x-auto px-4 [mask-image:linear-gradient(90deg,transparent,black_1rem,black_96%,transparent)] sm:snap-none"
				ref={list}
			>
				{props.children}
			</div>
		</PageSection>
	);
}
