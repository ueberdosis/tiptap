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
 camelCase, Emitter, ExtensionManager, ComponentView,
} from './Utils'
import { Doc, Paragraph, Text } from './Nodes'

export default class Editor extends Emitter {

  constructor(options = {}) {
    super()

    this.defaultOptions = {
      editorProps: {},
      editable: true,
      autoFocus: false,
      extensions: [],
      content: '',
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
      onInit: () => {},
      onUpdate: () => {},
      onFocus: () => {},
      onBlur: () => {},
      onPaste: () => {},
      onDrop: () => {},
    }

    this.events = [
      'init',
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

    if (this.options.autoFocus) {
      this.focus()
    }

    this.events.forEach(name => {
      this.on(name, this.options[camelCase(`on ${name}`)])
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
      editable: this.options.editable,
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
              focus: event => this.emit('focus', {
                event,
                state: this.state,
                view: this.view,
              }),
              blur: event => this.emit('blur', {
                event,
                state: this.state,
                view: this.view,
              }),
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
    const view = new EditorView(this.element, {
      state: this.createState(),
      handlePaste: (...args) => { this.emit('paste', ...args) },
      handleDrop: (...args) => { this.emit('drop', ...args) },
      dispatchTransaction: this.dispatchTransaction.bind(this),
    })

    view.dom.style.whiteSpace = 'pre-wrap'

    return view
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
        editable: this.options.editable,
      }),
    })
  }

  initNodeViews({ parent, extensions, editable }) {
    return extensions
      .filter(extension => ['node', 'mark'].includes(extension.type))
      .filter(extension => extension.view)
      .reduce((nodeViews, extension) => {
        const nodeView = (node, view, getPos, decorations) => {
          const component = extension.view

          return new ComponentView(component, {
            extension,
            parent,
            node,
            view,
            getPos,
            decorations,
            editable,
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
    this.setActiveNodesAndMarks()

    if (!transaction.docChanged) {
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

  focus(position = null) {
    if (position !== null) {
      let pos = position

      if (position === 'start') {
        pos = 0
      } else if (position === 'end') {
        pos = this.view.state.doc.nodeSize - 2
      }

      const selection = TextSelection.near(this.view.state.doc.resolve(pos))
      const transaction = this.view.state.tr.setSelection(selection)
      this.view.dispatch(transaction)
    }

    setTimeout(() => {
      this.view.focus()
    }, 10)
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
    const newState = EditorState.create({
      schema: this.state.schema,
      doc: this.createDocument(content, parseOptions),
      plugins: this.state.plugins,
    })

    this.view.updateState(newState)

    if (emitUpdate) {
      this.emitUpdate()
    }
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
