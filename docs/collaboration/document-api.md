---
tableOfContents: true
---

# Document Management API

The Collaboration Management API provides a suite of RESTful endpoints for managing documents. This API facilitates document creation, listing, retrieval, updates, and deletion, along with the ability to duplicate documents for efficient content management.

Explore the [Postman Collection](https://www.postman.com/docking-module-explorer-14290287/workspace/tiptap-collaboration-public/collection/33042171-cc186a66-df41-4df8-9c6e-e91b20deffe5?action=share&creator=32651125) for a hands-on experience, allowing you to experiment with the REST API's capabilities.

## Accessing the Management API
The REST API is exposed directly from your Collaboration app, available at your custom URL:

`https://YOUR_APP_ID.collab.tiptap.cloud/`

Authentication is done using an API secret which you can find in
the [settings](https://collab.tiptap.dev/) of your Collaboration app. The secret must be sent as
an `Authorization` header.

If your document identifier contains a slash (`/`), just make sure to encode it as `%2F`, e.g.
using `encodeURIComponent`.

## Document Operations

### Create Document

```bash
POST /api/documents/:identifier
```

This call takes a binary Yjs update message (an existing Yjs document on your side must be encoded
using `Y.encodeStateAsUpdate`) and creates a document. This can be used to seed documents before a
user connects to the Tiptap Collab server.

This endpoint will return the HTTP status `204` if the document was created successfully, or `409`
if the document already exists. If you want to overwrite it, you must delete it first.

```bash
curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA' \
--data '@yjsUpdate.binary.txt'
```

### List Documents

```bash
GET /api/documents?take=100&skip=0
```

This call returns a list of all documents present on the servers storage. We're returning the first
100 by default, pass `take` or `skip` parameters to adjust this.

```bash
curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'
```

### Get Document

```bash
GET /api/documents/:identifier?format=:format&fragment=:fragment
```

This call exports the given document with all fragments in JSON format. We export either the current
in-memory version or the version read from the database. If the document is currently open on your
server, we will return the in-memory version.

`format` supports either `yjs` or `json`. Default: `json`

If you choose the `yjs` format, you'll get the binary Yjs update message created
with `Y.encodeStateAsUpdate`.

`fragment` can be an array (`fragment=a&fragment=b`) of or a single fragment that you want to
export. By default we'll export all fragments. Note that this is only taken into account when using
the `json` format, otherwise you'll always get the whole Yjs document.

```bash
curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'
```

**Note:** When using axios, you need to specify `responseType: arraybuffer` in the options of the
request.

```typescript
import * as Y from 'yjs'

const ydoc = new Y.Doc()

const axiosResult = await axios.get('https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/somedoc?format=yjs', {
  headers: {
    'Authorization': 'YOUR_SECRET_FROM_SETTINGS_AREA',
  },
  responseType: 'arraybuffer'
})

Y.applyUpdate(ydoc, axiosResult.data)
```

When using `node-fetch`, you need to use .arrayBuffer() and create a Buffer from it:

```typescript
import * as Y from 'yjs'

const ydoc = new Y.Doc()

const fetchResult = await fetch('https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/somedoc?format=yjs', {
  headers: {
    'Authorization': 'YOUR_SECRET_FROM_SETTINGS_AREA',
  },
})

Y.applyUpdate(ydoc, Buffer.from(await docUpdateAsBinaryResponse.arrayBuffer()))
```

### Update Document

```bash
PATCH /api/documents/:identifier
```

This call accepts a Yjs update message and will apply it on the existing document on the server.
This endpoint will return the HTTP status `204` if the document was updated successfully, `404` is
the document does not exist, or `422` if the payload is invalid or the update cannot be applied.

```bash
curl --location --request PATCH 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA' \
--data '@yjsUpdate.binary.txt'
```

### Delete Document

```bash
DELETE /api/documents/:identifier
```

This endpoint deletes a document from the server after closing any open connection to the document.

It returns either HTTP status `204` if the document was deleted successfully or `404` if the
document was not found.

If the endpoint returned `204`, but the document still exists, make sure that there is no user
re-creating the document from the provider.
We are closing all connections before deleting a document, but your error handling might re-create
the provider, and thus create the document again.

```bash
curl --location --request DELETE 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'
```

### Duplicate Document

In order to copy a document, you can just use the GET endpoint and then create it again with the
POST endpoint, here's an example in typescript:

```typescript

const docUpdateAsBinaryResponse = await axios.get('https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/somedoc?format=yjs', {
  headers: {
    'Authorization': 'YOUR_SECRET_FROM_SETTINGS_AREA',
  },
  responseType: 'arraybuffer',
})

await axios.post('https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/somedoc-duplicated', docUpdateAsBinaryResponse.data, {
  headers: {
    'Authorization': 'YOUR_SECRET_FROM_SETTINGS_AREA',
  },
})
```
