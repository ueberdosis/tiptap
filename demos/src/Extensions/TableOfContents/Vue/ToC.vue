<template>
  <template v-if="items.length === 0">
    <ToCEmptyState />
  </template>
  <template v-else>
    <ToCItem
      v-for="(item, i) in items"
      :key="item.id"
      :item="item"
      :index="i + 1"
      @item-click="onItemClick"
    />
  </template>
</template>

<script>
import { TextSelection } from '@tiptap/pm/state'
import { defineComponent } from 'vue'

import ToCEmptyState from './ToCEmptyState.vue'
import ToCItem from './ToCItem.vue'

export default defineComponent({
  components: {
    ToCItem,
    ToCEmptyState,
  },

  props: {
    items: {
      type: Array,
      default: () => [],
    },
    editor: {
      type: Object,
      required: true,
    },
  },

  methods: {
    onItemClick(e, id) {
      if (this.editor) {
        const element = this.editor.view.dom.querySelector(`[data-toc-id="${id}"`)
        const pos = this.editor.view.posAtDOM(element, 0)

        // set focus
        const tr = this.editor.view.state.tr

        tr.setSelection(new TextSelection(tr.doc.resolve(pos)))

        this.editor.view.dispatch(tr)

        this.editor.view.focus()

        if (history.pushState) { // eslint-disable-line
          history.pushState(null, null, `#${id}`) // eslint-disable-line
        }

        window.scrollTo({
          top: element.getBoundingClientRect().top + window.scrollY,
          behavior: 'smooth',
        })
      }
    },
  },
})
</script>
