<script lang="ts">
  import type { MarkViewProps } from '@tiptap/core'
  import { MarkViewContent } from '@tiptap/svelte'

  let { HTMLAttributes, updateAttributes }: MarkViewProps = $props()

  let count = $state(HTMLAttributes['data-count'] ?? 0)

  function increase() {
    count += 1
  }

  function updateCountAttr() {
    updateAttributes({ 'data-count': count })
  }
</script>

<span class="content" data-test-id="mark-view" data-count={HTMLAttributes['data-count']}>
  <span class="mark-view-content-wrapper" data-test-id="mark-view-content-wrapper">
    <MarkViewContent />
  </span>
  <label contenteditable="false">
    Svelte Component::
    <button data-test-id="count-button" onclick={increase} class="primary">
      This button has been clicked {count} times.
    </button>
    <button data-test-id="update-attributes-button" onclick={updateCountAttr}>Update attributes</button>
  </label>
</span>

<style lang="scss">
  :global(.content) {
    margin-top: 1.5rem;
    padding: 1rem;
  }
</style>
