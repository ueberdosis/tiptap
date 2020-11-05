# Dropcursor
This extension loads the [ProseMirror Gapcursor plugin](https://github.com/ProseMirror/prosemirror-gapcursor) by Marijn Haverbeke, which adds a gap for the cursor in places that don’t allow regular selection. For example, after a table at the end of a document.

Note that tiptap is renderless, but the dropcursor needs CSS for its appearance. The default CSS is added to the usage example below.

## Installation
```bash
# with npm
npm install @tiptap/extension-dropcursor

# with Yarn
yarn add @tiptap/extension-dropcursor
```

## Source code
[packages/extension-dropcursor/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-dropcursor/)

## Usage
<demo name="Extensions/Dropcursor" highlight="" />
