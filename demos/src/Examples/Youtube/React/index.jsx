import './styles.scss'

import Youtube from '@tiptap/extension-youtube'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
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

    editor.commands.setYoutubeVideo({
      src: url,
      width: Math.max(320, parseInt(widthRef.current.value, 10)) || 640,
      height: Math.max(180, parseInt(heightRef.current.value, 10)) || 480,
    })
  }

  return (
    <>
      <button id="add" onClick={addYoutubeVideo}>Add youtube video</button>
      <input id="width" type="number" min="320" max="1024" ref={widthRef} placeholder="width" />
      <input id="height" type="number" min="180" max="720" ref={heightRef} placeholder="height" />
    </>
  )
}

export default () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Youtube.configure({
        controls: false,
      }),
    ],
    content: `
      <p>Tiptap now supports youtube embeds! Awesome!</p>
      <div data-youtube-video>
        <iframe src="https://www.youtube.com/watch?v=cqHqLQgVCgY"></iframe>
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
    <div>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
