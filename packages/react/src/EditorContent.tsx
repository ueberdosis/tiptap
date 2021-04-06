import React from 'react'
import ReactDOM from 'react-dom'
import { Editor } from './Editor'
import { ReactRenderer } from './ReactRenderer'

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

export interface EditorContentProps {
  editor: Editor | null,
}

export interface EditorContentState {
  renderers: Map<string, ReactRenderer>
}

export class PureEditorContent extends React.Component<EditorContentProps, EditorContentState> {
  editorContentRef: React.RefObject<any>

  constructor(props: EditorContentProps) {
    super(props)
    this.editorContentRef = React.createRef()

    this.state = {
      renderers: new Map(),
    }
  }

  componentDidMount() {
    this.init()
  }

  componentDidUpdate() {
    this.init()
  }

  init() {
    const { editor } = this.props

    if (editor && editor.options.element) {
      if (editor.contentComponent) {
        return
      }

      const element = this.editorContentRef.current

      element.appendChild(editor.options.element.firstChild)

      editor.setOptions({
        element,
      })

      editor.contentComponent = this

      // TODO: alternative to setTimeout?
      setTimeout(() => editor.createNodeViews(), 0)
    }
  }

  componentWillUnmount() {
    const { editor } = this.props

    if (!editor) {
      return
    }

    if (!editor.isDestroyed) {
      editor.view.setProps({
        nodeViews: {},
      })
    }

    editor.contentComponent = null

    if (!editor.options.element.firstChild) {
      return
    }

    const newElement = document.createElement('div')

    newElement.appendChild(editor.options.element.firstChild)

    editor.setOptions({
      element: newElement,
    })
  }

  render() {
    return (
      <>
        <div ref={this.editorContentRef} />
        {
          // @ts-ignore
          <Portals renderers={this.state.renderers} />
        }
      </>
    )
  }
}

export const EditorContent = React.memo(PureEditorContent)
