import { Color } from '$lib/color';
import { colors } from '$lib/pallete';
import { derived, writable } from 'svelte/store';

export const selectedIndex = writable(0);
export const selectedColor = derived(selectedIndex, (v) => Color.fromUint32(colors[v]));
