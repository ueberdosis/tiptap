import React from 'react'
import { Editor } from './Editor'

type EditorContentProps = {
  editor: Editor | null
}

export class PureEditorContent extends React.Component<EditorContentProps, EditorContentProps> {
  editorContentRef: React.RefObject<any>

  constructor(props: EditorContentProps) {
    super(props)
    this.editorContentRef = React.createRef()

    this.state = {
      editor: this.props.editor
    }
  }

  componentDidUpdate() {
    const { editor } = this.props

    if (editor && editor.options.element) {
      const element = this.editorContentRef.current

      element.appendChild(editor.options.element.firstChild)

      editor.setOptions({
        element,
      })

      editor.contentComponent = this

      // TODO: why setTimeout?
      setTimeout(() => {
        editor.createNodeViews()
      }, 0)
    }
  }

  render() {
    return (
      <div ref={this.editorContentRef} />
    )
  }
}

export const EditorContent = React.memo(PureEditorContent);
