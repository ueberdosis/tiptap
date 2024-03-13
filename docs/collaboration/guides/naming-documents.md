# Naming documents with unique identifiers

This guide outlines best practices for naming documents and organizing content within a single document, to help you define your own document structure.

For a comprehensive understanding of how to choose document names, you should review our [authorization guide](https://tiptap.dev/docs/editor/collaboration/authenticate#authorization-in-collaboration), as document naming plays a crucial role in access control as well.

## Structuring document names

Tiptap Collaboration uses document names to facilitate collaborative sessions, they serve as unique identifiers that link users to the same document.

While the following example uses an entity's name combined with a unique ID, typical for CMS applications, you're free to adopt any naming convention that suits your application's requirements.

```tsx
const documentName = "article.123";
```

This naming format allows you to separate out the key details easily:

```tsx
const documentName = "article.123";

// Splitting the document name into separate parts
const [entityType, entityID] = documentName.split(".");

console.log(entityType); // Output: "article"
console.log(entityID); // Output: "123"
```

## Managing nested documents with fragments

Yjs's fragments are ideal for handling complex documents with clear sections. This might relevant in case you want to nest your documents, like for example a blog post with separate `title` and `content` parts.

With fragments, you can use one Y.Doc instance (e.g. one document) and use different editors for its distinct sections.

For example, in this blog post setup:

```tsx
const ydoc = new Y.Doc();

const titleEditor = new Editor({
  extensions: [
    Collaboration.configure({
      document: this.ydoc,
      field: "title",
    }),
  ],
})

const bodyEditor = new Editor({
  extensions: [
    Collaboration.configure({
      document: this.ydoc,
      field: "body",
    }),
  ],
})
```


To fully grasp how document naming influences access control in Tiptap Collaboration, it's essential to consult our [authorization guide](https://tiptap.dev/docs/editor/collaboration/authenticate#authorization-in-collaboration).
