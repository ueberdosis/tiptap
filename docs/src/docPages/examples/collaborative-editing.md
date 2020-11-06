# Collaborative editing

:::premium Requires Pro Extensions
We kindly ask you to sponsor us, before using this example in production. [Read more](/sponsor)
:::

This example shows how you can use tiptap to let different users collaboratively work on the same text in real-time.

It connects client with WebRTC and merges changes to the document (no matter where they come from) with the awesome library [Y.js](https://github.com/yjs/yjs) by Kevin Jahns. Be aware that in a real-world scenario you would probably add a server, which is also able to merge changes with Y.js.

If you want to learn more about collaborative text editing, [check out our guide on that topic](/guide/collaborative-editing). Anyway, it’s showtime now:

:::warning Shared Document
Be nice! The content of this editor is shared with other users from the Internet.
:::

<!-- <demo name="Examples/CollaborativeEditing" :show-source="false"/> -->

<demo name="Examples/CollaborativeEditing" />
