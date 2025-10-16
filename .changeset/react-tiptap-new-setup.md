---
"@tiptap/react": minor
---

Introduce a new, optional React integration that provides a declarative `<Tiptap />` component for setting up editors in React apps.

Summary
- Add a new, ergonomic way to initialize and use Tiptap editors in React via `<Tiptap />` components. This is an additive change and does not remove or change existing APIs.

Why this change
- Improves ergonomics for React users by offering a component-first API that pairs well with React patterns (hooks, JSX composition and props-driven configuration).

Migration and usage
- The old programmatic setup remains supported for this major version — nothing breaks. We encourage consumers to try the new `<Tiptap />` component and migrate when convenient.

Example

```tsx
import { Tiptap, useEditor } from '@tiptap/react'

function MyEditor() {
  const editor = useEditor({ extensions: [StarterKit], content: '<h1>Hello from Tiptap</h1>' })

  return (
    <Tiptap instance={editor}>
      <Tiptap.Content />
      <Tiptap.BubbleMenu>My Bubble Menu</Tiptap.BubbleMenu>
      <Tiptap.FloatingMenu>My Floating Menu</Tiptap.FloatingMenu>
      <MenuBar /> {/* MenuBar can use the new `useTiptap` hook to read the editor instance from context */}
    </Tiptap>
  )
}
```

Deprecation plan
- The old imperative setup will remain fully backward-compatible for this major release. We plan to deprecate (and remove) the legacy setup in the next major version — a deprecation notice and migration guide will be published ahead of that change.
