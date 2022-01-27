import React from 'react'

const FunctionsMenu = ({ editor }) => {
  if (!editor) {
    return null
  }

  return (
    <nav>
      <div className='button-group'>
        <button onClick={() => editor.chain().focus().insertContent('😊').run()}>set emoji</button>
        <button onClick={() => editor.chain().focus().insertContent({
          type: 'mention',
          attrs: {
            id: 1,
            label: 'Lea Thompson',
          },
        }).run()}>set mention</button>
        <button onClick={() => editor.chain().focus().insertContent(' @').run()}>select mention</button>
      </div>
      <div className='button-group'>
        <button>send</button>
      </div>
    </nav>
  )
}

export default FunctionsMenu
