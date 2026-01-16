import './styles.scss'

import { Extension } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useCallback } from 'react'

export default () => {
  // Create extension that replaces words
  const WordReplacerExtension = Extension.create({
    name: 'wordReplacer',
    priority: 100,

    transformPastedHTML(html) {
      // Replace "foo" with "bar" in text content
      return html.replace(/\bfoo\b/gi, 'bar')
    },
  })

  // Create extension that converts tabs to spaces
  const TabToSpacesExtension = Extension.create({
    name: 'tabToSpaces',
    priority: 110, // Higher priority = runs first

    transformPastedHTML(html) {
      // Convert tabs to 2 spaces
      return html.replace(/\t/g, '  ')
    },
  })

  // Create extension that normalizes line breaks
  const LineBreakExtension = Extension.create({
    name: 'lineBreak',
    priority: 90,

    transformPastedHTML(html) {
      // Convert double line breaks to paragraph breaks
      return html.replace(/\n\n+/g, '</p><p>')
    },
  })

  // Create extension that removes inline styles
  const CleanStylesExtension = Extension.create({
    name: 'cleanStyles',
    priority: 80,

    transformPastedHTML(html) {
      // Remove inline style attributes
      return html.replace(/\s+style="[^"]*"/gi, '')
    },
  })

  const editor = useEditor({
    extensions: [StarterKit, TabToSpacesExtension, WordReplacerExtension, LineBreakExtension, CleanStylesExtension],
    content: `
      <h2>Transform Pasted HTML Demo</h2>
      <p>This demo showcases the <code>transformPastedHTML</code> API that allows extensions to transform pasted HTML content before it's parsed into the editor.</p>

      <h3>How it works:</h3>
      <ol>
        <li><strong>Tab to Spaces</strong> (priority: 110) - Converts tabs to spaces</li>
        <li><strong>Word Replacer</strong> (priority: 100) - Replaces "foo" with "bar"</li>
        <li><strong>Line Break</strong> (priority: 90) - Converts double line breaks to paragraphs</li>
        <li><strong>Clean Styles</strong> (priority: 80) - Removes inline style attributes</li>
      </ol>

      <p>Extensions with higher priority run first. Each extension receives the output from the previous extension's transform, creating a transform chain.</p>

      <h3>Try it:</h3>
      <p>Use the buttons above to simulate the transformation, or try copying and pasting HTML content with tabs, "foo" text, or inline styles from another source to see the API work during actual paste events!</p>

      <p><em>Note: The buttons above simulate the transform for demonstration purposes. Real paste events (Ctrl+V / Cmd+V) will also trigger these transforms automatically.</em></p>
    `,
  })

  const pasteHTML = useCallback(
    html => {
      if (!editor) {
        return
      }

      // Get the transformed HTML by calling the view's transformPastedHTML
      const transformedHTML = editor.view.props.transformPastedHTML?.(html) || html

      // Insert the transformed HTML at the current position
      editor.chain().focus().insertContent(transformedHTML).run()
    },
    [editor],
  )

  const pasteWithTabs = useCallback(() => {
    const html = '<p>This\ttext\thas\ttabs\tbetween\twords</p>'
    pasteHTML(html)
  }, [pasteHTML])

  const pasteWithFoo = useCallback(() => {
    const html = '<p>The foo is strong in this foo. Foo fighters unite!</p>'
    pasteHTML(html)
  }, [pasteHTML])

  const pasteWithStyles = useCallback(() => {
    const html =
      '<p style="background-color: yellow; padding: 20px;">This has <span style="color: red;">inline</span> styles that will be removed</p>'
    pasteHTML(html)
  }, [pasteHTML])

  return (
    <div>
      {editor && (
        <div className="control-group">
          <div className="button-group">
            <button onClick={pasteWithTabs} type="button">
              Paste with Tabs
            </button>
            <button onClick={pasteWithFoo} type="button">
              Paste with "foo"
            </button>
            <button onClick={pasteWithStyles} type="button">
              Paste with Styles
            </button>
          </div>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  )
}
