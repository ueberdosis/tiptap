# Collaborative editing

This example shows how you can use tiptap to let multiple users collaborate in the same document in real-time.

It connects all clients to a WebSocket server and merges changes to the document with the power of [Y.js](https://github.com/yjs/yjs). If you want to learn more about collaborative text editing, check out [our guide on collaborative editing](/guide/collaborative-editing).

:::warning Shared Document
Be nice! The content of this editor is shared with other users from the Internet.
:::

<demo name="Examples/CollaborativeEditing" />

In case you’re wondering what kind of sorcery you need on the server to achieve this, here is the backend code for the demo:

```js
import { Server } from '@hocuspocus/server'
import { LevelDB } from '@hocuspocus/leveldb'

const server = Server.configure({
  port: 1234,

  persistence: new LevelDB({
    path: './database',
  }),
})

server.listen()
```
