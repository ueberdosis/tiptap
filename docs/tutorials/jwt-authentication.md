# JWT authentication with Tiptap Collab

In our first tutorial, we've gone from a simple textarea to a fully collaborative Tiptap editor instance.
However, the JWT that is given by Tiptap Collab is valid for just a few hours, which is enough for testing,
but certainly not enough for a real live application.

## What is a JWT

In a short explanation, a JWT (JSON Web Token) is a json object that is cryptographically signed, which means a generated JWT cannot be altered.

## How to generate a JWT

The JWT **must** be generated on the server side, as your `secret` **must not** leave your server (i.e. don't even try to generate the JWT on the frontend).
You can use the following snippet on a NodeJS server and build an API around it.

```typescript
import jsonwebtoken from 'jsonwebtoken'

const jwt = jsonwebtoken.sign({ /* object to be encoded in the JWT */ }, 'your_secret')
// this JWT should be sent in the `token` field of the provider. Never expose 'your_secret' to a frontend!
```

A full server / API example is available [here](https://github.com/ueberdosis/tiptap-collab-replit/blob/main/src/server-collab.ts).
Make sure to put the `secret` inside the server environment variable (or just make it a constant in the server file, don't transfer it from the client).
You probably want to create an API call like `GET /getCollabToken` which will generate the JWT based on the server secret and the list of documents that the user is allowed to access.

## How to limit access to specific documents

Documents can only be accessed by knowing the exact document name, as there is no way to get a list of documents from TiptapCollab.
Thus, it's a good practice to name them like `userUuid/documentUuid` (i.e. `1500c624-8f9f-496a-b196-5e5dd8ec3c25/7865975c-38d0-4bb5-846b-df909cdc66d3`), which
already makes it impossible to open random documents by guessing the name.

If you want to further limit which documents can be accessed using which JWT, you can encode the `allowedDocumentNames` property in the JWT, as in the following
example. The created JWT will only allow access to the document(s) specified.

```typescript
import jsonwebtoken from 'jsonwebtoken'

const jwt = jsonwebtoken.sign({
  allowedDocumentNames: [
    '1500c624-8f9f-496a-b196-5e5dd8ec3c25/7865975c-38d0-4bb5-846b-df909cdc66d3', // userUuid/documentUuid
    '1500c624-8f9f-496a-b196-5e5dd8ec3c25/*' // userUuid/*
  ]
}, 'your_secret')
// this JWT should be sent in the `token` field of the provider. Never expose 'your_secret' to a frontend!
```
