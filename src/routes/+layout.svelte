<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>SvPix - Pixel art sprite editor powered by Svelte</title>
</svelte:head>

{@render children()}
