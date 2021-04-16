# Collaborative editing

## toc

## Introduction
Real-time collaboration, syncing between different devices and working offline used to be hard. We provide everything you need to keep everything in sync, conflict-free with the power of [Y.js](https://github.com/yjs/yjs). The following guide explains all things to take into account when you consider to make tiptap collaborative. Don’t worry, a production-grade setup doesn’t require much code.

## Configure the editor
The underyling schema tiptap uses is an excellent foundation to sync documents. With the [`Collaboration`](/api/extensions/collaboration) you can tell tiptap to track changes to the document with [Y.js](https://github.com/yjs/yjs).

Y.js is a conflict-free replicated data types implementation, or in other words: It’s reaaally good in merging changes. And to achieve that, changes don’t have to come in order. It’s totally fine to change a document while being offline and merge it with other changes when the device is online again.

But somehow, all clients need to interchange document modifications at some point. The most popular technologies to do that are [WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API) and [WebSockets](https://developer.mozilla.org/de/docs/Web/API/WebSocket), so let’s have a closer look at those:

### WebRTC
WebRTC uses a server only to connect clients with each other. The actual data is then flowing between the clients, without the server knowing anything about it and that’s great to take the first steps with collaborative editing.

First, install the dependencies:

```bash
# with npm
npm install @tiptap/extension-collaboration yjs y-webrtc

# with Yarn
yarn add @tiptap/extension-collaboration yjs y-webrtc
```

Now, create a new Y document, and register it with tiptap:

```js
import { Editor } from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'

// A new Y document
const ydoc = new Y.Doc()
// Registered with a WebRTC provider
const provider = new WebrtcProvider('example-document', ydoc)

const editor = new Editor({
  extensions: [
    // …
    // Register the document with tiptap
    Collaboration.configure({
      document: ydoc,
    }),
  ],
})
```

This should be enough to create a collaborative instance of tiptap. Crazy, isn’t it? Try it out, and open the editor in two different browsers. Changes should be synced between different windows.

So how does this magic work? All clients need to connect with eachother, that’s the job of a *provider*. The [WebRTC provider](https://github.com/yjs/y-webrtc) is the easiest way to get started with, as it requires a public server to connect clients directly with each other, but not to sync the actual changes. This has two downsides, though.

1. Browsers refuse to connect with too many clients. With Y.js it’s enough if all clients are connected indirectly, but even that isn’t possible at some point. Or in other words, it doesn’t scale well for more than 100+ clients in the same document.
2. It’s likely you want to involve a server to persist changes anyway. But the WebRTC signaling server (which connects all clients with eachother) doesn’t receive the changes and therefore doesn’t know what’s in the document.

Anyway, if you want to dive deeper, head over to [the Y WebRTC repository](https://github.com/yjs/y-webrtc) on GitHub.

### WebSocket (Recommended)
For most uses cases, the WebSocket provider is the recommended choice. It’s very flexible and can scale very well. For the client, the example is nearly the same, only the provider is different. First, let’s install the dependencies:

```bash
# with npm
npm install @tiptap/extension-collaboration yjs y-websocket

# with Yarn
yarn add @tiptap/extension-collaboration yjs y-websocket
```

And then register the WebSocket provider with tiptap:

```js
import { Editor } from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

// A new Y document
const ydoc = new Y.Doc()
// Registered with a WebSocket provider
const provider = new WebsocketProvider('ws://127.0.0.1:1234', 'example-document', ydoc)

const editor = new Editor({
  extensions: [
    // …
    // Register the document with tiptap
    Collaboration.configure({
      document: ydoc,
    }),
  ],
})
```

That example doesn’t work out of the box. As you can see, it’s configured to talk to a WebSocket server which is available under `ws://127.0.0.1:1234` (WebSocket protocol `ws://`, your local IP `127.0.0.1` and the port `1234`). You need to set this up, too.

#### The WebSocket backend
To make the server part as easy as possible, we provide [an opinionated server package, called hocuspocus](http://hocuspocus.dev/) (not published yet). Let’s go through, how this will work once its released.

Create a new project, and install the hocuspocus server as a dependency:

```bash
# with npm
npm install @hocuspocus/server

# with Yarn
yarn add @hocuspocus/server
```

Create an `index.js` and throw in the following content, to create, configure and start your very own WebSocket server:

```js
import { Server } from '@hocuspocus/server'

const server = Server.configure({
  port: 1234,
})

server.listen()
```

That’s all. Start the script with:

```bash
node ./index.js
```

<!-- TODO: This should output something like “Listening on ws://127.0.0.1:1234”.  -->
Try opening http://127.0.0.1:1234 in your browser. You should see a plain text `OK` if everything works fine.

Go back to your tiptap editor and hit reload, it should now connect to the WebSocket server and changes should sync with all other clients. Amazing, isn’t it?

### Multiple network providers
You can even combine multiple providers. That’s not needed, but could keep clients connected, even if one connection - for example the WebSocket server - goes down for a while. Here is an example:

```js
new WebrtcProvider('example-document', ydoc)
new WebsocketProvider('ws://127.0.0.1:1234', 'example-document', ydoc)
```

Yes, that’s all.

Keep in mind that WebRTC needs a signaling server to connect clients. This signaling server doesn’t receive the synced data, but helps to let clients find each other. You can [run your own signaling server](https://github.com/yjs/y-webrtc#signaling), if you like. Otherwise it’s using a default URL baked into the package.

### Show other cursors
To enable users to see the cursor and text selections of each other, add the [`CollaborationCursor`](/api/extensions/collaboration-cursor) extension.

```js
import { Editor } from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

const ydoc = new Y.Doc()
const provider = new WebsocketProvider('ws://127.0.0.1:1234', 'example-document', ydoc)

const editor = new Editor({
  extensions: [
    Collaboration.configure({
      document: ydoc,
    }),
    // Register the collaboration cursor extension
    CollaborationCursor.configure({
      provider: provider,
      name: 'Cyndi Lauper',
      color: '#f783ac',
    }),
    // …
  ],
})
```

As you can see, you can pass a name and color for every user. Look at the [collaborative editing example](/examples/collaborative-editing), to see a more advanced example.

### Offline support
Adding offline support to your collaborative editor is basically a one-liner, thanks to the fantastic [Y IndexedDB adapter](https://github.com/yjs/y-indexeddb). Install it:

```bash
# with npm
npm install y-indexeddb

# with Yarn
yarn add y-indexeddb
```

And connect it with a Y document:

```js
import { Editor } from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'
import { IndexeddbPersistence } from 'y-indexeddb'

const ydoc = new Y.Doc()

// Store the Y document in the browser
new IndexeddbPersistence('example-document', ydoc)

const editor = new Editor({
  extensions: [
    // …
    Collaboration.configure({
      document: ydoc,
    }),
  ],
})
```

All changes will be stored in the browser then, even if you close the tab, go offline, or make changes while working offline. Next time you are online, the WebSocket provider will try to find a connection and eventually sync the changes.

Yes, it’s magic. As already mentioned, that is all based on the fantastic Y.js framework. And if you’re using it, or our integration, you should definitely [sponsor Kevin Jahns on GitHub](https://github.com/dmonad), he is the brain behind Y.js.

## Our plug & play collaboration backend
Our collaborative editing backend handles the syncing, authorization, persistence and scaling. Let’s go through a few common use cases here!

:::warning Request early access
Our plug & play collaboration backend hocuspocus is still work in progress. If you want to give it a try, [request early access](https://www.hocuspocus.dev).
:::

### The document name
The document name is `'example-document'` in all examples here, but it could be any string. In a real-world app you’d probably add the name of your entity and the ID of the entity. Here is how that could look like:

```js
const documentName = 'page.140'
```

In the backend, you can split the string to know the user is typing on a page with the ID 140 to manage authorization and such accordingly. New documents are created on the fly, no need to tell the backend about them, besides passing a string to the provider.

And if you’d like to sync multiple fields with one Y.js document, just pass different fragment names to the collaboration extension:

```js
// a tiptap instance for the field
Collaboration.configure({
  document: ydoc,
  field: 'title',
})

// and another instance for the summary, both in the same Y.js document
Collaboration.configure({
  document: ydoc,
  field: 'summary',
})
```

If your setup is somehow more complex, for example with nested fragments, you can pass a raw Y.js fragment too. `document` and `field` will be ignored then.

```js
// a raw Y.js fragment
Collaboration.configure({
  fragment: ydoc.getXmlFragment('custom'),
})
```

### Authentication
With the `onConnect` hook you can write a custom Promise to check if a client is authenticated. That can be a request to an API, to a microservice, a database query, or whatever is needed, as long as it’s executing `resolve()` at some point. You can also pass contextual data to the `resolve()` method which will be accessible in other hooks.

```js
import { Server } from '@hocuspocus/server'

const server = Server.configure({
  onConnect(data, resolve, reject) {
    // You can set contextual data…
    const context = {
      user: {
        id: 1234,
        name: 'John',
      },
    }

    // …and pass it along to use it in other hooks
    resolve(context)
  },
})

server.listen()
```

### Authorization
With the `onConnect` hook you can check if a user is authorized to edit the current document. This works in the same way the [Authentication](#authentication) works.

```js
import { Server } from '@hocuspocus/server'

const server = Server.configure({
  onConnect(data, resolve, reject) {
    const { requestParameters } = data

    // Example: Check if a user is authenticated using a request parameter
    if (requestParameters.access_token !== 'super-secret-token') {
      return reject()
    }

    resolve()
  },
})

server.listen()
```

### Persist the document
By default, documents are only stored in the memory. Hence they are deleted when the WebSocket server is stopped. To prevent this, store changes on the hard disk with the RocksDB adapter. When you restart the server, it’ll restore documents from the hard disk, in that case from the `./database` folder:

```js
import { Server } from '@hocuspocus/server'
import { RocksDB } from '@hocuspocus/rocksdb'

const server = Server.configure({

  extensions: [
    new RocksDB({
      // Store the actual data in that folder:
      path: './database',
    })
  ],

})

server.listen()
```

### Store the documents as JSON
To pass the updated documents to an API, to a database, or store on it on the hard disk as JSON, you can use the `onChange` hook, which is executed when a document changes.

```js
import { writeFile } from 'fs'
import { Server } from '@hocuspocus/server'
import { yDocToProsemirrorJSON } from 'y-prosemirror'

const hocuspocus = Server.configure({
  onChange(data) {
    const save = () => {
      // Get the underlying Y Document
      const ydoc = data.document

      // Convert the Y Document to the format your editor uses, in this
      // example Prosemirror JSON for the tiptap editor
      const prosemirrorDocument = yDocToProsemirrorJSON(ydoc, 'default')

      // Save your document. In a real-world app this could be a database query
      // a webhook or something else
      writeFile(
        `/path/to/your/documents/${data.documentName}.json`,
        prosemirrorDocument
      )
    }
  },
})

hocuspocus.listen()
```

### Scale with Redis (Advanced)

:::warning Keep in mind
The redis adapter only syncs document changes. Collaboration cursors are not yet supported.
:::

To scale the WebSocket server, you can spawn multiple instances of the server behind a load balancer and sync changes between the instances through Redis. Import the Redis adapter and register it with hocuspocus. For a full documentation on all available redis and redis cluster options, check out the [ioredis API docs](https://github.com/luin/ioredis/blob/master/API.md).

```js
import { Server } from '@hocuspocus/server'
import { Redis } from '@hocuspocus/redis'

const server = Server.configure({
  extensions: [
    new Redis({
      host: '127.0.0.1',
      port: 6379,
    })
  ],
})

server.listen()
```

If you want to use a redis cluster, use the redis cluster adapter:

```js
import { Server } from '@hocuspocus/server'
import { RedisCluster } from '@hocuspocus/redis'

const server = Server.configure({
  extensions: [
    new RedisCluster({
      scaleReads: 'all',
      redisOptions: {
        host: '127.0.0.1',
        port: 6379,
      },
    })
  ],
})

server.listen()
```

## Pitfalls

### Schema updates
tiptap is very strict with the [schema](/api/schema), that means, if you add something that’s not allowed according to the configured schema it’ll be thrown away. That can lead to a strange behaviour when multiple clients with different schemas share changes to a document.

Let’s say you added an editor to your app and the first people use it already. They have all a loaded instance of tiptap with all default extensions, and therefor a schema that only allows those. But you want to add task lists in the next update, so you add the extension and deploy again.

A new user opens your app and has the updated schema (with task lists), while all others still have the old schema (without task lists). The new user checks out the newly added tasks lists and adds it to a document to show that feature to other users in that document. But then, it magically disappears right after she added it. What happened?

When one user adds a new node (or mark), that change will be synced to all other connected clients. The other connected clients apply those changes to the editor, and tiptap, strict as it is, removes the newly added node, because it’s not allowed according to their (old) schema. Those changes will be synced to other connected clients and oops, it’s removed everywhere. To avoid this you have a few options:

1. Never change the schema (not cool).
2. Force clients to update when you deploy a new schema (tough).
3. Keep track of the schema version and disable the editor for clients with an outdated schema (depends on your setup).

It’s on our list to provide features to make that easier. If you’ve got an idea how to improve that, share it with us!
