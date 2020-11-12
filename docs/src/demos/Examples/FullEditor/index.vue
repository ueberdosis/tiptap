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
      content: '<p>full editor</p>',
      extensions: defaultExtensions(),
    }
  },
}
</script>
