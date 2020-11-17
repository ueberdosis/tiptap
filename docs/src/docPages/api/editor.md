# Editor

## toc

## Introduction
This class is a central building block of tiptap. It does most of the heavy lifting of creating a working  [ProseMirror](https://ProseMirror.net/) editor such as creating the [`EditorView`](https://ProseMirror.net/docs/ref/#view.EditorView), setting the initial [`EditorState`](https://ProseMirror.net/docs/ref/#state.Editor_State) and so on.

## Configuration
| Setting            | Type            | Default     | Description                                                                                                                                                                         |
| ------------------ | --------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `autofocus`        | `Boolean`       | `false`     | Focus the editor on init.                                                                                                                                                           |
| `content`          | `Object|String` | `null`      | The editor state object used by Prosemirror. You can also pass HTML to the `content` slot. When used both, the `content` slot will be ignored.                                      |
| `editable`         | `Boolean`       | `true`      | When set to `false` the editor is read-only.                                                                                                                                        |
| `editorProps`      | `Object`        | `{}`        | A list of [Prosemirror editorProps](https://prosemirror.net/docs/ref/#view.EditorProps).                                                                                            |
| `extensions`       | `Array`         | `[]`        | A list of extensions used, by the editor. This can be `Nodes`, `Marks` or `Plugins`.                                                                                                |
| `parseOptions`     | `Object`        | `{}`        | A list of [Prosemirror parseOptions](https://prosemirror.net/docs/ref/#model.ParseOptions).                                                                                         |
| `onBlur`           | `Function`      | `undefined` | Returns an object with the `event` and current `state` and `view` of Prosemirror on blur.                                                                                           |
| `onFocus`          | `Function`      | `undefined` | Returns an object with the `event` and current `state` and `view` of Prosemirror on focus.                                                                                          |
| `onInit`           | `Function`      | `undefined` | Returns an object with the current `state` and `view` of Prosemirror on init.                                                                                                       |
| `onUpdate`         | `Function`      | `undefined` | Returns an object with the current `state` of Prosemirror, a `getJSON()` and `getHTML()` function and the `transaction` on every change.                                            |

## Methods
| Method               | Parameters                                                                                                  | Description                                               |
| -------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `getHTML()`          | –                                                                                                           | Returns the current content as HTML.                      |
| `getJSON()`          | –                                                                                                           | Returns the current content as JSON.                      |
| `destroy()`          | –                                                                                                           | Stops the editor instance and unbinds all events.         |
| `chain()`            | -                                                                                                           | Create a command chain to call multiple commands at once. |
| `can()`              | -                                                                                                           | Check if a command or a command chain can be executed. Without executing it. |
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
| `isEmpty()`          | -                                                                                                           | Check if there is no content.                             |
