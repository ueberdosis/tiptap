# Bold
This extension is used to render text in **bold**. If you pass `<strong>`, `<b>` tags, or text with inline `style` attributes setting the `font-weight` CSS rule in the editor’s initial content, they will all be rendered accordingly.

::: warning Restrictions
The extension will generate the corresponding `<strong>` HTML tags when reading contents of the `Editor` instance. All text marked bold, regardless of the method will be normalized to `<strong>` HTML tags.
:::

## Options
*None*

## Commands
| Command | Options | Description |
| ------- | ------- | ----------- |
| bold | — | Mark text bold. |

## Keybindings
* Windows & Linux: `Control` + `B`
* macOS: `Command` + `B`

## Source Code
[packages/extension-bold/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-bold/)

## Usage
<demo name="Extensions/Bold" highlight="3-5,17,36" />