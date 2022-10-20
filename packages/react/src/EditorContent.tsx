import React, { HTMLProps } from 'react'
import ReactDOM, { flushSync } from 'react-dom'

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

    if (editor && editor.options.element) {
      if (editor.contentComponent) {
        return
      }

      const element = this.editorContentRef.current

      element.append(...editor.options.element.childNodes)

      editor.setOptions({
        element,
      })

      editor.contentComponent = this

      editor.createNodeViews()
    }
  }

  setRenderer(id: string, renderer: ReactRenderer) {
    queueMicrotask(() => {
      flushSync(() => {
        const { renderers } = this.state

        renderers.set(id, renderer)

        this.setState({ renderers })
      })
    })
  }

  removeRenderer(id: string) {
    queueMicrotask(() => {
      flushSync(() => {
        const { renderers } = this.state

        renderers.delete(id)

        this.setState({ renderers })
      })
    })
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

    newElement.append(...editor.options.element.childNodes)

    editor.setOptions({
      element: newElement,
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
