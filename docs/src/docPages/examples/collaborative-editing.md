---
tableOfContents: true
---

# Collaborative editing

:::pro Commercial use
Using the collaborative editing commercially? [Become a sponsor](/sponsor) to fund its development!
:::

## toc

## Introduction
This example shows how you can use tiptap to let multiple users collaborate in the same document in real-time.

It connects all clients to a WebSocket server and merges changes to the document with the power of [Y.js](https://github.com/yjs/yjs). If you want to learn more about collaborative text editing, check out [our guide on collaborative editing](/guide/collaborative-editing).

## Example
:::warning Shared Document
Be nice! The content of this editor is shared with other users from the Internet.
:::

<demo name="Examples/CollaborativeEditing" />

## Backend
In case you’re wondering what kind of sorcery you need on the server to achieve this, here is the whole backend code for the demo:

:::warning Request early access
Our plug & play collaboration backend hocuspocus is still work in progress. If you want to give it a try, [get early access](https://www.hocuspocus.dev).
:::

```js
import { Server } from '@hocuspocus/server'
import { RocksDB } from '@hocuspocus/extension-rocksdb'

const server = Server.configure({
  port: 80,
  extensions: [
    new RocksDB({ path: './database' }),
  ],
})

server.listen()
```
