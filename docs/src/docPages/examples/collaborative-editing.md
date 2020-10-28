# Collaborative editing

:::premium Requires Premium Extensions
Using this example in production requires a **tiptap pro** license. [Read more](/tiptap-pro)
:::

This example shows how you can use tiptap to let different users collaboratively work on the same text in real-time.

It connects client with WebRTC and merges changes to the document (no matter where they come from) with the awesome library [Y.js](https://github.com/yjs/yjs) by Kevin Jahns. Be aware that in a real-world scenario you would probably add a server, which is also able to merge changes with Y.js.

If you want to learn more about collaborative text editing, [check out our guide on that topic](/guide/collaborative-editing). Anyway, it’s showtime now:

:::warning The content of this editor is shared with other users from the Internet.
Don’t share your password, credit card numbers or other things you wouldn’t make public.
:::

<!-- <demo name="Examples/Collaboration" :show-source="false"/> -->

<demo name="Examples/CollaborativeEditing" />
