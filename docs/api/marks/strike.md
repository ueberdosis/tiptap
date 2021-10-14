---
description: Cut through the words you wrote, if you’re too afraid to delete it.
icon: strikethrough
---

# Strike
[![Version](https://img.shields.io/npm/v/@tiptap/extension-strike.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-strike)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-strike.svg)](https://npmcharts.com/compare/@tiptap/extension-strike?minimal=true)

Use this extension to render ~~striked text~~. If you pass `<s>`, `<del>`, `<strike>` tags, or text with inline `style` attributes setting `text-decoration: line-through` in the editor’s initial content, they all will be rendered accordingly.

Type <code>&Tilde;&Tilde;text between tildes&Tilde;&Tilde;</code> and it will be magically ~~striked through~~ while you type.

::: warning Restrictions
The extension will generate the corresponding `<s>` HTML tags when reading contents of the `Editor` instance. All text striked through, regardless of the method will be normalized to `<s>` HTML tags.
:::

## Installation
```bash
# with npm
npm install @tiptap/extension-strike

# with Yarn
yarn add @tiptap/extension-strike
```

## Settings

### HTMLAttributes
Custom HTML attributes that should be added to the rendered HTML tag.

```js
Strike.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

## Commands

### setStrike()
Mark text as striked.

```js
editor.commands.setStrike()
```

### toggleStrike()
Toggle strike mark.

```js
editor.commands.toggleStrike()
```

### unsetStrike()
Remove strike mark.

```js
editor.commands.unsetStrike()
```

## Keyboard shortcuts
| Command        | Windows/Linux                   | macOS                       |
| -------------- | ------------------------------- | --------------------------- |
| toggleStrike() | `Control`&nbsp;`Shift`&nbsp;`X` | `Cmd`&nbsp;`Shift`&nbsp;`X` |

## Source code
[packages/extension-strike/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-strike/)

## Usage
<tiptap-demo name="Marks/Strike"></tiptap-demo>
