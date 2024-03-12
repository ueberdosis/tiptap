# What is Awareness in Collaboration

Awareness in Tiptap Collaboration, powered by Yjs, is helping you share real-time info on users' activities within a collaborative space. This can include details like user presence, cursor positions, and custom user states.

At its core, awareness utilizes its own Conflict-Free Replicated Data Type (CRDT) to ensure that this shared meta-information remains consistent and immediate across all users, without maintaining a historical record of these states.

You can read more about Awareness in the [Yjs documentation on awareness](https://docs.yjs.dev/getting-started/adding-awareness).

### Understanding provider events for awareness

Awareness updates trigger specific [provider events](https://tiptap.dev/docs/editor/collaboration/events) to develop interactive features based on user actions and presence:

- `awarenessUpdate`: This event signals that a user is active. It triggers without actual state changes, serving as a 'heartbeat' to inform others the user is in the document.
- `awarenessChange`: This event alerts you to any additions, updates, or deletions in the awareness state, reflecting both your local changes and those from remote users.

These events serve as hooks for integrating custom Awareness features.

## Integrating Basic Awareness

With your [collaborative environment](https://tiptap.dev/docs/editor/collaboration/install) set up, you're all set to integrate Awareness, which is natively supported by the Collaboration Provider.

To kick things off, update the Awareness state with any relevant information. For this guide, we'll use a user's name, cursor color, and mouse position as examples.

### Setting the awareness field

Let's assign a name, color, and mouse position to the user. This is just an example; feel free to use any data relevant to your application.
```typescript
// Set the awareness field for the current user
provider.setAwarenessField("user", {
  // Share any information you like
  name: "Kevin James",
  color: "#ffcc00",
  mouseX: event.clientX,
  mouseY: event.clientY,
});
```

### Listening for changes

Set up an event listener to track changes in the Awareness states across all connected users:

```typescript
// Listen for updates to the states of all users
provider.on("awarenessChange", ({ states }) => {
  console.log(states);
});
```
You can now view these updates in your browser's console as you move on to the next step.

### Tracking mouse movement

Next, we'll add an event listener to our app to track mouse movements and update the awareness' information accordingly.

```typescript
document.addEventListener("mousemove", (event) => {
  // Share any information you like
  provider.setAwarenessField("user", {
    name: "Kevin James",
    color: "#ffcc00",
    mouseX: event.clientX,
    mouseY: event.clientY,
  });
});
```

Check your browser's console to see the stream of events as users move their mice.

### Next Steps

With basic Awareness in place, consider enhancing your setup with the Collaborative Cursor extension. This extension adds cursor positions, text selections, and personalized details (such as names and colors) of all participating users to your editor.
