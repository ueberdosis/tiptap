import './styles.scss'

import DragHandle from '@tiptap/extension-drag-handle-react'
import Image from '@tiptap/extension-image'
import { TableKit } from '@tiptap/extension-table'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useState } from 'react'

const NESTED_CONFIG = { edgeDetection: { threshold: -16 } }

export default () => {
  const [nested, setNested] = useState(true)

  const editor = useEditor({
    extensions: [StarterKit, Image.configure({ inline: false }), TableKit],
    content: `
      <h1>The Complete Guide to Modern Web Development</h1>
      <p>Web development has evolved significantly over the past decade. What once required multiple tools and complex setups can now be accomplished with modern frameworks and libraries that prioritize developer experience.</p>

      <img src="https://unsplash.it/500/500" alt="Random Image" />

      <h2>Getting Started</h2>
      <p>Before diving into the technical details, it's important to understand the foundational concepts that make modern web development possible.</p>

      <blockquote>
        <p>"The best code is no code at all. Every new line of code you willingly bring into the world is code that has to be debugged, code that has to be read and understood." - Jeff Atwood</p>
      </blockquote>

      <p>This philosophy guides much of modern development practices, emphasizing simplicity and maintainability over complexity.</p>

      <table>
        <thead>
          <tr>
            <th>Feature</th>
            <th>Description</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr></tr>
            <td>Component-Based Architecture</td>
            <td>Breaks down the UI into reusable components.</td>
            <td><code>&lt;MyComponent /&gt;</code></td>
          </tr>
          <tr></tr>
            <td>Virtual DOM</td>
            <td>Improves performance by minimizing direct DOM manipulation.</td>
            <td><code>&lt;VirtualDOMComponent /&gt;</code></td>
          </tr>
        </tbody>
      </table>

      <hr>

      <h2>Key Technologies</h2>
      <p>Here are the essential technologies every web developer should be familiar with:</p>

      <ul>
        <li>HTML5 and semantic markup</li>
        <li>CSS3 with modern layout techniques
          <ul>
            <li>Flexbox for one-dimensional layouts</li>
            <li>Grid for two-dimensional layouts</li>
            <li>Custom properties (CSS variables)</li>
          </ul>
        </li>
        <li>JavaScript (ES6+)</li>
        <li>TypeScript for type safety</li>
      </ul>

      <h3>Framework Comparison</h3>
      <p>Choosing the right framework depends on your project requirements:</p>

      <ol>
        <li>React - Component-based UI library</li>
        <li>Vue - Progressive framework</li>
        <li>Angular - Full-featured platform</li>
        <li>Svelte - Compile-time framework</li>
      </ol>

      <hr>

      <h2>Best Practices</h2>
      <p>Following established best practices ensures your code remains maintainable and scalable.</p>

      <blockquote>
        <p>Always write code as if the person who ends up maintaining it is a violent psychopath who knows where you live.</p>
      </blockquote>

      <h3>Code Organization</h3>
      <p>A well-organized codebase is crucial for long-term project success. Consider these principles:</p>

      <ul>
        <li>Separation of concerns</li>
        <li>DRY (Don't Repeat Yourself)</li>
        <li>KISS (Keep It Simple, Stupid)</li>
      </ul>

      <p>By following these guidelines, you'll create applications that are easier to maintain, test, and extend over time.</p>
    `,
  })

  const toggleEditable = () => {
    editor.setEditable(!editor.isEditable)
    editor.view.dispatch(editor.view.state.tr)
  }

  const toggleNested = () => {
    setNested(!nested)
  }

  return (
    <>
      <div>
        <button onClick={toggleEditable}>Toggle editable</button>
        <button onClick={toggleNested}>Toggle nested</button>
      </div>
      <DragHandle editor={editor} nested={nested ? NESTED_CONFIG : false}>
        <div className="custom-drag-handle" />
      </DragHandle>
      <EditorContent editor={editor} />
    </>
  )
}
