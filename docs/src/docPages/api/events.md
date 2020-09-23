# Events
Events are a great way to run code when the editor has been initialized, the content has changed, the editor is in focus or the editor isn’t in focus anymore. There are two ways to add code that is executed at those events:

## Option 1: Use hooks
Hooks can be assigned to the editor on initialization. Pass a function that gets called in case of those events.

```js
const editor = new Editor({
  onInit: () => {
    // the editor is ready
  },
  onUpdate: ({ html }) => {
    // the content has been changed
    const newContent = html()
  },
})
```

## Option 2: Listen for events
You can even register event listeners later. Here is the same example with event listeners:

```js
const editor = new Editor({
  // …
})

editor.on('init', () => {
  // the editor is ready
})

editor.on('update', ({ html }) => {
  // the content has been changed
  const newContent = html()
})
```

## List of events
| Event    | Description                   | Parameters                           |
| -------- | ----------------------------- | ------------------------------------ |
| `blur`   | Editor isn’t focused anymore. | `{ event, state, view }`             |
| `focus`  | Editor is in focus.           | `{ event, state, view }`             |
| `init`   | Editor has been initialized.  | `{ state, view }`                    |
| `update` | Content has been changed.     | `{ state, json, html, transaction }` |

:::info List of hooks
The according hooks are called `onBlur`, `onFocus`, `onInit` and `onUpdate`.
:::