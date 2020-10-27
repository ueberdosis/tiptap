# CodeBlock
With the CodeBlock extension you can add fenced code blocks to your documents. It’ll wrap the code in `<pre>` and `<code>` HTML tags.

Type <code>&grave;&grave;&grave;&nbsp;</code> (three backticks and a space) or <code>&Tilde;&Tilde;&Tilde;&nbsp;</code> (three tildes and a space) and a code block is instantly added for you. You can even specify the language, try writing <code>&grave;&grave;&grave;css&nbsp;</code>. That should add a `language-css` class to the `<code>`-tag.

::: warning Restrictions
The CodeBlock extension doesn’t come with styling and has no syntax highlighting built-in. It’s on our roadmap though.
:::

## Installation
```bash
# With npm
npm install @tiptap/extension-code-block

# Or: With Yarn
yarn add @tiptap/extension-code-block
```

## Settings
| Option              | Type   | Default   | Description                                                      |
| ------------------- | ------ | --------- | ---------------------------------------------------------------- |
| class               | string | –         | Add a custom class to the rendered HTML tag.                     |
| languageClassPrefix | string | language- | Adds a prefix to language classes that are applied to code tags. |

## Commands
| Command   | Options | Description                   |
| --------- | ------- | ----------------------------- |
| codeBlock | —       | Wrap content in a code block. |

## Keyboard shortcuts
* Windows/Linux: `Control`&nbsp;`Shift`&nbsp;`C`
* macOS: `Cmd`&nbsp;`Shift`&nbsp;`C`

## Source code
[packages/extension-code-block/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-code-block/)

## Usage
<demo name="Extensions/CodeBlock" highlight="3-5,17,36" />
