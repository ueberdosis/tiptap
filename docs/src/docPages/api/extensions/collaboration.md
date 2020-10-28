# Collaboration
The Collaboration extension enables you to collaborate with others on one document. The implementation is based on [Y.js by Kevin Jahns](https://github.com/yjs/yjs), which is the coolest thing to [integrate collaborative editing](/guide/collaborative-editing) in your project.

:::premium Premium Extension
Using this in production requires a **tiptap pro** license. [Read more](/tiptap-pro)
:::

## Installation
```bash
# With npm
npm install @tiptap/extension-collaboration yjs y-webrtc

# Or: With Yarn
yarn add @tiptap/extension-collaboration yjs y-webrtc
```

## Settings
| Option   | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| provider |      |         |             |
| type     |      |         |             |

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
<demo name="Extensions/Collaboration" highlight="" />
