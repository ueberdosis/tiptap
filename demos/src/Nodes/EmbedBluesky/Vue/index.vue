<template>
  <div v-if="editor" class="container">
    <div class="control-group">
      <div class="button-group">
        <button id="add" @click="addEmbed">Add Bluesky embed</button>
      </div>
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import Document from '@tiptap/extension-document'
import EmbedBluesky from '@tiptap/extension-embed-bluesky'
import Heading from '@tiptap/extension-heading'
import { ListKit } from '@tiptap/extension-list'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Editor, EditorContent } from '@tiptap/vue-3'

export default {
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
        Document,
        Heading,
        Paragraph,
        ListKit,
        Text,
        EmbedBluesky.configure({
          addPasteHandler: true,
          colorMode: 'system',
          // Custom loading HTML - you can use any HTML here (spinner, skeleton, etc.)
          loadingHTML: '<div class="bluesky-spinner"><span></span></div>',
        }),
      ],
      content: `
        <p>Tiptap now supports Bluesky embeds! Awesome!</p>
        <p>The extension automatically resolves post metadata from the Bluesky API and renders the embed.</p>
        <h2>Features</h2>
        <ul>
          <li>Paste Bluesky URLs directly</li>
          <li>Automatic metadata resolution via public API</li>
          <li>Configurable color mode (light, dark, system)</li>
          <li>Fallback link if resolution fails</li>
        </ul>
        <p>Here's an example of a resolved Bluesky embed:</p>
        <blockquote class="bluesky-embed" data-bluesky-uri="at://did:plc:vod7n54e7zoorlj53df3sgez/app.bsky.feed.post/3lnzavsbkvs2x" data-bluesky-cid="bafyreicv3qaeah2dsjm6uymt6ld3sphs3oru7fd6472w4n3vuiyi2hvhze" data-bluesky-embed-color-mode="system"><p lang="en"><a href="https://bsky.app/profile/tiptap.dev/post/3lnzavsbkvs2x?ref_src=embed">View on Bluesky</a></p></blockquote>
      `,
      editorProps: {
        attributes: {
          spellcheck: 'false',
        },
      },
    })
  },

  methods: {
    addEmbed() {
      const url = prompt('Enter Bluesky post URL (e.g., https://bsky.app/profile/user/post/123)')

      if (url) {
        this.editor.commands.setEmbedBluesky({
          src: url,
        })
      }
    },
  },

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

  /* Bluesky embed - wrapper and both blockquote (loading) and div (rendered) */
  blockquote[data-bluesky-src],
  blockquote[data-bluesky-uri],
  div.bluesky-embed {
    cursor: move;
    transition: outline 0.15s;
  }

  /* Blockquote specific styles (before embed loads) */
  blockquote[data-bluesky-src],
  blockquote[data-bluesky-uri] {
    padding: 1rem;
    border-left: 4px solid var(--purple);
    background-color: var(--gray-light);
    border-radius: 0.25rem;

    /* Loading state */
    &[data-state='loading'],
    &[data-state='resolving'] {
      background-color: var(--gray-light);
      opacity: 0.6;
    }

    /* Error state */
    &[data-state='error'] {
      background-color: rgba(239, 68, 68, 0.1);
      border-left-color: #ef4444;

      p {
        color: #7f1d1d;
      }
    }

    /* Resolved state */
    &[data-state='resolved'] {
      background-color: transparent;
      border-left: none;
      padding: 0;
    }
  }

  /* Loading text styling */
  .bluesky-embed-loading {
    color: var(--gray);
    font-size: 0.875rem;
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  /* Custom spinner example */
  .bluesky-spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;

    span {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: var(--purple);
      animation: spinner-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;

      &::before {
        content: '';
        display: block;
        position: absolute;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: var(--purple);
        animation: spinner-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
      }
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes spinner-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes spinner-ping {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    75% {
      transform: scale(2);
      opacity: 0;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }

  /* Selected state - apply outline to wrapper and child div */
  .ProseMirror-selectednode {
    & > div.bluesky-embed {
      outline: 3px solid var(--purple);
      outline-offset: 2px;
    }

    &blockquote[data-bluesky-src],
    &blockquote[data-bluesky-uri] {
      outline: 3px solid var(--purple);
      outline-offset: 2px;
    }
  }
}
</style>
