---
tableOfContents: true
---


# Install Collaboration
This guide will get you started with collaborative editing in the Tiptap Editor. If you're already using Tiptap Editor, feel free to skip ahead to the "Adding Collaboration" section.

### Installing Tiptap Editor

If Tiptap Editor isn't installed yet, run the following command in your CLI for either React or Vue to install the basic editor and necessary extensions for this example:

```bash
npm install @tiptap/extension-document @tiptap/extension-paragraph @tiptap/extension-text @tiptap/react
```

Once installed, you can get your Tiptap Editor up and running with this basic setup. Just add the following code snippets to your project:
https://embed.tiptap.dev/preview/Examples/Minimal

## Adding Collaboration

To introduce team collaboration features into your Tiptap Editor, integrate the Yjs library and Editor Collaboration extension into your frontend. This setup uses Y.Doc, a shared document model, rather than just handling plain text.
Afterwards we will connect Y.Doc to the TiptapCollabProvider to synchronize user interactions.

### Integrating Yjs and the Collaboration Extension

Add the Editor Collaboration extension and Yjs library to your frontend:

```bash
npm install @tiptap/extension-collaboration yjs
```

Then, update your index.jsx to include these new imports:

```typescript
import './styles.scss'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'

import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'

export default () => {
  const doc = new Y.Doc() // Initialize Y.Doc for shared editing

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Collaboration.configure({
        document: doc // Configure Y.Doc for collaboration
      })
    ],
    content: `
      <p>
        This is a radically reduced version of Tiptap. It has support for a document, with paragraphs and text. That’s it. It’s probably too much for real minimalists though.
      </p>
      <p>
        The paragraph extension is not really required, but you need at least one node. Sure, that node can be something different.
      </p>
    `,
  })

  return (
    <EditorContent editor={editor} />
  )
}
```

Your editor is now prepared for collaborative editing!

### Connecting to the Collaboration Server

For collaborative functionality, install the `@hocuspocus/provider` package:

```bash
npm install @hocuspocus/provider
```

Next, configure the Hocuspocus provider in your index.jsx file with your server details:

- **name**: Serves as the document identifier for synchronization.
- **appID**: Found in your [Cloud account](https://cloud.tiptap.dev/apps) after you started your app. For on-premises setups replace `appID` with `baseUrl`.
- **token**: Use the JWT from your [Cloud interface](https://cloud.tiptap.dev/apps/settings) for testing, but generate your own JWT for production.

Incorporate the following code to complete the setup:

```typescript
import './styles.scss'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'

import * as Y from 'yjs'
import Collaboration from '@tiptap/extension-collaboration'

// Importing the provider
import { TiptapCollabProvider } from '@hocuspocus/provider'

export default () => {
  const doc = new Y.Doc()

  // Connect to your Collaboration server
  const provider = new TiptapCollabProvider({
    name: "document.name", // Unique document identifier for syncing. This is your document name.
    appId: '7j9y6m10', // Your Cloud Dashboard AppID or `baseURL` for on-premises
    token: 'notoken', // Your JWT token
    document: doc,
  })

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Collaboration.configure({
        document: doc,
      }),
    ],
    content: `
      <p>
        This is a radically reduced version of Tiptap. It has support for a document, with paragraphs and text. That’s it. It’s probably too much for real minimalists though.
      </p>
      <p>
        The paragraph extension is not really required, but you need at least one node. Sure, that node can be something different.
      </p>
    `,
  })

  return (
    <EditorContent editor={editor} />
  )
}
```

After following these steps, you should be able to open two different browsers and connect to the same document simultaneously through separate WebSocket connections.

For a clear test of the collaboration features, using two different browsers is recommended to guarantee unique websocket connections.

### Initializing Content Properly

Upon implementing collaboration in your Tiptap Editor, you might notice that the initial content is repeatedly added each time the editor loads. To prevent this, use the `.setContent()` method to set the initial content only once.

```typescript
import './styles.scss'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'

import * as Y from 'yjs'
import Collaboration from '@tiptap/extension-collaboration'

import { TiptapCollabProvider } from '@hocuspocus/provider'

export default () => {
  const doc = new Y.Doc()

  const provider = new TiptapCollabProvider({
    name: "document.name", // Unique document identifier for syncing. This is your document name.
    appId: '7j9y6m10', // Your Cloud Dashboard AppID or `baseURL` for on-premises
    token: 'notoken', // Your JWT token
    document: doc,
    
    // The onSynced callback ensures initial content is set only once using editor.setContent(), preventing repetitive content insertion on editor syncs.
    onSynced() {

      if( !doc.getMap('config').get('initialContentLoaded') && editor ){
        doc.getMap('config').set('initialContentLoaded', true);

        editor.commands.setContent(`
        <p>
          This is a radically reduced version of Tiptap. It has support for a document, with paragraphs and text. That’s it. It’s probably too much for real minimalists though.
        </p>
        <p>
          The paragraph extension is not really required, but you need at least one node. Sure, that node can be something different.
        </p>
        `)
      }

    }
  })

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Collaboration.configure({
        document: doc
      }),
    ],
    // Remove the automatic content addition on editor initialization.
  })


  return (
    <EditorContent editor={editor} />
  )
}
```

This ensures the initial content is set only once. To test with new initial content, create a new document by changing the `name` parameter (e.g., from `document.name` to `document.name2`).

## Disabling Default Undo/Redo
If you're integrating collaboration into an editor **other than the one provided in this demo**, you may need to disable the default history function of your Editor. This is necessary to avoid conflicts with the collaborative history management: You wouldn't want to revert someone else's changes.

This action is only required if your project includes the Tiptap [StarterKit](https://tiptap.dev/docs/editor/api/extensions/starter-kit) or [History](https://tiptap.dev/docs/editor/api/extensions/history) extension.

```typescript
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      history: false, // Disables default history to use Collaboration's history management
    }),
…
```

Following this guide will set up a basic, yet functional collaborative Tiptap Editor, synchronized through either the Collaboration Cloud or an on-premises backend.
