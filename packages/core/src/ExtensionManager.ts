import { Plugin } from 'prosemirror-state'
import { keymap } from 'prosemirror-keymap'
// import { Schema, Node as ProsemirrorNode } from 'prosemirror-model'
import { inputRules } from 'prosemirror-inputrules'
// import { EditorView, Decoration } from 'prosemirror-view'

import { Editor } from './Editor'
// import capitalize from './utils/capitalize'
import { Extensions } from './types'
import getSchema from './utils/getSchema'

export default class ExtensionManager {

  editor: Editor

  extensions: Extensions

  constructor(extensions: Extensions, editor: Editor) {
    this.editor = editor
    this.extensions = extensions
  }

  // resolveConfigs() {
  //   this.extensions.forEach(extension => {
  //     const { editor } = this
  //     const { name } = extension.config
  //     const options = {
  //       ...extension.config.defaults,
  //       ...extension.options,
  //     }
  //     const type = extension.type === 'node'
  //       ? editor.schema.nodes[name]
  //       : editor.schema.marks[name]

  //     resolveExtensionConfig(extension, 'commands', {
  //       name, options, editor, type,
  //     })
  //     resolveExtensionConfig(extension, 'inputRules', {
  //       name, options, editor, type,
  //     })
  //     resolveExtensionConfig(extension, 'pasteRules', {
  //       name, options, editor, type,
  //     })
  //     resolveExtensionConfig(extension, 'keys', {
  //       name, options, editor, type,
  //     })
  //     resolveExtensionConfig(extension, 'plugins', {
  //       name, options, editor, type,
  //     })

  //     if (extension.config.commands) {
  //       editor.registerCommands(extension.config.commands)
  //     }
  //   })
  // }

  get schema() {
    return getSchema(this.extensions)
  }

  get plugins(): Plugin[] {
    // const plugins = collect(this.extensions)
    //   .flatMap(extension => extension.config.plugins)
    //   .filter(plugin => plugin)
    //   .toArray()

    return [
      // ...plugins,
      ...this.keymaps,
      ...this.pasteRules,
      inputRules({ rules: this.inputRules }),
    ]
  }

  get inputRules(): any {
    return []
    // return collect(this.extensions)
    //   .flatMap(extension => extension.config.inputRules)
    //   .filter(plugin => plugin)
    //   .toArray()
  }

  get pasteRules(): any {
    return []
    // return collect(this.extensions)
    //   .flatMap(extension => extension.config.pasteRules)
    //   .filter(plugin => plugin)
    //   .toArray()
  }

  get keymaps() {
    return this.extensions.map(extension => {
      const context = {
        options: extension.options,
        editor: this.editor,
      }

      return keymap(extension.addKeyboardShortcuts.bind(context)())
    })
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
