---
name: tiptap
description: Helps coding agents integrate and work with the Tiptap rich text editor. Use when building or modifying a rich text editor with Tiptap, installing Tiptap extensions, or implementing features like collaboration, comments, AI, or document conversion.
compatibility: Requires git
metadata:
  author: tiptap
  version: '1.0'
---

# Tiptap Integration Skill

This skill contains instructions for integrating the Tiptap rich text editor into an app and
developing new features with it.

This is not the Tiptap editor you know: it may have evolved and changed since the version you're familiar with.
Before you implement any feature with Tiptap, reference the Tiptap code and documentation to make sure you implement
it correctly. Make sure any decision you make is in accordance to the "Best Practices" section and is grounded in the
Tiptap documentation and source code. Do not guess or invent patterns, make sure the code you write matches the library
source code and the documentation.

## Initial setup

Clone the tiptap and tiptap-docs repositories so you can search the source code and documentation.

- https://github.com/ueberdosis/tiptap
- https://github.com/ueberdosis/tiptap-docs

If the workspace already has a reference folder with other repositories, clone them there.

Otherwise, clone the repositories in a new `.reference` folder. The reference folder should be git-ignored.

## Referencing the Tiptap documentation

Before doing any task that involves the Tiptap editor:

1. Pull the latest changes of the `main` branch in the local tiptap and tiptap-docs repositories
2. Research the documentation and source code to see how to implement it

Never implement new features from `tiptap-docs/src/content/ai/deprecated/`. Those pages document the
retired AI Agent, AI Changes, and AI Suggestion extensions. In general, prefer the more powerful and flexible
AI Toolkit: it supports robust AI functionality with agents reading, editing, and commenting on docs in various ways.
For simple, non-agentic (one-shot) use cases, Basic AI Generation may be sufficient.

To move an existing integration off the deprecated products, see
`tiptap-docs/src/content/ai/ai-toolkit/client/advanced-guides/migration-guides/`.

## Best Practices

### General

- For a new install, use the latest stable version. Resolve it with `npm view @tiptap/core version`.
- The editor and extension packages published from the tiptap monorepo share one version line. Pin
  every one of them to that same version. Mixing versions risks introducing bugs.
- Some packages have their own version line. Resolve these from the registry, never from
  `@tiptap/core`: `@tiptap/ai-toolkit`, `@tiptap/y-tiptap`, `@tiptap-pro/*` (private registry),
  `@hocuspocus/*`.
- Do not mix majors. For a project still on Tiptap 2, upgrade first. See
  `tiptap-docs/src/content/guides/upgrade-tiptap-v2.mdx`.
- When integrating Tiptap for the first time, read the corresponding installation guide in tiptap-docs.
- When server-side rendering (e.g. Next.js), set the `immediatelyRender: false` option when initializing the editor. Otherwise, the editor will crash. Learn more about this in tiptap-docs.

### React

- Prefer using the React Composable API. See `tiptap-docs/src/content/guides/react-composable-api.mdx`

## Implementing Editor Features

When the user asks you to implement one of these features, read the corresponding section in tiptap-docs for guidance.

### Real-time collaboration

Multiple users editing a document simultaneously. See `tiptap-docs/src/content/collaboration/`.

Use Tiptap Cloud to implement real-time collaboration. Use the Collaboration extension:

```
const doc = new Y.Doc()

const editor = new Editor({
  extensions: [
    Collaboration.configure({
      document: doc,
    }),
  ],
})
```

Use the TiptapCollabProvider:

```
const provider = new TiptapCollabProvider({
  name: 'unique_document_name',
  appId: 'APP_ID', // Your document server ID from the Cloud dashboard
  token: 'JWT_TOKEN', // Your JWT token
  document: doc,
})
```

If it's the first time setting up collaboration and the Tiptap Cloud account is not set up, explain
to the user how to set up a Tiptap Cloud account and obtain the environment variables.

### Comments

Implement comments with the Comments extension.

Thread-based inline and document comments. See `tiptap-docs/src/content/comments/`.

### Tracked changes

Track, accept, and reject document edits. See `tiptap-docs/src/content/tracked-changes/`.

### Import/Export

Convert documents to and from DOCX, PDF, Markdown, and other formats. See `tiptap-docs/src/content/conversion/`.

### AI agent document editing

Give an AI agent the ability to read, write to, and accurately edit Tiptap documents. See `tiptap-docs/src/content/ai/ai-toolkit/overview.mdx`.

### AI review and proofreading

Review, proofread, and suggest style improvements. See `tiptap-docs/src/content/ai/ai-toolkit/overview.mdx`.

### AI client-side agent tools

Run AI workflows that edit rich text documents in the browser by interacting directly with the Tiptap editor. See `tiptap-docs/src/content/ai/ai-toolkit/client/overview.mdx`.

### Basic (non-agent) AI content generation

Generate and edit text content via basic one-shot prompts. See `tiptap-docs/src/content/ai/basic/overview.mdx`.

### Version history

Save and restore document snapshots. See `tiptap-docs/src/content/collaboration/documents/snapshot.mdx`.

### Snapshot compare

Highlight differences between document versions. See `tiptap-docs/src/content/collaboration/documents/snapshot-compare.mdx`.

### Pages

Print-ready page layout with headers, footers, and page breaks. See `tiptap-docs/src/content/pages/`.

## Pro Extensions

Some Tiptap extensions are distributed through a private npm registry. To install pro packages, see `tiptap-docs/src/content/guides/pro-extensions.mdx` for setup instructions.
