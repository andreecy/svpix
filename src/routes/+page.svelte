<script lang="ts">
	import { Canvas } from '$lib/canvas';
	import { Color } from '$lib/color';
	import PalleteComponent from '$lib/components/PalleteComponent.svelte';
	import ToolComponent from '$lib/components/ToolComponent.svelte';
	import { selectedColor } from '$lib/stores/pallete';
	import { activeTool, Tool } from '$lib/stores/tool';
	import { onMount } from 'svelte';

	const originSize = 128;

	let canvasOrigin: HTMLCanvasElement;
	let canvasTiles: HTMLCanvasElement;
	let canvasPaint: HTMLCanvasElement;

	let tilesMousePos = $state({ x: 0, y: 0 });

	let selectedTileIndex = $state(0);
	let selectionRectPos = $state({ x: 0, y: 0 });

	let paintMousePos = $state({ x: 0, y: 0 });
	let isMouseDown = $state(false);

	// data of the original file
	let tiles: Canvas | undefined;

	// tile size in px / zoom
	let tileSize = $state(8);

	// update canvas when tileSize / zoom changes
	$effect(() => {
		if (tileSize) {
			updateCanvasOrigin();
			updateCanvasTiles();
			updateCanvasPaint();
		}
	});

	async function updateCanvasOrigin() {
		const tilesBitmap = await tiles?.getImageBitmap();
		// origin canvas, represent the original image
		let originCtx = canvasOrigin.getContext('2d');
		if (!originCtx) return;
		originCtx.clearRect(0, 0, originSize, originSize);
		if (tilesBitmap) {
			originCtx.drawImage(tilesBitmap, 0, 0);
		}
	}

	function newBlank() {
		tiles?.clearPixel();
		updateCanvasOrigin();
		updateCanvasTiles();
		updateCanvasPaint();
	}

	let inputFile: HTMLInputElement;

	function loadfile() {
		inputFile.type = 'file';
		inputFile.accept = 'image/*';
		inputFile.click();

		inputFile.addEventListener('change', (event) => {
			const file = (event.target as HTMLInputElement).files![0];

			if (file) {
				const reader = new FileReader();
				reader.onload = async function () {
					const img = new Image();
					img.src = reader.result as string;

					await img.decode();
					const ctx = canvasOrigin.getContext('2d');
					if (!ctx) return;
					ctx.clearRect(0, 0, originSize, originSize);
					ctx.drawImage(img, 0, 0);

					tiles = new Canvas(originSize, originSize);
					tiles.setImageData(ctx.getImageData(0, 0, originSize, originSize));

					updateCanvasOrigin();
					updateCanvasTiles();
					updateCanvasPaint();
				};

				reader.readAsDataURL(file);
			}
		});
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
		const tilesBitmap = await tiles?.getImageBitmap();

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
		if (tilesBitmap) {
			tilesCtx.drawImage(tilesBitmap, 0, 0);
		}
		tilesCtx.drawImage(selectionRectBitmap, selectionRectPos.x - 1, selectionRectPos.y - 1);
	}

	async function updateCanvasPaint() {
		const tilesBitmap = await tiles?.getImageBitmap();

		// canvasPaint, the current selected tile, painting canvas
		let paintCtx = canvasPaint.getContext('2d');
		if (!paintCtx) return;
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

	type Point = { x: number; y: number };

	function fill(startPoint: Point, fillColor: Color) {
		const oldColor = tiles?.getPixel(startPoint.x, startPoint.y);
		if (oldColor?.toUint32() === fillColor.toUint32()) return;

		const stack: Point[] = [startPoint];

		while (stack.length > 0) {
			const { x, y } = stack.pop()!;
			const targetColor = tiles?.getPixel(x, y);

			// check bounds and if the pixel need to be filled
			if (
				x >= selectionRectPos.x &&
				x < selectionRectPos.x + tileSize &&
				y >= selectionRectPos.y &&
				y < selectionRectPos.y + tileSize &&
				targetColor?.toUint32() === oldColor?.toUint32()
			) {
				tiles?.setPixel(x, y, fillColor);

				// add neighbors to the stack
				const left = { x: x - 1, y: y };
				if (tiles?.getPixel(left.x, left.y).toUint32() === oldColor?.toUint32()) stack.push(left);

				const right = { x: x + 1, y: y };
				if (tiles?.getPixel(right.x, right.y).toUint32() === oldColor?.toUint32())
					stack.push(right);

				const top = { x: x, y: y - 1 };
				if (tiles?.getPixel(top.x, top.y).toUint32() === oldColor?.toUint32()) stack.push(top);

				const bottom = { x: x, y: y + 1 };
				if (tiles?.getPixel(bottom.x, bottom.y).toUint32() === oldColor?.toUint32())
					stack.push(bottom);
			}
		}
	}

	function paintDraw() {
		const x = paintMousePos.x + selectionRectPos.x;
		const y = paintMousePos.y + selectionRectPos.y;

		switch ($activeTool) {
			case Tool.Pencil:
				tiles?.setPixel(x, y, $selectedColor);
				break;
			case Tool.Eraser:
				tiles?.deletePixel(x, y);
				break;
			case Tool.Fill:
				fill({ x, y }, $selectedColor);
				break;
		}
		updateCanvasOrigin();
		updateCanvasTiles();
		updateCanvasPaint();
	}

	function updateSelection() {
		const { x, y } = tilesMousePos;
		const col = Math.floor(x / 8);
		const row = Math.floor(y / 8);
		// get index of 16 rows and 16 cols tiles
		const index = row * 16 + col;
		// console.log({ row, col, index });
		selectedTileIndex = index;

		const targetRectX = Math.min(col * 8, originSize - tileSize);
		const targetRectY = Math.min(row * 8, originSize - tileSize);

		// get selection rect pos by col row
		selectionRectPos = { x: targetRectX, y: targetRectY };
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
			updateSelection();
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

<div class="font-mono">
	<div class="flex h-screen items-center">
		<div class="flex h-full flex-1 flex-row items-start">
			<div class="h-full flex-1 bg-slate-950">
				<div
					class="flex h-10 flex-row items-center justify-between bg-slate-700 px-4 py-1 text-white"
				>
					<div class="flex items-center gap-8">
						<p>TILES</p>
						<p>
							<span>⊹</span>
							<span>x: {tilesMousePos.x}</span>
							<span>y: {tilesMousePos.y}</span>
						</p>
						<p>
							<span>⛶</span>
							<span>#{selectedTileIndex}</span>
							<span>x: {selectionRectPos.x}</span>
							<span>y: {selectionRectPos.y}</span>
						</p>
					</div>

					<div class="flex items-center gap-4 p-2">
						<p class="text-white">Zoom</p>
						<div class="grid grid-cols-4 gap-2">
							<button
								class="h-6 w-6 {tileSize === 8
									? 'bg-slate-300 text-black'
									: 'bg-slate-800 text-white'}"
								onclick={() => (tileSize = 8)}>8</button
							>
							<button
								class="h-6 w-6 {tileSize === 16
									? 'bg-slate-300 text-black'
									: 'bg-slate-800 text-white'}"
								onclick={() => (tileSize = 16)}>16</button
							>
							<button
								class="h-6 w-6 {tileSize === 32
									? 'bg-slate-300 text-black'
									: 'bg-slate-800 text-white'}"
								onclick={() => (tileSize = 32)}>32</button
							>
							<button
								class="h-6 w-6 {tileSize === 64
									? 'bg-slate-300 text-black'
									: 'bg-slate-800 text-white'}"
								onclick={() => (tileSize = 64)}>64</button
							>
						</div>
					</div>
				</div>
				<div class="flex flex-col items-center gap-4 p-4">
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
						class="border-4 border-neutral-600 bg-black"
						style="width: 640px; height: 640px;"
						bind:this={canvasTiles}
					></canvas>
					<div class="flex-col items-center gap-4 p-4">
						<button class="bg-slate-700 px-2 py-1 text-white" onclick={newBlank}>New</button>
						<input type="file" id="inputFile" bind:this={inputFile} style="display: none;" />
						<button class="bg-slate-700 px-2 py-1 text-white" onclick={loadfile}>Load</button>
						<button class="bg-slate-700 px-2 py-1 text-white" onclick={exportPng}>Export</button>
					</div>
				</div>
			</div>
			<div class="h-full flex-1 bg-slate-800">
				<div class="flex h-10 items-center gap-8 bg-slate-700 px-4 py-1 text-white">
					<p>CANVAS</p>
					<p>
						<span>⊹</span>
						<span>x: {paintMousePos.x}</span>
						<span>y: {paintMousePos.y}</span>
					</p>
				</div>
				<div class="flex flex-col items-center gap-4 p-4">
					<p class="text-xl text-white">#{selectedTileIndex}</p>
					<canvas
						width={tileSize}
						height={tileSize}
						class="border border-black bg-black"
						style="width: 480px; height: 480px;"
						bind:this={canvasPaint}
					></canvas>
					<ToolComponent />
					<PalleteComponent />
				</div>
			</div>
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
