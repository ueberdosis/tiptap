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
  doc: new Y.Doc() // pass your existing doc, or leave this out and use provider.document
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
  "tiptapData": {}, // JSON output from Tiptap (see https://tiptap.dev/guide/output#option-1-json): TiptapTransformer.fromYdoc()
  "ydocState"?: {}, // optionally contains the entire yDoc as base64. Contact us to enable this property!
  "clientsCount": 100 // number of currently connected clients
}
```

### Signing

All requests to your webhook URL will contain a header called `X-Hocuspocus-Signature-256` that signs the entire message with your secret. You can find it in the [settings](https://collab.tiptap.dev/apps/settings) of your Tiptap Collab app.

## Management API

In addition to the websocket protocol, each Tiptap Collab app comes with a REST API for managing your documents. It's exposed directly from your Tiptap Collab app, so it's available at your custom URL:

`https://YOUR_APP_ID.collab.tiptap.cloud/`

Authentication is done using an API secret which you can find in the [settings](https://collab.tiptap.dev/) of your Tiptap Collab app. The secret must be sent as an `Authorization` header.

If your document identifier contains a slash (`/`), just make sure to encode it as `%2F`, e.g. using `encodeURIComponent` of vanilla JavaScript.

### Create Document

```bash
POST /api/documents/:identifier
```

This call takes a binary Yjs update message (an existing Yjs document on your side must be encoded using `Y.encodeStateAsUpdate`) and creates a document. This can be used to seed documents before a user connects to the Tiptap Collab server.

This endpoint will return the HTTP status `204` if the document was created successfully, or `409` if the document already exists. If you want to overwrite it, you must delete it first.

```bash
curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA' \
--data '@yjsUpdate.binary.txt'
```

### Get Document

```bash
GET /api/documents/:identifier?format=:format&fragment=:fragment
```

This call exports the given document with all fragments in JSON format. We export either the current in-memory version or the version read from the database. If the document is currently open on your server, we will return the in-memory version.

`format` supports either `yjs` or `json`. Default: `json`

If you choose the `yjs` format, you'll get the binary Yjs update message created with `Y.encodeStateAsUpdate`.

`fragment` can be an array (`fragment=a&fragment=b`) of or a single fragment that you want to export. By default we'll export all fragments. Note that this is only taken into account when using the `json` format, otherwise you'll always get the whole Yjs document.

```bash
curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'
```

### Delete Document

```bash
DELETE /api/documents/:identifier
```

This endpoint deletes a document from the server after closing any open connection to the document.

It returns either HTTP status `204` if the document was deleted successfully or `404` if the document was not found.

```bash
curl --location --request DELETE 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'
```

## Screenshots

Here are some screenshots of Tiptap Collab to give you an idea what of Tiptap Collab looks like.

### Dashboard

View key metrics such as total or concurrent connections of your Tiptap Collab app.

[![Cloud Dashboard](https://tiptap.dev/images/docs/server/cloud/dashboard.png)](https://tiptap.dev/images/docs/server/cloud/dashboard.png)

### Documents

Get insight into all your documents, such as size or delete them if you want.

[![Cloud Documents](https://tiptap.dev/images/docs/server/cloud/documents.png)](https://tiptap.dev/images/docs/server/cloud/documents.png)

### Logging

View real-time log events for information about currently loaded or modified documents.

[![Cloud Settings](https://tiptap.dev/images/docs/server/cloud/logging.png)](https://tiptap.dev/images/docs/server/cloud/logging.png)

### Settings

Manage the authentication of your application or defined webhooks in the settings.

[![Cloud Settings](https://tiptap.dev/images/docs/server/cloud/settings.png)](https://tiptap.dev/images/docs/server/cloud/settings.png)

## Need anything else?

Contact us on [Discord](https://tiptap.dev/discord) or send an email to [humans@tiptap.dev](mailto:humans@tiptap.dev).
