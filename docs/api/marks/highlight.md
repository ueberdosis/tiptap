# Highlight
[![Version](https://img.shields.io/npm/v/@tiptap/extension-highlight.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-highlight)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-highlight.svg)](https://npmcharts.com/compare/@tiptap/extension-highlight?minimal=true)

Use this extension to render highlighted text with `<mark>`. You can use only default `<mark>` HTML tag, which has a yellow background color by default, or apply different colors.

Type `==two equal signs==` and it will magically transform to <mark>highlighted</mark> text while you type.

## Installation
```bash
# with npm
npm install @tiptap/extension-highlight

# with Yarn
yarn add @tiptap/extension-highlight
```

## Settings

### HTMLAttributes
Custom HTML attributes that should be added to the rendered HTML tag.

```js
Highlight.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

### multicolor
Add support for multiple colors.

Default: `false`

```js
Highlight.configure({
  multicolor: true,
})
```

## Commands

### setHighlight()
Mark text as highlighted.

```js
editor.commands.setHighlight()
editor.commands.setHighlight({ color: '#ffcc00' })
```

### toggleHighlight()
Toggle a text highlight.

```js
editor.commands.toggleHighlight()
editor.commands.toggleHighlight({ color: '#ffcc00' })
```

### unsetHighlight()
 Removes the highlight.

```js
editor.commands. unsetHighlight()
```


## Keyboard shortcuts
| Command           | Windows/Linux                   | macOS                       |
| ----------------- | ------------------------------- | --------------------------- |
| toggleHighlight() | `Control`&nbsp;`Shift`&nbsp;`H` | `Cmd`&nbsp;`Shift`&nbsp;`H` |

## Source code
[packages/extension-highlight/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-highlight/)

## Usage
<tiptap-demo name="Marks/Highlight"></tiptap-demo>
