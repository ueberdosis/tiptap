import React, { HTMLProps } from 'react'
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

export interface EditorContentProps extends HTMLProps<HTMLDivElement> {
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

    if (editor && editor.view.dom) {
      if (editor.contentComponent) {
        return
      }

      const element = this.editorContentRef.current
      const parentElement = editor.view.dom.parentElement
      if (parentElement) {
        element.append(...parentElement.childNodes)
      }

      editor.setOptions({
        element,
      })

      editor.contentComponent = this

      editor.createNodeViews()
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

    if (!editor.view.dom) {
      return
    }

    const element = document.createElement('div')
    const parentElement = editor.view.dom.parentElement
    if (parentElement) {
      element.append(...parentElement.childNodes)
    }

    editor.setOptions({
      element,
    })
  }

  render() {
    const { editor, ...rest } = this.props

    return (
      <>
        <div ref={this.editorContentRef} {...rest} />
        <Portals renderers={this.state.renderers} />
      </>
    )
  }
}

export const EditorContent = React.memo(PureEditorContent)
