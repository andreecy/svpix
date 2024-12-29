<script lang="ts">
	import { Canvas } from '$lib/canvas';
	import { Color } from '$lib/color';
	import PalleteComponent from '$lib/components/PalleteComponent.svelte';
	import { selectedColor } from '$lib/stores/pallete';
	import { onMount } from 'svelte';

	const originSize = 128;

	let canvasOrigin: HTMLCanvasElement;
	let canvasTiles: HTMLCanvasElement;
	let canvasPaint: HTMLCanvasElement;

	let tilesMousePos = $state({ x: 0, y: 0 });
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let selectedTileIndex = $state(0);
	let selectionRectPos = $state({ x: 0, y: 0 });

	let paintMousePos = $state({ x: 0, y: 0 });
	let isMouseDown = $state(false);

	// data of the original file
	let tiles: Canvas;

	let tileSize = $state(8);

	async function updateCanvasOrigin() {
		// for (let x = 0; x < w; x++) {
		// 	for (let y = 0; y < h; y++) {
		// 		// random color for 16x16
		// 		if (x < 16 && y < 16) {
		// 			tiles.setPixel(x, y, new Color(x * 10 + y * 10, x * 10 + y * 10, x * 10 + y * 10, 255));
		// 		}
		// 	}
		// }

		const tilesBitmap = await tiles.getImageBitmap();
		// origin canvas, represent the original image
		let originCtx = canvasOrigin.getContext('2d');
		if (!originCtx) return;
		originCtx.drawImage(tilesBitmap, 0, 0);
	}

	function exportPng() {
		const dataURL = canvasOrigin.toDataURL('image/png');

		// Create a temporary link element
		const link = document.createElement('a');
		link.setAttribute('download', 'tiles.png'); // Set the desired filename
		link.setAttribute(
			'href',
			dataURL.replace(/^data:image\/png/i, 'data:application/octet-stream')
		);

		// Trigger a click event to initiate the download
		link.click();
	}

	async function updateCanvasTiles() {
		const tilesBitmap = await tiles.getImageBitmap();

		const size = tileSize + 2;
		const selectionRect = new Canvas(size, size);
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
		let tilesCtx = canvasTiles.getContext('2d');
		if (!tilesCtx) return;
		tilesCtx.imageSmoothingEnabled = false;
		tilesCtx.clearRect(0, 0, originSize, originSize);
		tilesCtx.drawImage(tilesBitmap, 0, 0);
		tilesCtx.drawImage(selectionRectBitmap, selectionRectPos.x - 1, selectionRectPos.y - 1);
	}

	async function updateCanvasPaint() {
		const tilesBitmap = await tiles.getImageBitmap();

		// canvasPaint, the current selected tile, painting canvas
		let paintCtx = canvasPaint.getContext('2d');
		if (!paintCtx) return;
		paintCtx.imageSmoothingEnabled = false;
		paintCtx.clearRect(0, 0, tileSize, tileSize);
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

	function paintDraw() {
		tiles.setPixel(
			paintMousePos.x + selectionRectPos.x,
			paintMousePos.y + selectionRectPos.y,
			$selectedColor
		);
		updateCanvasOrigin();
		updateCanvasTiles();
		updateCanvasPaint();
	}

	onMount(async () => {
		tiles = new Canvas(originSize, originSize);
		updateCanvasOrigin();
		updateCanvasTiles();
		updateCanvasPaint();

		canvasTiles.addEventListener('mousemove', function (event) {
			const rect = canvasTiles.getBoundingClientRect();
			const scale = 640 / originSize;
			const x = Math.floor((event.clientX - rect.left) / scale);
			const y = Math.floor((event.clientY - rect.top) / scale);
			tilesMousePos = { x, y };
		});

		canvasTiles.addEventListener('mousedown', function () {
			const { x, y } = tilesMousePos;
			const col = Math.floor(x / tileSize);
			const row = Math.floor(y / tileSize);
			// get index of 16 rows and 16 cols tiles
			const index = row * 16 + col;
			// console.log({ row, col, index });
			selectedTileIndex = index;
			// get selection rect pos by col row
			selectionRectPos = { x: col * tileSize, y: row * tileSize };
			updateCanvasTiles();
			updateCanvasPaint();
		});

		canvasPaint.addEventListener('mousemove', function (event) {
			const rect = canvasPaint.getBoundingClientRect();
			const scale = 480 / tileSize;
			const x = Math.floor((event.clientX - rect.left) / scale);
			const y = Math.floor((event.clientY - rect.top) / scale);
			paintMousePos = { x, y };

			if (isMouseDown) {
				paintDraw();
			}
		});

		canvasPaint.addEventListener('mousedown', function () {
			isMouseDown = true;
			paintDraw();
		});

		canvasPaint.addEventListener('mouseup', function () {
			isMouseDown = false;
		});

		canvasPaint.addEventListener('mouseleave', function () {
			isMouseDown = false;
		});

		canvasPaint.addEventListener('mouseout', function () {
			isMouseDown = false;
		});
	});
</script>

<div class="flex h-screen items-center">
	<div class="flex h-full flex-1 flex-row items-start gap-4 p-4">
		<div class="flex flex-1 flex-col items-center gap-4">
			<canvas
				width={originSize}
				height={originSize}
				class="hidden border border-black"
				style="width: 128px; height: 128px;"
				bind:this={canvasOrigin}
			></canvas>
			<canvas
				width={originSize}
				height={originSize}
				class="border border-black bg-black"
				style="width: 640px; height: 640px;"
				bind:this={canvasTiles}
			></canvas>
			<button class="bg-black px-4 py-2 text-white" onclick={exportPng}>Export</button>
		</div>
		<div class="flex flex-1 flex-col items-center gap-8">
			<canvas
				width={tileSize}
				height={tileSize}
				class="border border-black bg-black"
				style="width: 480px; height: 480px;"
				bind:this={canvasPaint}
			></canvas>
			<PalleteComponent />
		</div>
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
