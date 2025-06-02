<template>
  <div v-if="editor">
    <bubble-menu :editor="editor">
      <div class="bubble-menu">
        <button
          @click="editor.chain().focus().toggleBold().run()"
          :class="{ 'is-active': editor.isActive('bold') }"
          >
          Bold
        </button>
      </div>
    </bubble-menu>
    <floating-menu :editor="editor">
      <div class="floating-menu">
        <button
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
           :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
        >
          H1
        </button>
      </div>
    </floating-menu>
  </div>
  <editor-content :editor="editor" />
</template>

<script>
import Bold from '@tiptap/extension-bold'
import Collaboration from '@tiptap/extension-collaboration'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Placeholder from '@tiptap/extension-placeholder'
import Text from '@tiptap/extension-text'
import {
  BubbleMenu, Editor, EditorContent, FloatingMenu,
} from '@tiptap/vue-3'
import { WebrtcProvider } from 'y-webrtc'
import * as Y from 'yjs'

export default {
  components: {
    EditorContent,
    BubbleMenu,
    FloatingMenu,
  },

  data() {
    return {
      editor: null,
      provider: null,
    }
  },

  mounted() {
    const ydoc = new Y.Doc()

    this.provider = new WebrtcProvider('tiptap-collaboration-extension', ydoc)

    this.editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Heading,
        Bold,
        Collaboration.configure({
          document: ydoc,
        }),
        Placeholder.configure({
          placeholder: 'Write something … It’ll be shared with everyone else looking at this example.',
        }),
      ],
    })
  },

  beforeUnmount() {
    this.editor.destroy()
    this.provider.destroy()
  },
}
</script>

<style lang="scss">
/* Basic editor styles */
.tiptap {
  :first-child {
    margin-top: 0;
  }

  /* Placeholder (at the top) */
  p.is-editor-empty:first-child::before {
    color: var(--gray-4);
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }

  &.ProseMirror-focused p.is-editor-empty:first-child::before {
    content: '';
  }
}

/* Bubble menu */
.bubble-menu {
  background-color: var(--white);
  border: 1px solid var(--gray-1);
  border-radius: 0.7rem;
  box-shadow: var(--shadow);
  display: flex;
  padding: 0.2rem;

  button {
    background-color: unset;

    &:hover {
      background-color: var(--gray-3);
    }

    &.is-active {
      background-color: var(--purple);

      &:hover {
        background-color: var(--purple-contrast);
      }
    }
  }
}

/* Floating menu */
.floating-menu {
  display: flex;
  background-color: var(--gray-3);
  padding: 0.1rem;
  border-radius: 0.5rem;

  button {
    background-color: unset;
    padding: 0.275rem 0.425rem;
    border-radius: 0.3rem;

    &:hover {
      background-color: var(--gray-3);
    }

    &.is-active {
      background-color: var(--white);
      color: var(--purple);

      &:hover {
        color: var(--purple-contrast);
      }
    }
  }
}
</style>
