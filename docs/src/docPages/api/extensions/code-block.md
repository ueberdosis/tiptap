# CodeBlock
With the CodeBlock extension you can add fenced code blocks to your documents. It’ll wrap the code in `<pre>` and `<code>` HTML tags.

Type three backticks and a space (`\`` ) and a code block is instantly added for you.

::: warning Restrictions
The CodeBlock extension doesn’t come with styling and has no syntax highlighting built-in. It’s on our roadmap though.
:::

## Options
| Option | Type   | Default | Description                                  |
| ------ | ------ | ------- | -------------------------------------------- |
| class  | string | –       | Add a custom class to the rendered HTML tag. |

## Commands
| Command   | Options | Description                   |
| --------- | ------- | ----------------------------- |
| codeBlock | —       | Wrap content in a code block. |

## Keyboard shortcuts
* `Shift` + `Control` + `\`

## Source code
[packages/extension-code-block/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-code-block/)

## Usage
<demo name="Extensions/CodeBlock" highlight="3-5,17,36" />
