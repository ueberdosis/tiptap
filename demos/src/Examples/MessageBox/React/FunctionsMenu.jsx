import React from 'react'

const FunctionsMenu = ({ editor }) => {
  if (!editor) {
    return null
  }

  return (
    <nav>
      <div>
        <button>set emoji</button>
        <button onClick={() => editor.chain().focus().insertContent('@').run()}>set mention</button>
      </div>
      <div>
        <button>send</button>
      </div>
    </nav>
  )
}

export default FunctionsMenu
