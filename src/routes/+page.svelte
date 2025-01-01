<script lang="ts">
	import TilesComponent from '$lib/components/TilesComponent.svelte';
	import CanvasComponent from '$lib/components/CanvasComponent.svelte';
</script>

<div class="font-mono">
	<div class="flex h-screen items-center">
		<div class="flex h-full flex-1 flex-row items-start">
			<TilesComponent />
			<CanvasComponent />
		</div>
	</div>
</div>
