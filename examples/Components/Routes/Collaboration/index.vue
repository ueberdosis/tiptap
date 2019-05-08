<template>
  <div class="editor">
    <h2>
      Collaborative Editing
    </h2>
    <div class="message">
      With the Collaboration Extension it's possible for several users to work on a document at the same time. To make this possible, client-side and server-side code is required. This example shows this using a <a href="https://glitch.com/edit/#!/tiptap-sockets" target="_blank">socket server on glitch.com</a>. To keep the demo code clean, only a few nodes and marks are activated. There is also set a 250ms debounce for all changes. Try it out below:
    </div>
    <template v-if="editor && !loading">
      <div class="count">
        {{ count }} {{ count === 1 ? 'user' : 'users' }} connected
      </div>
      <editor-content class="editor__content" :editor="editor"  />
    </template>
    <em v-else>
      Connecting to socket server …
    </em>
  </div>
</template>

<script>
import io from 'socket.io-client'
import { Editor, EditorContent } from 'tiptap'
import {
  HardBreak,
  Heading,
  Bold,
  Code,
  Italic,
  History,
  Collaboration,
} from 'tiptap-extensions'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      loading: true,
      editor: null,
      socket: null,
      count: 0,
    }
  },

  methods: {
    onInit({ doc, version }) {
      this.loading = false

      if (this.editor) {
        this.editor.destroy()
      }

      this.editor = new Editor({
        content: doc,
        extensions: [
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new Bold(),
          new Code(),
          new Italic(),
          new History(),
          new Collaboration({
            // the initial version we start with
            // version is an integer which is incremented with every change
            version,
            // debounce changes so we can save some bandwidth
            debounce: 250,
            // onSendable is called whenever there are changed we have to send to our server
            onSendable: data => {
              this.socket.emit('update', data)
            },
          }),
        ],
      })
    },

    setCount(count) {
      this.count = count
    },
  },

  mounted() {
    // server implementation: https://glitch.com/edit/#!/tiptap-sockets
    this.socket = io('wss://tiptap-sockets.glitch.me')
      // get the current document and its version
      .on('init', data => this.onInit(data))
      // send all updates to the collaboration extension
      .on('update', data => this.editor.extensions.options.collaboration.update(data))
      // get count of connected users
      .on('getCount', count => this.setCount(count))
  },

  beforeDestroy() {
    this.editor.destroy()
    this.socket.destroy()
  },
}
</script>

<style lang="scss">
@import "~variables";

.count {
  display: flex;
  align-items: center;
  font-weight: bold;
  color: rgba($color-black, 0.5);
  color: #27b127;
  margin-bottom: 1rem;
  text-transform: uppercase;
  font-size: 0.7rem;
  line-height: 1;

  &:before {
    content: '';
    display: inline-flex;
    background-color: #27b127;
    width: 0.4rem;
    height: 0.4rem;
    border-radius: 50%;
    margin-right: 0.3rem;
  }
}
</style>
