import { Editor } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { TextStyleKit } from '@tiptap/extension-text-style'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const demoContent = `
  <p><span>This has a &lt;span&gt; tag without a style attribute, so it's thrown away.</span></p>
  <p><span style="">But this one is wrapped in a &lt;span&gt; tag with an inline style attribute, so it's kept - even if it's empty for now.</span></p>
  <p>--- merge nested span styles option enabled ---</p>
  <p>
    <span style="color: #FF0000;">
      <span style="font-family: serif;">
        red serif
      </span>
    </span>
  </p>
  <p>
    <span style="color: #FF0000;">
      <span style="font-family: serif;">
        <span style="color: #0000FF;">
          blue serif
        </span>
      </span>
    </span>
  </p>
  <p>
    <span style="color: #00FF00;">
      <span style="font-family: serif;">green serif </span>
      <span style="font-family: serif;color: #FF0000;">red serif</span>
    </span>
  </p>
  <p>
    <span>
      plain
      <span style="color: #0000FF;">blue</span>
      plain
      <span style="color: #00FF00;">
        green
        <span style="font-family: serif;">green serif</span>
      </span>
      plain
    </span>
  </p>
  <p>
    <span style="color: #0000FF;">
      blue
      <span style="color: #00FF00;">
        green
        <span style="font-family: serif;">
          green serif
          <span style="color: #0000FF;">blue serif</span>
        </span>
      </span>
    </span>
  </p>
`

describe('TextStyleKit nested span merge', () => {
  let editor: Editor

  beforeEach(() => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [Document, Paragraph, Text, TextStyleKit, Bold],
      content: demoContent,
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  it('merges styles of a span with one nested child span into a single span', () => {
    const spans = editor.view.dom.querySelectorAll('p:nth-child(4) > span')
    expect(spans.length).toBe(1)
    expect(spans[0].textContent?.trim()).toBe('red serif')
    expect(spans[0].getAttribute('style')).toBe('color: #FF0000; font-family: serif')
  })

  it('merges styles of multiple nested spans into the innermost descendant', () => {
    const spans = editor.view.dom.querySelectorAll('p:nth-child(5) > span')
    expect(spans.length).toBe(1)
    expect(spans[0].textContent?.trim()).toBe('blue serif')
    expect(spans[0].getAttribute('style')).toBe('color: #0000FF; font-family: serif')
  })

  it('merges parent styles into each sibling descendant span', () => {
    const spans = editor.view.dom.querySelectorAll('p:nth-child(6) > span')
    expect(spans.length).toBe(2)
    expect(spans[0].textContent?.trim()).toBe('green serif')
    expect(spans[0].getAttribute('style')).toBe('color: #00FF00; font-family: serif')
    expect(spans[1].textContent?.trim()).toBe('red serif')
    expect(spans[1].getAttribute('style')).toBe('color: #FF0000; font-family: serif')
  })

  it('keeps descendant spans intact when the parent span has no style', () => {
    const spans = editor.view.dom.querySelectorAll('p:nth-child(7) > span')
    expect(spans.length).toBe(4)
    expect(spans[0].textContent?.trim()).toBe('blue')
    expect(spans[0].getAttribute('style')).toBe('color: #0000FF')
    expect(spans[1].textContent?.trim()).toBe('green')
    expect(spans[1].getAttribute('style')).toBe('color: #00FF00')
    expect(spans[2].textContent?.trim()).toBe('green serif')
    expect(spans[2].getAttribute('style')).toBe('color: #00FF00; font-family: serif')
  })

  it('merges parent styles into descendants while preserving root text spans', () => {
    const spans = editor.view.dom.querySelectorAll('p:nth-child(8) > span')
    expect(spans.length).toBe(4)
    expect(spans[0].textContent?.trim()).toBe('blue')
    expect(spans[0].getAttribute('style')).toBe('color: #0000FF')
    expect(spans[1].textContent?.trim()).toBe('green')
    expect(spans[1].getAttribute('style')).toBe('color: #00FF00')
    expect(spans[2].textContent?.trim()).toBe('green serif')
    expect(spans[2].getAttribute('style')).toBe('color: #00FF00; font-family: serif')
    expect(spans[3].textContent?.trim()).toBe('blue serif')
    expect(spans[3].getAttribute('style')).toBe('color: #0000FF; font-family: serif')
  })
})
