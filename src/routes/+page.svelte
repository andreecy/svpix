<script lang="ts">
	import { Canvas, Color } from '$lib/canvas';
	import { onMount } from 'svelte';

	const w = 128;
	const h = 128;

	let canvasOrigin: HTMLCanvasElement;
	let canvasTiles: HTMLCanvasElement;
	let canvasPaint: HTMLCanvasElement;

	onMount(async () => {
		const tiles = new Canvas(w, h);
		for (let x = 0; x < w; x++) {
			for (let y = 0; y < h; y++) {
				// random color for 16x16
				if (x < 16 && y < 16) {
					tiles.setPixel(x, y, new Color(x * 10 + y * 10, x * 10 + y * 10, x * 10 + y * 10, 255));
				}
			}
		}

		const tilesBitmap = await tiles.getImageBitmap();

		const selectionRect = new Canvas(8, 8);
		for (let x = 0; x < 8; x++) {
			for (let y = 0; y < 8; y++) {
				if (x === 0 || x === 7 || y === 0 || y === 7) {
					selectionRect.setPixel(x, y, new Color(255, 255, 255, 255));
				} else {
					selectionRect.setPixel(x, y, new Color(0, 0, 0, 0));
				}
			}
		}
		const selectionRectBitmap = await selectionRect.getImageBitmap();

		// origin canvas, represent the original image
		let originCtx = canvasOrigin.getContext('2d');
		if (!originCtx) return;
		originCtx.drawImage(tilesBitmap, 0, 0);

		// canvasTiles, represent the tiles
		let tilesCtx = canvasTiles.getContext('2d');
		if (!tilesCtx) return;
		tilesCtx.imageSmoothingEnabled = false;
		tilesCtx.drawImage(canvasOrigin, 0, 0, w, h);
		tilesCtx.drawImage(selectionRectBitmap, 0, 0);

		// canvasPaint, the current selected tile, painting canvas
		let paintCtx = canvasPaint.getContext('2d');
		if (!paintCtx) return;
		paintCtx.imageSmoothingEnabled = false;
		paintCtx.drawImage(canvasOrigin, 0, 0, w, h);
	});
</script>

<div class="flex h-screen items-center">
	<div class="flex h-full flex-1 flex-row items-start gap-4 p-4">
		<canvas
			width={w}
			height={h}
			class="hidden border border-black"
			style="width: 128px; height: 128px;"
			bind:this={canvasOrigin}
		></canvas>
		<canvas
			width={w}
			height={h}
			class="border border-black"
			style="width: 512px; height: 512px;"
			bind:this={canvasTiles}
		></canvas>
		<canvas
			width={8}
			height={8}
			class="border border-black"
			style="width: 512px; height: 512px;"
			bind:this={canvasPaint}
		></canvas>
	</div>
</div>

<style>
	canvas {
		image-rendering: optimizeSpeed;
		image-rendering: -moz-crisp-edges;
		image-rendering: -o-crisp-edges;
		image-rendering: -webkit-optimize-contrast;
		image-rendering: optimize-contrast;
		image-rendering: crisp-edges;
		image-rendering: pixelated;
		-ms-interpolation-mode: nearest-neighbor;
	}
</style>
