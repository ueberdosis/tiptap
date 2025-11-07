import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { TextStyle } from '@tiptap/extension-text-style'
import Youtube from '@tiptap/extension-youtube'
import { generateHTML, generateJSON } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import { describe, expect, it } from 'vitest'

describe('generateHTML', () => {
  it('generate HTML from JSON without an editor instance', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Example Text',
            },
          ],
        },
      ],
    }

    const html = generateHTML(json, [Document, Paragraph, Text])

    expect(html).toBe('<p xmlns="http://www.w3.org/1999/xhtml">Example Text</p>')
  })

  it('can convert from & to html', async () => {
    const extensions = [Document, Paragraph, Text, Youtube]
    const html = `<p>Tiptap now supports YouTube embeds! Awesome!</p>
      <div data-youtube-video>
        <iframe src="https://www.youtube.com/watch?v=cqHqLQgVCgY"></iframe>
      </div>`
    const json = generateJSON(html, extensions)

    expect(json).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Tiptap now supports YouTube embeds! Awesome!',
            },
          ],
        },
        {
          type: 'youtube',
          attrs: {
            src: 'https://www.youtube.com/watch?v=cqHqLQgVCgY',
            start: 0,
            width: 640,
            height: 480,
          },
        },
      ],
    })

    expect(generateHTML(json, extensions)).toBe(
      '<p xmlns="http://www.w3.org/1999/xhtml">Tiptap now supports YouTube embeds! Awesome!</p><div xmlns="http://www.w3.org/1999/xhtml" data-youtube-video=""><iframe width="640" height="480" allowfullscreen="true" autoplay="false" disablekbcontrols="false" enableiframeapi="false" endtime="0" ivloadpolicy="0" loop="false" modestbranding="false" origin="" playlist="" rel="1" src="https://www.youtube.com/embed/cqHqLQgVCgY?rel=1" start="0"></iframe></div>',
    )
  })

  it('can convert from & to HTML with a complex schema', async () => {
    const extensions = [StarterKit, TextStyle]
    const html = `
<h2>
  Hi there,
</h2>
<p>
  this is a <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:
</p>
<ul>
  <li>
    That’s a bullet list with one …
  </li>
  <li>
    … or two list items.
  </li>
</ul>
<p>
  Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:
</p>
<pre><code class="language-css">body {
  display: none;
}</code></pre>
<p>
  I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.
</p>
<blockquote>
  Wow, that’s amazing. Good work, boy! 👏
  <br />
  — Mom
</blockquote>`
    const json = generateJSON(html, extensions)

    const expected = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: {
            level: 2,
          },
          content: [
            {
              type: 'text',
              text: 'Hi there,',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'this is a ',
            },
            {
              type: 'text',
              marks: [
                {
                  type: 'italic',
                },
              ],
              text: 'basic',
            },
            {
              type: 'text',
              text: ' example of ',
            },
            {
              type: 'text',
              marks: [
                {
                  type: 'bold',
                },
              ],
              text: 'Tiptap',
            },
            {
              type: 'text',
              text: '. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:',
            },
          ],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'That’s a bullet list with one …',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '… or two list items.',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:',
            },
          ],
        },
        {
          type: 'codeBlock',
          attrs: {
            language: 'css',
          },
          content: [
            {
              type: 'text',
              text: 'body {\n  display: none;\n}',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.',
            },
          ],
        },
        {
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Wow, that’s amazing. Good work, boy! 👏 ',
                },
                {
                  type: 'hardBreak',
                },
                {
                  type: 'text',
                  text: '— Mom',
                },
              ],
            },
          ],
        },
      ],
    }

    expect(json).toEqual(expected)

    expect(generateHTML(json, extensions)).toBe(
      `<h2 xmlns="http://www.w3.org/1999/xhtml">Hi there,</h2><p xmlns="http://www.w3.org/1999/xhtml">this is a <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:</p><ul xmlns="http://www.w3.org/1999/xhtml"><li><p>That’s a bullet list with one …</p></li><li><p>… or two list items.</p></li></ul><p xmlns="http://www.w3.org/1999/xhtml">Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:</p><pre xmlns="http://www.w3.org/1999/xhtml"><code class="language-css">body {
  display: none;
}</code></pre><p xmlns="http://www.w3.org/1999/xhtml">I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.</p><blockquote xmlns="http://www.w3.org/1999/xhtml"><p>Wow, that’s amazing. Good work, boy! 👏 <br />— Mom</p></blockquote>`,
    )
  })
})
