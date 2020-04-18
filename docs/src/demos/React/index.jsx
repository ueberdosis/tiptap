import React, { Component } from 'react'
import { Editor } from '@tiptap/core'
import extensions from '@tiptap/starter-kit'

export default class extends Component {
  constructor() {
    super()
    this.editorNode = React.createRef()
  }
  
  componentDidMount() {
    this.editor = new Editor({
      element: this.editorNode.current,
      content: '<p>rendered in <strong>react</strong>!</p>',
      extensions: extensions(),
    })
    this.forceUpdate()
  }

  render() {
    return (
      <div>
        {this.editor &&
          <div>
            <button onClick={() => this.editor.focus().removeMarks()}>
              clear formatting
            </button>
            <button
              onClick={() => this.editor.focus().bold()}
              className={`${this.editor.isActive('bold') ? 'is-active' : ''}`}
            >
              bold
            </button>
          </div>
        } 
        <div ref={this.editorNode} />
      </div>
    )
  }
}
