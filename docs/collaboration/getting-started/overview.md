---
tableOfContents: true
---

# What is Tiptap Collaboration?

Tiptap Collaboration turns standard text editors into collaborative platforms, enabling simultaneous editing similar to Google Docs or Notion. Built on our open source Hocuspocus WebSocket backend, it facilitates real-time and asynchronous updates through WebSocket technology, with Y.js ensuring consistent synchronization of changes.

Built for performance and scalability, Tiptap Collaboration is tested by hundreds of thousands of users every day. Enhancing the robust Hocuspocus foundation, Tiptap Collaboration introduces more performance, scalability, and security.

It integrates functionalities such as commenting, document version history, and secure authentication, suitable for both cloud services and personal servers.

### Core features

- Real-time and offline change merging without conflicts.
- Compatible with various editors: Tiptap, Slate, Quill, Monaco, ProseMirror.
- Supports multiplexing for handling multiple documents over one WebSocket connection.
- Integrates with webhooks for change notifications.
- Scales efficiently with Redis for high user volumes.
- Built with TypeScript for type safety and scalability.

Tiptap Collaboration serves as a foundational technology, enabling a suite of advanced features including webhook events, document version control, backend document manipulation, comments and more.

## Where your documents are stored
If you're using our on-premises solutions, you can choose where to store your documents in your own infrastructure. However, for users of our Collaboration Cloud service, we've partnered with Hetzner, renowned for their dependable cloud infrastructure, to guarantee stable and efficient performance, especially during periods of heavy traffic and collaborative activities.

Your document storage location depends on your subscription plan:
- Entry Plan: Your documents are stored in GDPR-compliant data centers in Europe, ensuring your data's privacy and security.
- Business Plan: You have the option to store your documents in data centers on the US East or West Coast, or in Europe, according to your preference.
- Enterprise Plan: Choose dedicated cloud storage in your preferred location, or opt for on-premises storage to manage your documents yourself.

Regardless of your plan, you have the flexibility to create your own backups of all documents and associated information using our document management API.

## About Y.js

Y.js is a library that enables real-time, conflict-free merging of changes made by multiple users. It stands out for its high performance among Conflict-Free Replicated Data Types (CRDTs), offering significant efficiency advantages over similar technologies.

As a CRDT, Y.js ensures that the sequence of changes does not impact the final state of the document, similar to how Git operates with commits. This guarantees that all copies of the data remain consistent across different environments.

The technology supports the development of highly responsive real-time applications, enabling collaborative features in existing software, managing synchronization states, and catering to offline-first scenarios with easy data integration upon reconnection.

### Y.js Document Compatibility

Y.js uses a special Y.doc binary format to work efficiently, but you don't need to worry about changing how you create documents in Tiptap Editor. You can keep using common formats like JSON or HTML, and the Collaboration server will take care of converting them for use with Y.js.

Thanks to Y.js's binary format, it handles data quickly and keeps everything in sync. If you need the binary format, you can get the Y.doc through the document management API. However, you have the option to retrieve your documents in the more familiar JSON or HTML formats. While direct markup output isn't provided, you can achieve it by converting from HTML, offering versatility in how you handle document formats.

## Migrate from Hocuspocus or Collaboration Cloud

Migrating your application from Hocuspocus to either an on-premises solution or the Tiptap Collaboration Cloud involves a simple switch from the `HocuspocusProvider` to the `TiptapCollabProvider`, or the other way around.

This doesn't require any other updates to your setup, and the way you interact with the API won't change as well. The `TiptapCollabProvider` acts as a go-between, managing how your application connects to the server and handles login details.

This migration approach is also applicable when migrating from the Tiptap Collaboration Cloud to an on-premises configuration.

## Schema management

Tiptap enforces strict schema adherence, discarding any elements not defined in the active schema. This can cause issues when clients using different schema versions concurrently edit a document.

For instance, imagine adding a task list feature in an update. Users on the previous schema won't see these task lists, and any added by a user on the new schema will disappear from their view due to schema discrepancies. This occurs because Tiptap synchronizes changes across clients, removing unrecognized elements based on the older schema.

To mitigate these issues, consider the following strategies:

1. Require clients to update their application to match the new schema upon deployment.
2. Monitor schema versions and restrict editing access for clients using outdated versions.
