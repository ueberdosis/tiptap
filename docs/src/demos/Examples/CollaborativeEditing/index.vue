<template>
  <div>
    <div v-if="editor">
      <menu-bar :editor="editor" />
      <editor-content :editor="editor" />

      <br>

      <button @click="setName">
        Set Name
      </button>
      <button @click="updateCurrentUser({ name: getRandomName() })">
        Random Name
      </button>
      <button @click="updateCurrentUser({ color: getRandomColor() })">
        Random Color
      </button>
    </div>

    <div class="collaboration-users">
      <div
        class="collaboration-users__item"
        :style="`background-color: ${otherUser.color}`"
        v-for="otherUser in users"
        :key="otherUser.clientId"
      >
        {{ otherUser.name }}
      </div>
    </div>

    <div :class="`collaboration-status collaboration-status--${status}`">
      <template v-if="status">
        {{ status }},
      </template>
      {{ users.length }} user{{ users.length === 1 ? '' : 's' }} online
    </div>
  </div>
</template>

<script>
import { Editor, EditorContent, defaultExtensions } from '@tiptap/vue-starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'
import MenuBar from './MenuBar.vue'

const getRandomElement = list => {
  return list[Math.floor(Math.random() * list.length)]
}

export default {
  components: {
    EditorContent,
    MenuBar,
  },

  data() {
    return {
      currentUser: {
        name: this.getRandomName(),
        color: this.getRandomColor(),
      },
      indexdb: null,
      editor: null,
      users: [],
      status: null,
    }
  },

  mounted() {
    const ydoc = new Y.Doc()
    const provider = new WebsocketProvider('ws://websocket.tiptap.dev', 'tiptap-collaboration-example', ydoc)
    provider.on('status', event => {
      this.status = event.status
    })

    this.indexdb = new IndexeddbPersistence('tiptap-collaboration-example', ydoc)

    this.editor = new Editor({
      extensions: [
        ...defaultExtensions().filter(extension => extension.config.name !== 'history'),
        Collaboration.configure({
          provider,
        }),
        CollaborationCursor.configure({
          provider,
          user: this.currentUser,
          onUpdate: users => {
            this.users = users
          },
        }),
      ],
    })
  },

  methods: {
    setName() {
      const name = window.prompt('Name')

      if (name) {
        return this.updateCurrentUser({
          name,
        })
      }
    },

    updateCurrentUser(attributes) {
      this.currentUser = { ...this.currentUser, ...attributes }
      this.editor.chain().focus().user(this.currentUser).run()
    },

    getRandomColor() {
      return getRandomElement([
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
      return getRandomElement([
        'Lea Thompson', 'Cyndi Lauper', 'Tom Cruise', 'Madonna', 'Jerry Hall', 'Joan Collins', 'Winona Ryder', 'Christina Applegate', 'Alyssa Milano', 'Molly Ringwald', 'Ally Sheedy', 'Debbie Harry', 'Olivia Newton-John', 'Elton John', 'Michael J. Fox', 'Axl Rose', 'Emilio Estevez', 'Ralph Macchio', 'Rob Lowe', 'Jennifer Grey', 'Mickey Rourke', 'John Cusack', 'Matthew Broderick', 'Justine Bateman', 'Lisa Bonet',
      ])
    },
  },

  beforeDestroy() {
    this.editor.destroy()
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
  border-radius: 5px;
  margin-top: 1rem;
  color: #616161;

  &::before {
    content: ' ';
    display: inline-block;
    width: 0.5rem;
    height: 0.5rem;
    background: #ccc;
    border-radius: 50%;
    margin-right: 0.5rem;
  }

  &--connecting::before {
    background: #fd9170;
  }

  &--connected::before {
    background: #9DEF8F;
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
