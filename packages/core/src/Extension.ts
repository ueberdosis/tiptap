import { Editor } from './Editor'

export default abstract class Extension {

  constructor(options = {}) {
    this.options = {
      ...this.defaultOptions,
      ...options,
    }
  }
  
  editor!: Editor
  options: { [key: string]: any } = {}
  defaultOptions: { [key: string]: any } = {}
  
  public abstract name: string
  
  public type = 'extension'

  public created() {}

  public bindEditor(editor: Editor): void {
    this.editor = editor
  }

  update(): any {
    return () => {}
  }

  plugins(): any {
    return []
  }

  inputRules(): any {
    return []
  }

  pasteRules(): any {
    return []
  }

  keys(): { [key: string]: any } {
    return {}
  }

  commands(): { [key: string]: any } {
    return {}
  } 

}
