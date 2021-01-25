# Image
[![Version](https://img.shields.io/npm/v/@tiptap/extension-image.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-image)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-image.svg)](https://npmcharts.com/compare/@tiptap/extension-image?minimal=true)

Use this extension to render `<img>` HTML tags. By default, those images are blocks. If you want to render images in line with text  set the `inline` option to `true`.

:::warning Restrictions
This extension does only the rendering of images. It doesn’t upload images to your server, that’s a whole different story.
:::

## Installation
```bash
# with npm
npm install @tiptap/extension-image

# with Yarn
yarn add @tiptap/extension-image
```

## Settings
| Option         | Type      | Default | Description                                                           |
| -------------- | --------- | ------- | --------------------------------------------------------------------- |
| HTMLAttributes | `Object`  | `{}`    | Custom HTML attributes that should be added to the rendered HTML tag. |
| inline         | `Boolean` | `false` | Renders the image node inline.                                        |

## Source code
[packages/extension-image/](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-image/)

## Usage
<demo name="Nodes/Image" />
