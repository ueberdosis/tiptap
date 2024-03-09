# What is Tiptap Collaboration?

Tiptap Collaboration, built on our open-source Hocuspocus WebSocket backend, enhances rich text editors by enabling collaborative functionalities. It uses WebSocket technology to merge content in both real-time and offline modes, with Y.js handling conflict resolution to maintain synchronized changes.

Optimized for performance and scalability, Tiptap Collaboration, tested by hundreds of thousands of users daily, enriches the secure and accessible Hocuspocus base with advanced features such as comments, version history, and authentication. These capabilities are offered for both cloud and on-premises setups.

### **Core features**

- Real-time and asynchronous change merging without conflicts.
- Compatible with various editors: Tiptap, Slate, Quill, Monaco, ProseMirror.
- Supports multiplexing for handling multiple documents over one WebSocket connection.
- Integrates with webhooks for change notifications.
- Scales efficiently with Redis for high user volumes.
- Built with TypeScript for type safety and scalability.

Tiptap Collaboration serves as a foundational technology, enabling a suite of advanced features including webhook events, document version control, backend document manipulation, and comments. These capabilities are built upon the collaboration infrastructure and require it as a prerequisite.

## **Document storage solutions**

We partner with Hetzner, a provider known since 1997 for robust cloud infrastructure, to support our cloud solutions. These can handle extensive daily connections and simultaneous edits across documents.

Storage varies by plan:

- **Entry Plan**: Documents are stored in Hetzner's GDPR-compliant EU data centers.
- **Business Plan**: Choose between Hetzner's US East or West Coast, or European data centers.
- **Enterprise Plan**: Opt for dedicated cloud storage in your chosen location or deploy on-premises for full document control.

## **About Y.js**

Y.js is a library that enables real-time, conflict-free merging of changes made by multiple users. It stands out for its high performance among Conflict-Free Replicated Data Types (CRDTs), offering significant efficiency advantages over similar technologies.

As a CRDT, Y.js ensures that the sequence of changes does not impact the final state of the document, similar to how Git operates with commits. This characteristic guarantees that all copies of the data remain consistent across different environments.

The technology supports the development of highly responsive real-time applications, enabling collaborative features in existing software, managing synchronization states, and catering to offline-first scenarios with easy data integration upon reconnection.

### Y.js Document Compatibility

Y.js operates with a specialized Y.doc binary format for its internal CRDT mechanisms, optimizing performance. However, this does not necessitate any changes to the document formats used within the Tiptap Editor. Users can continue working with familiar formats such as JSON or HTML, which are seamlessly converted by the Collaboration server for CRDT processing.

The binary nature of Y.js's operations allows for efficient data handling and synchronization. While the Y.doc format is accessible through the document management API for specific use cases, the standard retrieval format for documents remains JSON or HTML. Although direct markup output is not natively supported, it can be indirectly produced through HTML conversion, offering flexibility in handling document formats.

## Migrate from Hocuspocus or Collaboration Cloud

Migrating your application from Hocuspocus to either an on-premises solution or the Tiptap Collaboration Cloud involves a simple switch from the **`HocuspocusProvider`** to the **`TiptapCollabProvider`**, or the other way around.

This adjustment does not necessitate any changes to your infrastructure, and the API interface will remain unchanged. The **`TiptapCollabProvider`** serves as an intermediary, handling the server connection and authentication for your Collaboration application.

This migration approach is also applicable when migrating from the Tiptap Collaboration Cloud to an on-premises configuration.

## Schema management

Tiptap enforces strict schema adherence, discarding any elements not defined in the active schema. This can cause issues when clients using different schema versions concurrently edit a document.

For instance, imagine adding a task list feature in an update. Users on the previous schema won't see these task lists, and any added by a user on the new schema will disappear from their view due to schema discrepancies. This occurs because Tiptap synchronizes changes across clients, removing unrecognized elements based on the older schema.

To mitigate these issues, consider the following strategies:

1. Require clients to update their application to match the new schema upon deployment.
2. Monitor schema versions and restrict editing access for clients using outdated versions.
