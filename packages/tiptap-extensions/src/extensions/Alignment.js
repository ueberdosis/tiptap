import { Extension } from 'tiptap'
import { setTextAlignment } from 'tiptap-commands'

export default class Alignment extends Extension {

  constructor(options = {}) {
    super(options)

    this._alignment = options.alignment || 'left'
  }

  get name() {
    return 'alignment'
  }

  get defaultOptions() {
    return {
      alignments: ['left', 'right', 'center', 'justify'],
    }
  }

  get schema() {
    return {
      attrs: {
        align: { default: 'left' },
      },
    }
  }

  commands({ type }) {
    return attrs => setTextAlignment(type, attrs)
  }

}
