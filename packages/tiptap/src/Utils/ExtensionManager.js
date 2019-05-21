import { keymap } from 'prosemirror-keymap'

export default class ExtensionManager {

  constructor(extensions = [], editor) {
    extensions.forEach(extension => {
      extension.bindEditor(editor)
      extension.init()
    })
    this.extensions = extensions
  }

  get nodes() {
    return this.extensions
      .filter(extension => extension.type === 'node')
      .reduce((nodes, { name, schema }) => ({
        ...nodes,
        [name]: schema,
      }), {})
  }

  get options() {
    const { view } = this
    return this.extensions
        .reduce((nodes, extension) => ({
          ...nodes,
          [extension.name]: new Proxy(extension.options, {
            set(obj, prop, value) {
              const changed = (obj[prop] !== value)

              Object.assign(obj, { [prop]: value })

              if (changed) {
                extension.update(view)
              }

              return true
            },
          }),
        }), {})
  }

  get marks() {
    return this.extensions
      .filter(extension => extension.type === 'mark')
      .reduce((marks, { name, schema }) => ({
        ...marks,
        [name]: schema,
      }), {})
  }

  get plugins() {
    return this.extensions
      .filter(extension => extension.plugins)
      .reduce((allPlugins, { plugins }) => ([
        ...allPlugins,
        ...plugins,
      ]), [])
  }

  keymaps({ schema }) {
    const extensionKeymaps = this.extensions
      .filter(extension => ['extension'].includes(extension.type))
      .filter(extension => extension.keys)
      .map(extension => extension.keys({ schema }))

    const nodeMarkKeymaps = this.extensions
      .filter(extension => ['node', 'mark'].includes(extension.type))
      .filter(extension => extension.keys)
      .map(extension => extension.keys({
        type: schema[`${extension.type}s`][extension.name],
        schema,
      }))

    return [
      ...extensionKeymaps,
      ...nodeMarkKeymaps,
    ].map(keys => keymap(keys))
  }

  inputRules({ schema, excludedExtensions }) {
    if (!(excludedExtensions instanceof Array) && excludedExtensions) return []

    const allowedExtensions = (excludedExtensions instanceof Array) ? this.extensions
        .filter(extension => !excludedExtensions.includes(extension.name)) : this.extensions

    const extensionInputRules = allowedExtensions
      .filter(extension => ['extension'].includes(extension.type))
      .filter(extension => extension.inputRules)
      .map(extension => extension.inputRules({ schema }))

    const nodeMarkInputRules = allowedExtensions
      .filter(extension => ['node', 'mark'].includes(extension.type))
      .filter(extension => extension.inputRules)
      .map(extension => extension.inputRules({
        type: schema[`${extension.type}s`][extension.name],
        schema,
      }))

    return [
      ...extensionInputRules,
      ...nodeMarkInputRules,
    ].reduce((allInputRules, inputRules) => ([
      ...allInputRules,
      ...inputRules,
    ]), [])
  }

  pasteRules({ schema, excludedExtensions }) {
    if (!(excludedExtensions instanceof Array) && excludedExtensions) return []

    const allowedExtensions = (excludedExtensions instanceof Array) ? this.extensions
        .filter(extension => !excludedExtensions.includes(extension.name)) : this.extensions

    const extensionPasteRules = allowedExtensions
      .filter(extension => ['extension'].includes(extension.type))
      .filter(extension => extension.pasteRules)
      .map(extension => extension.pasteRules({ schema }))

    const nodeMarkPasteRules = allowedExtensions
      .filter(extension => ['node', 'mark'].includes(extension.type))
      .filter(extension => extension.pasteRules)
      .map(extension => extension.pasteRules({
        type: schema[`${extension.type}s`][extension.name],
        schema,
      }))

    return [
      ...extensionPasteRules,
      ...nodeMarkPasteRules,
    ].reduce((allPasteRules, pasteRules) => ([
      ...allPasteRules,
      ...pasteRules,
    ]), [])
  }

  commands({ schema, view }) {

    return this.extensions
      .filter(extension => extension.commands)
      .reduce((allCommands, extension) => {
        const { name, type } = extension
        const commands = {}
        const value = extension.commands({
          schema,
          ...['node', 'mark'].includes(type) ? {
            type: schema[`${type}s`][name],
          } : {},
        })

        const apply = (cb, attrs) => {
          if (!view.editable) {
            return false
          }
          view.focus()
          return cb(attrs)(view.state, view.dispatch, view)
        }

        const handle = (_name, _value) => {
          if (Array.isArray(_value)) {
            commands[_name] = attrs => _value.forEach(callback => apply(callback, attrs))
          } else if (typeof _value === 'function') {
            commands[_name] = attrs => apply(_value, attrs)
          }
        }

        if (typeof value === 'object') {
          Object.entries(value).forEach(([commandName, commandValue]) => {
            handle(commandName, commandValue)
          })
        } else {
          handle(name, value)
        }

        return {
          ...allCommands,
          ...commands,
        }
      }, {})
  }

}
