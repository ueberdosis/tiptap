---
tableOfContents: true
---

"Embed real-time collaboration into your app in under one minute, and everything is in sync." ([Live-Demo](/collab))- If that sounds interesting to you, we might have something :)

# Tiptap Collab

Tiptap Collab is our hosted solution of Hocuspocus (The plug’n’play collaborative editing backend) making it a blast to add real-time collaboration to any app.

:::warning Pro Feature
To get started, you need a Tiptap Pro account ([sign up / login here](https://tiptap.dev/pro)).
:::

[![Cloud Dashboard](https://tiptap.dev/images/docs/server/cloud/dashboard.png)](https://tiptap.dev/images/docs/server/cloud/dashboard.png)

Note that you need `@hocuspocus/provider` [~v2.0.0](https://github.com/ueberdosis/hocuspocus/releases/tag/v2.0.0)


## Getting started

Tiptap Collab makes your app collaborative by syncing your Y.Doc across users using websockets. If you are already using yjs in your app, getting started is as simple as shown below.

If you are not, you might want to start in our [Tutorials](/tutorials) section.

```typescript
import { TiptapCollabProvider } from '@hocuspocus/provider'
import * as Y from 'yjs'

const provider = new TiptapCollabProvider({
  appId: 'your_app_id', // get this at collab.tiptap.dev
  name: 'your_document_name', // e.g. a uuid uuidv4();
  token: 'your_JWT', // see "Authentication" below
  doc: new Y.Doc() // pass your existing doc, or leave this out and use provider.document
});

// That's it! Your Y.Doc will now be synced to any other user currently connected
```

### Upgrade from self-hosted deployments

If you are upgrading from a self-hosted deployment, on the frontend you just need to replace `HocuspocusProvider` with the new `TiptapCollabProvider`. The API is the same, it's just a wrapper that handles hostnames / auth.

## Examples

##### replit / Sandbox: Fully functional prototype

[![Cloud Documents](https://tiptap.dev/images/docs/server/cloud/tiptapcollab-demo.png)](https://tiptap.dev/images/docs/server/cloud/tiptapcollab-demo.png)

We have created a simple client / server setup using replit, which you can review and fork here:

[Github](https://github.com/janthurau/TiptapCollab) or [Replit (Live-Demo)](https://replit.com/@ueberdosis/TiptapCollab?v=1)

The example load multiple documents over the same websocket (multiplexing), and shows how to realize per-document authentication using JWT.

##### Authentication

Authentication is done using JWT. You can see your secret in the admin interface and use it to generate tokens for your clients. If you want to generate a JWT and add some attributes for testing, you can use http://jwtbuilder.jamiekurtz.com/ . You can leave all fields default, just replace the "key" with the secret from your settings.

In Node.js, you can generate a JWT like this:

```typescript
import jsonwebtoken from 'jsonwebtoken'

const data = {
  // use this list to limit the number of documents that can be accessed by this client.
  // empty array means no access at all
  // not sending this property means access to all documents
  // we are supporting a wildcard at the end of the string (only there)
  allowedDocumentNames: ['document-1', 'document-2', 'my-user-uuid/*', 'my-organization-uuid/*']
}

const jwt = jsonwebtoken.sign(data, 'your_secret')
// this JWT should be sent in the `token` field of the provider. Never expose 'your_secret' to a frontend!
```

#### Getting the JSON document

If you want to access the JSON representation (we're currently exporting the `default` fragment of the YDoc), you can add a webhook in the admin interface. We are calling it when storing to our database, so it's debounced by 2 seconds (max 10 seconds).

All requests contain a header `X-Hocuspocus-Signature-256` which signs the entire message using 'your_secret' (find it in the settings). The payload looks like this:

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

### Screenshots

[![Cloud Documents](https://tiptap.dev/images/docs/server/cloud/documents.png)](https://tiptap.dev/images/docs/server/cloud/documents.png)

[![Cloud Settings](https://tiptap.dev/images/docs/server/cloud/settings.png)](https://tiptap.dev/images/docs/server/cloud/settings.png)

### Need anything else?

Contact us on [Discord](https://tiptap.dev/discord) or send an email to [humans@tiptap.dev](mailto:humans@tiptap.dev).
