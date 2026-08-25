// <recipe-grid columns> is a static count with no breakpoints of its own — the
// published component's doc comment says the app decides breakpoint behaviour. This
// tracks viewport width and returns the target column count: 1 / 2 @768 / 3 @1024 /
// 4 @1280.
const BREAKPOINTS: [minWidth: number, columns: 1 | 2 | 3 | 4][] = [
	[1280, 4],
	[1024, 3],
	[768, 2],
	[0, 1]
];

export function gridColumns() {
	let columns = $state<1 | 2 | 3 | 4>(1);

	$effect(() => {
		// $effect never runs during SSR, so `window` is always defined here.
		const update = () => {
			// eslint-disable-next-line no-restricted-globals -- guarded by $effect above
			const width = window.innerWidth;
			columns = BREAKPOINTS.find(([minWidth]) => width >= minWidth)?.[1] ?? 1;
		};
		update();
		// eslint-disable-next-line no-restricted-globals -- guarded by $effect above
		window.addEventListener('resize', update);
		// eslint-disable-next-line no-restricted-globals -- guarded by $effect above
		return () => window.removeEventListener('resize', update);
	});

	return {
		get value() {
			return columns;
		}
	};
}
