import './styles.scss'

import Emoji, { gitHubEmojis } from '@dibdab/extension-emoji'
import { EditorContent, useEditor } from '@dibdab/react'
import StarterKit from '@dibdab/starter-kit'
import React from 'react'

import suggestion from './suggestion.js'

export default () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Emoji.configure({
        emojis: gitHubEmojis,
        enableEmoticons: true,
        suggestion,
      }),
    ],
    content: `
      <p>
        These <span data-type="emoji" data-name="smiley"></span>
        are <span data-type="emoji" data-name="fire"></span>
        some <span data-type="emoji" data-name="smiley_cat"></span>
        emojis <span data-type="emoji" data-name="exploding_head"></span>
        rendered <span data-type="emoji" data-name="ghost"></span>
        as <span data-type="emoji" data-name="massage"></span>
        inline <span data-type="emoji" data-name="v"></span>
        nodes.
      </p>
      <p>
        Type <code>:</code> to open the autocomplete.
      </p>
      <p>
        Even <span data-type="emoji" data-name="octocat"></span>
        custom <span data-type="emoji" data-name="trollface"></span>
        emojis <span data-type="emoji" data-name="neckbeard"></span>
        are <span data-type="emoji" data-name="rage1"></span>
        supported.
      </p>
      <p>
        And unsupported emojis (without a fallback image) are rendered as just the shortcode <span data-type="emoji" data-name="this_does_not_exist"></span>.
      </p>
      <pre><code>In code blocks all emojis are rendered as plain text. 👩‍💻👨‍💻</code></pre>
      <p>
        There is also support for emoticons. Try typing <code><3</code>.
      </p>
    `,
  })

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button onClick={() => editor.chain().focus().setEmoji('zap').run()}>Insert ⚡</button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
