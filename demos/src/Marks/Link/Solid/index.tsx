import './styles.scss'

import Code from '@tiptap/extension-code'
import Document from '@tiptap/extension-document'
import Link from '@tiptap/extension-link'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor, useEditorState } from '@tiptap/solid'

export default function App() {
  const editor = useEditor({
    editable: true,
    extensions: [
      Document,
      Paragraph,
      Text,
      Code,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        protocols: ['http', 'https'],
        isAllowedUri: (url, ctx) => {
          try {
            const parsedUrl = url.includes(':')
              ? new URL(url)
              : new URL(`${ctx.defaultProtocol}://${url}`)

            if (!ctx.defaultValidate(parsedUrl.href)) {
              return false
            }

            const disallowedProtocols = ['ftp', 'file', 'mailto']
            const protocol = parsedUrl.protocol.replace(':', '')

            if (disallowedProtocols.includes(protocol)) {
              return false
            }

            const allowedProtocols = ctx.protocols.map(p => (typeof p === 'string' ? p : p.scheme))

            if (!allowedProtocols.includes(protocol)) {
              return false
            }

            const disallowedDomains = ['example-phishing.com', 'malicious-site.net']
            const domain = parsedUrl.hostname

            if (disallowedDomains.includes(domain)) {
              return false
            }

            return true
          } catch {
            return false
          }
        },
        shouldAutoLink: url => {
          try {
            const parsedUrl = url.includes(':') ? new URL(url) : new URL(`https://${url}`)

            const disallowedDomains = ['example-no-autolink.com', 'another-no-autolink.com']
            const domain = parsedUrl.hostname

            return !disallowedDomains.includes(domain)
          } catch {
            return false
          }
        },
      }),
    ],
    content: `
        <p>
          Wow, this editor has support for links to the whole <a href="https://en.wikipedia.org/wiki/World_Wide_Web">world wide web</a>. We tested a lot of URLs and I think you can add *every URL* you want. Isn't that cool? Let's try <a href="https://statamic.com/">another one!</a> Yep, seems to work.
        </p>
        <p>
          By default every link will get a <code>rel="noopener noreferrer nofollow"</code> attribute. It's configurable though.
        </p>
      `,
  })

  const state = useEditorState({
    editor: editor(),
    selector: ({ editor: ed }) => ({
      isLink: ed.isActive('link'),
    }),
  })

  const setLink = () => {
    const ed = editor()
    const previousUrl = ed.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      ed.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    try {
      ed.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    } catch (e) {
      alert((e as Error).message)
    }
  }

  return (
    <>
      <div class="control-group">
        <div class="button-group">
          <button onClick={setLink} class={state().isLink ? 'is-active' : ''}>
            Set link
          </button>
          <button
            onClick={() => editor().chain().focus().unsetLink().run()}
            disabled={!state().isLink}
          >
            Unset link
          </button>
        </div>
      </div>
      <EditorContent editor={editor()} />
    </>
  )
}
