import { Editor, Command } from './Editor'

export default abstract class Extension {

  constructor(options = {}) {
    this.options = {
      ...this.defaultOptions(),
      ...options,
    }
  }
  
  editor!: Editor
  options: { [key: string]: any } = {}
  
  public abstract name: string
  
  public extensionType = 'extension'

  public created() {}

  public bindEditor(editor: Editor): void {
    this.editor = editor
  }

  defaultOptions(): { [key: string]: any } {
    return {}
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

  keys(): { [key: string]: Function } {
    return {}
  }

  commands(): { [key: string]: Command } {
    return {}
  } 

}
