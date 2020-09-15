# Editor

:::warning Out of date
This content is written for tiptap 1 and needs an update.
:::

This class is a central building block of tiptap. It does most of the heavy lifting of creating a working  [ProseMirror](https://ProseMirror.net/) editor such as creating the [`EditorView`](https://ProseMirror.net/docs/ref/#view.EditorView), setting the initial [`EditorState`](https://ProseMirror.net/docs/ref/#state.Editor_State) and so on.

## Editor Properties
| Property           |     Type     | Default | Description                                                                                                                                   |
| ---------------------- | :--------------: | :---------: | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content`              | `Object\|String` |   `null`    | The editor state object used by Prosemirror. You can also pass HTML to the `content` slot. When used both, the `content` slot will be ignored.    |
| `editorProps`          |     `Object`     |    `{}`     | A list of [Prosemirror editorProps](https://prosemirror.net/docs/ref/#view.EditorProps).                                                          |
| `editable`             |    `Boolean`     |   `true`    | When set to `false` the editor is read-only.                                                                                                      |
| `autoFocus`            |    `Boolean`     |   `false`   | Focus the editor on init.                                                                                                                         |
| `extensions`           |     `Array`      |    `[]`     | A list of extensions used, by the editor. This can be `Nodes`, `Marks` or `Plugins`.                                                              |
| `useBuiltInExtensions` |    `Boolean`     |   `true`    | By default tiptap adds a `Doc`, `Paragraph` and `Text` node to the Prosemirror schema.                                                            |
| `dropCursor`           |     `Object`     |    `{}`     | Config for `prosemirror-dropcursor`.                                                                                                              |
| `enableDropCursor`     |    `Boolean`     |   `true`    | Option to enable / disable the dropCursor plugin.                                                                                                 |
| `enableGapCursor`      |    `Boolean`     |   `true`    | Option to enable / disable the gapCursor plugin.                                                                                                  |
| `parseOptions`         |     `Object`     |    `{}`     | A list of [Prosemirror parseOptions](https://prosemirror.net/docs/ref/#model.ParseOptions).                                                       |
| `onInit`               |    `Function`    | `undefined` | This will return an Object with the current `state` and `view` of Prosemirror on init.                                                            |
| `onFocus`              |    `Function`    | `undefined` | This will return an Object with the `event` and current `state` and `view` of Prosemirror on focus.                                               |
| `onBlur`               |    `Function`    | `undefined` | This will return an Object with the `event` and current `state` and `view` of Prosemirror on blur.                                                |
| `onUpdate`             |    `Function`    | `undefined` | This will return an Object with the current `state` of Prosemirror, a `getJSON()` and `getHTML()` function and the `transaction` on every change. |