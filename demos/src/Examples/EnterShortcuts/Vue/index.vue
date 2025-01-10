<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <div class="button-group">
        <button
          @click="editor.chain().focus().toggleBold().run()"
          :class="{ 'is-active': editor.isActive('bold') }"
        >
          Bold
        </button>
        <button
          @click="editor.chain().focus().toggleItalic().run()"
          :class="{ 'is-active': editor.isActive('italic') }"
        >
          Italic
        </button>
      </div>
      <div className="hint" v-if="lastShortcut">
        {{ lastShortcut }} was the last shortcut hit, and was handled by Vue
      </div>
      <div className="hint" v-else>
        No shortcut has been hit yet, use Shift+Enter to trigger a shortcut handler
      </div>
    </div>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent, Extension } from '@tiptap/vue-3'

const CustomKeyboardShortcutExtension = Extension.create({
  name: 'customKeyboardShortcuts',
  // Set a higher priority to make sure this extension is executed first before the default keyboard shortcuts
  priority: 101,
  addKeyboardShortcuts() {
    return {
      'Ctrl-Enter': ctx => {
        // Creates a transaction with this custom meta set
        return ctx.editor.commands.setMeta('customKeyboardShortcutHandler', 'Ctrl-Enter')
      },
      'Meta-Enter': ctx => {
        // Creates a transaction with this custom meta set
        return ctx.editor.commands.setMeta('customKeyboardShortcutHandler', 'Meta-Enter')
      },
      'Shift-Enter': ctx => {
        return ctx.editor.commands.setMeta('customKeyboardShortcutHandler', 'Shift-Enter')
      },
    }
  },
})

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
      lastShortcut: null,
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [StarterKit, CustomKeyboardShortcutExtension],
      // Listen for the custom meta set in the transaction
      onTransaction: ({ transaction }) => {
        if (transaction.getMeta('customKeyboardShortcutHandler')) {
          switch (transaction.getMeta('customKeyboardShortcutHandler')) {
            case 'Ctrl-Enter':
              this.lastShortcut = 'Ctrl-Enter'
              break
            case 'Meta-Enter':
              this.lastShortcut = 'Meta-Enter'
              break
            case 'Shift-Enter':
              this.lastShortcut = 'Shift-Enter'
              break
            default:
              break
          }
        }
      },
      content: `
      <p>
        Hey, try to hit Shift+Enter or Meta+Enter. The last shortcut hit will be displayed above.
      </p>
    `,
    })
  },

  methods: {},

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss">
/* Basic editor styles */
.tiptap {
  :first-child {
    margin-top: 0;
  }

  /* List styles */
  ul,
  ol {
    padding: 0 1rem;
    margin: 1.25rem 1rem 1.25rem 0.4rem;

    li p {
      margin-top: 0.25em;
      margin-bottom: 0.25em;
    }
  }

  /* Heading styles */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
    margin-top: 2.5rem;
    text-wrap: pretty;
  }

  h1,
  h2 {
    margin-top: 3.5rem;
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 1.4rem;
  }

  h2 {
    font-size: 1.2rem;
  }

  h3 {
    font-size: 1.1rem;
  }

  h4,
  h5,
  h6 {
    font-size: 1rem;
  }

  /* Code and preformatted text styles */
  code {
    background-color: var(--purple-light);
    border-radius: 0.4rem;
    color: var(--black);
    font-size: 0.85rem;
    padding: 0.25em 0.3em;
  }

  pre {
    background: var(--black);
    border-radius: 0.5rem;
    color: var(--white);
    font-family: "JetBrainsMono", monospace;
    margin: 1.5rem 0;
    padding: 0.75rem 1rem;

    code {
      background: none;
      color: inherit;
      font-size: 0.8rem;
      padding: 0;
    }
  }

  blockquote {
    border-left: 3px solid var(--gray-3);
    margin: 1.5rem 0;
    padding-left: 1rem;
  }

  hr {
    border: none;
    border-top: 1px solid var(--gray-2);
    margin: 2rem 0;
  }
}
</style>
