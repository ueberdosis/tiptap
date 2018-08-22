<template>
	<div>
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

		<!-- <pre>{{ data }}</pre> -->
	</div>
</template>

<script>
import Icon from 'Components/Icon'
import { Editor } from 'tiptap'
import MentionPlugin from './Mention.js'

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