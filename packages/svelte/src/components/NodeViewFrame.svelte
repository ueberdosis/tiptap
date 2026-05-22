<script lang="ts">
  import { setContext } from 'svelte'

  let { component: Component, onDragStart, decorationClasses, ...props }: {
    component: any
    onDragStart: (event: DragEvent) => void
    decorationClasses: string
    [key: string]: any
  } = $props()

  setContext('onDragStart', onDragStart)
  setContext('decorationClasses', decorationClasses)
</script>

<Component {...props} />
