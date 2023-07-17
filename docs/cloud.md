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


## API

Each Tiptap Collab instance comes with an API for the most common operations. Is is provided directly by your Tiptap Collab instance, so it's available under your custom URL:

`https://YOUR_APP_ID.collab.tiptap.cloud/`

Authentication is done using an admin secret which you can find in your collab [settings area](https://collab.tiptap.dev/). The secret has to be sent as an `Authorization` header.
If your document identifier contains a slash (`/`), just make sure that you encode it as `%2F` (e.g. using javascripts `encodeURIComponent`).

### POST /api/documents/:identifier

This call takes a binary yjs update message (an existing Ydoc on your side must be encoded using `Y.encodeStateAsUpdate`) and creates a document. This can be used to seed documents before a user connects to the Tiptap Collab server.

```bash
curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA' \
--data '@yjsUpdate.binary.txt'

// returns either http status 204 if the document was created successfully
// or http status 409 if the document already exists (if you wish to overwrite it, just delete it first)
```

### GET /api/documents/:identifier?format=:format&fragment=:fragment

This call exports the given document (all fragments) in json format. We are exporting either the current in-memory version (in case the document is currently open on your server, or we fetch the most recent version from the database).

`format` supports either `yjs` or `json`, default=`json`

If you choose the `yjs` format, you'll get the binary Y.js update message (created using `Y.encodeStateAsUpdate`)

`fragment` can be an array of (`fragment=a&fragment=b`) or a single fragment that you want exported. By default we're exporting all fragments. Note that this is only considered when using `json` format, otherwise you'll always get the entire Y.doc.

```bash
curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'

// returns either http status 200 and the requested document
// or http status 404 if the document was not found
```

### DELETE /api/documents/:identifier

This simply deletes a document from the server after terminating any open connection to the document.

```bash
curl --location --request DELETE 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'

// returns either http status 204 if the document was deleted successfully
// or http status 404 if the document was not found
```

### ANY /api/

Need something else? Hit us up and we'll see what we can do (links below)


## Screenshots

[![Cloud Documents](https://tiptap.dev/images/docs/server/cloud/documents.png)](https://tiptap.dev/images/docs/server/cloud/documents.png)

[![Cloud Settings](https://tiptap.dev/images/docs/server/cloud/settings.png)](https://tiptap.dev/images/docs/server/cloud/settings.png)

## Need anything else?

Contact us on [Discord](https://tiptap.dev/discord) or send an email to [humans@tiptap.dev](mailto:humans@tiptap.dev).
