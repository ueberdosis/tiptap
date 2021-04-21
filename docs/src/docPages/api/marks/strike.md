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
| Option         | Type     | Default | Description                                                           |
| -------------- | -------- | ------- | --------------------------------------------------------------------- |
| HTMLAttributes | `Object` | `{}`    | Custom HTML attributes that should be added to the rendered HTML tag. |

## Commands
| Command      | Parameters | Description           |
| ------------ | ---------- | --------------------- |
| setStrike    | —          | Mark text as striked. |
| toggleStrike | —          | Toggle strike mark.   |
| unsetStrike  | —          | Remove strike mark.   |

## Keyboard shortcuts
* Windows/Linux: `Control`&nbsp;`Shift`&nbsp;`X`
* macOS: `Cmd`&nbsp;`Shift`&nbsp;`X`

## Source code
[packages/extension-strike/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-strike/)

## Usage
<demo name="Marks/Strike" highlight="3-5,17,36" />
