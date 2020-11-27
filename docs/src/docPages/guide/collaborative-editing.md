# Collaborative editing

:::premium Become a sponsor
Using collaborative editing in production? Do the right thing and [sponsor our work](/sponsor)!
:::

## toc

## Introduction
Real-time collaboration, syncing between different devices or working offline used to be hard. We provide everything you need to keep everything in sync, conflict-free with the power of [Y.js](https://github.com/yjs/yjs). The following guide explains all things to take into account when you consider to make tiptap collaborative. Don’t worry, a production-grade setup doesn’t require much code.

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

And create a new Y document, and register it with tiptap:

```js
import { Editor } from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'

// A new Y document
const ydoc = new Y.Doc()
// Registered with a WebRTC provider
const provider = new WebrtcProvider('example-document', ydoc)
// Point to the ProseMirror schema
const type = ydoc.getXmlFragment('prosemirror')

const editor = new Editor({
  extensions: [
    // …
    // Register the document with tiptap
    Collaboration.configure({
      type: type,
    }),
  ],
})
```

This should be enough to create collaborative instance of tiptap. Crazy, isn’t it? Try it out, and open the editor in two different browsers. Changes should be synced.

So how does this magic work? All clients need to connect with eachother, that’s the job of providers. The [WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API) provider is the easiest way to get started with, as it requires a server to connect clients directly with-each other, but not to sync the actual changes.

This has two downsides, though. On the one hand, browsers refuse to connect with too many clients. With Y.js it’s enough if all clients are connected indirectly, but even that isn’t possible at some point. Or in other words, it doesn’t scale well for more than 100+ clients in the same document.

On the other hand, it’s likely you want to involve a server to persist changes anyway. But the WebRTC signaling server (which connects client with eachother) doesn’t receive changes from clients and therefore doesn’t know what’s in the document.

Anyway, if you want to dive deeper, head over to [the Y WebRTC repository](https://github.com/yjs/y-webrtc).

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
// Point to the ProseMirror schema
const type = ydoc.getXmlFragment('prosemirror')

const editor = new Editor({
  extensions: [
    // …
    // Register the document with tiptap
    Collaboration.configure({
      type: type,
    }),
  ],
})
```

That example doesn’t work out of the box. As you can see, it configures to talk to a WebSocket server which is available under `ws://127.0.0.1:1234` (WebSocket protocol, your local IP and port 1234).

To make the server part as easy as possible, we provide you with an opinionated server package, called [hocuspocus](http://github.com/ueberdosis/hocuspocus). Create a new project, and install it as a dependency:

```bash
# with npm
npm install @hocuspocus/server

# with Yarn
yarn add @hocuspocus/server
```

Create an `index.js` and throw in the following content:

```js
import { Server } from '@hocuspocus/server'

const server = Server.configure({
  port: 1234,
})

server.listen()
```

That’s all. Start your new WebSocket server:

```bash
node ./index.js
```

This should output something like “Listening on ws://127.0.0.1:1234”. If you go back to your tiptap editor and hit reload, it should connect to the WebSocket server and changes should be in sync with all other clients. Amazing, isn’t it?

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
const type = ydoc.getXmlFragment('prosemirror')

const editor = new Editor({
  extensions: [
    // …
    Collaboration.configure({
      type: type,
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

As you can see, you can pass a name and color for every users. Look at the [collaborative editing example](/exmplaes/collaborative-editing), to see a more advanced example.

### Offline support
Adding offline support to your collaborative editor is basically a one liner, thanks to the [Y IndexedDB adapter](https://github.com/yjs/y-indexeddb). Install it:

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
const type = ydoc.getXmlFragment('prosemirror')
// Store the Y document in the browser
const indexdb = new IndexeddbPersistence('example-document', ydoc)

const editor = new Editor({
  extensions: [
    // …
    Collaboration.configure({
      type: type,
    }),
  ],
})
```

All changes will then be stored in the browser, even if you close the tab, go offline, or make changes while working offline. The next time you’re online, the WebSocket provider will try to find a connection and eventually sync the changes.

Yes, it’s magic. And you should sponsor [Kevin Jahns on GitHub](https://github.com/dmonad), he is the brain behind Y.js.

## Store the content
Our collaborative editing backend is ready to handle advanced usage, like authorization, persistence and scaling. Let’s go through a few common use cases here!

### Authorization
With the `onJoinDocument` hook you can write a custom Promise to check if a client is authorized

```js
import { Server } from '@hocuspocus/server'

const server = Server.configure({
  onJoinDocument(data, resolve, reject) {
    const {
      documentName, clientID, requestHeaders, clientsCount, document,
    } = data
    // Your code here, for example a request to an API

    // If the user is authorized …
    resolve()

    // if the user isn’t authorized …
    reject()
  },
})

server.listen()
```

### Persist the document
By default, documents are only stored in the memory. Hence they are deleted when the WebSocket server is stopped. To prevent this, store changes on the hard disk with the LevelDB adapter:

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
If you want to pass the data to an API, you can use the `onChange` hook, which is executed when a document changes. With the `debounce` setting you can slow down requests to your API, with the `debounceMaximum` setting you can make sure the content is sent to your API at least every few seconds:

```js
import { Server } from '@hocuspocus/server'

const server = Server.configure({
  // time to wait before sending changes (in milliseconds)
  debounce: 2000,

  // maximum time to wait (in milliseconds)
  debounceMaximum: 10000,

  // executed when the document is changed
  onChange(data) {
    const {
      documentName, clientID, requestHeaders, clientsCount, document,
    } = data

  },
})

server.listen()
```

### Scale with Redis (Advanced)
If you want to scale the WebSocket server, you can spawn multiple instances behind a load balancer and sync changes between the instances through Redis. Install the Redis adapter and register it with hocuspocus:

```js
import { Server } from '@hocuspocus/server'
import { Redis } from '@hocuspocus/redis'

const server = Server.configure({
  persistence: new Redis('redis://:password@127.0.0.1:1234/0'),
})

server.listen()
```
