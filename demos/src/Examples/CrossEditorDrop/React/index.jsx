import { Mark, markPasteRule } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const PasteMark = Mark.create({
  name: 'pasteMark',
  addPasteRules() {
    return [markPasteRule({ find: /==(.*?)==/g, type: this.type })]
  },
})

const extensions = [StarterKit, PasteMark]

export default () => {
  const source = useEditor({
    extensions,
    content: '<p>Select and drag this text into the other editor.</p>',
  })
  const target = useEditor({ extensions, content: '<p>Drop the text here.</p>' })

  return (
    <div>
      <p>Select text in the first editor and drag it into the second editor.</p>
      <EditorContent editor={source} />
      <EditorContent editor={target} />
    </div>
  )
}
