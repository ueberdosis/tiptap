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
      content: '<p>full editor</p>',
    }
  },
}
</script>
