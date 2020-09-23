# Italic
Use this extension to render text in *italic*. If you pass `<em>`, `<i>` tags, or text with inline `style` attributes setting `font-style: italic` in the editor’s initial content, they all will be rendered accordingly.

Type `*one asterisk*` or `_one underline_` and it will magically transform to *italic* text while you type.

::: warning Restrictions
The extension will generate the corresponding `<em>` HTML tags when reading contents of the `Editor` instance. All text marked italic, regardless of the method will be normalized to `<em>` HTML tags.
:::

## Installation
```bash
# With npm
npm install @tiptap/extension-italic

# Or: With Yarn
yarn add @tiptap/extension-italic
```

## Settings
| Option | Type   | Default | Description                                  |
| ------ | ------ | ------- | -------------------------------------------- |
| class  | string | –       | Add a custom class to the rendered HTML tag. |

## Commands
| Command | Options | Description       |
| ------- | ------- | ----------------- |
| italic  | —       | Mark text italic. |

## Keyboard shortcuts
* Windows & Linux: `Control` + `I`
* macOS: `Command` + `I`

## Source code
[packages/extension-italic/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-italic/)

## Usage
<demo name="Extensions/Italic" highlight="3-5,17,36" />
