<script lang="ts">
  import type { NodeViewProps } from '@tiptap/core'
  import { NodeViewWrapper } from '@tiptap/svelte'

  let { node, updateAttributes }: NodeViewProps = $props()

  function increase() {
    updateAttributes({ count: node.attrs.count + 1 })
  }
</script>

<NodeViewWrapper class="svelte-component">
  <label>Svelte Component</label>

  <div class="content">
    <button onclick={increase}>This button has been clicked {node.attrs.count} times.</button>
  </div>
</NodeViewWrapper>

<style lang="scss">
  :global(.svelte-component) {
    background-color: var(--purple-light);
    border: 2px solid var(--purple);
    border-radius: 0.5rem;
    margin: 2rem 0;
    position: relative;
  }

  :global(.svelte-component label) {
    background-color: var(--purple);
    border-radius: 0 0 0.5rem 0;
    color: var(--white);
    font-size: 0.75rem;
    font-weight: bold;
    padding: 0.25rem 0.5rem;
    position: absolute;
    top: 0;
  }

  :global(.svelte-component .content) {
    margin-top: 1.5rem;
    padding: 1rem;
  }
</style>
