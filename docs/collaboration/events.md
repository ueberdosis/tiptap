---
tableOfContents: true
---


# What are provider events?

Events in Collaboration providers allow you to respond to various states and changes, such as successful connections or authentication updates. You can attach event listeners during the provider's initialization or add them later based on your application's needs.

## Key Events and their uses

| Event | Description |
| --- | --- |
| open | Triggered when the WebSocket connection is established. |
| connect | Occurs when the provider successfully connects to the server. |
| authenticated | Indicates successful client authentication. |
| authenticationFailed | Fires when client authentication fails. |
| status | Reflects changes in connection status. |
| message | Captures incoming messages. |
| outgoingMessage | Signals when a message is about to be sent. |
| synced | Marks the initial successful sync of the Y.js document. |
| close | Triggered when the WebSocket connection closes. |
| disconnect | Occurs upon provider disconnection. |
| destroy | Signifies the impending destruction of the provider. |
| awarenessUpdate | Tracks updates in user awareness information. |
| awarenessChange | Indicates changes in the awareness state. |
| stateless | When the stateless message was received. |

## Configuring Event Listeners

To ensure immediate event tracking, you can pass event listeners directly to the provider's constructor. This method guarantees that listeners are active from the start.

```typescript
const provider = new TiptapCollabProvider({
  appId: '', // Use for cloud setups, replace with baseUrl in case of on-prem
  name: "example-document", // Document identifier
  token: '', // Your authentication JWT token
  document: ydoc,
  onOpen() {
    console.log("WebSocket connection opened.");
  },
  onConnect() {
    console.log("Connected to the server.");
  },
  // See below for all event listeners...
});

```

### Dynamic Event Binding

For scenarios where you need to add or remove listeners post-initialization, the provider allows for dynamic binding and unbinding of event handlers

**Binding Event Listeners**

```typescript
const provider = new TiptapCollabProvider({
  // …
});

provider.on("synced", () => {
  console.log("Document synced.");
});
```

**Unbinding Event Listeners**

```typescript
const onMessage = () => {
  console.log("New message received.");
};

// Binding
provider.on("message", onMessage);

// Unbinding
provider.off("message", onMessage);
```

## Use cases for event handling

### Real-time Connection Status

Utilize `onConnect` and `onDisconnect` to provide users with real-time connection status feedback, enhancing the user experience.

```tsx
provider.on("connect", () => {
  showStatus("Connected");
});

provider.on("disconnect", () => {
  showStatus("Disconnected");
});
```

### Document Sync Status

The `synced` event can be used to alert users when the document is fully synced initially, ensuring they start working with the latest version.

```tsx
provider.on("synced", () => {
  alert("Document initialized");
});
```

### Handling Authentication Issues

Use `authenticationFailed` to catch authentication errors and prompt users to reauthenticate, maintaining secure access.

```tsx
provider.on("authenticationFailed", ({ reason }) => {
  console.error("Authentication failed:", reason);
  requestUserReauthentication();
});
```
