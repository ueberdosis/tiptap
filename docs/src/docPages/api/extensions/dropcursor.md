# Dropcursor
This extension loads the [ProseMirror Dropcursor plugin](https://github.com/ProseMirror/prosemirror-dropcursor) by Marijn Haverbeke, which shows a cursor at the drop position when something is dragged over the editor.

Note that tiptap is headless, but the dropcursor needs CSS for its appearance. The default CSS is added to the usage example below.

## Installation
```bash
# with npm
npm install @tiptap/extension-dropcursor

# with Yarn
yarn add @tiptap/extension-dropcursor
```

## Settings
| Option | Type     | Default   | Description                                                           |
| ------ | -------- | --------- | --------------------------------------------------------------------- |
| color  | `String` | `'black'` | Color of the dropcursor.                                              |
| width  | `Number` | `1`       | Width of the dropcursor.                                              |
| class  | `String` | –         | One or multiple CSS classes that should be applied to the dropcursor. |

## Source code
[packages/extension-dropcursor/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-dropcursor/)

## Usage
<demo name="Extensions/Dropcursor" highlight="12,33" />
