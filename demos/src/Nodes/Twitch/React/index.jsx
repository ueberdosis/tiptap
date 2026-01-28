import './styles.scss'

import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import { ListKit } from '@tiptap/extension-list'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Twitch from '@tiptap/extension-twitch'
import { useEditor, Tiptap } from '@tiptap/react'
import React from 'react'

const MenuBar = ({ editor }) => {
  const [height, setHeight] = React.useState(480)
  const [width, setWidth] = React.useState(640)

  if (!editor) {
    return null
  }

  const addTwitchVideo = () => {
    const url = prompt('Enter Twitch video URL')

    if (url) {
      editor.commands.setTwitchVideo({
        src: url,
        width: Math.max(320, parseInt(width, 10)) || 640,
        height: Math.max(180, parseInt(height, 10)) || 480,
      })
    }
  }

  return (
    <div className="control-group">
      <div className="button-group">
        <input
          id="width"
          type="number"
          min="320"
          max="1024"
          placeholder="width"
          value={width}
          onChange={event => setWidth(event.target.value)}
        />
        <input
          id="height"
          type="number"
          min="180"
          max="720"
          placeholder="height"
          value={height}
          onChange={event => setHeight(event.target.value)}
        />
        <button id="add" onClick={addTwitchVideo}>
          Add Twitch video
        </button>
      </div>
    </div>
  )
}

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Heading,
      Paragraph,
      ListKit,
      Text,
      Twitch.configure({
        parent: window.location.hostname,
        allowFullscreen: true,
      }),
    ],
    content: `
      <p>Tiptap now supports Twitch embeds! Awesome!</p>
      <p>It supports</p>
      <ul>
        <li>
          <p>Different types of content</p>
          <ul>
            <li>Channels</li>
            <li>Videos</li>
            <li>& Clips</li>
          </ul>
        </li>
        <li>
          <p>Customizable parameters</p>
          <ul>
            <li>Muted</li>
            <li>Autoplay</li>
            <li>Start time</li>
          </ul>
        </li>
      </ul>
      <h2>Channel</h2>
      <div data-twitch-video>
        <iframe src="https://www.twitch.tv/LofiGirl" muted="true"></iframe>
      </div>
      <h2>Videos</h2>
      <div data-twitch-video>
        <iframe src="https://www.twitch.tv/videos/2409205759" muted="true"></iframe>
      </div>
      <h2>Clips</h2>
      <div data-twitch-video>
        <iframe src="https://www.twitch.tv/nasa/clip/CooperativeBrainyJellyfishPJSugar-0TPiyjN_MNkrcErt" muted="true"></iframe>
      </div>

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
      <Tiptap instance={editor}>
        <Tiptap.Content />
      </Tiptap>
    </>
  )
}
