import React from 'react'

const FunctionsMenu = ({ editor }) => {
  if (!editor) {
    return null
  }

  const mention = {
    type: 'mention',
    attrs: {
      id: 1,
      label: 'Lea Thompson',
    },
  }

  return (
    <nav>
      <div className='button-group'>
        <button onClick={() => editor.chain().focus().setEmoji('zap').run()}>set emoji</button>
        <button onClick={() => editor.chain().focus().insertContent(':').run()}>select emoji</button>
        <div className="divider"></div>
        <button onClick={() => editor.chain().focus().insertContent(mention).run()}>set mention</button>
        <button onClick={() => editor.chain().focus().insertContent(' @').run()}>select mention</button>
      </div>
      <div className='button-group'>
        <button>send</button>
      </div>
    </nav>
  )
}

export default FunctionsMenu
