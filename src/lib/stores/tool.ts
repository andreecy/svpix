import { writable } from 'svelte/store';

export const enum Tool {
	Pencil = 0,
	Eraser = 1,
	Fill = 2
}

export const activeTool = writable<Tool>(Tool.Pencil);
