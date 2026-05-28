<script lang="ts">
  let { as = 'div', class: className }: { as?: string; class?: string } = $props()
</script>

{#key 'nvc'}
  <svelte:element this={as} class={className} data-node-view-content="" style="white-space: pre-wrap"></svelte:element>
{/key}
