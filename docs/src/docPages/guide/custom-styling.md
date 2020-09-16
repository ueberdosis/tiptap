# Custom styling
Tiptap is renderless, that doesn’t mean there is no styling provided. You can decided how your editor should look like.

## Option 1: Styling the plain HTML
The content is rendered as HTML, so you can just use that to add styling:

```css
p {
  margin: 1em 0;
}
```

## Option 2: Adding custom classes everywhere
Every node has a `class` option, that you can use to add a custom class to the rendered HTML tag.

```js
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

This will be the result then:

```html
<h1 class="my-custom-heading">Example Text</p>
<p class="my-custom-paragraph">Wow, that’s really custom.</p>
```

## Option 3: Customizing the HTML markup
You can even customize the markup for every extension. This will make a custom bold extension that doesn’t render a `<strong>` tag, but a `<b>` tag:

```js
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
