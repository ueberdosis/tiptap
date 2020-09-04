# Generate HTML from ProseMirror JSON

If you need to render the content on the server side, e. g. for a blog post that was written with tiptap, you’ll probably need a way to do just that without an actual editor instance.

<demo name="Api/Schema" />

That should work in the browser (client side) and in Node.js (browser side).

## Converting JSON<>HTML with PHP

We needed to do the same thing in PHP at some point, so we published libraries to convert ProseMirror JSON to HTML and vice-versa:

* [ueberdosis/prosemirror-php](https://github.com/ueberdosis/prosemirror-php) (PHP)
* [ueberdosis/prosemirror-to-html](https://github.com/ueberdosis/prosemirror-to-html) (PHP)
* [ueberdosis/html-to-prosemirror](https://github.com/ueberdosis/html-to-prosemirror) (PHP)
