<template>
  <div>
    <button @click="setName">
      Set Name
    </button>
    <button @click="changeName">
      Random Name
    </button>
    <button @click="changeColor">
      Random Color
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
      const name = window.prompt('Name')

      if (name) {
        this.name = name
        return this.updateUser()
      }
    },

    changeName() {
      this.name = this.getRandomName()
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
      return this.getRandomElement([
        '#616161',
        '#A975FF',
        '#FB5151',
        '#fd9170',
        '#FFCB6B',
        '#68CEF8',
        '#80cbc4',
        '#9DEF8F',
      ])
    },

    getRandomName() {
      return this.getRandomElement([
        'Lea Thompson', 'Cyndi Lauper', 'Tom Cruise', 'Madonna', 'Jerry Hall', 'Joan Collins', 'Winona Ryder', 'Christina Applegate', 'Alyssa Milano', 'Molly Ringwald', 'Ally Sheedy', 'Debbie Harry', 'Olivia Newton-John', 'Elton John', 'Michael J. Fox', 'Axl Rose', 'Emilio Estevez', 'Ralph Macchio', 'Rob Lowe', 'Jennifer Grey', 'Mickey Rourke', 'John Cusack', 'Matthew Broderick', 'Justine Bateman', 'Lisa Bonet',
      ])
    },

    getRandomElement(list) {
      return list[Math.floor(Math.random() * list.length)]
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
/* A list of all available users */
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

/* Some information about the status */
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

/* Give a remote user a caret */
.collaboration-cursor__caret {
  position: relative;
  margin-left: -1px;
  margin-right: -1px;
  border-left: 1px solid black;
  border-right: 1px solid black;
  word-break: normal;
  pointer-events: none;
}

/* Render the username above the caret */
.collaboration-cursor__label {
  position: absolute;
  top: -1.4em;
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
