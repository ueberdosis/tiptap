<template>
  <div>
    <full-editor v-model="content" :extensions="extensions" />
    <div>
      {{ content }}
    </div>
  </div>
</template>

<script>
import { FullEditor } from '@tiptap/vue'
import { defaultExtensions } from '@tiptap/starter-kit'

export default {
  components: {
    FullEditor,
  },

  data() {
    return {
      extensions: defaultExtensions(),
      content: '<p>A Vue.js wrapper component for tiptap to use <code>v-model</code>.</p>',
    }
  },
}
</script>
