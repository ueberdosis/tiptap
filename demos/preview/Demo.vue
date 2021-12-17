<template>
  <demo-frame
    v-if="inline"
    :src="currentIframeUrl"
    :key="currentIframeUrl"
  />
  <div class="antialiased" v-else>
    <div v-if="showTabs">
      <button
        v-for="(language, index) in sortedTabs"
        :key="index"
        @click="setTab(language.name)"
        class="px-4 py-2 rounded-t-lg text-xs uppercase font-bold tracking-wide"
        :class="[currentTab === language.name
          ? 'bg-black text-white'
          : 'text-black'
        ]"
      >
        {{ language.name }}
      </button>
    </div>
    <div class="overflow-hidden rounded-b-xl">
      <div
        class="bg-white border-3 border-black last:rounded-b-xl"
        :class="[
          showTabs && firstTabSelected
            ? 'rounded-tr-xl'
            : 'rounded-t-xl',
        ]"
      >
        <demo-frame
          :src="currentIframeUrl"
          :key="currentIframeUrl"
        />
      </div>

      <div class="bg-black text-white" v-if="!hideSource && currentFile">
        <div class="flex overflow-x-auto">
          <div class="flex flex-auto px-4 border-b-2 border-gray-800">
            <button
              class="inline-flex relative mr-4 py-2 pb-[calc(0.3rem + 2px)] mb-[-2px] border-b-2 border-transparent font-mono text-sm whitespace-nowrap"
              :class="[!showDebug && currentFile.content === file.content
                ? 'text-white border-white font-bold'
                : 'text-gray-400'
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
              :class="[showDebug
                ? 'text-white border-white font-bold'
                : 'text-gray-400'
              ]"
              @click="showDebug = !showDebug"
            >
              Inspect
            </button>
          </div>
        </div>

        <div class="overflow-dark overflow-auto max-h-[500px] relative text-white">
          <shiki
            class="overflow-visible p-4"
            :language="debugJSON && showDebug ? 'js' : getFileExtension(currentFile.name)"
            :code="debugJSON && showDebug ? debugJSON : currentFile.content"
          />
        </div>

        <div class="flex justify-between px-4 py-2 text-md text-gray-400 border-t border-gray-800">
          <a class="flex-shrink min-w-0 overflow-ellipsis overflow-hidden whitespace-nowrap" :href="currentIframeUrl">
            {{ name }}/{{ currentTab }}
          </a>
          <a class="whitespace-nowrap pl-4" :href="githubUrl" target="_blank">
            Edit on GitHub →
          </a>
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
      tabOrder: ['React', 'Vue', 'JS'],
      debugJSON: null,
      showDebug: false,
    }
  },

  computed: {
    showTabs() {
      return this.sortedTabs.length > 1
    },

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
      return Object.fromEntries(Object
        .entries(this.$route.query)
        .map(([key, value]) => [key, this.fromString(value)]))
    },

    inline() {
      return this.query.inline || false
    },

    hideSource() {
      return this.query.hideSource || false
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
      this.sources = {}
      this.currentFile = null

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
    const intitialTab = localStorage.tab && this.tabs.some(tab => tab.name === localStorage.tab)
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
