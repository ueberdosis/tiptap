# Styling

## toc

## Introduction
tiptap is headless, that means there is no styling provided. That also means, you are in full control of how your editor looks. The following methods allow you to apply custom styles to the editor.

## Option 1: Style the plain HTML
The whole editor is rendered inside of a container with the class `.ProseMirror`. You can use that to scope your styling to the editor content:

```css
/* Scoped to the editor */
.ProseMirror p {
  margin: 1em 0;
}
```

If you’re rendering the stored content somewhere, there won’t be a `.ProseMirror` container, so you can just globally add styling to the used HTML tags:

```css
/* Global styling */
p {
  margin: 1em 0;
}
```


## Option 2: Add custom classes
You can control the whole rendering, including adding classes to everything.

### Extensions
Most extensions allow you to add attributes to the rendered HTML through the `HTMLAttributes` option. You can use that to add a custom class (or any other attribute). That’s also very helpful, when you work with [Tailwind CSS](https://tailwindcss.com/).

```js
new Editor({
  extensions: [
    Document,
    Paragraph.configure({
      HTMLAttributes: {
        class: 'my-custom-paragraph',
      },
    }),
    Heading.configure({
      HTMLAttributes: {
        class: 'my-custom-heading',
      },
    }),
    Text,
  ],
})
```

The rendered HTML will look like that:

```html
<h1 class="my-custom-heading">Example Text</p>
<p class="my-custom-paragraph">Wow, that’s really custom.</p>
```

If there are already classes defined by the extensions, your classes will be added.

### Editor
You can even pass classes to the element which contains the editor like that:

```js
new Editor({
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
    },
  },
})
```

### With Tailwind CSS
The editor works fine with Tailwind CSS, too. Find an example that’s styled with the `@tailwindcss/typography` plugin below.

<iframe
  src="https://codesandbox.io/embed/tiptap-demo-tailwind-iqjz0?fontsize=14&hidenavigation=1&module=%2Fsrc%2Findex.js&theme=dark&view=preview"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="tiptap-demo-tailwind"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

## Option 3: Customize the HTML
Or you can customize the markup for extensions. The following example will make a custom bold extension that doesn’t render a `<strong>` tag, but a `<b>` tag:

```js
import Bold from '@tiptap/extension-bold'

const CustomBold = Bold.extend({
  renderHTML({ HTMLAttributes }) {
    // Original:
    // return ['strong', HTMLAttributes, 0]
    return ['b', HTMLAttributes, 0]
  },
})

new Editor({
  extensions: [
    // …
    CustomBold(),
  ],
})
```

You should put your custom extensions in separate files, but I think you got the idea.

