import React from 'react'
import ReactDOM from 'react-dom'
import { Editor } from './Editor'
import { ReactRenderer } from './ReactRenderer'

type EditorContentProps = {
  editor: Editor | null
}

const Portals: React.FC<{ renderers: Map<string, ReactRenderer> }> = ({ renderers }) => {
  return (
    <>
      {Array.from(renderers).map(([key, renderer]) => {
        return ReactDOM.createPortal(
          renderer.reactElement,
          renderer.element,
          key,
        )
      })}
    </>
  )
}

export class PureEditorContent extends React.Component<EditorContentProps, any> {
  editorContentRef: React.RefObject<any>

  constructor(props: EditorContentProps) {
    super(props)
    this.editorContentRef = React.createRef()

    this.state = {
      editor: this.props.editor,
      renderers: new Map(),
    }
  }

  componentDidUpdate() {
    const { editor } = this.props

    if (editor && editor.options.element) {
      if (editor.contentComponent) {
        return
      }

      // this.setState({
      //   editor,
      // })

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
      <>
        <div ref={this.editorContentRef} />
        <Portals renderers={this.state.renderers} />
      </>
    )
  }
}

export const EditorContent = React.memo(PureEditorContent)
