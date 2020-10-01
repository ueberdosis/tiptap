# Custom styling

## Table of Contents

## Introduction
Tiptap is renderless, that doesn’t mean there is no styling provided. You can decided how your editor should look like.

## Option 1: Style the plain HTML
The whole editor is rendered inside of a container with the class `.ProseMirror`. You can use that to scope your styling to the editor content:

```css
/* Scoped to the editor */
.ProseMirror p&nbsp;{
  margin: 1em 0;
}
```

If you’re rendering the stored content somewhere, there won’t be a `.ProseMirror` container, so you can just globally add styling to the used HTML tags:

```css
/* Global styling */
p&nbsp;{
  margin: 1em 0;
}
```


## Option 2: Add custom classes
Most extensions have a `class` option, which you can use to add a custom CSS class to the HTML tag.

```js
/* Add custom classes */
new Editor({
  extensions: [
    Document(),
    Paragraph({
      class: 'my-custom-paragraph',
    }),
    Heading({
      class: 'my-custom-heading',
    }),
    Text(),
  ]
})
```

The rendered HTML will look like that:

```html
<h1 class="my-custom-heading">Example Text</p>
<p class="my-custom-paragraph">Wow, that’s really custom.</p>
```

## Option 3: Customize the HTML
You can even customize the markup for every extension. This will make a custom bold extension that doesn’t render a `<strong>` tag, but a `<b>` tag:

```js
/* Customizing the markup */
import Bold from '@tiptap/extension-bold'

const CustomBold = Bold
  .schema(() => ({
    toDOM: () => ['b', 0],
  }))
  .create()

new Editor({
  extensions: [
      // …
      CustomBold(),
  ]
})
```

You should put your custom extensions in separate files though, but I think you’ve got the idea.
