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
