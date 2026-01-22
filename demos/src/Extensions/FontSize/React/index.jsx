import { FontSize, TextStyle } from '@dibdab/extension-text-style'
import { EditorContent, useEditor } from '@dibdab/react'
import StarterKit from '@dibdab/starter-kit'

export default () => {
  const editor = useEditor({
    shouldRerenderOnTransaction: true,
    extensions: [StarterKit, TextStyle, FontSize],
    content: `
        <p>Adjusting font sizes can greatly affect the readability of your text, making it easier for users to engage with your content.</p>
        <p>When designing a website, it's crucial to balance large headings and smaller body text for a clean, organized layout.</p>
        <p>When setting font sizes, it's important to consider accessibility, ensuring that text is readable for users with different visual impairments.</p>
        <p><span style="font-size: 10px">Too small</span> a font size can strain the eyes, while <span style="font-size: 40px">too large</span> can disrupt the flow of the design.</p>
        <p>When designing for mobile, font sizes should be adjusted to maintain readability on smaller screens.</p>
      `,
  })

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => editor.chain().focus().setFontSize('28px').run()}
            className={editor.isActive('textStyle', { fontSize: '28px' }) ? 'is-active' : ''}
            data-test-id="28px"
          >
            Font size 28px
          </button>
          <button
            onClick={() => editor.chain().focus().setFontSize('32px').run()}
            className={editor.isActive('textStyle', { fontSize: '32px' }) ? 'is-active' : ''}
            data-test-id="32px"
          >
            Font size 32px
          </button>
          <button onClick={() => editor.chain().focus().unsetFontSize().run()} data-test-id="unsetFontSize">
            Unset font size
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </>
  )
}
