<template>
  <node-view-wrapper class="vue-component">
    <span class="label">Vue Component</span>

    <div class="content">
      <button @click="increase">
        This button has been clicked {{ count }} times.
      </button>
    </div>
  </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper } from '@tiptap/vue-2'

export default {
  components: {
    NodeViewWrapper,
  },

  data() {
    return {
      count: 0,
    }
  },

  methods: {
    increase() {
      this.count += 1
    },
  },
}
</script>

<style lang="scss">
.vue-component {
  border: 1px solid #adb5bd;
  border-radius: 0.5rem;
  margin: 1rem 0;
  position: relative;
}

.label {
  margin-left: 1rem;
  background-color: #adb5bd;
  font-size: 0.6rem;
  letter-spacing: 1px;
  font-weight: bold;
  text-transform: uppercase;
  color: #fff;
  position: absolute;
  top: 0;
  padding: 0.25rem 0.75rem;
  border-radius: 0 0 0.5rem 0.5rem;
}

.content {
  margin-top: 1.5rem;
  padding: 1rem;
}
</style>
