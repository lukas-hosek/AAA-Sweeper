/**
 * math.js: numeric helpers that belong to no particular class.
 */


/** A full circle in radians for canvas arcs. Slightly short of 2π, as every drawing was tuned with it. */
export const FULL_TURN = 6.283;


/** Limits `value` to the range [min, max]. */
export function Clamp(value, min, max) {
	return value < min ? min : value > max ? max : value;
}


/** Frequency in Hz of a MIDI note number (69 = A4 = 440 Hz). */
export function MidiToFrequency(midiNote) {
	return 440 * Math.pow(2, (midiNote - 69) / 12);
}
