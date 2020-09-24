# Generate HTML from ProseMirror JSON

If you need to render the content on the server side, e. g. for a blog post that was written with tiptap, you’ll probably need a way to do just that without an actual editor instance.

That’s what `generateHtml()` is for. It’s a utility function that renders HTML without an actual editor instance.

:::warning Work in progress
Currently, that works only in the browser (client side), but we plan to bring this to Node.js (to use it on the server side).
:::

<demo name="Api/Schema/GenerateHtml" highlight="6,29-33"/>

## Converting JSON<>HTML with PHP

We needed to do the same thing in PHP at some point, so we published libraries to convert ProseMirror JSON to HTML and vice-versa:

* [ueberdosis/prosemirror-php](https://github.com/ueberdosis/prosemirror-php) (PHP)
* [ueberdosis/prosemirror-to-html](https://github.com/ueberdosis/prosemirror-to-html) (PHP)
* [ueberdosis/html-to-prosemirror](https://github.com/ueberdosis/html-to-prosemirror) (PHP)
