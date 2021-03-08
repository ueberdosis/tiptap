import * as React from 'react'
import ReactDOM from 'react-dom'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Node, Schema } from 'prosemirror-model'
// import applyDevTools from 'prosemirror-dev-tools'
// import styled from 'styled-components'

// Here we have the (too simple) React component which
// we'll be rendering content into.
//
class Underlined extends React.Component {
  constructor(props) {
    super(props)
    this.hole = React.createRef()
  }
  // We'll put the content into what we render using
  // this function, which appends a given node to
  // a ref HTMLElement, if present.
  //
  append(node) {
    if (this.hole) {
      this.hole.current.appendChild(node)
    }
  }

  render() {
    // Just really wanted to prove I could get React AND
    // styled-component abilities at the same time.
    //
    // const UnderlinedText = styled.p`
    //   text-decoration: underline;
    // `

    // The styled components version is basically just a wrapper to do SCSS styling.
    // Questionable if it's even needed for such simple styling and because you can't clearly see the
    // DOM structure from the code (hence making `& > ${Component}` selectors quite unintuitive)
    // return <span style="text-decoration: underline" ref={this.hole} />
    return <p ref={this.hole} style={{textDecoration: 'underline'}}></p>
  }
}

// This class is our actual interactor for ProseMirror itself.
// It glues DOM rendering, React, and ProseMirror nodes together.
//
class Underline {
  constructor(node) {
    // We'll use this to access our Underlined component's
    // instance methods.
    //
    this.ref = React.createRef()

    // Here, we'll provide a container to render React into.
    // Coincidentally, this is where ProseMirror will put its
    // generated contentDOM.  React will throw out that content
    // once rendered, and at the same time we'll append it into
    // the component tree, like a fancy shell game.  This isn't
    // obvious to the user, but would it be more obvious on an
    // expensive render?
    //
    this.dom = document.createElement('span')

    // Finally, we provide an element to render content into.
    // We will be moving this node around as we need to.
    //
    this.contentDOM = document.createElement('span')

    // Better way of doing this would be portals https://reactjs.org/docs/portals.html
    ReactDOM.render(
      <Underlined ref={this.ref} />,
      this.dom,
      this.putContentDomInRef
    )
  }

  update(node) {
    return true
  }

  // This is the least complex part.  Now we've put
  // all of our interlocking pieces behind refs and
  // instance properties, this becomes the callback
  // which performs the actual shell game.
  //
  putContentDomInRef = () => {
    this.ref.current.append(this.contentDOM)
  }

  // Required to not to leave the React nodes orphaned.
  destroy() {
    ReactDOM.unmountComponentAtNode(this.dom)
  }
}

export default class Editor extends React.Component {
  constructor(props) {
    super(props)
    this.editorState = EditorState.create({
      schema: new Schema({
        nodes: {
          doc: {
            content: 'block+'
          },
          underline: {
            group: 'block',
            content: 'inline*',
            parseDOM: [{ tag: 'p' }],
            toDOM() { return ['p', 0] }
          },
          text: {
            group: 'inline'
          },
        }
      })
    })
  }

  createEditorView = (element) => {
    if (element != null) {
      this.editorView = new EditorView(element, {
        nodeViews: {
          underline: (node) => new Underline(node)
        },
        state: this.editorState,
      })
      // applyDevTools(this.editorView)
    }
  }

  componentWillUnmount() {
    if (this.editorView) {
      this.editorView.destroy()
    }
  }

  shouldComponentUpdate() {
    return false
  }

  render() {
    return <div id="editor" ref={ref => { this.createEditorView(ref) }} />
  }
}
