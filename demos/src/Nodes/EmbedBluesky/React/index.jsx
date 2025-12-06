import './styles.scss'

import Document from '@tiptap/extension-document'
import EmbedBluesky from '@tiptap/extension-embed-bluesky'
import Heading from '@tiptap/extension-heading'
import { ListKit } from '@tiptap/extension-list'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null
  }

  const addBlueskyEmbed = () => {
    const url = prompt('Enter Bluesky post URL (e.g., https://bsky.app/profile/user/post/123)')

    if (url) {
      editor.commands.setEmbedBluesky({
        src: url,
      })
    }
  }

  return (
    <div className="control-group">
      <div className="button-group">
        <button id="add" onClick={addBlueskyEmbed}>
          Add Bluesky embed
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
      EmbedBluesky.configure({
        addPasteHandler: true,
        colorMode: 'system',
        // Custom loading HTML - you can use any HTML here (spinner, skeleton, etc.)
        loadingHTML: '<div class="bluesky-spinner"><span></span></div>',
      }),
    ],
    content: `
      <p>Tiptap now supports Bluesky embeds! Awesome!</p>
      <p>The extension automatically resolves post metadata from the Bluesky API and renders the embed.</p>
      <h2>Features</h2>
      <ul>
        <li>Paste Bluesky URLs directly</li>
        <li>Automatic metadata resolution via public API</li>
        <li>Configurable color mode (light, dark, system)</li>
        <li>Fallback link if resolution fails</li>
      </ul>
      <p>Here's an example of a resolved Bluesky embed:</p>
      <blockquote class="bluesky-embed" data-bluesky-uri="at://did:plc:vod7n54e7zoorlj53df3sgez/app.bsky.feed.post/3lnzavsbkvs2x" data-bluesky-cid="bafyreicv3qaeah2dsjm6uymt6ld3sphs3oru7fd6472w4n3vuiyi2hvhze" data-bluesky-embed-color-mode="system"><p lang="en"><a href="https://bsky.app/profile/tiptap.dev/post/3lnzavsbkvs2x?ref_src=embed">View on Bluesky</a></p></blockquote>
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
