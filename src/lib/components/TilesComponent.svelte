<script lang="ts">
	import {
		originSize,
		updateCanvasOrigin,
		updateCanvasPaint,
		updateCanvasTiles
	} from '$lib/editor';
	import {
		tileSize as tileSizeStore,
		tilesMousePos as tilesMousePosStore,
		selectedTileIndex as selectedTileIndexStore,
		selectionRectPos as selectionRectPosStore
	} from '$lib/stores/tiles';
	import { Tiles } from '$lib/tiles';
	import { onMount } from 'svelte';

	let canvasOrigin: HTMLCanvasElement;
	let canvasTiles: HTMLCanvasElement;

	const tileSize = $derived($tileSizeStore);
	const tilesMousePos = $derived($tilesMousePosStore);
	const selectedTileIndex = $derived($selectedTileIndexStore);
	const selectionRectPos = $derived($selectionRectPosStore);

	function newFile() {
		Tiles.instance.clearPixel();
		updateCanvasOrigin();
		updateCanvasTiles();
		updateCanvasPaint();
	}

	let inputFile: HTMLInputElement;

	// open image file
	function loadFile() {
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

					Tiles.instance.setImageData(ctx.getImageData(0, 0, originSize, originSize));

					updateCanvasOrigin();
					updateCanvasTiles();
					updateCanvasPaint();
				};

				reader.readAsDataURL(file);

				// reset input file
				inputFile.value = '';
			}
		});
	}

	// export to png image and download
	function exportFile() {
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

	// update canvas when tileSize / zoom changes
	$effect(() => {
		if (tileSize) {
			updateCanvasOrigin();
			updateCanvasTiles();
		}
	});

	// handle click on tiles to select active canvas
	function handleSelect() {
		const { x, y } = tilesMousePos;
		const col = Math.floor(x / 8);
		const row = Math.floor(y / 8);
		// get index of 16 rows and 16 cols tiles
		const index = row * 16 + col;
		// console.log({ row, col, index });
		selectedTileIndexStore.set(index);

		const targetRectX = Math.min(col * 8, originSize - tileSize);
		const targetRectY = Math.min(row * 8, originSize - tileSize);

		// get selection rect pos by col row
		selectionRectPosStore.set({ x: targetRectX, y: targetRectY });

		// update selection also update rendering canvasTiles and canvasPaint
		updateCanvasTiles();
		updateCanvasPaint();
	}

	onMount(async () => {
		Tiles.instance.setImageData(new ImageData(128, 128));
		updateCanvasOrigin();
		updateCanvasTiles();

		canvasTiles.addEventListener('mousemove', function (event) {
			const rect = canvasTiles.getBoundingClientRect();
			const scale = 640 / originSize;
			const x = Math.floor((event.clientX - rect.left) / scale);
			const y = Math.floor((event.clientY - rect.top) / scale);
			tilesMousePosStore.set({ x, y });
		});

		canvasTiles.addEventListener('mousedown', function () {
			handleSelect();
		});
	});
</script>

<div class="h-full flex-1 bg-slate-950">
	<div class="flex h-10 flex-row items-center justify-between bg-slate-700 px-4 py-1 text-white">
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
					class="h-6 w-6 {tileSize === 8 ? 'bg-slate-300 text-black' : 'bg-slate-800 text-white'}"
					onclick={() => tileSizeStore.set(8)}>8</button
				>
				<button
					class="h-6 w-6 {tileSize === 16 ? 'bg-slate-300 text-black' : 'bg-slate-800 text-white'}"
					onclick={() => tileSizeStore.set(16)}>16</button
				>
				<button
					class="h-6 w-6 {tileSize === 32 ? 'bg-slate-300 text-black' : 'bg-slate-800 text-white'}"
					onclick={() => tileSizeStore.set(32)}>32</button
				>
				<button
					class="h-6 w-6 {tileSize === 64 ? 'bg-slate-300 text-black' : 'bg-slate-800 text-white'}"
					onclick={() => tileSizeStore.set(64)}>64</button
				>
			</div>
		</div>
	</div>
	<div class="flex flex-col items-center gap-4 p-4">
		<canvas
			id="canvasOrigin"
			bind:this={canvasOrigin}
			width={originSize}
			height={originSize}
			class="hidden border border-black"
			style="width: 128px; height: 128px;"
		></canvas>
		<canvas
			id="canvasTiles"
			bind:this={canvasTiles}
			width={originSize}
			height={originSize}
			class="border-4 border-neutral-600 bg-black"
			style="width: 640px; height: 640px;"
		></canvas>
		<div class="flex-col items-center gap-4 p-4">
			<button class="bg-slate-700 px-2 py-1 text-white" onclick={newFile}>New</button>
			<input type="file" id="inputFile" bind:this={inputFile} style="display: none;" />
			<button class="bg-slate-700 px-2 py-1 text-white" onclick={loadFile}>Load</button>
			<button class="bg-slate-700 px-2 py-1 text-white" onclick={exportFile}>Export</button>
		</div>
	</div>
</div>
