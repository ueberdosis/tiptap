# Placeholder
[![Version](https://img.shields.io/npm/v/@tiptap/extension-placeholder.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-placeholder)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-placeholder.svg)](https://npmcharts.com/compare/@tiptap/extension-placeholder?minimal=true)

This extension provides placeholder support.

## Installation
```bash
# with npm
npm install @tiptap/extension-placeholder

# with Yarn
yarn add @tiptap/extension-placeholder
```

## Settings
| Option               | Type                | Default               | Description                                                 |
| -------------------- | ------------------- | --------------------- | ----------------------------------------------------------- |
| emptyEditorClass     | `String`            | `'is-editor-empty'`   | The added CSS class if the editor is empty.                 |
| emptyNodeClass       | `String`            | `'is-empty'`          | The added CSS class if the node is empty.                   |
| placeholder          | `String | Function` | `'Write something …'` | The placeholder text added as `data-placeholder` attribute. |
| showOnlyWhenEditable | `Boolean`           | `true`                | Show decorations only when editor is editable.              |
| showOnlyCurrent      | `Boolean`           | `true`                | Show decorations only in currently selected node.           |

## Source code
[packages/extension-placeholder/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-placeholder/)

## Usage
<demo name="Extensions/Placeholder" />
