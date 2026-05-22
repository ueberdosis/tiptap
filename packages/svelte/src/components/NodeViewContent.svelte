<script lang="ts">
  let { as = 'div' }: { as?: string } = $props()
</script>

<svelte:element this={as} data-node-view-content="" style="white-space: pre-wrap">
  <slot />
</svelte:element>
