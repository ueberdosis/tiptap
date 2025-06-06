<template>
  <div class="overflow-hidden antialiased rounded-lg">
    <div class="px-3 py-1 bg-black flex items-center gap-0.5">
      <button
        v-for="(language, index) in sortedTabs"
        :key="index"
        @click="setTab(language.name)"
        class="px-3 py-2 text-sm text-white leading-[125%] font-semibold rounded-[0.625rem] transition-all"
        :class="[
          currentTab === language.name
            ? 'opacity-100 bg-[#1C1917]'
            : 'opacity-50 bg-transparent hover:opacity-100 hover:bg-[#1C1917]',
        ]"
      >
        {{ language.name }}
      </button>
    </div>
    <div class="overflow-hidden">
      <div class="bg-white" :class="[hidePreview ? 'hidden' : '']">
        <demo-frame :src="currentIframeUrl" :key="currentIframeUrl" />
      </div>

      <div class="text-white bg-black" v-if="!hideSource && currentFile">
        <div class="flex overflow-x-auto">
          <div class="flex flex-auto px-4 border-b-2 border-gray-800">
            <button
              class="inline-flex relative mr-4 py-2 pb-[calc(0.3rem + 2px)] mb-[-2px] border-b-2 border-transparent font-mono text-sm whitespace-nowrap"
              :class="[
                !showDebug && currentFile.content === file.content
                  ? 'text-white border-white font-bold'
                  : 'text-gray-400',
              ]"
              v-for="(file, index) in source"
              :key="index"
              @click="setFile(file.name)"
            >
              {{ file.name }}
            </button>

            <button
              v-if="debugJSON"
              class="inline-flex relative py-2 pb-[calc(0.3rem + 2px)] mb-[-2px] border-b-2 border-transparent font-mono text-sm ml-auto"
              :class="[showDebug ? 'text-white border-white font-bold' : 'text-gray-400']"
              @click="showDebug = !showDebug"
            >
              Inspect
            </button>
          </div>
        </div>

        <div class="overflow-dark overflow-auto max-h-[500px] relative text-white">
          <shiki
            class="p-4 overflow-visible"
            :language="debugJSON && showDebug ? 'js' : getFileExtension(currentFile.name)"
            :code="debugJSON && showDebug ? debugJSON : currentFile.content"
          />
        </div>

        <div class="flex justify-between px-4 py-2 text-gray-400 border-t border-gray-800 text-md">
          <a class="flex-shrink min-w-0 overflow-hidden overflow-ellipsis whitespace-nowrap" :href="currentIframeUrl">
            {{ name }}/{{ currentTab }}
          </a>
          <a class="pl-4 whitespace-nowrap" :href="githubUrl" target="_blank"> Edit on GitHub → </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getDebugJSON } from '@tiptap/core'

import DemoFrame from './DemoFrame.vue'
import Shiki from './Shiki.vue'

export default {
  components: {
    DemoFrame,
    Shiki,
  },

  props: {
    name: {
      type: String,
      required: true,
    },

    tabs: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      data: [],
      sources: {},
      currentTab: null,
      currentFile: null,
      tabOrder: ['React', 'Vue', 'Svelte', 'JS'],
      debugJSON: null,
      showDebug: false,
    }
  },

  computed: {
    currentIframeUrl() {
      return `/src/${this.name}/${this.currentTab}/`
    },

    firstTabSelected() {
      return this.sortedTabs[0].name === this.currentTab
    },

    sortedTabs() {
      return [...this.tabs].sort((a, b) => {
        return this.tabOrder.indexOf(a.name) - this.tabOrder.indexOf(b.name)
      })
    },

    query() {
      return Object.fromEntries(Object.entries(this.$route.query).map(([key, value]) => [key, this.fromString(value)]))
    },

    inline() {
      return this.query.inline || false
    },

    hideSource() {
      return this.query.hideSource || false
    },

    hidePreview() {
      return this.query.hidePreview || false
    },

    githubUrl() {
      return `https://github.com/ueberdosis/tiptap/tree/main/demos/src/${this.name}`
    },

    source() {
      return this.sources[this.currentTab]
    },
  },

  methods: {
    getFileExtension(name) {
      return name.split('.').pop()
    },

    setTab(name, persist = true) {
      this.currentTab = name

      if (persist) {
        localStorage.tab = name
      }
    },

    setFile(name) {
      this.showDebug = false
      this.currentFile = this.source.find(item => item.name === name)
    },

    onSource(event) {
      this.sources[this.currentTab] = event.detail
      this.setFile(this.source[0].name)
    },

    onEditor(event) {
      const editor = event.detail

      if (!editor) {
        this.debugJSON = null

        return
      }

      this.debugJSON = JSON.stringify(getDebugJSON(editor.state.doc), null, '  ')

      editor.on('update', () => {
        this.debugJSON = JSON.stringify(getDebugJSON(editor.state.doc), null, '  ')
      })
    },

    fromString(value) {
      if (value === null) {
        return true
      }

      if (value.match(/^\d*(\.\d+)?$/)) {
        return Number(value)
      }

      if (value === 'true') {
        return true
      }

      if (value === 'false') {
        return false
      }

      if (value === 'null') {
        return null
      }

      return value
    },
  },

  mounted() {
    // TODO: load language from url params
    const intitialTab =
      localStorage.tab && this.tabs.some(tab => tab.name === localStorage.tab)
        ? localStorage.tab
        : this.sortedTabs[0]?.name

    this.setTab(intitialTab, false)

    window.document.addEventListener('editor', this.onEditor, false)
    window.document.addEventListener('source', this.onSource, false)
  },

  beforeUnmount() {
    window.document.removeEventListener('editor', this.onEditor)
    window.document.removeEventListener('source', this.onSource)
  },
}
</script>
