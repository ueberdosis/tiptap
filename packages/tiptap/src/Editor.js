import {
  EditorState,
  Plugin,
  PluginKey,
  TextSelection,
} from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Schema, DOMParser, DOMSerializer } from 'prosemirror-model'
import { dropCursor } from 'prosemirror-dropcursor'
import { gapCursor } from 'prosemirror-gapcursor'
import { keymap } from 'prosemirror-keymap'
import { baseKeymap } from 'prosemirror-commands'
import { inputRules, undoInputRule } from 'prosemirror-inputrules'
import { markIsActive, nodeIsActive, getMarkAttrs } from 'tiptap-utils'
import {
  injectCSS,
  camelCase,
  Emitter,
  ExtensionManager,
  ComponentView,
  minMax,
} from './Utils'
import { Doc, Paragraph, Text } from './Nodes'
import css from './style.css'

export default class Editor extends Emitter {

  constructor(options = {}) {
    super()

    this.defaultOptions = {
      editorProps: {},
      editable: true,
      autoFocus: null,
      extensions: [],
      content: '',
      topNode: 'doc',
      emptyDocument: {
        type: 'doc',
        content: [{
          type: 'paragraph',
        }],
      },
      useBuiltInExtensions: true,
      disableInputRules: false,
      disablePasteRules: false,
      dropCursor: {},
      parseOptions: {},
      injectCSS: true,
      onInit: () => {},
      onTransaction: () => {},
      onUpdate: () => {},
      onFocus: () => {},
      onBlur: () => {},
      onPaste: () => {},
      onDrop: () => {},
    }

    this.events = [
      'init',
      'transaction',
      'update',
      'focus',
      'blur',
      'paste',
      'drop',
    ]

    this.init(options)
  }

  init(options = {}) {
    this.setOptions({
      ...this.defaultOptions,
      ...options,
    })
    this.focused = false
    this.selection = { from: 0, to: 0 }
    this.element = document.createElement('div')
    this.extensions = this.createExtensions()
    this.nodes = this.createNodes()
    this.marks = this.createMarks()
    this.schema = this.createSchema()
    this.plugins = this.createPlugins()
    this.keymaps = this.createKeymaps()
    this.inputRules = this.createInputRules()
    this.pasteRules = this.createPasteRules()
    this.view = this.createView()
    this.commands = this.createCommands()
    this.setActiveNodesAndMarks()

    if (this.options.injectCSS) {
      injectCSS(css)
    }

    if (this.options.autoFocus !== null) {
      this.focus(this.options.autoFocus)
    }

    this.events.forEach(name => {
      this.on(name, this.options[camelCase(`on ${name}`)] || (() => {}))
    })

    this.emit('init', {
      view: this.view,
      state: this.state,
    })

    // give extension manager access to our view
    this.extensions.view = this.view
  }

  setOptions(options) {
    this.options = {
      ...this.options,
      ...options,
    }

    if (this.view && this.state) {
      this.view.updateState(this.state)
    }
  }

  get builtInExtensions() {
    if (!this.options.useBuiltInExtensions) {
      return []
    }

    return [
      new Doc(),
      new Text(),
      new Paragraph(),
    ]
  }

  get state() {
    return this.view ? this.view.state : null
  }

  createExtensions() {
    return new ExtensionManager([
      ...this.builtInExtensions,
      ...this.options.extensions,
    ], this)
  }

  createPlugins() {
    return this.extensions.plugins
  }

  createKeymaps() {
    return this.extensions.keymaps({
      schema: this.schema,
    })
  }

  createInputRules() {
    return this.extensions.inputRules({
      schema: this.schema,
      excludedExtensions: this.options.disableInputRules,
    })
  }

  createPasteRules() {
    return this.extensions.pasteRules({
      schema: this.schema,
      excludedExtensions: this.options.disablePasteRules,
    })
  }

  createCommands() {
    return this.extensions.commands({
      schema: this.schema,
      view: this.view,
    })
  }

  createNodes() {
    return this.extensions.nodes
  }

  createMarks() {
    return this.extensions.marks
  }

  createSchema() {
    return new Schema({
      topNode: this.options.topNode,
      nodes: this.nodes,
      marks: this.marks,
    })
  }

  createState() {
    return EditorState.create({
      schema: this.schema,
      doc: this.createDocument(this.options.content),
      plugins: [
        ...this.plugins,
        inputRules({
          rules: this.inputRules,
        }),
        ...this.pasteRules,
        ...this.keymaps,
        keymap({
          Backspace: undoInputRule,
        }),
        keymap(baseKeymap),
        dropCursor(this.options.dropCursor),
        gapCursor(),
        new Plugin({
          key: new PluginKey('editable'),
          props: {
            editable: () => this.options.editable,
          },
        }),
        new Plugin({
          props: {
            attributes: {
              tabindex: 0,
            },
            handleDOMEvents: {
              focus: (view, event) => {
                this.focused = true
                this.emit('focus', {
                  event,
                  state: view.state,
                  view,
                })

                const transaction = this.state.tr.setMeta('focused', true)
                this.view.dispatch(transaction)
              },
              blur: (view, event) => {
                this.focused = false
                this.emit('blur', {
                  event,
                  state: view.state,
                  view,
                })

                const transaction = this.state.tr.setMeta('focused', false)
                this.view.dispatch(transaction)
              },
            },
          },
        }),
        new Plugin({
          props: this.options.editorProps,
        }),
      ],
    })
  }

  createDocument(content, parseOptions = this.options.parseOptions) {
    if (content === null) {
      return this.schema.nodeFromJSON(this.options.emptyDocument)
    }

    if (typeof content === 'object') {
      try {
        return this.schema.nodeFromJSON(content)
      } catch (error) {
        console.warn('[tiptap warn]: Invalid content.', 'Passed value:', content, 'Error:', error)
        return this.schema.nodeFromJSON(this.options.emptyDocument)
      }
    }

    if (typeof content === 'string') {
      const element = document.createElement('div')
      element.innerHTML = content.trim()

      return DOMParser.fromSchema(this.schema).parse(element, parseOptions)
    }

    return false
  }

  createView() {
    return new EditorView(this.element, {
      state: this.createState(),
      handlePaste: (...args) => { this.emit('paste', ...args) },
      handleDrop: (...args) => { this.emit('drop', ...args) },
      dispatchTransaction: this.dispatchTransaction.bind(this),
    })
  }

  setParentComponent(component = null) {
    if (!component) {
      return
    }

    this.view.setProps({
      nodeViews: this.initNodeViews({
        parent: component,
        extensions: [
          ...this.builtInExtensions,
          ...this.options.extensions,
        ],
      }),
    })
  }

  initNodeViews({ parent, extensions }) {
    return extensions
      .filter(extension => ['node', 'mark'].includes(extension.type))
      .filter(extension => extension.view)
      .reduce((nodeViews, extension) => {
        const nodeView = (node, view, getPos, decorations) => {
          const component = extension.view

          return new ComponentView(component, {
            editor: this,
            extension,
            parent,
            node,
            view,
            getPos,
            decorations,
          })
        }

        return {
          ...nodeViews,
          [extension.name]: nodeView,
        }
      }, {})
  }

  dispatchTransaction(transaction) {
    const newState = this.state.apply(transaction)
    this.view.updateState(newState)
    this.selection = {
      from: this.state.selection.from,
      to: this.state.selection.to,
    }
    this.setActiveNodesAndMarks()

    this.emit('transaction', {
      getHTML: this.getHTML.bind(this),
      getJSON: this.getJSON.bind(this),
      state: this.state,
      transaction,
    })

    if (!transaction.docChanged || transaction.getMeta('preventUpdate')) {
      return
    }

    this.emitUpdate(transaction)
  }

  emitUpdate(transaction) {
    this.emit('update', {
      getHTML: this.getHTML.bind(this),
      getJSON: this.getJSON.bind(this),
      state: this.state,
      transaction,
    })
  }

  resolveSelection(position = null) {
    if (this.selection && position === null) {
      return this.selection
    }

    if (position === 'start' || position === true) {
      return {
        from: 0,
        to: 0,
      }
    }

    if (position === 'end') {
      const { doc } = this.state
      return {
        from: doc.content.size,
        to: doc.content.size,
      }
    }

    return {
      from: position,
      to: position,
    }
  }

  focus(position = null) {
    if ((this.view.focused && position === null) || position === false) {
      return
    }

    const { from, to } = this.resolveSelection(position)

    this.setSelection(from, to)
    setTimeout(() => this.view.focus(), 10)
  }

  setSelection(from = 0, to = 0) {
    const { doc, tr } = this.state
    const resolvedFrom = minMax(from, 0, doc.content.size)
    const resolvedEnd = minMax(to, 0, doc.content.size)
    const selection = TextSelection.create(doc, resolvedFrom, resolvedEnd)
    const transaction = tr.setSelection(selection)

    this.view.dispatch(transaction)
  }

  blur() {
    this.view.dom.blur()
  }

  getSchemaJSON() {
    return JSON.parse(JSON.stringify({
      nodes: this.extensions.nodes,
      marks: this.extensions.marks,
    }))
  }

  getHTML() {
    const div = document.createElement('div')
    const fragment = DOMSerializer
      .fromSchema(this.schema)
      .serializeFragment(this.state.doc.content)

    div.appendChild(fragment)

    return div.innerHTML
  }

  getJSON() {
    return this.state.doc.toJSON()
  }

  setContent(content = {}, emitUpdate = false, parseOptions) {
    const { doc, tr } = this.state
    const document = this.createDocument(content, parseOptions)
    const selection = TextSelection.create(doc, 0, doc.content.size)
    const transaction = tr
      .setSelection(selection)
      .replaceSelectionWith(document, false)
      .setMeta('preventUpdate', !emitUpdate)

    this.view.dispatch(transaction)
  }

  clearContent(emitUpdate = false) {
    this.setContent(this.options.emptyDocument, emitUpdate)
  }

  setActiveNodesAndMarks() {
    this.activeMarks = Object
      .entries(this.schema.marks)
      .reduce((marks, [name, mark]) => ({
        ...marks,
        [name]: (attrs = {}) => markIsActive(this.state, mark, attrs),
      }), {})

    this.activeMarkAttrs = Object
      .entries(this.schema.marks)
      .reduce((marks, [name, mark]) => ({
        ...marks,
        [name]: getMarkAttrs(this.state, mark),
      }), {})

    this.activeNodes = Object
      .entries(this.schema.nodes)
      .reduce((nodes, [name, node]) => ({
        ...nodes,
        [name]: (attrs = {}) => nodeIsActive(this.state, node, attrs),
      }), {})
  }

  getMarkAttrs(type = null) {
    return this.activeMarkAttrs[type]
  }

  get isActive() {
    return Object
      .entries({
        ...this.activeMarks,
        ...this.activeNodes,
      })
      .reduce((types, [name, value]) => ({
        ...types,
        [name]: (attrs = {}) => value(attrs),
      }), {})
  }

  registerPlugin(plugin = null) {
    if (!plugin) {
      return
    }

    const newState = this.state.reconfigure({
      plugins: this.state.plugins.concat([plugin]),
    })
    this.view.updateState(newState)
  }

  unregisterPlugin(name = null) {
    if (!name || !this.view.docView) {
      return
    }

    const newState = this.state.reconfigure({
      plugins: this.state.plugins.filter(plugin => !plugin.key.startsWith(`${name}$`)),
    })
    this.view.updateState(newState)
  }

  destroy() {
    if (!this.view) {
      return
    }

    this.view.destroy()
  }

}
