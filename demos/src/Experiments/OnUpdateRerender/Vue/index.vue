<template>
  <div class="container">
    <div class="control-group">
      <div class="button-group">
        <button @click="countUp">INC</button> = {{ count }}
      </div>
    </div>
    <TiptapComponent :count="count" />
  </div>
</template>

<script>
import TiptapComponent from './TiptapComponent.vue'

export default {
  components: {
    TiptapComponent,
  },

  data() {
    return {
      count: 0,
    }
  },

  methods: {
    countUp() {
      this.count += 1
    },
  },
}
</script>

<style lang="scss">
/* Basic editor styles */
.tiptap {
  :first-child {
    margin-top: 0;
  }
}
</style>
