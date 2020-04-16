import React, { Component } from 'react'
import { Editor } from '@tiptap/core'
import extensions from '@tiptap/starter-kit'

export default class TestComponent extends Component {
  constructor() {
    super()
    this.editorNode = React.createRef()
  }
  
  componentDidMount() {
    this.editor = new Editor({
      element: this.editorNode.current,
      content: '<p>this is rendered in react</p>',
      extensions: extensions(),
    })
  }

  render() {
    return (
      <div>
        <div ref={this.editorNode} />
      </div>
    )
  }
}
