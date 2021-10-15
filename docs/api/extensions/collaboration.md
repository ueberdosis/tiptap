---
description: Collaborative text editing can be fricking complex, but it doesn’t have to be that way.
icon: user-voice-line
---

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

### document
An initialized Y.js document.

Default: `null`

```js
Collaboration.configure({
  document: new Y.Doc(),
})
```

### field
Name of a Y.js fragment, can be changed to sync multiple fields with one Y.js document.

Default: `'default'`

```js
Collaboration.configure({
  document: new Y.Doc(),
  field: 'title',
})
```

### fragment
A raw Y.js fragment, can be used instead of `document` and `field`.

Default: `null`

```js
Collaboration.configure({
  fragment: new Y.Doc().getXmlFragment('body'),
})
```

## Commands
The `Collboration` extension comes with its own history extension. Make sure to disable the default extension, if you’re working with the `StarterKit`.

### undo()
Undo the last change.

```js
editor.commands.undo()
```
### redo()
Redo the last change.

```js
editor.commands.redo()
```

## Keyboard shortcuts
| Command | Windows/Linux                                         | macOS                                         |
| ------- | ----------------------------------------------------- | --------------------------------------------- |
| undo()  | `Control`&nbsp;`Z`                                    | `Cmd`&nbsp;`Z`                                |
| redo()  | `Shift`&nbsp;`Control`&nbsp;`Z`<br>`Control`&nbsp;`Y` | `Shift`&nbsp;`Cmd`&nbsp;`Z`<br>`Cmd`&nbsp;`Y` |

## Source code
[packages/extension-collaboration/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-collaboration/)

## Usage
:::warning Public
The content of this editor is shared with other users.
:::
<tiptap-demo name="Extensions/Collaboration" hide-source></tiptap-demo>
<tiptap-demo name="Extensions/Collaboration"></tiptap-demo>
