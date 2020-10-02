<template>
  <div>
    <button @click="setName">
      set username
    </button>
    <button @click="changeColor">
      change color
    </button>

    <div class="collaboration-status">
      {{ users.length }} user{{ users.length === 1 ? '' : 's' }}
    </div>
    <div class="collaboration-users">
      <div
        class="collaboration-users__item"
        :style="`background-color: ${user.color}`"
        v-for="user in users"
        :key="user.id"
      >
        {{ user.name }}
      </div>
    </div>

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { IndexeddbPersistence } from 'y-indexeddb'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      documentName: 'tiptap-collaboration-example',
      name: this.getRandomName(),
      color: this.getRandomColor(),
      ydoc: null,
      provider: null,
      type: null,
      indexdb: null,
      editor: null,
      users: [],
    }
  },

  mounted() {
    this.ydoc = new Y.Doc()
    this.provider = new WebrtcProvider(this.documentName, this.ydoc)
    this.type = this.ydoc.getXmlFragment('prosemirror')
    this.indexdb = new IndexeddbPersistence(this.documentName, this.ydoc)

    this.provider.awareness.on('change', this.updateState)

    this.editor = new Editor({
      // TODO: This is added by every new user.
      // content: `
      //   <p>Example Text</p>
      // `,
      extensions: [
        Document(),
        Paragraph(),
        Text(),
        Collaboration({
          provider: this.provider,
          type: this.type,
        }),
        CollaborationCursor({
          provider: this.provider,
          name: this.name,
          color: this.color,
        }),
      ],
    })

    this.updateState()
  },

  methods: {
    setName() {
      this.name = window.prompt('Name')
      this.updateUser()
    },

    changeColor() {
      this.color = this.getRandomColor()
      this.updateUser()
    },

    updateUser() {
      this.editor.chain().focus().user({
        name: this.name,
        color: this.color,
      }).run()

      this.updateState()
    },

    getRandomColor() {
      const colors = [
        '#f03e3e',
        '#d6336c',
        '#ae3ec9',
        '#7048e8',
        '#4263eb',
        '#1c7ed6',
        '#1098ad',
        '#0ca678',
        '#37b24d',
        '#74b816',
        '#f59f00',
        '#f76707',
      ]

      return colors[Math.floor(Math.random() * colors.length)]
    },

    getRandomName() {
      const names = ['🙈', '🙉', '🙊', '💥', '💫', '💦', '💨', '🐵', '🐒', '🦍', '🦧', '🐶', '🐕', '🦮', '🐕‍🦺', '🐩', '🐺', '🦊', '🦝', '🐱', '🐈', '🦁', '🐯', '🐅', '🐆', '🐴', '🐎', '🦄', '🦓', '🦌', '🐮', '🐂', '🐃', '🐄', '🐷', '🐖', '🐗', '🐽', '🐏', '🐑', '🐐', '🐪', '🐫', '🦙', '🦒', '🐘', '🦏', '🦛', '🐭', '🐁', '🐀', '🐹', '🐰', '🐇', '🐿', '🦔', '🦇', '🐻', '🐨', '🐼', '🦥', '🦦', '🦨', '🦘', '🦡', '🐾', '🦃', '🐔', '🐓', '🐣', '🐤', '🐥', '🐦', '🐧', '🕊', '🦅', '🦆', '🦢', '🦉', '🦩', '🦚', '🦜', '🐸', '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🦕', '🦖', '🐳', '🐋', '🐬', '🐟', '🐠', '🐡', '🦈', '🐙', '🐚', '🐌', '🦋', '🐛', '🐜', '🐝', '🐞', '🦗', '🕷', '🕸', '🦂', '🦟', '🦠']

      return names[Math.floor(Math.random() * names.length)]
    },

    updateState() {
      const { states } = this.provider.awareness

      this.users = Array.from(states.entries()).map(state => {
        return {
          id: state[0],
          ...state[1].user,
        }
      })
    },
  },

  beforeDestroy() {
    this.editor.destroy()
    this.provider.destroy()
  },
}
</script>

<style lang="scss">
.collaboration-users {
  margin-top: 0.5rem;

  &__item {
    display: inline-block;
    border-radius: 5px;
    padding: 0.25rem 0.5rem;
    color: white;
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
  }
}

.collaboration-status {
  background: #eee;
  color: #666;
  border-radius: 5px;
  padding: 0.5rem 1rem;
  margin-top: 1rem;

  &::before {
    content: ' ';
    display: inline-block;
    width: 0.5rem;
    height: 0.5rem;
    background: green;
    border-radius: 50%;
    margin-right: 0.5rem;
  }
}

/* This gives the remote user caret */
.collaboration-cursor__caret {
  position: relative;
  margin-left: -1px;
  margin-right: -1px;
  border-left: 1px solid black;
  border-right: 1px solid black;
  word-break: normal;
  pointer-events: none;
}

/* This renders the username above the caret */
.collaboration-cursor__label {
  position: absolute;
  top: -1.6em;
  left: -1px;
  font-size: 13px;
  font-style: normal;
  font-weight: normal;
  line-height: normal;
  user-select: none;
  color: white;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  white-space: nowrap;
}
</style>
