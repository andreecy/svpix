<script lang="ts">
	import { activeTool, Tool } from '$lib/stores/tool';

	const tools = [Tool.Pencil, Tool.Eraser, Tool.Fill];
</script>

<div class="grid grid-cols-4 gap-2">
	{#each tools as tool}
		<button
			class="h-8 w-8 {tool == $activeTool ? 'bg-slate-500 text-white' : 'text-white'}"
			onclick={() => ($activeTool = tool)}
			title={tool == Tool.Pencil ? 'Pencil' : tool == Tool.Eraser ? 'Eraser' : 'Fill'}
		>
			{tool == Tool.Pencil ? '✏️' : tool == Tool.Eraser ? '🧼' : '💧'}
		</button>
	{/each}
</div>
