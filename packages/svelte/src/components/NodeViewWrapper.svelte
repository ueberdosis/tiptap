<script lang="ts">
  import { getContext } from 'svelte'
  import type { Snippet } from 'svelte'

  let { as = 'div', class: className, children }: { as?: string; class?: string; children?: Snippet } = $props()

  let onDragStart = getContext<(event: DragEvent) => void>('onDragStart')
  let decorationClasses = getContext<string>('decorationClasses')

  let combinedClass = [decorationClasses, className].filter(Boolean).join(' ') || undefined
</script>

<svelte:element this={as} data-node-view-wrapper="" class={combinedClass} style="white-space: normal" ondragstart={onDragStart}>
  {#if children}
    {@render children()}
  {/if}
</svelte:element>
