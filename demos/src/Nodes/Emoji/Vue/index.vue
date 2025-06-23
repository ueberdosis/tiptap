<template>
  <div class="control-group">
    <div class="button-group">
      <button @click="editor.chain().focus().setEmoji('zap').run()">Insert ⚡</button>
    </div>
  </div>
  <editor-content :editor="editor" />
</template>

<script>
import Emoji, { gitHubEmojis } from '@tiptap/extension-emoji'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'
import { defineComponent } from 'vue'

import suggestion from './suggestion.js'

export default defineComponent({
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        StarterKit,
        Emoji.configure({
          emojis: gitHubEmojis,
          enableEmoticons: true,
          suggestion,
        }),
      ],
      content: `
        <p>
          These <span data-type="emoji" data-name="smiley"></span>
          are <span data-type="emoji" data-name="fire"></span>
          some <span data-type="emoji" data-name="smiley_cat"></span>
          emojis <span data-type="emoji" data-name="exploding_head"></span>
          rendered <span data-type="emoji" data-name="ghost"></span>
          as <span data-type="emoji" data-name="massage"></span>
          inline <span data-type="emoji" data-name="v"></span>
          nodes.
        </p>
        <p>
          Type <code>:</code> to open the autocomplete.
        </p>
        <p>
          Even <span data-type="emoji" data-name="octocat"></span>
          custom <span data-type="emoji" data-name="trollface"></span>
          emojis <span data-type="emoji" data-name="neckbeard"></span>
          are <span data-type="emoji" data-name="rage1"></span>
          supported.
        </p>
        <p>
          And unsupported emojis (without a fallback image) are rendered as just the shortcode <span data-type="emoji" data-name="this_does_not_exist"></span>.
        </p>
        <pre><code>In code blocks all emojis are rendered as plain text. 👩‍💻👨‍💻</code></pre>
        <p>
          There is also support for emoticons. Try typing <code><3</code>.
        </p>
      `,
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
})
</script>

<style lang="scss">
/* Basic editor styles */
.tiptap {
  :first-child {
    margin-top: 0;
  }

  // Emoji extension styles
  [data-type="emoji"] {
    img {
      height: 1em;
      width: 1em;
    }
  }
}
</style>
