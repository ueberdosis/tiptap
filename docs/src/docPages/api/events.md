# Events
Events are a great way to run code when the editor has been initialized, the content has changed, the editor is in focus or the editor isn’t in focus anymore. There are two ways to add code to those events.

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

## List of available hooks & events
| Hook       | Event    | Description                                                                                                                        |
| ---------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `onBlur`   | `blur`   | Returns an object with the `event` and current `state` and `view` of Prosemirror on blur.                                          |
| `onFocus`  | `focus`  | Returns an object with the `event` and current `state` and `view` of Prosemirror on focus.                                         |
| `onInit`   | `init`   | Returns an object with the current `state` and `view` of Prosemirror on init.                                                      |
| `onUpdate` | `update` | Returns an object with the current `state` of Prosemirror, a `json()` and `html()` function and the `transaction` on every change. |