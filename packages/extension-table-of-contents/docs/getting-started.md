# Getting started

Add the extension to an editor and draw a sidebar from the outline it reports.

- Demo: [React](https://embed.tiptap.dev/preview/Extensions/TableOfContents/React) · [Vue](https://embed.tiptap.dev/preview/Extensions/TableOfContents/Vue)

## Install

```bash
npm install @tiptap/extension-table-of-contents
```

The package needs `@tiptap/core` and `@tiptap/pm` version 3. It works in any framework and in
plain JavaScript.

## A first sidebar

Pass an `onUpdate` callback. The extension calls it with the outline when the editor starts and
after every change.

```js
import { Editor } from '@tiptap/core'
import { getHierarchicalIndexes, TableOfContents } from '@tiptap/extension-table-of-contents'
import StarterKit from '@tiptap/starter-kit'

const sidebar = document.querySelector('#sidebar')

new Editor({
  element: document.querySelector('#editor'),
  extensions: [
    StarterKit,
    TableOfContents.configure({
      getIndex: getHierarchicalIndexes,
      onUpdate(items) {
        sidebar.innerHTML = ''

        items.forEach(item => {
          const link = document.createElement('a')

          link.href = `#${item.id}`
          link.textContent = item.textContent
          link.style.paddingLeft = `${item.level - 1}rem`
          link.classList.toggle('is-active', item.isActive)

          sidebar.append(link)
        })
      },
    }),
  ],
  content: '<h1>Title</h1><p>Text</p><h2>Section</h2><p>More text</p>',
})
```

The result is one link per heading. `Section` is indented one step under `Title`. Type a new
heading in the editor, and a new link appears.

Each item has the heading's `id`, its text, its `level` in the outline, and whether the reader has
scrolled to it. [Storage](storage.md#items) lists every field.

## Go to a heading

Every heading gets an `id` attribute in the editor's HTML, so `#${item.id}` links work. To also put
the cursor in the heading, set the selection yourself:

```js
import { TextSelection } from '@tiptap/pm/state'

function goToHeading(editor, item) {
  const { tr } = editor.state

  tr.setSelection(TextSelection.near(tr.doc.resolve(item.pos + 1)))
  tr.scrollIntoView()
  editor.view.dispatch(tr)
  editor.view.focus()
}
```

## With React or Vue

Store the items in state and render them with your components:

```jsx
const [items, setItems] = useState([])

const editor = useEditor({
  extensions: [StarterKit, TableOfContents.configure({ onUpdate: setItems })],
})
```

```js
const items = ref([])

const editor = new Editor({
  extensions: [
    StarterKit,
    TableOfContents.configure({
      onUpdate: content => {
        items.value = content
      },
    }),
  ],
})
```

## Next steps

- Change which nodes count and how they are numbered: [Options](options.md)
- Read the outline on the server or without the sidebar updates: [Read the outline](reading.md)
