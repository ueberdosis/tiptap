import { EditorState, Plugin } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Schema, DOMParser, DOMSerializer } from 'prosemirror-model'
import { gapCursor } from 'prosemirror-gapcursor'
import { keymap } from 'prosemirror-keymap'
import { baseKeymap, selectParentNode } from 'prosemirror-commands'
import { inputRules, undoInputRule } from 'prosemirror-inputrules'
import { markIsActive, nodeIsActive, getMarkAttrs } from 'tiptap-utils'
import { tableNodes, fixTables } from 'prosemirror-tables'
import { ExtensionManager, ComponentView } from './Utils'
import builtInNodes from './Nodes'

export default class Editor {

  constructor(options = {}) {
    this.init(options)
  }

  init(options = {}) {
    this.setOptions(options)
    this.element = document.createElement('div')
    this.extensions = this.createExtensions()
    this.nodes = this.createNodes()
    this.marks = this.createMarks()
    this.schema = this.createSchema()
    this.plugins = this.createPlugins()
    this.keymaps = this.createKeymaps()
    this.inputRules = this.createInputRules()
    this.state = this.createState()
    this.view = this.createView()
    this.commands = this.createCommands()
    this.setActiveNodesAndMarks()
    this.options.onInit({
      view: this.view,
      state: this.state,
    })
  }

  setOptions(options) {
    const defaultOptions = {
      editable: true,
      extensions: [],
      content: '',
      emptyDocument: {
        type: 'doc',
        content: [{
          type: 'paragraph',
        }],
      },
      onInit: () => {},
      onUpdate: () => {},
      onFocus: () => {},
      onBlur: () => {},
    }

    this.options = {
      ...defaultOptions,
      ...options,
    }
  }

  createExtensions() {
    return new ExtensionManager([
      ...builtInNodes,
      ...this.options.extensions,
    ])
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
    const table = tableNodes({
      tableGroup: 'block',
      cellContent: 'block+',
      cellAttributes: {
        background: {
          default: null,
          getFromDOM(dom) { return dom.style.backgroundColor || null },
          setDOMAttr(value, attrs) {
            attrs.style = attrs.style || {}
            if (value) attrs.style['background-color'] = value
          },
        },
      },
    })
    return Object.assign(this.extensions.nodes, table)
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
    let state = EditorState.create({
      schema: this.schema,
      doc: this.createDocument(this.options.content),
      plugins: [
        ...this.plugins,
        inputRules({
          rules: this.inputRules,
        }),
        ...this.keymaps,
        keymap({
          Backspace: undoInputRule,
          Escape: selectParentNode,
        }),
        keymap(baseKeymap),
        gapCursor(),
        new Plugin({
          props: {
            editable: () => this.options.editable,
          },
        }),
      ],
    })
    // table handle history
    const fix = fixTables(state)
    if (fix) state = state.apply(fix.setMeta('addToHistory', false))
    return state
  }

  createDocument(content) {
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

      return DOMParser.fromSchema(this.schema).parse(element)
    }

    return false
  }

  createView() {
    const view = new EditorView(this.element, {
      state: this.state,
      dispatchTransaction: this.dispatchTransaction.bind(this),
    })

    view.dom.style.whiteSpace = 'pre-wrap'

    view.dom.addEventListener('focus', () => this.options.onFocus({
      state: this.state,
      view: this.view,
    }))

    view.dom.addEventListener('blur', () => this.options.onBlur({
      state: this.state,
      view: this.view,
    }))

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
          ...builtInNodes,
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
    this.state = this.state.apply(transaction)
    this.view.updateState(this.state)
    this.setActiveNodesAndMarks()

    if (!transaction.docChanged) {
      return
    }

    this.emitUpdate()
  }

  emitUpdate() {
    this.options.onUpdate({
      getHTML: this.getHTML.bind(this),
      getJSON: this.getJSON.bind(this),
      state: this.state,
    })
  }

  focus() {
    this.view.focus()
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

  setContent(content = {}, emitUpdate = false) {
    this.state = EditorState.create({
      schema: this.state.schema,
      doc: this.createDocument(content),
      plugins: this.state.plugins,
    })

    this.view.updateState(this.state)

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

    this.state = this.state.reconfigure({
      plugins: this.state.plugins.concat([plugin]),
    })
    this.view.updateState(this.state)
  }

  destroy() {
    if (!this.view) {
      return
    }

    this.view.destroy()
  }

}
