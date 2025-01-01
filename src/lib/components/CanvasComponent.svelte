<script lang="ts">
	import PalleteComponent from '$lib/components/PalleteComponent.svelte';
	import ToolComponent from '$lib/components/ToolComponent.svelte';
	import { Color } from '$lib/color';
	import { selectedColor } from '$lib/stores/pallete';
	import { activeTool, Tool } from '$lib/stores/tool';
	import {
		tileSize as tileSizeStore,
		selectedTileIndex as selectedTileIndexStore,
		selectionRectPos as selectionRectPosStore
	} from '$lib/stores/tiles';
	import { onMount } from 'svelte';
	import { Tiles } from '$lib/tiles';
	import { updateCanvasOrigin, updateCanvasPaint, updateCanvasTiles } from '$lib/editor';

	let canvasPaint: HTMLCanvasElement;

	let paintMousePos = $state({ x: 0, y: 0 });
	let isMouseDown = $state(false);

	const tileSize = $derived($tileSizeStore);
	const selectedTileIndex = $derived($selectedTileIndexStore);
	const selectionRectPos = $derived($selectionRectPosStore);

	// update canvas when tileSize / zoom changes
	$effect(() => {
		if (tileSize) {
			updateCanvasPaint();
		}
	});

	type Point = { x: number; y: number };

	function fill(startPoint: Point, fillColor: Color) {
		const oldColor = Tiles.instance?.getPixel(startPoint.x, startPoint.y);
		if (oldColor?.toUint32() === fillColor.toUint32()) return;

		const stack: Point[] = [startPoint];

		while (stack.length > 0) {
			const { x, y } = stack.pop()!;
			const targetColor = Tiles.instance?.getPixel(x, y);

			// check bounds and if the pixel need to be filled
			if (
				x >= selectionRectPos.x &&
				x < selectionRectPos.x + tileSize &&
				y >= selectionRectPos.y &&
				y < selectionRectPos.y + tileSize &&
				targetColor?.toUint32() === oldColor?.toUint32()
			) {
				Tiles.instance.setPixel(x, y, fillColor);

				// add neighbors to the stack
				const left = { x: x - 1, y: y };
				if (Tiles.instance.getPixel(left.x, left.y).toUint32() === oldColor?.toUint32())
					stack.push(left);

				const right = { x: x + 1, y: y };
				if (Tiles.instance.getPixel(right.x, right.y).toUint32() === oldColor?.toUint32())
					stack.push(right);

				const top = { x: x, y: y - 1 };
				if (Tiles.instance.getPixel(top.x, top.y).toUint32() === oldColor?.toUint32())
					stack.push(top);

				const bottom = { x: x, y: y + 1 };
				if (Tiles.instance.getPixel(bottom.x, bottom.y).toUint32() === oldColor?.toUint32())
					stack.push(bottom);
			}
		}
	}

	function handlePaint() {
		const x = paintMousePos.x + selectionRectPos.x;
		const y = paintMousePos.y + selectionRectPos.y;

		switch ($activeTool) {
			case Tool.Pencil:
				Tiles.instance.setPixel(x, y, $selectedColor);
				break;
			case Tool.Eraser:
				Tiles.instance.deletePixel(x, y);
				break;
			case Tool.Fill:
				fill({ x, y }, $selectedColor);
				break;
		}
		updateCanvasOrigin();
		updateCanvasTiles();
		updateCanvasPaint();
	}

	onMount(async () => {
		updateCanvasPaint();

		canvasPaint.addEventListener('mousemove', function (event) {
			const rect = canvasPaint.getBoundingClientRect();
			const scale = 480 / tileSize;
			const x = Math.floor((event.clientX - rect.left) / scale);
			const y = Math.floor((event.clientY - rect.top) / scale);
			paintMousePos = { x, y };

			if (isMouseDown) {
				handlePaint();
			}
		});

		canvasPaint.addEventListener('mousedown', function () {
			isMouseDown = true;
			handlePaint();
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
			id="canvasPaint"
			bind:this={canvasPaint}
			width={tileSize}
			height={tileSize}
			class="border border-black bg-black"
			style="width: 480px; height: 480px;"
		></canvas>
		<ToolComponent />
		<PalleteComponent />
	</div>
</div>
