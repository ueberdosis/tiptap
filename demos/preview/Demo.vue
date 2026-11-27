<template>
  <iframe
    v-if="embed"
    ref="frame"
    class="block w-full h-screen border-0 bg-transparent"
    :src="currentIframeUrl"
    :key="currentIframeUrl"
    :title="name"
    @load="onFrameLoad"
  />
  <div class="overflow-hidden antialiased rounded-lg" v-else>
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
          <a
            class="flex-shrink min-w-0 overflow-hidden overflow-ellipsis whitespace-nowrap"
            :href="currentIframeUrl"
          >
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

import { applyTheme } from '../setup/helper.js'
import DemoFrame from './DemoFrame.vue'
import Shiki from './Shiki.vue'

/**
 * A page that embeds this preview (the Tiptap docs) talks to it with `postMessage`.
 * The preview sends `{ channel: 'tiptap-demo', type }` with `ready`, `source`, `document`
 * and `height`; the page sends `{ channel: 'tiptap-docs', type }` with `hello`, `theme` and `content`.
 */
const isEmbedded = window.parent !== window

const post = (type, data = {}) => {
  if (isEmbedded) {
    window.parent.postMessage({ channel: 'tiptap-demo', type, ...data }, '*')
  }
}

const usesCollaboration = editor =>
  editor.extensionManager.extensions.some(extension => extension.name === 'collaboration')

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
      editor: null,
      theme: null,
      pendingContent: null,
      postTimeout: null,
    }
  },

  computed: {
    currentIframeUrl() {
      const search = new URL(this.$route.fullPath, window.location.origin).search

      return `/src/${this.name}/${this.currentTab}/${search}`
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
      return Object.fromEntries(
        Object.entries(this.$route.query).map(([key, value]) => [key, this.fromString(value)]),
      )
    },

    inline() {
      return this.query.inline || false
    },

    // The demo alone, filling the frame: the embedding page sets its size and shows the code.
    embed() {
      return this.query.embed || false
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
      post('source', { tab: this.currentTab, files: event.detail })
    },

    onEditor(event) {
      const editor = event.detail

      this.editor = editor

      if (!editor) {
        this.debugJSON = null

        return
      }

      // A theme that came while the demo was loading
      applyTheme(this.$refs.frame?.contentDocument, this.theme, editor)
      this.restoreContent()
      this.debugJSON = JSON.stringify(getDebugJSON(editor.state.doc), null, '  ')
      post('document', { tab: this.currentTab, json: editor.getJSON() })

      editor.on('update', () => {
        this.debugJSON = JSON.stringify(getDebugJSON(editor.state.doc), null, '  ')

        clearTimeout(this.postTimeout)
        this.postTimeout = setTimeout(() => {
          post('document', { tab: this.currentTab, json: editor.getJSON() })
        }, 250)
      })
    },

    // A document the page kept from the other framework's demo; a collaborative demo keeps its own.
    restoreContent() {
      if (!this.editor || !this.pendingContent || usesCollaboration(this.editor)) {
        return
      }

      this.editor.commands.setContent(this.pendingContent, { emitUpdate: false })
      this.pendingContent = null
    },

    // The demo's height, for a page that sizes its frame to the demo
    onFrameLoad() {
      this.heightObserver?.disconnect()
      clearTimeout(this.heightFallback)

      const win = this.$refs.frame?.contentWindow
      const root = win?.document.getElementById('app') ?? win?.document.body

      if (!win || !root) {
        return
      }

      const loadedAt = Date.now()

      const report = () => {
        // Not the empty page before the demo rendered its editor; a demo without one after 3s
        if (!root.querySelector('.ProseMirror, .tiptap') && Date.now() - loadedAt < 3000) {
          return
        }

        // The bottom, so the margins of the first and last element count; 24px for the last one's
        const height = Math.ceil(root.getBoundingClientRect().bottom + win.scrollY + 24)

        if (height !== this.lastHeight) {
          this.lastHeight = height
          post('height', { height })
        }
      }

      // Once it settles: a demo that draws its charts in steps reports one height, not each step
      const settle = () => {
        clearTimeout(this.heightTimeout)
        this.heightTimeout = setTimeout(report, 150)
      }

      this.heightObserver = new win.ResizeObserver(settle)
      this.heightObserver.observe(root)
      settle()
      this.heightFallback = setTimeout(report, 3000)
    },

    postReady() {
      post('ready', { tabs: this.sortedTabs.map(({ name }) => name), tab: this.currentTab })
    },

    onMessage(event) {
      const message = event.data

      if (event.source !== window.parent || message?.channel !== 'tiptap-docs') {
        return
      }

      // The page may start listening after this preview loaded: it says hello, and gets `ready` again
      if (message.type === 'hello') {
        this.postReady()
      }

      if (message.type === 'theme') {
        this.theme = message.theme
        applyTheme(document, message.theme)
        applyTheme(this.$refs.frame?.contentDocument, message.theme, this.editor)
      }

      if (message.type === 'content') {
        this.pendingContent = message.json
        this.restoreContent()
      }
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
    // `?tab=Vue` from the page first, then the tab this browser chose last
    const intitialTab = [this.query.tab, localStorage.tab].find(name =>
      this.tabs.some(tab => tab.name === name),
    )

    this.setTab(intitialTab ?? this.sortedTabs[0]?.name, false)
    applyTheme(document, this.query.theme)

    window.document.addEventListener('editor', this.onEditor, false)
    window.document.addEventListener('source', this.onSource, false)
    window.addEventListener('message', this.onMessage, false)

    this.postReady()
  },

  created() {
    this.heightObserver = null
    this.lastHeight = 0
    this.heightTimeout = null
    this.heightFallback = null
  },

  beforeUnmount() {
    this.heightObserver?.disconnect()
    clearTimeout(this.heightTimeout)
    clearTimeout(this.heightFallback)
    clearTimeout(this.postTimeout)
    window.removeEventListener('message', this.onMessage)
    window.document.removeEventListener('editor', this.onEditor)
    window.document.removeEventListener('source', this.onSource)
  },
}
</script>
