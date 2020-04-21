# Schema

Unlike many other editors, tiptap is based on a [schema](https://prosemirror.net/docs/guide/#schema) that defines how your content is structured. This allows you to define the kind of nodes that may occur in the document, its attributes and the way they can be nested.

This schema is *very* strict. You can’t use any HTML-element or attribute that is not defined in your schema.

For example if you paste something like `This is <strong>important</strong>` into tiptap and don’t have registered any extension that handles `strong` tags, you’ll only see `This is important`.


