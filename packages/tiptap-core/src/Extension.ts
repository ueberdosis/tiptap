import { Editor } from './Editor'

export default abstract class Extension {

  public abstract name: string

  editor: any
  options: { [key: string]: any } = {}
  defaultOptions: { [key: string]: any } = {}

  constructor(options = {}) {
    this.options = {
      ...this.defaultOptions,
      ...options,
    }
  }

  init(): any {
    return null
  }

  bindEditor(editor: Editor): void {
    this.editor = editor
  }

  get type(): any {
    return 'extension'
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
