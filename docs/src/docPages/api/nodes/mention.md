# Mention
Honestly, the mention node is amazing. It adds support for `@mentions`, for example to ping users, and provides full control over the rendering.

## Installation
```bash
# with npm
npm install @tiptap/extension-mention

# with Yarn
yarn add @tiptap/extension-mention
```

## Settings
| Option         | Type     | Default | Description                                                           |
| -------------- | -------- | ------- | --------------------------------------------------------------------- |
| HTMLAttributes | `Object` | `{}`    | Custom HTML attributes that should be added to the rendered HTML tag. |
| suggestion     | `Object` | `{ … }` | [Read more](/api/utilities/suggestion)                                |

## Source code
[packages/extension-mention/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-mention/)

## Usage
<demo name="Nodes/Mention" />
