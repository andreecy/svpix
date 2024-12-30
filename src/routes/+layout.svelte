<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>SvPix - Pixel Art Sprite Editor powered by Svelte</title>
</svelte:head>

{@render children()}
