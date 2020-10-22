import { Plugin } from 'prosemirror-state'
import { keymap } from 'prosemirror-keymap'
// import { Schema, Node as ProsemirrorNode } from 'prosemirror-model'
import { inputRules } from 'prosemirror-inputrules'
// import { EditorView, Decoration } from 'prosemirror-view'
import { Editor } from './Editor'
// import capitalize from './utils/capitalize'
import { Extensions } from './types'
import getSchema from './utils/getSchema'
import getSchemaTypeByName from './utils/getSchemaTypeByName'

export default class ExtensionManager {

  editor: Editor

  extensions: Extensions

  constructor(extensions: Extensions, editor: Editor) {
    this.editor = editor
    this.extensions = extensions

    this.extensions.forEach(extension => {
      const context = {
        options: extension.options,
        editor: this.editor,
        type: getSchemaTypeByName(extension.name, this.schema),
      }

      const commands = extension.addCommands.bind(context)()

      editor.registerCommands(commands)
    })
  }

  get schema() {
    return getSchema(this.extensions)
  }

  get plugins(): Plugin[] {
    const plugins = this.extensions
      .map(extension => {
        const context = {
          options: extension.options,
          editor: this.editor,
          type: getSchemaTypeByName(extension.name, this.schema),
        }

        return extension.addProseMirrorPlugins.bind(context)()
      })
      .flat()

    return [
      ...plugins,
      ...this.keymaps,
      ...this.pasteRules,
      inputRules({ rules: this.inputRules }),
    ]
  }

  get inputRules(): any {
    return this.extensions
      .map(extension => {
        const context = {
          options: extension.options,
          editor: this.editor,
          type: getSchemaTypeByName(extension.name, this.schema),
        }

        return extension.addInputRules.bind(context)()
      })
      .flat()
  }

  get pasteRules(): any {
    return this.extensions
      .map(extension => {
        const context = {
          options: extension.options,
          editor: this.editor,
          type: getSchemaTypeByName(extension.name, this.schema),
        }

        return extension.addPasteRules.bind(context)()
      })
      .flat()
  }

  get keymaps() {
    return this.extensions.map(extension => {
      const context = {
        options: extension.options,
        editor: this.editor,
        type: getSchemaTypeByName(extension.name, this.schema),
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
