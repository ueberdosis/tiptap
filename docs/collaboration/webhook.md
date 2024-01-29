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
