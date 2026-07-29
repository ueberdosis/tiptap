<script lang="ts">
  import { setContext } from 'svelte'

  let { component: Component, onDragStart, decorationClasses, ...props }: {
    component: any
    onDragStart: (event: DragEvent) => void
    decorationClasses: string
    [key: string]: any
  } = $props()

  setContext('onDragStart', onDragStart)
  // Context is only set once, so we pass a getter to let consumers read the
  // current prop value when decorations change.
  setContext('decorationClasses', () => decorationClasses)
</script>

<Component {...props} />
