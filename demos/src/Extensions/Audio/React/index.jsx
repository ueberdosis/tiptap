import './styles.scss'

import Audio from '@tiptap/extension-audio'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'

const DEFAULT_AUDIO_SRC = 'https://www.w3schools.com/html/horse.ogg'

const Control = ({ children }) => <div className="control">{children}</div>

export default () => {
  const [src, setSrc] = React.useState(DEFAULT_AUDIO_SRC)
  const [autoplay, setAutoplay] = React.useState(false)
  const [loop, setLoop] = React.useState(true)
  const [muted, setMuted] = React.useState(false)
  const [controls, setControls] = React.useState(true)
  const [preload, setPreload] = React.useState('metadata')
  const [controlsList, setControlsList] = React.useState('nodownload')
  const [crossorigin, setCrossorigin] = React.useState('')
  const [disableRemotePlayback, setDisableRemotePlayback] = React.useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      Audio.configure({
        controls: true,
        preload: 'metadata',
      }),
    ],
    content: `
      <p>Use the controls above to insert audio tracks with native elements.</p>
      <audio src="${DEFAULT_AUDIO_SRC}" controls loop preload="metadata"></audio>
    `,
    editorProps: {
      attributes: {
        spellcheck: 'false',
      },
    },
  })

  const insertAudio = () => {
    if (!editor || !src) {
      return
    }

    editor
      .chain()
      .focus()
      .setAudio({
        src,
        controls,
        autoplay,
        loop,
        muted,
        preload: preload || null,
        controlslist: controlsList || undefined,
        crossorigin: crossorigin || undefined,
        disableremoteplayback: disableRemotePlayback || undefined,
      })
      .run()
  }

  return (
    <>
      <div className="control-group">
        <Control>
          <label htmlFor="src">Audio source</label>
          <input
            id="src"
            type="text"
            value={src}
            onChange={event => setSrc(event.target.value)}
            placeholder="https://.../audio.mp3"
          />
        </Control>

        <Control>
          <label htmlFor="preload">Preload</label>
          <select id="preload" value={preload ?? ''} onChange={event => setPreload(event.target.value)}>
            <option value="metadata">metadata</option>
            <option value="auto">auto</option>
            <option value="none">none</option>
            <option value="">(empty)</option>
          </select>
        </Control>

        <Control>
          <label htmlFor="controlsList">controlslist</label>
          <input
            id="controlsList"
            type="text"
            value={controlsList}
            onChange={event => setControlsList(event.target.value)}
            placeholder="nodownload noplaybackrate"
          />
        </Control>

        <Control>
          <label htmlFor="crossorigin">crossorigin</label>
          <select id="crossorigin" value={crossorigin} onChange={event => setCrossorigin(event.target.value)}>
            <option value="">(unset)</option>
            <option value="anonymous">anonymous</option>
            <option value="use-credentials">use-credentials</option>
          </select>
        </Control>
      </div>

      <div className="control-group toggles">
        <Control>
          <label>
            <input type="checkbox" checked={controls} onChange={event => setControls(event.target.checked)} />
            Show controls
          </label>
        </Control>
        <Control>
          <label>
            <input type="checkbox" checked={autoplay} onChange={event => setAutoplay(event.target.checked)} />
            Autoplay
          </label>
        </Control>
        <Control>
          <label>
            <input type="checkbox" checked={loop} onChange={event => setLoop(event.target.checked)} />
            Loop
          </label>
        </Control>
        <Control>
          <label>
            <input type="checkbox" checked={muted} onChange={event => setMuted(event.target.checked)} />
            Muted
          </label>
        </Control>
        <Control>
          <label>
            <input
              type="checkbox"
              checked={disableRemotePlayback}
              onChange={event => setDisableRemotePlayback(event.target.checked)}
            />
            Disable remote playback
          </label>
        </Control>
      </div>

      <button className="insert" onClick={insertAudio} disabled={!editor}>
        Insert audio
      </button>

      <EditorContent editor={editor} />
    </>
  )
}
