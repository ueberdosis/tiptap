---
tableOfContents: true
---

# Tiptap Collab

Implementing real-time collaboration is quite hard. With Tiptap Collab we build a solution that does it in minutes. To see it in action check out our [live demo](https://tiptap.dev/editor).

Tiptap Collab is our managed cloud solution of [Hocuspocus](https://tiptap.dev/hocuspocus/introduction). It makes it a easy to add real-time collaboration to any application. If you already have an application using Tiptap Editor, it's even easier to add collaboration.

:::warning Pro Feature
To get started, you need a Tiptap Pro account. [Log in](https://tiptap.dev/login) or [sign up](https://tiptap.dev/register) for free.
:::

## Getting Started

### Installation

First you need to install `@hocuspocus/provider` at least in version `2.0.0`.

```bash
npm install @hocuspocus/provider
```

### Basic Usage

Tiptap Collab makes your application collaborative by synchronizing a Yjs document between connected users using websockets. If you're already using Yjs in your application, it's as easy as this:

```typescript
import { TiptapCollabProvider } from '@hocuspocus/provider'
import * as Y from 'yjs'

const provider = new TiptapCollabProvider({
  appId: 'your_app_id', // get this at collab.tiptap.dev
  name: 'your_document_name', // e.g. a uuid uuidv4();
  token: 'your_JWT', // see "Authentication" below
  document: new Y.Doc() // pass your existing doc, or leave this out and use provider.document
});
```

### Upgrade From Hocuspocus

If you are upgrading from our self-hosted collaboration backend called Hocuspocus, all you need to do is replace `HocuspocusProvider` with the new `TiptapCollabProvider`. The API is the same, it's just a wrapper that handles the hostname to your Tiptap Collab app and authentication.

## Example

[![Cloud Documents](https://tiptap.dev/images/docs/server/cloud/tiptapcollab-demo.png)](https://tiptap.dev/images/docs/server/cloud/tiptapcollab-demo.png)

We have created a simple client / server setup using replit that you can review and fork here:

[Github](https://github.com/janthurau/TiptapCollab) or [Replit Demo](https://replit.com/@ueberdosis/TiptapCollab?v=1)

The example loads multiple documents over the same websocket (multiplexing), and shows how to implement per-document authentication using JWT.

More tutorials can be found in our [Tutorials section](/tutorials).

## Authentication

Authentication is done using [JSON Web Token (JWT)](https://en.wikipedia.org/wiki/JSON_Web_Token). There are many libraries available to generate a valid token.

### JWT Generation

To generate a JWT in the browser, you can use [http://jwtbuilder.jamiekurtz.com/](http://jwtbuilder.jamiekurtz.com/). You can leave all the fields as default, just replace the "Key" at the bottom with the secret from your [settings](https://collab.tiptap.dev/apps/settings).

In Node.js, you can generate a JWT like this:

```typescript
import jsonwebtoken from 'jsonwebtoken'

const data = {
  // Use this list to limit the number of documents that can be accessed by this client.
  // An empty array means no access at all.
  // Not sending this property means access to all documents.
  // We are supporting a wildcard at the end of the string (only there).
  allowedDocumentNames: ['document-1', 'document-2', 'my-user-uuid/*', 'my-organization-uuid/*']
}

// This JWT should be sent in the `token` field of the provider. Never expose 'your_secret' to a frontend!
const jwt = jsonwebtoken.sign(data, 'your_secret')
```

## Webhook

You can define a URL and we will call it every time a document has changed. This is useful for getting the JSON representation of the Yjs document in your own application. We call your webhook URL when the document is saved to our database. This operation is debounced by 2-10 seconds. So your application won't be flooded by us. Right now we're only exporting the fragment `default` of the Yjs document.
You can add the webhook URL in the [settings page](https://collab.tiptap.dev/apps/settings) of your Tiptap Collab app.

### Payload

A sample payload of the webhook request looks like this:

```json
{
  "appName": '', // name of your app
  "name": '', // name of the document
  "time": // current time as ISOString (new Date()).toISOString())
  "tiptapJson": {}, // JSON output from Tiptap (see https://tiptap.dev/guide/output#option-1-json): TiptapTransformer.fromYdoc()
  "ydocState"?: {}, // optionally contains the entire yDoc as base64. Contact us to enable this property!
  "clientsCount": 100 // number of currently connected clients
}
```

### Signing

All requests to your webhook URL will contain a header called `X-Hocuspocus-Signature-256` that signs the entire message with your secret. You can find it in the [settings](https://collab.tiptap.dev/apps/settings) of your Tiptap Collab app.

## Need anything else?

Contact us on [Discord](https://tiptap.dev/discord) or send an email to [humans@tiptap.dev](mailto:humans@tiptap.dev).
