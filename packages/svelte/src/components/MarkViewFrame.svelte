<script lang="ts">
  let { component: Component, ...props }: {
    component: any
    [key: string]: any
  } = $props()
</script>

<Component {...props} />
