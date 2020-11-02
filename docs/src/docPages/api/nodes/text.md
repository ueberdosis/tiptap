# Text
**The `Text` extension is required**, at least if you want to work with text of any kind and that’s very likely. This extension is a little bit different, it doesn’t even render HTML. It’s plain text, that’s all.

:::warning Breaking Change from 1.x → 2.x
tiptap 1 tried to hide that node from you, but it has always been there. You have to explicitly import it from now on (or use `defaultExtensions()`).
:::

## Installation
```bash
# with npm
npm install @tiptap/extension-text

# with Yarn
yarn add @tiptap/extension-text
```

## Source code
[packages/extension-text/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-text/)

## Usage
<demo name="Extensions/Text" highlight="12,30" />
