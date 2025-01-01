import { writable } from 'svelte/store';

// tile size in px / zoom
export const tileSize = writable(8);

export const tilesMousePos = writable({ x: 0, y: 0 });
export const selectedTileIndex = writable(0);
export const selectionRectPos = writable({ x: 0, y: 0 });
