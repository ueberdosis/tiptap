# Editor

## Table of Contents

## Introduction
This class is a central building block of tiptap. It does most of the heavy lifting of creating a working  [ProseMirror](https://ProseMirror.net/) editor such as creating the [`EditorView`](https://ProseMirror.net/docs/ref/#view.EditorView), setting the initial [`EditorState`](https://ProseMirror.net/docs/ref/#state.Editor_State) and so on.

## Configuration
| Setting            | Type            | Default     | Description                                                                                                                                                                         |
| ------------------ | --------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `autoFocus`        | `Boolean`       | `false`     | Focus the editor on init.                                                                                                                                                           |
| `content`          | `Object|String` | `null`      | The editor state object used by Prosemirror. You can also pass HTML to the `content` slot. When used both, the `content` slot will be ignored.                                      |
| `dropCursor`       | `Object`        | `{}`        | Config for `prosemirror-dropcursor`.                                                                                                                                                |
| `editable`         | `Boolean`       | `true`      | When set to `false` the editor is read-only.                                                                                                                                        |
| `editorProps`      | `Object`        | `{}`        | A list of [Prosemirror editorProps](https://prosemirror.net/docs/ref/#view.EditorProps).                                                                                            |
| `enableDropCursor` | `Boolean`       | `true`      | Enable/disable showing a cursor at the drop position when something is dragged over the editor.                                                                                     |
| `enableGapCursor`  | `Boolean`       | `true`      | Enable/disable a cursor at places that don’t allow regular selection (such as positions that have a leaf block node, table, or the end of the document both before and after them). |
| `extensions`       | `Array`         | `[]`        | A list of extensions used, by the editor. This can be `Nodes`, `Marks` or `Plugins`.                                                                                                |
| `parseOptions`     | `Object`        | `{}`        | A list of [Prosemirror parseOptions](https://prosemirror.net/docs/ref/#model.ParseOptions).                                                                                         |
| `onBlur`           | `Function`      | `undefined` | Returns an object with the `event` and current `state` and `view` of Prosemirror on blur.                                                                                           |
| `onFocus`          | `Function`      | `undefined` | Returns an object with the `event` and current `state` and `view` of Prosemirror on focus.                                                                                          |
| `onInit`           | `Function`      | `undefined` | Returns an object with the current `state` and `view` of Prosemirror on init.                                                                                                       |
| `onUpdate`         | `Function`      | `undefined` | Returns an object with the current `state` of Prosemirror, a `json()` and `html()` function and the `transaction` on every change.                                                  |

## Methods
| Method               | Parameters                                                                                                  | Description                                               |
| -------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `html()`             | –                                                                                                           | Returns the current content as HTML.                      |
| `json()`             | –                                                                                                           | Returns the current content as JSON.                      |
| `destroy()`          | –                                                                                                           | Stops the editor instance and unbinds all events.         |
| `chain()`            | -                                                                                                           | Create a command chain to call multiple commands at once. |
| `setOptions()`       | `options` A list of options                                                                                 | Update editor options.                                    |
| `isEditable()`       | -                                                                                                           | Returns whether the editor is editable.                   |
| `state()`            | -                                                                                                           | Returns the editor state.                                 |
| `registerCommands()` | `commands` A list of commands                                                                               | Register a list of commands.                              |
| `registerCommand()`  | `name` The name of your command<br>`callback` The method of your command                                    | Register a command.                                       |
| `registerPlugin()`   | `plugin` A ProseMirror plugin<br>`handlePlugins` Control how to merge the plugin into the existing plugins. | Register a ProseMirror plugin.                            |
| `unregisterPlugin()` | `name` The plugins name                                                                                     | Unregister a ProseMirror plugin.                          |
| `createDocument()`   | `content` EditorContent<br>`parseOptions`                                                                   | Creates a ProseMirror document.                           |
| `getNodeAttrs()`     | `name` Name of the node                                                                                     | Get attributes of the currently selected node.            |
| `getMarkAttrs()`     | `name` Name of the mark                                                                                     | Get attributes of the currently selected mark.            |
| `isActive()`         | `name` Name of the node or mark<br>`attrs` Attributes of the node or mark                                   | Returns if the currently selected node or mark is active. |
