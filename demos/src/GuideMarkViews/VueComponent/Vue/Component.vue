<template>
  <span className="content" data-test-id="mark-view" :data-count="HTMLAttributes['data-count']">
    <mark-view-content />
    <label contenteditable="false"
      >Vue Component::
      <button data-test-id="count-button" @click="increase" class="primary">
        This button has been clicked {{ count }} times.
      </button>
      <button data-test-id="update-attributes-button" @click="updateCountAttr">Update attributes</button>
    </label>
  </span>
</template>

<script>
import { MarkViewContent, markViewProps } from '@dibdab/vue-3'

export default {
  components: {
    MarkViewContent,
  },

  data() {
    return {
      count: this.$props.HTMLAttributes['data-count'] ?? 0,
    }
  },

  props: markViewProps,

  methods: {
    increase() {
      this.count += 1
    },
    updateCountAttr() {
      this.updateAttributes({
        'data-count': this.count,
      })
    },
  },
}
</script>

<style lang="scss">
.tiptap {
  /* Vue component */
  .vue-component {
    background-color: var(--purple-light);
    border: 2px solid var(--purple);
    border-radius: 0.5rem;

    label {
      background-color: var(--purple);
      border-radius: 0 0 0.5rem 0;
      color: var(--white);
      font-size: 0.75rem;
      font-weight: bold;
      padding: 0.25rem 0.5rem;
    }

    .content {
      margin-top: 1.5rem;
      padding: 1rem;
    }
  }
}
</style>
