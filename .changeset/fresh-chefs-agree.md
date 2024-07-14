---
"@tiptap/react": patch
---

We've heard a number of complaints around the performance of our React integration, and we finally have a solution that we believe will satisfy everyone. We've made a number of optimizations to how the editor is rendered, as well give you more control over the rendering process.

Here is a summary of the changes and how you can take advantage of them:

- SSR rendering was holding back our ability to have an editor instance on first render of `useEditor`. We've now made the default behavior to render the editor immediately on the client. This behavior can be controlled with the new `immediatelyRender` option which when set to `false` will defer rendering until the second render (via a useEffect), this should only be used when server-side rendering.
- The default behavior of the useEditor hook is to re-render the editor on every editor transaction. Now with the `shouldRerenderOnTransaction` option, you can disable this behavior to optimize performance. Instead, to access the new editor state, you can use the `useEditorState` hook.
- `useEditorState` this new hook allows you to select from the editor instance any state you need to render your UI. This is useful when you want to optimize performance by only re-rendering the parts of your UI that need to be updated.

Here is a usage example:

```jsx
  const editor = useEditor({
    /**
     * This option gives us the control to enable the default behavior of rendering the editor immediately.
     */
    immediatelyRender: true,
    /**
     * This option gives us the control to disable the default behavior of re-rendering the editor on every transaction.
     */
    shouldRerenderOnTransaction: false,
    extensions: [StarterKit],
    content: `
    <p>
      A highly optimized editor that only re-renders when it’s necessary.
    </p>
    `,
  })

  /**
   * This hook allows us to select the editor state we want to use in our component.
   */
  const currentEditorState = useEditorState({
    /**
     * The editor instance we want to use.
     */
    editor,
    /**
     * This selector allows us to select the data we want to use in our component.
     * It is evaluated on every editor transaction and compared to it's previously returned value.
     * You can return any data shape you want.
     */
    selector: ctx => ({
      isBold: ctx.editor.isActive('bold'),
      isItalic: ctx.editor.isActive('italic'),
      isStrike: ctx.editor.isActive('strike'),
    }),
    /**
     * This function allows us to customize the equality check for the selector.
     * By default it is a `===` check.
     */
    equalityFn: (prev, next) => {
      // A deep-equal function would probably be more maintainable here, but, we use a shallow one to show that it can be customized.
      if (!next) {
        return false
      }
      return (
        prev.isBold === next.isBold
        && prev.isItalic === next.isItalic
        && prev.isStrike === next.isStrike
      )
    },
  })
```
