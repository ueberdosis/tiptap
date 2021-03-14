import React from 'react'
import ReactDOM from 'react-dom'
import { Editor } from './Editor'

type EditorContentProps = {
  editor: Editor | null
}

const Portals = ({ renderers }: { renderers: Map<any, any> }) => {
  return (
    <div>
      {Array.from(renderers).map(([key, renderer]) => {
        return ReactDOM.createPortal(
          renderer.comp,
          renderer.teleportElement,
          renderer.id,
        )
      })}
    </div>
  )
}

// const Content = React.memo(({ reference }: { reference: React.RefObject<any> }) => {
//   return (
//     <div ref={reference} />
//   )
// })

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
    // console.log('render', this.state)
    // console.log('render', this.props.editor, this.state.editor)
    return (
      <>
        <div ref={this.editorContentRef} />
        <Portals renderers={this.state.renderers} />
      </>
    )
  }
}

export const EditorContent = React.memo(PureEditorContent)
