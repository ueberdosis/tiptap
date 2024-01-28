import React, { HTMLProps } from 'react'
import ReactDOM, { flushSync } from 'react-dom'

import { Editor } from './Editor.js'
import { ReactRenderer } from './ReactRenderer.js'

const Portals: React.FC<{ renderers: Record<string, ReactRenderer> }> = ({ renderers }) => {
  return (
    <>
      {Object.entries(renderers).map(([key, renderer]) => {
        return ReactDOM.createPortal(renderer.reactElement, renderer.element, key)
      })}
    </>
  )
}

export interface EditorContentProps extends HTMLProps<HTMLDivElement> {
  editor: Editor | null;
}

export interface EditorContentState {
  renderers: Record<string, ReactRenderer>;
}

export class PureEditorContent extends React.Component<EditorContentProps, EditorContentState> {
  editorContentRef: React.RefObject<any>

  initialized: boolean

  constructor(props: EditorContentProps) {
    super(props)
    this.editorContentRef = React.createRef()
    this.initialized = false

    this.state = {
      renderers: {},
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

      this.initialized = true
    }
  }

  maybeFlushSync(fn: () => void) {
    // Avoid calling flushSync until the editor is initialized.
    // Initialization happens during the componentDidMount or componentDidUpdate
    // lifecycle methods, and React doesn't allow calling flushSync from inside
    // a lifecycle method.
    if (this.initialized) {
      flushSync(fn)
    } else {
      fn()
    }
  }

  setRenderer(id: string, renderer: ReactRenderer) {
    this.maybeFlushSync(() => {
      this.setState(({ renderers }) => ({
        renderers: {
          ...renderers,
          [id]: renderer,
        },
      }))
    })
  }

  removeRenderer(id: string) {
    this.maybeFlushSync(() => {
      this.setState(({ renderers }) => {
        const nextRenderers = { ...renderers }

        delete nextRenderers[id]

        return { renderers: nextRenderers }
      })
    })
  }

  componentWillUnmount() {
    const { editor } = this.props

    if (!editor) {
      return
    }

    this.initialized = false

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
        {/* @ts-ignore */}
        <Portals renderers={this.state.renderers} />
      </>
    )
  }
}

// EditorContent should be re-created whenever the Editor instance changes
const EditorContentWithKey = (props: EditorContentProps) => {
  const key = React.useMemo(() => {
    return Math.floor(Math.random() * 0xFFFFFFFF).toString()
  }, [props.editor])

  // Can't use JSX here because it conflicts with the type definition of Vue's JSX, so use createElement
  return React.createElement(PureEditorContent, { key, ...props })
}

export const EditorContent = React.memo(EditorContentWithKey)
