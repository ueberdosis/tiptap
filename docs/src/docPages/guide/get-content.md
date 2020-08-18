# Get Content

## Working with JSON

## Working with HTML

## tiptap doesn’t work with Markdown

Unfortunately, tiptap doesn’t support Markdown as input/output format. We considered to add support for it, but there are a few limitations:

* HTML or JSON can have deeply nested structures, Markdown not
* Tables are not part of the Markdown standard, and can’t be easily stored and restored from Markdown

You should really consider to work with HTML or JSON to store your content. If you still think you need Markdown, Nextcloud uses tiptap to work with Markdown. There code is open source, so maybe you can learn from them.