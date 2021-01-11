# Collaboration
[![Version](https://img.shields.io/npm/v/@tiptap/extension-collaboration.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-collaboration)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-collaboration.svg)](https://npmcharts.com/compare/@tiptap/extension-collaboration?minimal=true)

The Collaboration extension enables you to collaborate with others in a single document. The implementation is based on [Y.js by Kevin Jahns](https://github.com/yjs/yjs), which is the coolest thing to [integrate collaborative editing](/guide/collaborative-editing) in your project.

The history works totally different in a collaborative editing setup. If you undo a change, you don’t want to undo changes of other users. To handle that behaviour this extension provides an own `undo` and `redo` command. Don’t load the default [`History`](/api/extensions/history) extension together with the Collaboration extension to avoid conflicts.

:::pro Pro Extension
We kindly ask you to [sponsor our work](/sponsor) when using this extension in production.
:::

## Installation
```bash
# with npm
npm install @tiptap/extension-collaboration yjs y-websocket

# with Yarn
yarn add @tiptap/extension-collaboration yjs y-websocket
```

## Settings
| Option   | Type     | Default   | Description                                                                               |
| -------- | -------- | --------- | ----------------------------------------------------------------------------------------- |
| document | `Object` | `null`    | An initialized Y.js document.                                                             |
| fragment | `String` | `default` | Name of the Y.js fragment, can be changed to sync multiple fields with one Y.js document. |

## Commands
| Command | Parameters | Description           |
| ------- | ---------- | --------------------- |
| undo    | —          | Undo the last change. |
| redo    | —          | Redo the last change. |

## Keyboard shortcuts
### Undo
* Windows/Linux: `Control`&nbsp;`Z`
* macOS: `Cmd`&nbsp;`Z`

### Redo
* Windows/Linux: `Shift`&nbsp;`Control`&nbsp;`Z` or `Control`&nbsp;`Y`
* macOS: `Shift`&nbsp;`Cmd`&nbsp;`Z` or `Cmd`&nbsp;`Y`

## Source code
[packages/extension-collaboration/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-collaboration/)

## Usage
:::warning Public
The content of this editor is shared with other users.
:::
<demo name="Extensions/Collaboration" highlight="10,27-28,35-37,44" />
