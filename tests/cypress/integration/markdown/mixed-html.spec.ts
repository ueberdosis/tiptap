import { Document } from '@tiptap/extension-document'
import { Heading } from '@tiptap/extension-heading'
import { Italic } from '@tiptap/extension-italic'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { MarkdownManager } from '@tiptap/markdown'

describe('MarkdownManager Mixed Markdown + HTML', () => {
  let manager: MarkdownManager
  const basicExtensions = [Document, Paragraph, Text, Heading, Italic]

  beforeEach(() => {
    manager = new MarkdownManager({ extensions: basicExtensions })
  })

  it('parses heading with inline HTML <em> as italic', () => {
    const md = '## hello <em>world</em>'
    const doc = manager.parse(md)

    expect(doc.type).to.equal('doc')
    expect(doc.content).to.be.an('array')
    const heading = doc.content[0]
    expect(heading.type).to.equal('heading')
    // Find the text node that contains 'world'
    const textNodes = heading.content.flatMap((n: any) => (n.type === 'text' ? [n] : n.content || []))
    const worldNode = textNodes.find((n: any) => n.text && n.text.includes('world'))
    // Use a function-call assertion to avoid the "no-unused-expressions" lint error
    expect(worldNode).to.not.equal(undefined)
    // The italic mark should be present
    expect(worldNode!.marks).to.be.an('array')
    const hasItalic = (worldNode.marks || []).some((m: any) => m.type === 'italic')
    expect(hasItalic).to.equal(true)
  })

  it('parses standalone inline HTML <em>world</em> as italic', () => {
    const md = '<em>world</em>'
    const doc = manager.parse(md)

    expect(doc.type).to.equal('doc')
    // Inline HTML typically produces a paragraph wrapper
    const paragraph = doc.content[0]
    expect(paragraph.type).to.equal('paragraph')
    const textNode = paragraph.content[0]
    expect(textNode.text).to.equal('world')
    expect(textNode.marks).to.be.an('array')
    const hasItalic = (textNode.marks || []).some((m: any) => m.type === 'italic')
    expect(hasItalic).to.equal(true)
  })

  it('parses markdown italic next to HTML italic correctly', () => {
    const md = '*a* <em>b</em> *c*'
    const doc = manager.parse(md)

    expect(doc.type).to.equal('doc')
    const para = doc.content[0]
    expect(para.type).to.equal('paragraph')

    // Collect texts and their mark states
    const runs = para.content.map((n: any) => ({ text: n.text, marks: n.marks || [] }))
    // Expect there to be runs containing a, b, c
    const texts = runs.map(r => (r.text || '').trim())
    expect(texts).to.include('a')
    expect(texts).to.include('b')
    expect(texts).to.include('c')
    ;['a', 'b', 'c'].forEach(letter => {
      const node = runs.find(r => (r.text || '').trim() === letter)
      expect(node).to.not.equal(undefined)
      const hasItalic = ((node as any).marks || []).some((m: any) => m.type === 'italic')
      expect(hasItalic).to.equal(true)
    })
  })
})
