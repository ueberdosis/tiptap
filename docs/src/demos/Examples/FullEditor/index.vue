<template>
  <div>
    <full-editor v-model="content" />
    <div>
      {{ content }}
    </div>
  </div>
</template>

<script>
import { FullEditor } from '@tiptap/vue'

export default {
  components: {
    FullEditor,
  },

  data() {
    return {
      content: '<p>A Vue.js wrapper component for tiptap to use <code>v-model</code>.</p>',
    }
  },
}
</script>
