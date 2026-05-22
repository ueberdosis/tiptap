<script lang="ts">
  import { getContext } from 'svelte'

  let { as = 'div', ...rest }: { as?: string } & Record<string, any> = $props()

  let onDragStart = getContext<(event: DragEvent) => void>('onDragStart')
  let decorationClasses = getContext<string>('decorationClasses')
</script>

<svelte:element this={as} data-node-view-wrapper="" class={decorationClasses} style="white-space: normal" ondragstart={onDragStart} {...rest}>
  <slot />
</svelte:element>
