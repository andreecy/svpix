<script lang="ts">
	import { colors } from '$lib/pallete';
	import { selectedIndex } from '$lib/stores/pallete';
</script>

<div class="flex w-96 flex-row flex-wrap">
	{#each colors as color, index}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="h-12 w-12 border-2 border-black {$selectedIndex === index
				? 'border-white'
				: 'border-black'}"
			style="background-color: #{color.toString(16)};"
			onclick={() => {
				selectedIndex.set(index);
			}}
		></div>
	{/each}
</div>
