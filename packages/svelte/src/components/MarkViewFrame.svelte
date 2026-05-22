<script lang="ts">
  import { setContext } from 'svelte'

  let {
    component: Component,
    extension,
    ...props
  }: {
    component: any
    extension?: { name?: string }
    [key: string]: any
  } = $props()

  let className = `svelte-renderer mark-${extension?.name || 'unknown'}`
</script>

<div class={className} data-mark-view-wrapper="">
  <Component extension={extension} {...props} />
</div>
