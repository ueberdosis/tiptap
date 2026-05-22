<script lang="ts">
  let { as = 'span', class: className }: { as?: string; class?: string } = $props()
</script>

{#key 'mvc'}
  <svelte:element this={as} class={className} data-mark-view-content="" style="white-space: inherit"></svelte:element>
{/key}
