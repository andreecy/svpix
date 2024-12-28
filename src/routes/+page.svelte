<script lang="ts">
	import { Canvas, Color } from '$lib/canvas';
	import { onMount } from 'svelte';

	const w = 128;
	const h = 128;
	let canvasTiles: HTMLCanvasElement;
	let canvas: HTMLCanvasElement;

	onMount(() => {
		let ctx = canvasTiles.getContext('2d');
		if (!ctx) return;
		ctx.imageSmoothingEnabled = false;
		const c = new Canvas(w, h);
		for (let x = 0; x < w; x++) {
			for (let y = 0; y < h; y++) {
				// random color for 16x16
				if (x < 16 && y < 16) {
					c.setPixel(x, y, new Color(x * 20, x * 20, x * 20, 255));
				}
			}
		}
		ctx.putImageData(c.imageData, 0, 0);

		let context = canvas.getContext('2d');
		if (!context) return;
		context.imageSmoothingEnabled = false;
		context.drawImage(canvasTiles, 0, 0, w, h);
	});
</script>

<div class="flex h-screen items-center">
	<div class="flex h-full flex-1 flex-row items-start gap-4 p-4">
		<canvas
			width={w}
			height={h}
			class="block border border-neutral-500"
			style="width: 512px; height: 512px;"
			bind:this={canvasTiles}
		></canvas>
		<canvas
			width={8}
			height={8}
			class="block border border-neutral-500"
			style="width: 512px; height: 512px;"
			bind:this={canvas}
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
