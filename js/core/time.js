/**
 * time.js: clock and timing helpers.
 */


/** Seconds since the page loaded, with sub-millisecond precision. */
export function NowSeconds() {
	return performance.now() / 1000;
}


/** A promise that resolves after `milliseconds`. */
export function Sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}


/**
 * Calls onProgress(p) every animation frame with p rising from 0 to 1 over `milliseconds`.
 * Resolves after the call with p = 1.
 */
export function Tween(milliseconds, onProgress) {
	return new Promise(resolve => {
		const startTime = performance.now();
		const step = () => {
			const progress = Math.min(1, (performance.now() - startTime) / milliseconds);
			onProgress(progress);
			if (progress < 1) {
				requestAnimationFrame(step);
			} else {
				resolve();
			}
		};
		requestAnimationFrame(step);
	});
}


/** A duration as "mm:ss" (minutes keep counting past 59). */
export function FormatMinutesSeconds(seconds) {
	const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
	const remainder = String(Math.floor(seconds % 60)).padStart(2, '0');
	return `${minutes}:${remainder}`;
}
