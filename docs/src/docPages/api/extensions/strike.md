# Strike
This extension is used to render ~~striked text~~. If you pass `<s>`, `<del>`, `<strike>` tags, or text with inline `style` attributes setting `text-decoration: line-through` in the editor’s initial content, they all will be rendered accordingly.

Type `~~two tildes~~` and the it will be magically ~~striked through~~ while you type.

::: warning Restrictions
The extension will generate the corresponding `<s>` HTML tags when reading contents of the `Editor` instance. All text striked through, regardless of the method will be normalized to `<s>` HTML tags.
:::

## Options
| Option | Type   | Default | Description                                  |
| ------ | ------ | ------- | -------------------------------------------- |
| class  | string | –       | Add a custom class to the rendered HTML tag. |

## Commands
| Command | Options | Description                 |
| ------- | ------- | --------------------------- |
| strike  | —       | Mark text as strikethrough. |

## Keyboard shortcuts
* Windows & Linux: `Control` + `D`
* macOS: `Command` + `D`

## Source Code
[packages/extension-strike/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-strike/)

## Usage
<demo name="Extensions/Strike" highlight="3-5,17,36" />
