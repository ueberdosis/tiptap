# Collaborative editing

:::premium Become a sponsor
Using collaborative editing in production? Do the right thing and [sponsor our work](/sponsor)!
:::

<!--
TODO:
- Pass auth token to the provider
-
 -->

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

To make the server part as easy as possible, we provide you with an opinionated server package, called [hocuspocus](http://github.com/ueberdosis/hocuspocus). Create a new project, and install the hocuspocus server as a dependency:

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

### Authentication
With the `onConnect` hook you can write a custom Promise to check if a client is authenticated. That can be a request to an API, to a microservice, a database query, or whatever is needed, as long as it’s executing `resolve()` at some point. You can also pass contextual data to the `resolve()` method which will be accessible in other hooks.

```js
import { Server } from '@hocuspocus/server'

const server = Server.configure({
  onConnect(data, resolve, reject) {
    const { requestHeaders } = data
    // Your code here, for example a request to an API

    // If the user is not authorized …
    if (requestHeaders.access_token !== 'super-secret-token') {
       return reject()
    }

    // Set contextual data
    const context = {
        user_id: 1234,
    }

    // If the user is authorized …
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
    } = data

    // Your code here, for example a request to an API
  },
})

server.listen()
```

### Scale with Redis (Advanced)
To scale the WebSocket server, you can spawn multiple instances of the server behind a load balancer and sync changes between the instances through Redis. Install the Redis adapter and register it with hocuspocus:

```js
import { Server } from '@hocuspocus/server'
import { Redis } from '@hocuspocus/redis'

const server = Server.configure({
  persistence: new Redis('redis://:password@127.0.0.1:1234/0'),
})

server.listen()
```
