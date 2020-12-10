# Collaborative editing

:::pro Become a sponsor
Using collaborative editing in production? Do the right thing and [sponsor our work](/sponsor)!
:::

## toc

## Introduction
Real-time collaboration, syncing between different devices and working offline used to be hard. We provide everything you need to keep everything in sync, conflict-free with the power of [Y.js](https://github.com/yjs/yjs). The following guide explains all things to take into account when you consider to make tiptap collaborative. Don’t worry, a production-grade setup doesn’t require much code.

## Configure collaboration
The underyling schema tiptap uses is an excellent foundation to sync documents. With the [`Collaboration`](/api/extensions/collaboration) you can tell tiptap to track changes to the document with [Y.js](https://github.com/yjs/yjs).

Y.js is a conflict-free replicated data types implementation, or in other words: It’s reaaally good in merging changes. And to achieve that, changes don’t have to come in order. It’s totally fine to change a document while being offline and merge the it with other changes when the device is online again.

But somehow, the clients need to interchange document modifications. The most technologies used to do that are WebRTC and WebSocket, so let’s have a look those:

### WebRTC
Anyway, let’s take the first steps. Install the dependencies:

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
      provider
    }),
  ],
})
```

This should be enough to create a collaborative instance of tiptap. Crazy, isn’t it? Try it out, and open the editor in two different browsers. Changes should be synced between different windows.

So how does this magic work? All clients need to connect with eachother, that’s the job of providers. The [WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API) provider is the easiest way to get started with, as it requires a public server to connect clients directly with-each other, but not to sync the actual changes. This has two downsides, though.

On the one hand, browsers refuse to connect with too many clients. With Y.js it’s enough if all clients are connected indirectly, but even that isn’t possible at some point. Or in other words, it doesn’t scale well for more than 100+ clients in the same document.

On the other hand, it’s likely you want to involve a server to persist changes anyway. But the WebRTC signaling server (which connects all clients with eachother) doesn’t receive the changes and therefore doesn’t know what’s in the document.

Anyway, if you want to dive deeper, head over to [the Y WebRTC repository](https://github.com/yjs/y-webrtc) on GitHub.

### WebSocket (Recommended)
For most uses cases, the WebSocket provider is the recommended choice. It’s very flexible and can scale very well. For the client, the example is nearly the same, only the provider is different. Install the dependencies first:

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
      provider
    }),
  ],
})
```

That example doesn’t work out of the box. As you can see, it’s configured to talk to a WebSocket server which is available under `ws://127.0.0.1:1234` (WebSocket protocol, your local IP and port 1234). You need to set this up, too.

To make the server part as easy as possible, we provide you with an opinionated server package, called hocuspocus (NOT PUBLISHED YET). Create a new project, and install the hocuspocus server as a dependency:

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

This should output something like “Listening on ws://127.0.0.1:1234”. If you go back to your tiptap editor and hit reload, it should connect to the WebSocket server and changes should sync with all other clients. Amazing, isn’t it?

### Add cursors
If you want to enable users to see the cursor and text selections of each other, add the [`CollaborationCursor`](/api/extensions/collaboration-cursor) extension.

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
    // …
    Collaboration.configure({
      provider
    }),
    // Register the collaboration cursor extension
    CollaborationCursor.configure({
      provider: this.provider,
      name: 'Cyndi Lauper',
      color: '#f783ac',
    }),
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
const indexdb = new IndexeddbPersistence('example-document', ydoc)

const editor = new Editor({
  extensions: [
    // …
    Collaboration.configure({
      provider
    }),
  ],
})
```

All changes will be stored in the browser then, even if you close the tab, go offline, or make changes while working offline. Next time you are online, the WebSocket provider will try to find a connection and eventually sync the changes.

Yes, it’s magic. As already mentioned, that is all based on the fantastic Y.js framework. And if you’re using it, or our integration, you should definitely [sponsor Kevin Jahns on GitHub](https://github.com/dmonad), he is the brain behind Y.js.

## Store the content
Our collaborative editing backend is ready to handle advanced use cases, like authorization, persistence and scaling. Let’s go through a few common use cases here!

:::warning Work in progress
Our plug & play collaboration backend hocuspocus is still work in progress. We’re setting up a dedicated website and documentation, and need to add one or two features before publishing it.

If you want to give it a try, send us an email to humans@tiptap.dev to receive early access.
:::
<!-- :::pro Backend as a Service (Paid)
Don’t want to wrap your head around the backend part? No worries, we offer a managed backend. For less than 1.000 documents, it’s $49/month (VAT may apply) and probably saves you a ton of time. Send us an email to [humans@tiptap.dev](mailto:humans@tiptap.dev) for further details.
::: -->

### The document name
The document name is `'example-document'` in all examples here, but it could be any string. In a real-world app you’d probably add the name of your entity, the ID of the entity and in some cases even the field (if you have multiple fields that you want to make collaborative). Here is how that could look like for a CMS:

```js
const documentName = 'page.140.content'
```

In the backend, you can split the string to know the user is typing on a page with the ID 140 in the `content` field and manage authorization and such accordingly. New documents are created on the fly, no need to tell the backend about them, besides passing a string to the provider.

### Authentication
With the `onConnect` hook you can write a custom Promise to check if a client is authenticated. That can be a request to an API, to a microservice, a database query, or whatever is needed, as long as it’s executing `resolve()` at some point. You can also pass contextual data to the `resolve()` method which will be accessible in other hooks.

```js
import { Server } from '@hocuspocus/server'

const server = Server.configure({
  onConnect(data, resolve, reject) {
    const { requestHeaders, requestParameters } = data
    // Your code here, for example a request to an API

    // If the user is not authenticated …
    if (requestParameters.access_token !== 'super-secret-token') {
       return reject()
    }

    // Set contextual data
    const context = {
        user_id: 1234,
    }

    // If the user is authenticated …
    resolve(context)
  },
})

server.listen()
```

### Authorization
With the `onJoinDocument` hook you can check if a user is authorized to edit the current document. This works in the same way the [Authentication](#authentication) works.

```js
import { Server } from '@hocuspocus/server'

const server = Server.configure({
  onJoinDocument(data, resolve, reject) {
    const {
      clientsCount,
      context,
      document,
      documentName,
      requestHeaders,
      requestParameters,
    } = data
    // Your code here, for example a request to an API

    // Access the contextual data from the onConnect hook, in this example this will print { user_id: 1234 }
    console.log(context)

    // If the user is authorized …
    resolve()

    // if the user isn’t authorized …
    reject()
  },
})

server.listen()
```

### Persist the document
By default, documents are only stored in the memory. Hence they are deleted when the WebSocket server is stopped. To prevent this, store changes on the hard disk with the LevelDB adapter. When you restart the server, it’ll restore documents from the hard disk, in that case from the `./database` folder:

```js
import { Server } from '@hocuspocus/server'
import { LevelDB } from '@hocuspocus/leveldb'

const server = Server.configure({
  persistence: new LevelDB({
    path: './database',
  }),
})

server.listen()
```

### Send it to an API
To pass the updated documents to an API, or to a database, you can use the `onChange` hook, which is executed when a document changes. With the `debounce` setting you can slow down the execution, with the `debounceMaxWait` setting you can make sure the content is sent at least every few seconds:

```js
import { Server } from '@hocuspocus/server'

const server = Server.configure({
  // time to wait before sending changes (in milliseconds)
  debounce: 2000,

  // maximum time to wait (in milliseconds)
  debounceMaxWait: 10000,

  // executed when the document is changed
  onChange(data) {
    const {
      clientsCount,
      document,
      documentName,
      requestHeaders,
      requestParameters,
    } = data

    // Your code here, for example a request to an API
  },
})

server.listen()
```

There is no method to restore documents from an external source, so you’ll need a [persistence driver](#persist-the-document) though. Those persistence drivers store every change to the document. That’s probably not needed in your external source, but is needed to make the merging of changes conflict-free in the collaborative editing backend.

### Scale with Redis (Advanced)

:::warning Keep in mind
The redis adapter only syncs document changes. Collaboration cursors are not yet supported.
:::

To scale the WebSocket server, you can spawn multiple instances of the server behind a load balancer and sync changes between the instances through Redis. Import the Redis adapter and register it with hocuspocus. For a full documentation on all available redis and redis cluster options, check out the [ioredis API docs](https://github.com/luin/ioredis/blob/master/API.md).

```js
import { Server } from '@hocuspocus/server'
import { Redis } from '@hocuspocus/redis'

const server = Server.configure({
  persistence: new Redis({
    host: '127.0.0.1',
    port: 6379,
  }),
})

server.listen()
```

If you want to use a redis cluster, use the redis cluster adapter:

```js
import { Server } from '@hocuspocus/server'
import { RedisCluster } from '@hocuspocus/redis'

const server = Server.configure({
  persistence: new RedisCluster({
    scaleReads: 'all',
    redisOptions: {
      host: '127.0.0.1',
      port: 6379,
    }
  }),
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
