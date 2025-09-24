---
'@tiptap/extension-unique-id': minor
---

Create a utility to add unique IDs to a document in the server

The utility is called `generateUniqueIds` and is exported from the `@tiptap/extension-unique-id` package.

It has the same functionality as the `UniqueID` extension, but without the need to create an `Editor` instance. This lets you add unique IDs to the document in the server.

It takes the following parameters:

- `doc`: The Tiptap JSON document to add unique IDs to.
- `extensions`: The extensions to use. Must include the `UniqueID` extension.

It returns the updated Tiptap JSON document, with the unique IDs added to the nodes.

