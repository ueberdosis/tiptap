<template>
  <div>

    <div class="editor">
      <editor-menu-bar :editor="editor" v-slot="{ commands }">
        <div class="menubar">
          <button class="menubar__button" @click="commands.mention({ id: 1, label: 'Philipp Kühn' })">
            <icon name="mention" />
            <span>Insert Mention</span>
          </button>
        </div>
      </editor-menu-bar>
      <editor-content class="editor__content" :editor="editor" />
    </div>

    <div class="suggestion-list" v-show="showSuggestions" ref="suggestions">
      <template v-if="hasResults">
        <div
          v-for="(user, index) in filteredUsers"
          :key="user.id"
          class="suggestion-list__item"
          :class="{ 'is-selected': navigatedUserIndex === index }"
          @click="selectUser(user)"
        >
          {{ user.name }}
        </div>
      </template>
      <div v-else class="suggestion-list__item is-empty">
        No users found
      </div>
    </div>

  </div>
</template>

<script>
import Fuse from 'fuse.js'
import tippy, { sticky } from 'tippy.js'
import Icon from 'Components/Icon'
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import {
  HardBreak,
  Heading,
  Mention,
  Code,
  Bold,
  Italic,
} from 'tiptap-extensions'

export default {

  components: {
    Icon,
    EditorContent,
    EditorMenuBar,
  },

  data() {
    return {
      editor: new Editor({
        extensions: [
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new Mention({
            // a list of all suggested items
            items: async () => {
              await new Promise(resolve => {
                setTimeout(resolve, 500)
              })
              return [
                { id: 1, name: 'Sven Adlung' },
                { id: 2, name: 'Patrick Baber' },
                { id: 3, name: 'Nick Hirche' },
                { id: 4, name: 'Philip Isik' },
                { id: 5, name: 'Timo Isik' },
                { id: 6, name: 'Philipp Kühn' },
                { id: 7, name: 'Hans Pagel' },
                { id: 8, name: 'Sebastian Schrama' },
              ]
            },
            // is called when a suggestion starts
            onEnter: ({
              items, query, range, command, virtualNode,
            }) => {
              this.query = query
              this.filteredUsers = items
              this.suggestionRange = range
              this.renderPopup(virtualNode)
              // we save the command for inserting a selected mention
              // this allows us to call it inside of our custom popup
              // via keyboard navigation and on click
              this.insertMention = command
            },
            // is called when a suggestion has changed
            onChange: ({
              items, query, range, virtualNode,
            }) => {
              this.query = query
              this.filteredUsers = items
              this.suggestionRange = range
              this.navigatedUserIndex = 0
              this.renderPopup(virtualNode)
            },
            // is called when a suggestion is cancelled
            onExit: () => {
              // reset all saved values
              this.query = null
              this.filteredUsers = []
              this.suggestionRange = null
              this.navigatedUserIndex = 0
              this.destroyPopup()
            },
            // is called on every keyDown event while a suggestion is active
            onKeyDown: ({ event }) => {
              if (event.key === 'ArrowUp') {
                this.upHandler()
                return true
              }

              if (event.key === 'ArrowDown') {
                this.downHandler()
                return true
              }

              if (event.key === 'Enter') {
                this.enterHandler()
                return true
              }

              return false
            },
            // is called when a suggestion has changed
            // this function is optional because there is basic filtering built-in
            // you can overwrite it if you prefer your own filtering
            // in this example we use fuse.js with support for fuzzy search
            onFilter: async (items, query) => {
              if (!query) {
                return items
              }

              await new Promise(resolve => {
                setTimeout(resolve, 500)
              })

              const fuse = new Fuse(items, {
                threshold: 0.2,
                keys: ['name'],
              })

              return fuse.search(query).map(item => item.item)
            },
          }),
          new Code(),
          new Bold(),
          new Italic(),
        ],
        content: `
          <h2>
            Suggestions
          </h2>
          <p>
            Sometimes it's useful to <strong>mention</strong> someone. That's a feature we're very used to. Under the hood this technique can also be used for other features likes <strong>hashtags</strong> and <strong>commands</strong> – lets call it <em>suggestions</em>.
          </p>
          <p>
            This is an example how to mention some users like <span data-mention-id="1">Philipp Kühn</span> or <span data-mention-id="2">Hans Pagel</span>. Try to type <code>@</code> and a popup (rendered with tippy.js) will appear. You can navigate with arrow keys through a list of suggestions.
          </p>
        `,
      }),
      query: null,
      suggestionRange: null,
      filteredUsers: [],
      navigatedUserIndex: 0,
      insertMention: () => {},
    }
  },

  computed: {

    hasResults() {
      return this.filteredUsers.length
    },

    showSuggestions() {
      return this.query || this.hasResults
    },

  },

  methods: {

    // navigate to the previous item
    // if it's the first item, navigate to the last one
    upHandler() {
      this.navigatedUserIndex = ((this.navigatedUserIndex + this.filteredUsers.length) - 1) % this.filteredUsers.length
    },

    // navigate to the next item
    // if it's the last item, navigate to the first one
    downHandler() {
      this.navigatedUserIndex = (this.navigatedUserIndex + 1) % this.filteredUsers.length
    },

    enterHandler() {
      const user = this.filteredUsers[this.navigatedUserIndex]

      if (user) {
        this.selectUser(user)
      }
    },

    // we have to replace our suggestion text with a mention
    // so it's important to pass also the position of your suggestion text
    selectUser(user) {
      this.insertMention({
        range: this.suggestionRange,
        attrs: {
          id: user.id,
          label: user.name,
        },
      })
      this.editor.focus()
    },

    // renders a popup with suggestions
    // tiptap provides a virtualNode object for using popper.js (or tippy.js) for popups
    renderPopup(node) {
      const boundingClientRect = node.getBoundingClientRect()
      const { x, y } = boundingClientRect

      if (x === 0 && y === 0) {
        return
      }

      if (this.popup) {
        return
      }

      // ref: https://atomiks.github.io/tippyjs/v6/all-props/
      this.popup = tippy('.page', {
        getReferenceClientRect: () => boundingClientRect,
        appendTo: () => document.body,
        interactive: true,
        sticky: true, // make sure position of tippy is updated when content changes
        plugins: [sticky],
        content: this.$refs.suggestions,
        trigger: 'mouseenter', // manual
        showOnCreate: true,
        theme: 'dark',
        placement: 'top-start',
        inertia: true,
        duration: [400, 200],
      })
    },

    destroyPopup() {
      if (this.popup) {
        this.popup[0].destroy()
        this.popup = null
      }
    },

  },

  beforeDestroy() {
    this.destroyPopup()
  },
}
</script>

<style lang="scss">
@import "~variables";

.mention {
  background: rgba($color-black, 0.1);
  color: rgba($color-black, 0.6);
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 5px;
  padding: 0.2rem 0.5rem;
  white-space: nowrap;
}

.mention-suggestion {
  color: rgba($color-black, 0.6);
}

.suggestion-list {
  padding: 0.2rem;
  border: 2px solid rgba($color-black, 0.1);
  font-size: 0.8rem;
  font-weight: bold;

  &__no-results {
    padding: 0.2rem 0.5rem;
  }

  &__item {
    border-radius: 5px;
    padding: 0.2rem 0.5rem;
    margin-bottom: 0.2rem;
    cursor: pointer;

    &:last-child {
      margin-bottom: 0;
    }

    &.is-selected,
    &:hover {
      background-color: rgba($color-white, 0.2);
    }

    &.is-empty {
      opacity: 0.5;
    }
  }
}

.tippy-box[data-theme~=dark] {
  background-color: $color-black;
  padding: 0;
  font-size: 1rem;
  text-align: inherit;
  color: $color-white;
  border-radius: 5px;
}
</style>
