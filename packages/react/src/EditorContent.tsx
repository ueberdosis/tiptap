import { Editor } from '@tiptap/core'
import React, {
  ForwardedRef, forwardRef, HTMLProps, LegacyRef, MutableRefObject,
} from 'react'
import ReactDOM from 'react-dom'
import { useSyncExternalStore } from 'use-sync-external-store/shim'

import { ContentComponent, EditorWithContentComponent } from './Editor.js'
import { ReactRenderer } from './ReactRenderer.js'

const mergeRefs = <T extends HTMLDivElement>(
  ...refs: Array<MutableRefObject<T> | LegacyRef<T> | undefined>
) => {
  return (node: T) => {
    refs.forEach(ref => {
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        (ref as MutableRefObject<T | null>).current = node
      }
    })
  }
}

/**
 * This component renders all of the editor's node views.
 */
const Portals: React.FC<{ contentComponent: ContentComponent }> = ({
  contentComponent,
}) => {
  // For performance reasons, we render the node view portals on state changes only
  const renderers = useSyncExternalStore(
    contentComponent.subscribe,
    contentComponent.getSnapshot,
    contentComponent.getServerSnapshot,
  )

  // This allows us to directly render the portals without any additional wrapper
  return (
    <>
      {Object.values(renderers)}
    </>
  )
}

export interface EditorContentProps extends HTMLProps<HTMLDivElement> {
  editor: Editor | null;
  innerRef?: ForwardedRef<HTMLDivElement | null>;
}

function getInstance(): ContentComponent {
  const subscribers = new Set<() => void>()
  let renderers: Record<string, React.ReactPortal> = {}

  return {
    /**
     * Subscribe to the editor instance's changes.
     */
    subscribe(callback: () => void) {
      subscribers.add(callback)
      return () => {
        subscribers.delete(callback)
      }
    },
    getSnapshot() {
      return renderers
    },
    getServerSnapshot() {
      return renderers
    },
    /**
     * Adds a new NodeView Renderer to the editor.
     */
    setRenderer(id: string, renderer: ReactRenderer) {
      renderers = {
        ...renderers,
        [id]: ReactDOM.createPortal(renderer.reactElement, renderer.element, id),
      }

      subscribers.forEach(subscriber => subscriber())
    },
    /**
     * Removes a NodeView Renderer from the editor.
     */
    removeRenderer(id: string) {
      const nextRenderers = { ...renderers }

      delete nextRenderers[id]
      renderers = nextRenderers
      subscribers.forEach(subscriber => subscriber())
    },
  }
}

export class PureEditorContent extends React.Component<
  EditorContentProps,
  { hasContentComponentInitialized: boolean }
> {
  editorContentRef: React.RefObject<any>

  initialized: boolean

  unsubscribeToContentComponent?: () => void

  constructor(props: EditorContentProps) {
    super(props)
    this.editorContentRef = React.createRef()
    this.initialized = false

    this.state = {
      hasContentComponentInitialized: Boolean((props.editor as EditorWithContentComponent | null)?.contentComponent),
    }
  }

  componentDidMount() {
    this.init()
  }

  componentDidUpdate() {
    this.init()
  }

  init() {
    const editor = this.props.editor as EditorWithContentComponent | null

    if (editor && !editor.isDestroyed && editor.options.element) {
      if (editor.contentComponent) {
        return
      }

      const element = this.editorContentRef.current

      element.append(...editor.options.element.childNodes)

      editor.setOptions({
        element,
      })

      editor.contentComponent = getInstance()

      // Has the content component been initialized?
      if (!this.state.hasContentComponentInitialized) {
        // Subscribe to the content component
        this.unsubscribeToContentComponent = editor.contentComponent.subscribe(() => {
          this.setState(prevState => {
            if (!prevState.hasContentComponentInitialized) {
              return {
                hasContentComponentInitialized: true,
              }
            }
            return prevState
          })

          // Unsubscribe to previous content component
          if (this.unsubscribeToContentComponent) {
            this.unsubscribeToContentComponent()
          }
        })
      }

      editor.createNodeViews()

      this.initialized = true
    }
  }

  componentWillUnmount() {
    const editor = this.props.editor as EditorWithContentComponent | null

    if (!editor) {
      return
    }

    this.initialized = false

    if (!editor.isDestroyed) {
      editor.view.setProps({
        nodeViews: {},
      })
    }

    if (this.unsubscribeToContentComponent) {
      this.unsubscribeToContentComponent()
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
    const { editor, innerRef, ...rest } = this.props

    return (
      <>
        <div ref={mergeRefs(innerRef, this.editorContentRef)} {...rest} />
        {/* @ts-ignore */}
        {editor?.contentComponent && <Portals contentComponent={editor.contentComponent} />}
      </>
    )
  }
}

// EditorContent should be re-created whenever the Editor instance changes
const EditorContentWithKey = forwardRef<HTMLDivElement, EditorContentProps>(
  (props: Omit<EditorContentProps, 'innerRef'>, ref) => {
    const key = React.useMemo(() => {
      return Math.floor(Math.random() * 0xffffffff).toString()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.editor])

    // Can't use JSX here because it conflicts with the type definition of Vue's JSX, so use createElement
    return React.createElement(PureEditorContent, {
      key,
      innerRef: ref,
      ...props,
    })
  },
)

export const EditorContent = React.memo(EditorContentWithKey)
