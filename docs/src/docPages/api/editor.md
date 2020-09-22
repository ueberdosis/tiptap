# Editor

This class is a central building block of tiptap. It does most of the heavy lifting of creating a working  [ProseMirror](https://ProseMirror.net/) editor such as creating the [`EditorView`](https://ProseMirror.net/docs/ref/#view.EditorView), setting the initial [`EditorState`](https://ProseMirror.net/docs/ref/#state.Editor_State) and so on.

## Settings
All of the listed settings can be set during initialization, read and updated during runtime.

| Setting            | Type            | Default | Description                                                                                                                                    |
| ------------------ | --------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `autoFocus`        | `Boolean`       | `false` | Focus the editor on init.                                                                                                                      |
| `content`          | `Object|String` | `null`  | The editor state object used by Prosemirror. You can also pass HTML to the `content` slot. When used both, the `content` slot will be ignored. |
| `dropCursor`       | `Object`        | `{}`    | Config for `prosemirror-dropcursor`.                                                                                                           |
| `editable`         | `Boolean`       | `true`  | When set to `false` the editor is read-only.                                                                                                   |
| `editorProps`      | `Object`        | `{}`    | A list of [Prosemirror editorProps](https://prosemirror.net/docs/ref/#view.EditorProps).                                                       |
| `enableDropCursor` | `Boolean`       | `true`  | Option to enable / disable the dropCursor plugin.                                                                                              |
| `enableGapCursor`  | `Boolean`       | `true`  | Option to enable / disable the gapCursor plugin.                                                                                               |
| `extensions`       | `Array`         | `[]`    | A list of extensions used, by the editor. This can be `Nodes`, `Marks` or `Plugins`.                                                           |
| `parseOptions`     | `Object`        | `{}`    | A list of [Prosemirror parseOptions](https://prosemirror.net/docs/ref/#model.ParseOptions).                                                    |

## Hooks
The editor provides a few hooks to react to specific [events](/api/events). Pass a function that get’s called in case of those events.

| Hook       | Type       | Default     | Description                                                                                                                                 |
| ---------- | ---------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `onBlur`   | `Function` | `undefined` | This will return an Object with the `event` and current `state` and `view` of Prosemirror on blur.                                          |
| `onFocus`  | `Function` | `undefined` | This will return an Object with the `event` and current `state` and `view` of Prosemirror on focus.                                         |
| `onInit`   | `Function` | `undefined` | This will return an Object with the current `state` and `view` of Prosemirror on init.                                                      |
| `onUpdate` | `Function` | `undefined` | This will return an Object with the current `state` of Prosemirror, a `json()` and `html()` function and the `transaction` on every change. |
