<template>
  <div>
    <div v-if="editor">
      <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }">
        bold
      </button>
      <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }">
        italic
      </button>
      <button @click="editor.chain().focus().toggleStrike().run()" :class="{ 'is-active': editor.isActive('strike') }">
        strike
      </button>
      <button @click="editor.chain().focus().toggleCode().run()" :class="{ 'is-active': editor.isActive('code') }">
        code
      </button>
      <button @click="editor.chain().focus().removeMarks().run()">
        clear marks
      </button>
      <button @click="editor.chain().focus().clearNodes().run()">
        clear nodes
      </button>
      <button @click="editor.chain().focus().paragraph().run()" :class="{ 'is-active': editor.isActive('paragraph') }">
        paragraph
      </button>
      <button @click="editor.chain().focus().heading({ level: 1 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">
        h1
      </button>
      <button @click="editor.chain().focus().heading({ level: 2 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
        h2
      </button>
      <button @click="editor.chain().focus().heading({ level: 3 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }">
        h3
      </button>
      <button @click="editor.chain().focus().heading({ level: 4 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }">
        h4
      </button>
      <button @click="editor.chain().focus().heading({ level: 5 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 5 }) }">
        h5
      </button>
      <button @click="editor.chain().focus().heading({ level: 6 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 6 }) }">
        h6
      </button>
      <button @click="editor.chain().focus().bulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }">
        bullet list
      </button>
      <button @click="editor.chain().focus().orderedList().run()" :class="{ 'is-active': editor.isActive('orderedList') }">
        ordered list
      </button>
      <button @click="editor.chain().focus().codeBlock().run()" :class="{ 'is-active': editor.isActive('codeBlock') }">
        code block
      </button>
      <button @click="editor.chain().focus().blockquote().run()" :class="{ 'is-active': editor.isActive('blockquote') }">
        blockquote
      </button>
      <button @click="editor.chain().focus().horizontalRule().run()">
        horizontal rule
      </button>
      <button @click="editor.chain().focus().hardBreak().run()">
        hard break
      </button>
      <button @click="editor.chain().focus().undo().run()">
        undo
      </button>
      <button @click="editor.chain().focus().redo().run()">
        redo
      </button>

      <br>
      <br>

      <button @click="setName">
        Set Name
      </button>
      <button @click="changeName">
        Random Name
      </button>
      <button @click="changeColor">
        Random Color
      </button>
    </div>

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
import { Editor, EditorContent, defaultExtensions } from '@tiptap/vue-starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import * as Y from 'yjs'
// import { WebrtcProvider } from 'y-webrtc'
import { WebsocketProvider } from 'y-websocket'
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
    this.type = this.ydoc.getXmlFragment('prosemirror')
    this.indexdb = new IndexeddbPersistence(this.documentName, this.ydoc)

    // this.provider = new WebrtcProvider(this.documentName, this.ydoc)
    this.provider = new WebsocketProvider('ws://127.0.0.1:1234', 'tiptap', this.ydoc)
    // this.provider = new WebsocketProvider('wss://demos.yjs.dev', 'tiptap', this.ydoc)
    this.provider.awareness.on('change', this.updateState)

    this.editor = new Editor({
      extensions: [
        ...defaultExtensions(),
        Collaboration.configure({
          type: this.type,
        }),
        CollaborationCursor.configure({
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

/* Basic editor styles */
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }

  ul,
  ol {
    padding: 0 1rem;
  }

  code {
    background-color: rgba(#616161, 0.1);
    color: #616161;
  }

  pre {
    background: #0D0D0D;
    color: #FFF;
    font-family: 'JetBrainsMono', monospace;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;

    code {
      color: inherit;
      background: none;
      font-size: 0.8rem;
    }
  }

  img {
    max-width: 100%;
    height: auto;
  }

  hr {
    margin: 1rem 0;
  }

  blockquote {
    padding-left: 1rem;
    border-left: 2px solid rgba(#0D0D0D, 0.1);
  }
}
</style>
