# Bold
[![Version](https://img.shields.io/npm/v/@tiptap/extension-bold.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-bold)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-bold.svg)](https://npmcharts.com/compare/@tiptap/extension-bold?minimal=true)

Use this extension to render text in **bold**. If you pass `<strong>`, `<b>` tags, or text with inline `style` attributes setting the `font-weight` CSS rule in the editor’s initial content, they all will be rendered accordingly.

Type `**two asterisks**` or `__two underlines__` and it will magically transform to **bold** text while you type.

::: warning Restrictions
The extension will generate the corresponding `<strong>` HTML tags when reading contents of the `Editor` instance. All text marked bold, regardless of the method will be normalized to `<strong>` HTML tags.
:::

## Installation
```bash
# with npm
npm install @tiptap/extension-bold

# with Yarn
yarn add @tiptap/extension-bold
```

## Settings

### HTMLAttributes
Custom HTML attributes that should be added to the rendered HTML tag.

```js
Bold.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

## Commands

### setBold()
Mark text as bold.

```js
editor.commands.setBold()
```

### toggleBold()
Toggle the bold mark.

```js
editor.commands.toggleBold()
```

### unsetBold()
Remove the bold mark.

```js
editor.commands.unsetBold()
```

## Keyboard shortcuts
| Command      | Windows/Linux      | macOS          |
| ------------ | ------------------ | -------------- |
| toggleBold() | `Control`&nbsp;`B` | `Cmd`&nbsp;`B` |

## Source code
[packages/extension-bold/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-bold/)

## Usage
<tiptap-demo name="Marks/Bold"></tiptap-demo>
