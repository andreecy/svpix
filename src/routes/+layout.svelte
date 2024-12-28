<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>SvPix</title>
</svelte:head>

{@render children()}
