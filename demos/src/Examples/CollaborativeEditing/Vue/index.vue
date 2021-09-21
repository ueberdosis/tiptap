<template>
  <div class="editor" v-if="editor">
    <menu-bar class="editor__header" :editor="editor" />
    <editor-content class="editor__content" :editor="editor" />
    <div class="editor__footer">
      <div :class="`editor__status editor__status--${status}`">
        <template v-if="status === 'connected'">
          {{ users.length }} user{{ users.length === 1 ? '' : 's' }} online in {{ room }}
        </template>
        <template v-else>
          offline
        </template>
      </div>
      <div class="editor__name">
        <button @click="setName">
          {{ currentUser.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Highlight from '@tiptap/extension-highlight'
import CharacterCount from '@tiptap/extension-character-count'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'
import MenuBar from './MenuBar.vue'

const getRandomElement = list => {
  return list[Math.floor(Math.random() * list.length)]
}

const getRandomRoom = () => {
  return getRandomElement([
    'rooms.7',
    'rooms.8',
    'rooms.9',
  ])
}

export default {
  components: {
    EditorContent,
    MenuBar,
  },

  data() {
    return {
      currentUser: JSON.parse(localStorage.getItem('currentUser')) || {
        name: this.getRandomName(),
        color: this.getRandomColor(),
      },
      provider: null,
      indexdb: null,
      editor: null,
      users: [],
      status: 'connecting',
      room: getRandomRoom(),
    }
  },

  mounted() {
    const ydoc = new Y.Doc()
    this.provider = new WebsocketProvider('wss://websocket.tiptap.dev', this.room, ydoc)
    this.provider.on('status', event => {
      this.status = event.status
    })

    window.ydoc = ydoc

    this.indexdb = new IndexeddbPersistence(this.room, ydoc)

    this.editor = new Editor({
      extensions: [
        StarterKit.configure({
          history: false,
        }),
        Highlight,
        TaskList,
        TaskItem,
        Collaboration.configure({
          document: ydoc,
        }),
        CollaborationCursor.configure({
          provider: this.provider,
          user: this.currentUser,
          onUpdate: users => {
            this.users = users
          },
        }),
        CharacterCount.configure({
          limit: 10000,
        }),
      ],
    })

    localStorage.setItem('currentUser', JSON.stringify(this.currentUser))
  },

  methods: {
    setName() {
      const name = (window.prompt('Name') || '')
        .trim()
        .substring(0, 32)

      if (name) {
        return this.updateCurrentUser({
          name,
        })
      }
    },

    updateCurrentUser(attributes) {
      this.currentUser = { ...this.currentUser, ...attributes }
      this.editor.chain().focus().user(this.currentUser).run()

      localStorage.setItem('currentUser', JSON.stringify(this.currentUser))
    },

    getRandomColor() {
      return getRandomElement([
        '#958DF1',
        '#F98181',
        '#FBBC88',
        '#FAF594',
        '#70CFF8',
        '#94FADB',
        '#B9F18D',
      ])
    },

    getRandomName() {
      return getRandomElement([
        'Lea Thompson', 'Cyndi Lauper', 'Tom Cruise', 'Madonna', 'Jerry Hall', 'Joan Collins', 'Winona Ryder', 'Christina Applegate', 'Alyssa Milano', 'Molly Ringwald', 'Ally Sheedy', 'Debbie Harry', 'Olivia Newton-John', 'Elton John', 'Michael J. Fox', 'Axl Rose', 'Emilio Estevez', 'Ralph Macchio', 'Rob Lowe', 'Jennifer Grey', 'Mickey Rourke', 'John Cusack', 'Matthew Broderick', 'Justine Bateman', 'Lisa Bonet',
      ])
    },
  },

  beforeUnmount() {
    this.editor.destroy()
    this.provider.destroy()
  },
}
</script>

<style lang="scss">
.editor {
  display: flex;
  flex-direction: column;
  max-height: 26rem;
  color: #0D0D0D;
  background-color: #FFF;
  border: 3px solid #0D0D0D;
  border-radius: 0.75rem;

  &__header {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    flex-wrap: wrap;
    padding: 0.25rem;
    border-bottom: 3px solid #0D0D0D;
  }

  &__content {
    padding: 1.25rem 1rem;
    flex: 1 1 auto;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  &__footer {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    white-space: nowrap;
    border-top: 3px solid #0D0D0D;
    font-size: 12px;
    font-weight: 600;
    color: #0D0D0D;
    white-space: nowrap;
    padding: 0.25rem 0.75rem;
  }

  /* Some information about the status */
  &__status {
    display: flex;
    align-items: center;
    border-radius: 5px;

    &::before {
      content: ' ';
      flex: 0 0 auto;
      display: inline-block;
      width: 0.5rem;
      height: 0.5rem;
      background: rgba(#0D0D0D, 0.5);
      border-radius: 50%;
      margin-right: 0.5rem;
    }

    &--connecting::before {
      background: #616161;
    }

    &--connected::before {
      background: #B9F18D;
    }
  }

  &__name {
    button {
      background: none;
      border: none;
      font: inherit;
      font-size: 12px;
      font-weight: 600;
      color: #0D0D0D;
      border-radius: 0.4rem;
      padding: 0.25rem 0.5rem;

      &:hover {
        color: #FFF;
        background-color: #0D0D0D;
      }
    }
  }
}
</style>

<style lang="scss">
/* Give a remote user a caret */
.collaboration-cursor__caret {
  position: relative;
  margin-left: -1px;
  margin-right: -1px;
  border-left: 1px solid #0D0D0D;
  border-right: 1px solid #0D0D0D;
  word-break: normal;
  pointer-events: none;
}

/* Render the username above the caret */
.collaboration-cursor__label {
  position: absolute;
  top: -1.4em;
  left: -1px;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  user-select: none;
  color: #0D0D0D;
  padding: 0.1rem 0.3rem;
  border-radius: 3px 3px 3px 0;
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

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
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
      padding: 0;
      background: none;
      font-size: 0.8rem;
    }
  }

  mark {
    background-color: #FAF594;
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

  hr {
    border: none;
    border-top: 2px solid rgba(#0D0D0D, 0.1);
    margin: 2rem 0;
  }

  ul[data-type="taskList"] {
    list-style: none;
    padding: 0;

    li {
      display: flex;
      align-items: center;

      > label {
        flex: 0 0 auto;
        margin-right: 0.5rem;
      }

      > div {
        flex: 1 1 auto;
      }
    }
  }
}
</style>
