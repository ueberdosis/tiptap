import React from 'react'
import ReactDOM from 'react-dom'
import { Editor } from './Editor'

type EditorContentProps = {
  editor: Editor | null
}

// const Portals = ({ editor }: { editor: Editor | null }) => {
//   if (!editor?.contentComponent) {
//     return null
//   }

//   console.log('render portals')

//   return (
//     <div>portaaals</div>
//   )
// }

const Portals = ({ renderers }: { renderers: Map<any, any> }) => {
  return (
    <div>
      {Array.from(renderers).map(([key, renderer]) => {

        // console.log({renderer})
        // return (
        //   <div key={key}>{value}</div>
        // )

        // return React.createElement(renderer.component)


        // return (
        //   <React.Fragment key={renderer.id}>
        //     {ReactDOM.createPortal(
        //       React.createElement(renderer.component),
        //       renderer.teleportElement,
        //     )}
        //   </React.Fragment>
        // )

        return (
          <React.Fragment key={renderer.id}>
            {renderer.bla}
          </React.Fragment>
        )

        // return ReactDOM.createPortal(
        //   React.createElement(renderer.component),
        //   renderer.teleportElement,
        // )
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

    // setInterval(() => {
    //   if (this.props?.editor?.contentComponent) {
    //     this.props.editor.contentComponent.setState({
    //       renderers: this.state.renderers.set(Math.random(), Math.random())
    //     })
    //   }
    // }, 1000)
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

      console.log('UPDATE')

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
    console.log('render', this.state)
    // console.log('render', this.props.editor, this.state.editor)
    return (
      <>
        <div ref={this.editorContentRef} />
        {/* <Content reference={this.editorContentRef} /> */}
        {/* <Portals editor={this.props.editor} /> */}

        <Portals renderers={this.state.renderers} />
      </>
    )
  }
}

export const EditorContent = React.memo(PureEditorContent)

// export const EditorContent = PureEditorContent
