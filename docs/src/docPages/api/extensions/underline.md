# Underline
Use this extension to render text <u>underlined</u>. If you pass `<u>` tags, or text with inline `style` attributes setting `text-decoration: underline` in the editor’s initial content, they all will be rendered accordingly.

::: warning Restrictions
The extension will generate the corresponding `<u>` HTML tags when reading contents of the `Editor` instance. All text marked underlined, regardless of the method will be normalized to `<u>` HTML tags.
:::

## Options
| Option | Type   | Default | Description                                  |
| ------ | ------ | ------- | -------------------------------------------- |
| class  | string | –       | Add a custom class to the rendered HTML tag. |

## Commands
| Command   | Options | Description              |
| --------- | ------- | ------------------------ |
| underline | —       | Mark text as underlined. |

## Keyboard shortcuts
* Windows & Linux: `Control` + `U`
* macOS: `Command` + `U`

## Source code
[packages/extension-underline/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-underline/)

## Usage
<demo name="Extensions/Underline" highlight="3-5,17,36" />