<template>
  <div id="app" spellcheck="false">

    <editor :editable="true" class="editor" :doc="data" :extensions="plugins" @update="onUpdate">

      <div class="menububble" slot="menububble" slot-scope="{ marks, focus }">
        <template v-if="marks">
          <form class="menububble__form" v-if="linkMenuIsActive" @submit.prevent="setLinkUrl(linkUrl, marks.link, focus)">
            <input class="menububble__input" type="text" v-model="linkUrl" placeholder="https://" ref="linkInput" @keydown.esc="hideLinkMenu"/>
            <button class="menububble__button" @click="setLinkUrl(null, marks.link, focus)" type="button">
              <icon name="remove" />
            </button>
          </form>
          <template v-else>
            <button class="menububble__button" @click="marks.bold.command" :class="{ 'is-active': marks.bold.active() }">
              <icon name="bold" />
            </button>
            <button class="menububble__button" @click="marks.italic.command" :class="{ 'is-active': marks.italic.active() }">
              <icon name="italic" />
            </button>
            <button class="menububble__button" @click="marks.code.command" :class="{ 'is-active': marks.code.active() }">
              <icon name="code" />
            </button>
            <button class="menububble__button" @click="showLinkMenu(marks.link)" :class="{ 'is-active': marks.link.active() }">
              <icon name="link" />
            </button>
          </template>
        </template>
      </div>
      <div class="menubar" :class="{ 'is-focused': focused }" slot="menubar" slot-scope="{ nodes, focused }">
        <div v-if="nodes">
          <button class="menubar__button" @click="nodes.paragraph.command" :class="{ 'is-active': nodes.paragraph.active() }">
            <icon name="paragraph" />
          </button>
          <button class="menubar__button" @click="nodes.heading.command({ level: 1 })" :class="{ 'is-active': nodes.heading.active({ level: 1 }) }">
            H1
          </button>
          <button class="menubar__button" @click="nodes.heading.command({ level: 2 })" :class="{ 'is-active': nodes.heading.active({ level: 2 }) }">
            H2
          </button>
          <button class="menubar__button" @click="nodes.heading.command({ level: 3 })" :class="{ 'is-active': nodes.heading.active({ level: 3 }) }">
            H3
          </button>
          <button class="menubar__button" @click="nodes.bullet_list.command" :class="{ 'is-active': nodes.bullet_list.active() }">
            <icon name="ul" />
          </button>
          <button class="menubar__button" @click="nodes.ordered_list.command" :class="{ 'is-active': nodes.ordered_list.active() }">
            <icon name="ol" />
          </button>
          <button class="menubar__button" @click="nodes.code_block.command" :class="{ 'is-active': nodes.code_block.active() }">
            <icon name="code" />
          </button>
          <button class="menubar__button" @click="nodes.todo_list.command" :class="{ 'is-active': nodes.todo_list.active() }">
            <icon name="checklist" />
          </button>
        </div>
      </div>
      <div class="editor__content" slot="content" slot-scope="props"></div>
    </editor>

    <pre>{{ data }}</pre>
  </div>
</template>

<script>
import Icon from 'Components/Icon'
import { Editor } from 'tiptap'
// import tiptap from 'tiptap'
// import tiptap from '../dist/tiptap.min.js'
import MentionPlugin from './plugins/Mention.js'

// console.log(tiptap)

export default {
  components: {
    Editor,
    Icon,
  },
  data() {
    return {
      linkUrl: null,
      linkMenuIsActive: false,
      plugins: [
        new MentionPlugin(),
      ],
      data: {
        "type": "doc",
        "content": [
          {
            "type": "heading",
            "attrs": {
              "level": 1,
            },
            "content": [
              {
                "type": "text",
                "text": "A renderless rich-text editor for Vue.js "
              },
            ],
          },
          {
            "type": "paragraph",
            "content": [
              {
                "type": "text",
                "text": "This editor is based on "
              },
              {
                "type": "text",
                "marks": [
                  {
                    "type": "link",
                    "attrs": {
                      "href": "https://prosemirror.net"
                    }
                  }
                ],
                "text": "Prosemirror"
              },
              {
                "type": "text",
                "text": ", "
              },
              {
                "type": "text",
                "marks": [
                  {
                    "type": "italic"
                  }
                ],
                "text": "fully extendable "
              },
              {
                "type": "text",
                "text": "and renderless. There is a plugin system that lets you render each node as "
              },
              {
                "type": "text",
                "marks": [
                  {
                    "type": "bold"
                  }
                ],
                "text": "a vue component. "
              },
              {
                "type": "text",
                "text": "Things like mentions "
              },
              {
                "type": "mention",
                "attrs": {
                  "id": "Philipp"
                }
              },
              {
                "type": "text",
                "text": " are also supported."
              }
            ]
          },
          {
            "type": "code_block",
            "content": [
              {
                "type": "text",
                "text": "body {\n  display: none;\n}"
              }
            ]
          },
          {
            "type": "todo_list",
            "content": [
              {
                "type": "todo_item",
                "attrs": {
                  "done": true
                },
                "content": [
                  {
                    "type": "paragraph",
                    "content": [
                      {
                        "type": "text",
                        "text": "There is always something to do"
                      }
                    ]
                  }
                ]
              },
              {
                "type": "todo_item",
                "attrs": {
                  "done": false
                },
                "content": [
                  {
                    "type": "paragraph",
                    "content": [
                      {
                        "type": "text",
                        "text": "This list will never end"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "type": "bullet_list",
            "content": [
              {
                "type": "list_item",
                "content": [
                  {
                    "type": "paragraph",
                    "content": [
                      {
                        "type": "text",
                        "text": "A regular list"
                      }
                    ]
                  }
                ]
              },
              {
                "type": "list_item",
                "content": [
                  {
                    "type": "paragraph",
                    "content": [
                      {
                        "type": "text",
                        "text": "With regular items"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            "type": "paragraph",
            "content": [
              {
                "type": "text",
                "text": "It's amazing 👏"
              },
            ]
          }
        ]
      },

    }
  },
  methods: {
    showLinkMenu(type) {
      this.linkUrl = type.attrs.href
      this.linkMenuIsActive = true
      this.$nextTick(() => {
        this.$refs.linkInput.focus()
      })
    },
    hideLinkMenu() {
      this.linkUrl = null
      this.linkMenuIsActive = false
    },
    setLinkUrl(url, type, focus) {
      type.command({ href: url })
      this.hideLinkMenu()
      focus()
    },
    onUpdate(state) {
      this.data = state.doc.toJSON()
    },
  },
}
</script>

<style lang="scss">
@import "~variables";

.editor {
  position: relative;
  max-width: 30rem;
  margin: 0 auto 5rem auto;

  &__content {
    pre {
      padding: 0.7rem 1rem;
      border-radius: 5px;
      background: $color-black;
      color: $color-white;
      font-size: 0.8rem;

      code {
        display: block;
      }
    }

    ul,
    ol {
      padding-left: 1rem;
    }

    a {
      color: inherit;
    }
  }
}

.menububble {
  position: absolute;
  display: flex;
  z-index: 20;
  background: $color-black;
  border-radius: 5px;
  padding: 0.2rem;
  margin-bottom: 0.5rem;
  transform: translateX(-50%);
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.2s, visibility 0.2s;

  &__button {
    display: inline-flex;
    background: transparent;
    border: 0;
    color: $color-white;
    padding: 0.2rem 0.5rem;
    margin-right: 0.2rem;
    border-radius: 3px;
    cursor: pointer;

    &:last-child {
      margin-right: 0;
    }

    &:hover {
      background-color: rgba($color-white, 0.1);
    }

    &.is-active {
      background-color: rgba($color-white, 0.2);
    }
  }

  &__form {
    display: flex;
    align-items: center;
  }

  &__input {
    font: inherit;
    border: none;
    background: transparent;
    color: $color-white;
  }
}

.menubar {

  display: flex;
  margin-bottom: 1rem;
  visibility: hidden;
  opacity: 0;
  transition: visibility 0.2s 0.4s, opacity 0.2s 0.4s;

  &.is-focused {
    visibility: visible;
    opacity: 1;
    transition: visibility 0.2s, opacity 0.2s;
  }

  &__button {
    font-weight: bold;
    display: inline-flex;
    background: transparent;
    border: 0;
    color: $color-black;
    padding: 0.2rem 0.5rem;
    margin-right: 0.2rem;
    border-radius: 3px;
    cursor: pointer;

    &:hover {
      background-color: rgba($color-black, 0.05);
    }

    &.is-active {
      background-color: rgba($color-black, 0.1);
    }
  }
}

.mention {
  background: rgba($color-black, 0.1);
  color: rgba($color-black, 0.6);
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 5px;
  padding: 0.2rem 0.5rem;
}

ul[data-type="todo_list"] {
  padding-left: 0;
}

li[data-type="todo_item"] {
  display: flex;
  flex-direction: row;
}

.todo-checkbox {
  border: 2px solid $color-black;
  height: 0.9em;
  width: 0.9em;
  box-sizing: border-box;
  margin-right: 10px;
  margin-top: 0.3rem;
  user-select: none;
  -webkit-user-select: none;
  cursor: pointer;
  border-radius: 0.2em;
  background-color: transparent;
  transition: 0.4s background;
}

.todo-content {
  flex: 1;
}

li[data-done="true"] {
  text-decoration: line-through;
}

li[data-done="true"] .todo-checkbox {
  background-color: $color-black;
}

li[data-done="false"] {
  text-decoration: none;
}
</style>
