---
description: Add an image (but a beautiful one), when words aren’t enough.
icon: image-line
---

# Image
[![Version](https://img.shields.io/npm/v/@tiptap/extension-image.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-image)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-image.svg)](https://npmcharts.com/compare/@tiptap/extension-image?minimal=true)

Use this extension to render `<img>` HTML tags. By default, those images are blocks. If you want to render images in line with text  set the `inline` option to `true`.

:::warning Restrictions
This extension does only the rendering of images. It doesn’t upload images to your server, that’s a whole different story.
:::

## Installation
```bash
npm install @tiptap/extension-image
```

## Settings

### inline
Renders the image node inline, for example in a paragraph tag: `<p><img src="spacer.gif"></p>`. By default images are on the same level as paragraphs.

It totally depends on what kind of editing experience you’d like to have, but can be useful if you (for example) migrate from Quill to Tiptap.

Default: `true`

If you pasted images and text, and the image is included in the p, image must be inline. p can't contain both block and inline. 

```js
Image.configure({
  inline: true,
})
```

### allowBase64
Allow images to be parsed as base64 strings `<img src="data:image/jpg;base64...">`.

the placeholdSrc is base64 

Default: `true`

```js
Image.configure({
  allowBase64: true,
})
```

### HTMLAttributes
Custom HTML attributes that should be added to the rendered HTML tag.

```js
Image.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

### placeholderSrc
when the image is uploading, this is value of src.

Default `data:image/svg+xml,${imageSvg}`

```js
Image.configure({
  placeholderSrc: 'url'
})
```

### types
What types of images can be inserted into the editor?

Default `['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']`

```js
Image.configure({
  types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
})
```

### upload
customize the images are pasted or dragged into the editor

Default: `undefined`

```js
Image.configure({
  upload: async fileOrUrl => {
    if (typeof fileOrUrl === 'string') {
      return {
        src: fileOrUrl,
      }
    }

    return {
      src: URL.createObjectURL(fileOrUrl),
    }
  }
})
```

### id
generate the id of the image

Default `() => Math.random().toString(36).substring`

```js
Image.configure({
  id: () => Math.random().toString(36).substring(7),
})
```

## Commands

### setImage()
Makes the current node an image.

```js
editor.commands.setImage({ src: 'https://example.com/foobar.png' })
editor.commands.setImage({ src: 'https://example.com/foobar.png', alt: 'A boring example image', title: 'An example' })
```

## Source code
[packages/extension-image/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-image/)

## Usage
https://embed.tiptap.dev/preview/Nodes/Image
