# Placeholder
[![Version](https://img.shields.io/npm/v/@tiptap/extension-placeholder.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-placeholder)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-placeholder.svg)](https://npmcharts.com/compare/@tiptap/extension-placeholder?minimal=true)

This extension provides placeholder support. Give your users an idea what they should write with a tiny hint. There is a handful of things to customize, if you feel like it.

## Installation
```bash
# with npm
npm install @tiptap/extension-placeholder

# with Yarn
yarn add @tiptap/extension-placeholder
```

## Settings

### emptyEditorClass
The added CSS class if the editor is empty.

Default: `'is-editor-empty'`

```js
Placeholder.configure({
  emptyEditorClass: 'is-editor-empty',
})
```

### emptyNodeClass
The added CSS class if the node is empty.

Default: `'is-empty'`

```js
Placeholder.configure({
  emptyNodeClass: 'my-custom-is-empty-class',
})
```

### placeholder
The placeholder text added as `data-placeholder` attribute.

Default: `'Write something …'`

```js
Placeholder.configure({
  placeholder: 'My Custom Placeholder',
})
```

You can even use a function to add placeholder depending on the node:

```js
Placeholder.configure({
  placeholder: ({ node }) => {
    if (node.type.name === 'heading') {
      return 'What’s the title?'
    }

    return 'Can you add some further context?'
  },
})
```

### showOnlyWhenEditable
Show decorations only when editor is editable.

Default: `true`

```js
Placeholder.configure({
  showOnlyWhenEditable: false,
})
```

### showOnlyCurrent
Show decorations only in currently selected node.

Default: `true`

```js
Placeholder.configure({
  showOnlyCurrent: false
})
```


## Source code
[packages/extension-placeholder/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-placeholder/)

## Usage
<tiptap-demo name="Extensions/Placeholder"></tiptap-demo>
