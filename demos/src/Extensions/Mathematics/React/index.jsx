import 'katex/dist/katex.min.css'
import './styles.scss'

import Math from '@tiptap/extension-mathematics'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useCallback } from 'react'

export default () => {
  const editor = useEditor({
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit,
      Math.configure({
        blockOptions: {
          onClick: node => {
            const newCalculation = prompt('Enter new calculation:', node.attrs.latex)
            if (newCalculation) {
              editor.chain().updateBlockMath({ latex: newCalculation }).run()
            }
          },
        },
        inlineOptions: {
          onClick: node => {
            const newCalculation = prompt('Enter new calculation:', node.attrs.latex)
            if (newCalculation) {
              editor.chain().updateInlineMath({ latex: newCalculation }).run()
            }
          },
        },
      }),
    ],
    content: `
      <h1>
        This editor supports <span data-type="inline-math" data-latex="\\LaTeX"></span> math expressions.
      </h1>
      <p>
        Did you know that <span data-type="inline-math" data-latex="3 * 3 = 9"></span>? Isn't that crazy? Also Pythagoras' theorem is <span data-type="inline-math" data-latex="a^2 + b^2 = c^2"></span>.<br />
        Also the square root of 2 is <span data-type="inline-math" data-latex="\\sqrt{2}"></span>. If you want to know more about <span data-type="inline-math" data-latex="\\LaTeX"></span> visit <a href="https://katex.org/docs/supported.html" target="_blank">katex.org</a>.
      </p>
      <code>
        <pre>$\\LaTeX$</pre>
      </code>
      <p>
        Do you want go deeper? Here is a list of all supported functions:
      </p>
      <ul>
        <li><span data-type="inline-math" data-latex="\\sin(x)"></span></li>
        <li><span data-type="inline-math" data-latex="\\cos(x)"></span></li>
        <li><span data-type="inline-math" data-latex="\\tan(x)"></span></li>
        <li><span data-type="inline-math" data-latex="\\log(x)"></span></li>
        <li><span data-type="inline-math" data-latex="\\ln(x)"></span></li>
        <li><span data-type="inline-math" data-latex="\\sqrt{x}"></span></li>
        <li><span data-type="inline-math" data-latex="\\sum_{i=0}^n x_i"></span></li>
        <li><span data-type="inline-math" data-latex="\\int_a^b x^2 dx"></span></li>
        <li><span data-type="inline-math" data-latex="\\frac{1}{x}"></span></li>
        <li><span data-type="inline-math" data-latex="\\binom{n}{k}"></span></li>
        <li><span data-type="inline-math" data-latex="\\sqrt[n]{x}"></span></li>
        <li><span data-type="inline-math" data-latex="\\left(\\frac{1}{x}\\right)"></span></li>
        <li><span data-type="inline-math" data-latex="\\left\\{\\begin{matrix}x&\\text{if }x>0\\\\0&\\text{otherwise}\\end{matrix}\\right."></span></li>
      </ul>
      <p>The math extension also supports block level math nodes:</p>
      <div data-type="block-math" data-latex="\\int_a^b x^2 dx"></div>
    `,
  })

  const toggleEditing = useCallback(
    e => {
      if (!editor) {
        return
      }

      const { checked } = e.target

      editor.setEditable(!checked, true)
      editor.view.dispatch(editor.view.state.tr.scrollIntoView())
    },
    [editor],
  )

  const onInsertInlineMath = useCallback(() => {
    const hasSelection = !editor.state.selection.empty

    if (hasSelection) {
      return editor.chain().setInlineMath().focus().run()
    }

    const latex = prompt('Enter inline math expression:', '')
    return editor.chain().insertInlineMath({ latex }).focus().run()
  }, [editor])

  const onRemoveInlineMath = useCallback(() => {
    editor.chain().deleteInlineMath().focus().run()
  }, [editor])

  const onInsertBlockMath = useCallback(() => {
    const hasSelection = !editor.state.selection.empty

    if (hasSelection) {
      return editor.chain().setBlockMath().focus().run()
    }

    const latex = prompt('Enter block math expression:', '')
    return editor.chain().insertBlockMath({ latex }).focus().run()
  }, [editor])

  const onRemoveBlockMath = useCallback(() => {
    editor.chain().deleteBlockMath().focus().run()
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="control-group">
        <label>
          <input type="checkbox" checked={!editor.isEditable} onChange={toggleEditing} />
          Readonly
        </label>
      </div>
      <div className="control-group">
        <div className="button-group">
          <button onClick={onInsertInlineMath}>Insert inline math</button>
          <button onClick={onRemoveInlineMath}>Remove inline math</button>
          <button onClick={onInsertBlockMath}>Insert block math</button>
          <button onClick={onRemoveBlockMath}>Remove block math</button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
