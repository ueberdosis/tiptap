---
'@tiptap/core': minor
---

This introduces a new behavior for the editor, the ability to be safely run on the server-side (without rendering).

`prosemirror-view` encapsulates all view (& DOM) related code, and cannot safely be SSR'd, but, the majority of the editor instance itself is in plain JS that does not require DOM APIs (unless your content is specified in HTML).

But, we have so many convenient methods available for manipulating content. So, it is a shame that they could not be used on the server side too. With this change, the editor can be rendered on the server-side and will use a stub for select prosemirror-view methods. If accessing unsupported methods or values on the `editor.view`, you will encounter runtime errors, so it is important for you to test to see if the methods you call actually work.

This is a step towards being able to server-side render content, but, it is not completely supported yet. This does not mean that you can render an editor instance on the server and expect it to just output any HTML.

## Usage

If you pass `element: null` to your editor options:

- the `editor.view` will not be initialized
- the editor will not emit it's `'create'` event
- the focus will not be initialized to it's first position

You can however, later use the new `mount` function on the instance, which will mount the editor view to a DOM element. This obviously will not be allowed on the server which has no document object.

Therefore, this will work on the server:

```ts
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

const editor = new Editor({
  element: null,
  content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello, World!' }] }] },
  extensions: [StarterKit],
})

editor
  .chain()
  .selectAll()
  .setContent({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'XYZ' }] }] })
  .run()

console.log(editor.state.doc.toJSON())
// { type: 'doc', content: [ { type: 'paragraph', content: [ { type: 'text', text: 'XYZ' } ] } ] }
```

Any of these things will not work on the server, and result in a runtime error:

```ts
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

const editor = new Editor({
  // document will not be defined in a server environment
  element: document.createElement('div'),
  content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello, World!' }] }] },
  extensions: [StarterKit],
})

editor
  .chain()
  // focus is a command which depends on the editor-view, so it will not work in a server environment
  .focus()
  .run()

console.log(editor.getHTML())
// getHTML relies on the editor-view, so it will not work in a server environment
```
