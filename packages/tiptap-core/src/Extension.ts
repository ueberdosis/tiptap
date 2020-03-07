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
  // public abstract plugins: any
  
  public type = 'extension'

  public created() {}

  public bindEditor(editor: Editor): void {
    this.editor = editor
  }

  get update(): any {
    return () => {}
  }

  get plugins(): any {
    return []
  }

  inputRules(): any {
    return []
  }

  pasteRules(): any {
    return []
  }

  keys(): any {
    return {}
  }

}
