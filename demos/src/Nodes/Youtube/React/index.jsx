import './styles.scss'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Youtube from '@tiptap/extension-youtube'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

const MenuBar = ({ editor }) => {
  const widthRef = React.useRef(null)
  const heightRef = React.useRef(null)

  React.useEffect(() => {
    if (widthRef.current && heightRef.current) {
      widthRef.current.value = 640
      heightRef.current.value = 480
    }
  }, [widthRef.current, heightRef.current])

  if (!editor) {
    return null
  }

  const addYoutubeVideo = () => {
    const url = prompt('Enter YouTube URL')

    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: Math.max(320, parseInt(widthRef.current.value, 10)) || 640,
        height: Math.max(180, parseInt(heightRef.current.value, 10)) || 480,
      })
    }
  }

  return (
    <div className="control-group">
      <div className="button-group">
        <button id="add" onClick={addYoutubeVideo}>Add YouTube video</button>
        <input id="width" type="number" min="320" max="1024" ref={widthRef} placeholder="width" />
        <input id="height" type="number" min="180" max="720" ref={heightRef} placeholder="height" />
      </div>
    </div>
  )
}

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Youtube.configure({
        controls: false,
        nocookie: true,
      }),
    ],
    content: `
      <p>Tiptap now supports YouTube embeds! Awesome!</p>
      <div data-youtube-video>
        <iframe src="https://www.youtube.com/watch?v=3lTUAWOgoHs"></iframe>
      </div>
      <p>Try adding your own video to this editor!</p>
    `,
    editorProps: {
      attributes: {
        spellcheck: 'false',
      },
    },
  })

  return (
    <>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </>
  )
}
