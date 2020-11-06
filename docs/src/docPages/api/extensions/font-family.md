# FontFamily
This extension enables you to set the font family in the editor.

## Installation
::: warning Use with TextStyle
This extension requires the [`TextStyle`](/api/marks/text-style) mark.
:::

```bash
# with npm
npm install @tiptap/extension-text-style @tiptap/extension-font-family

# with Yarn
yarn add @tiptap/extension-text-style @tiptap/extension-font-family
```

## Settings
| Option | Type  | Default       | Description                                                           |
| ------ | ----- | ------------- | --------------------------------------------------------------------- |
| types  | array | ['textStyle'] | A list of marks where the font family attribute should be applied to. |

## Source code
[packages/extension-font-family/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-font-family/)

## Usage
<demo name="Extensions/FontFamily" highlight="" />
