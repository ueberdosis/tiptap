import React, { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { Editor } from './Editor'

// export const EditorContent = ({ editor }) => {
//   const editorContentRef = useRef(null)

//   useEffect(() => {
//     if (editor && editor.options.element) {
//       console.log('set editorContent element')

//       const element = editorContentRef.current

//       element.appendChild(editor.options.element.firstChild)

//       editor.setOptions({
//         element,
//       })

//       console.log({instance: this})

//       // TODO: why setTimeout?
//       setTimeout(() => {
//         editor.createNodeViews()
//       }, 0)
//     }
//   })

//   return (
//     <div ref={editorContentRef} />
//   )
// }

export class EditorContent extends React.Component {
  constructor(props) {
    super(props)
    this.editorContentRef = React.createRef()
    this.editorPortalRef = React.createRef()

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
