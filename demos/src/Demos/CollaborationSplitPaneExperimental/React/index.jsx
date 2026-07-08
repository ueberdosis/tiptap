import './styles.scss'

import * as Y from 'yjs'

import Editor from './Editor.jsx'

/**
 * Both editors bind to the same Y.Doc — exactly the state a network provider
 * would synchronize between clients, minus the transport. Every edit in one
 * pane arrives in the other as a remote Yjs update, which is what proves the
 * experimental React renderer handles collaboration: remote-origin
 * transactions re-render through React like any other transaction.
 */
const ydoc = new Y.Doc()

const App = () => {
  return (
    <div className="col-group">
      <Editor ydoc={ydoc} label="Editor A" seed />
      <Editor ydoc={ydoc} label="Editor B" />
    </div>
  )
}

export default App
