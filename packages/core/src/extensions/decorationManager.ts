import { Extension } from '../Extension.js'

export const DecorationManager = Extension.create({
  name: 'decorationManager',

  addProseMirrorPlugins() {

    return [
      this.editor.decorationManager.plugin,
    ]
  },
})
