# Collaboration
The Collaboration extension enables you to collaborate with others on one document. The implementation is based on [Y.js by Kevin Jahns](https://github.com/yjs/yjs), which is the coolest thing to [integrate collaborative editing](/guide/collaborative-editing) in your project.

:::premium Pro Extension
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
| Option   | Type     | Default | Description                                                                                          |
| -------- | -------- | ------- | ---------------------------------------------------------------------------------------------------- |
| provider | `Object` | `null`  | A Y.js network connection, for example a [y-websocket](https://github.com/yjs/y-websocket) instance. |

## Commands
*None*

## Keyboard shortcuts
*None*

## Source code
[packages/extension-collaboration/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-collaboration/)

## Usage
:::warning Public
The content of this editor is shared with other users.
:::
<demo name="Extensions/Collaboration" highlight="10,26-27,34-36" />
