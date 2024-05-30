<template>
  <div>
    <editor v-model="content" />

    <div class="output-group">
      <label>Content</label>
      <code>{{ content }}</code>
    </div>
  </div>
</template>

<script>
import Editor from './Editor.vue'

export default {
  components: {
    Editor,
  },

  data() {
    return {
      content: '<p>A Vue.js wrapper component for Tiptap to use <code>v-model</code>.</p>',
    }
  },
}
</script>
