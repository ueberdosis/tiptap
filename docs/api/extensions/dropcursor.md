# Dropcursor
[![Version](https://img.shields.io/npm/v/@tiptap/extension-dropcursor.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-dropcursor)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-dropcursor.svg)](https://npmcharts.com/compare/@tiptap/extension-dropcursor?minimal=true)

This extension loads the [ProseMirror Dropcursor plugin](https://github.com/ProseMirror/prosemirror-dropcursor) by Marijn Haverbeke, which shows a cursor at the drop position when something is dragged into the editor.

Note that tiptap is headless, but the dropcursor needs CSS for its appearance. There are settings for the color and width, and you’re free to add a custom CSS class.

## Installation
```bash
# with npm
npm install @tiptap/extension-dropcursor

# with Yarn
yarn add @tiptap/extension-dropcursor
```

## Settings
| Option | Type     | Default          | Description                                                           |
| ------ | -------- | ---------------- | --------------------------------------------------------------------- |
| color  | `String` | `'currentcolor'` | Color of the dropcursor.                                              |
| width  | `Number` | `1`              | Width of the dropcursor.                                              |
| class  | `String` | –                | One or multiple CSS classes that should be applied to the dropcursor. |

## Source code
[packages/extension-dropcursor/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-dropcursor/)

## Usage
<tiptap-demo name="Extensions/Dropcursor"></tiptap-demo>
