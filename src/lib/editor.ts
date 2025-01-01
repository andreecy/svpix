import { get } from 'svelte/store';
import {
	tileSize as tileSizeStore,
	selectionRectPos as selectionRectPosStore
} from './stores/tiles';
import { Tiles } from './tiles';
import { Canvas } from './canvas';
import { Color } from './color';

export const originSize = 128;

// update canvas paint
export async function updateCanvasPaint() {
	if (!Tiles.instance.imageData) return;
	const tilesBitmap = await createImageBitmap(Tiles.instance.imageData);

	// canvasPaint, the current selected tile, painting canvas
	const canvasPaint = document.getElementById('canvasPaint') as HTMLCanvasElement;
	const paintCtx = canvasPaint.getContext('2d');
	if (!paintCtx) return;

	const tileSize = get(tileSizeStore);
	const selectionRectPos = get(selectionRectPosStore);

	paintCtx.imageSmoothingEnabled = false;
	paintCtx.clearRect(0, 0, tileSize, tileSize);
	if (tilesBitmap) {
		paintCtx.drawImage(
			tilesBitmap,
			selectionRectPos.x,
			selectionRectPos.y,
			tileSize,
			tileSize,
			0,
			0,
			tileSize,
			tileSize
		);
	}
}

// update canvas origin, the hidden canvas, represent the original image
export async function updateCanvasOrigin() {
	if (!Tiles.instance.imageData) return;
	const tilesBitmap = await createImageBitmap(Tiles.instance.imageData);

	// origin canvas, represent the original image
	const canvas = document.getElementById('canvasOrigin') as HTMLCanvasElement;
	const ctx = canvas.getContext('2d');
	if (!ctx) return;
	ctx.clearRect(0, 0, originSize, originSize);
	if (tilesBitmap) {
		ctx.drawImage(tilesBitmap, 0, 0);
	}
}

// update canvas tiles
export async function updateCanvasTiles() {
	if (!Tiles.instance.imageData) return;
	const tilesBitmap = await createImageBitmap(Tiles.instance.imageData);

	const tileSize = get(tileSizeStore);
	const selectionRectPos = get(selectionRectPosStore);

	const size = tileSize + 2;
	const selectionRect = new Canvas(size, size);
	selectionRect.setImageData(new ImageData(size, size));
	for (let x = 0; x < size; x++) {
		for (let y = 0; y < size; y++) {
			if (x === 0 || x === size - 1 || y === 0 || y === size - 1) {
				selectionRect.setPixel(x, y, new Color(255, 255, 255, 255));
			} else {
				selectionRect.setPixel(x, y, new Color(0, 0, 0, 0));
			}
		}
	}
	const selectionRectBitmap = await selectionRect.getImageBitmap();

	// canvasTiles, represent the tiles
	const canvas = document.getElementById('canvasTiles') as HTMLCanvasElement;
	const ctx = canvas.getContext('2d');
	if (!ctx) return;
	ctx.imageSmoothingEnabled = false;
	ctx.clearRect(0, 0, originSize, originSize);
	if (tilesBitmap) {
		ctx.drawImage(tilesBitmap, 0, 0);
	}
	if (selectionRectBitmap) {
		ctx.drawImage(selectionRectBitmap, selectionRectPos.x - 1, selectionRectPos.y - 1);
	}
}
