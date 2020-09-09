import deepmerge from 'deepmerge'
import collect from 'collect.js'
import { Plugin } from 'prosemirror-state'
import { keymap } from 'prosemirror-keymap'
import { inputRules } from 'prosemirror-inputrules'
import { EditorView, Decoration } from 'prosemirror-view'
import { Node as ProsemirrorNode } from 'prosemirror-model'
import { Editor } from './Editor'
import Extension from './Extension'
import Node from './Node'
import Mark from './Mark'
import capitalize from './utils/capitalize'
import resolveExtensionConfig from './utils/resolveExtensionConfig'

type Extensions = (Extension | Node | Mark)[]

export default class ExtensionManager {

  editor: Editor
  extensions: Extensions

  constructor(extensions: Extensions, editor: Editor) {
    this.editor = editor
    this.extensions = extensions

    this.extensions.forEach(extension => {
      resolveExtensionConfig(extension, 'name')
      resolveExtensionConfig(extension, 'defaults')
      resolveExtensionConfig(extension, 'topNode')

      const name = extension.config.name
      const options = deepmerge(extension.config.defaults, extension.options)

      resolveExtensionConfig(extension, 'schema', { name, options })

      editor.on('schemaCreated', () => {
        const type = extension.type === 'node'
          ? this.editor.schema.nodes[extension.config.name]
          : this.editor.schema.marks[extension.config.name]

        resolveExtensionConfig(extension, 'commands', { name, options, editor, type })
        resolveExtensionConfig(extension, 'inputRules', { name, options, editor, type })
        resolveExtensionConfig(extension, 'pasteRules', { name, options, editor, type })
        resolveExtensionConfig(extension, 'keys', { name, options, editor, type })
        resolveExtensionConfig(extension, 'plugins', { name, options, editor, type })

        if (extension.config.commands) {
          this.editor.registerCommands(extension.config.commands)
        }
      })
    })
  }

  get topNode() {
    const topNode = collect(this.extensions).firstWhere('config.topNode', true)

    if (topNode) {
      return topNode.config.name
    }
  }

  get nodes(): any {
    return collect(this.extensions)
      .where('type', 'node')
      .mapWithKeys((extension: Node) => [extension.config.name, extension.config.schema])
      .all()
  }

  get marks(): any {
    return collect(this.extensions)
      .where('type', 'mark')
      .mapWithKeys((extension: Mark) => [extension.config.name, extension.config.schema])
      .all()
  }

  get plugins(): Plugin[] {
    const plugins = collect(this.extensions)
      .flatMap(extension => extension.config.plugins)
      .filter(plugin => plugin)
      .toArray()

    return [
      ...plugins,
      ...this.keymaps,
      ...this.pasteRules,
      inputRules({ rules: this.inputRules }),
    ]
  }

  get inputRules(): any {
    return collect(this.extensions)
      .flatMap(extension => extension.config.inputRules)
      .filter(plugin => plugin)
      .toArray()
  }

  get pasteRules(): any {
    return collect(this.extensions)
      .flatMap(extension => extension.config.pasteRules)
      .filter(plugin => plugin)
      .toArray()
  }

  get keymaps() {
    return collect(this.extensions)
      .map(extension => extension.config.keys)
      .filter(keys => keys)
      .map(keys => keymap(keys))
      .toArray()
  }

  get nodeViews() {
    // const { renderer: Renderer } = this.editor

    // if (!Renderer || !Renderer.type) {
    //   return {}
    // }

    // const prop = `to${capitalize(Renderer.type)}`

    // return collect(this.extensions)
    //   .where('extensionType', 'node')
    //   .filter((extension: any) => extension.schema()[prop])
    //   .map((extension: any) => {
    //     return (
    //       node: ProsemirrorNode,
    //       view: EditorView,
    //       getPos: (() => number) | boolean,
    //       decorations: Decoration[],
    //     ) => {
    //       return new Renderer(extension.schema()[prop], {
    //         extension,
    //         editor: this.editor,
    //         node,
    //         getPos,
    //         decorations,
    //       })
    //     }
    //   })
    //   .all()

    return {}
  }

}
