<script lang="ts">
  import { getContext } from 'svelte'
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  // class is narrowed to a string because it gets joined with the decoration
  // classes below, and Svelte's ClassValue also allows objects and arrays.
  let { as = 'div', class: className, style, children, ...attributes }: HTMLAttributes<HTMLElement> & {
    as?: string
    class?: string
    children?: Snippet
  } = $props()

  let onDragStart = getContext<(event: DragEvent) => void>('onDragStart')
  let decorationClasses = getContext<(() => string) | undefined>('decorationClasses')

  let combinedClass = $derived(
    [decorationClasses?.(), className].filter(Boolean).join(' ') || undefined,
  )

  // The wrapper needs normal white-space, but a caller style comes last so it
  // can still override it. This matches the React wrapper.
  let combinedStyle = $derived(['white-space: normal', style].filter(Boolean).join('; '))
</script>

<svelte:element
  this={as}
  {...attributes}
  data-node-view-wrapper=""
  class={combinedClass}
  style={combinedStyle}
  ondragstart={onDragStart}
>
  {#if children}
    {@render children()}
  {/if}
</svelte:element>
