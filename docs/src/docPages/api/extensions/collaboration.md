# Collaboration
The Collaboration extension enables you to collaborate with others on one document. The implementation is based on [Y.js by Kevin Jahns](https://github.com/yjs/yjs), which is the coolest thing to [integrate collaborative editing](/guide/collaborative-editing) in your project.

:::premium Pro Extension
We kindly ask you to sponsor us, before using this extension in production. [Read more](/sponsor)
:::

## Installation
```bash
# with npm
npm install @tiptap/extension-collaboration yjs y-webrtc

# with Yarn
yarn add @tiptap/extension-collaboration yjs y-webrtc
```

## Settings
<!-- TODO -->
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
<demo name="Extensions/Collaboration" highlight="10-12,30-32,43-46,53" />
