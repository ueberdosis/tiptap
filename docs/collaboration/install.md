# Install Collaboration
This guide will help you begin with collaborative editing using the Tiptap Editor. If Tiptap Editor is already in use, proceed to the "Adding Collaboration" section.

### **Installing Tiptap Editor**

If Tiptap Editor isn't installed yet, run the following command in your CLI for either React or Vue to install the basic editor and necessary extensions:

```bash
npm install @tiptap/extension-document @tiptap/extension-paragraph @tiptap/extension-text @tiptap/react
```

After installation, use this minimal setup code for Tiptap Editor by incorporating the provided code snippets into your project:
https://embed.tiptap.dev/preview/Examples/Minimal

## **Adding Collaboration**

To transform your Tiptap Editor into a collaborative platform, integrate the Yjs library and the Collaboration extension into your frontend editor.

This setup allows using the Y.Doc for collaboration instead of raw text. Then, connect the Y.Doc to the TiptapCollabProvider for synchronization across clients.

:::warning Disable default history function
If using Tiptap Editor's StarterKit, disable the history function to prevent undo/redo conflicts with the collaborative history management provided by the Collaboration extension.
:::

```typescript
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      history: false, // Disables default history to use Collaboration's history management
    }),
…
```

### **Integrating Yjs and the Collaboration Extension**

To enable real-time collaborative editing in your frontend, add the Collaboration extension and Yjs library to your editor setup:

```bash
npm install @tiptap/extension-collaboration yjs
```
Update your index.jsx by importing the new dependencies:

```typescript
import './styles.scss'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'

// Import new packages
export default () => {
  const doc = new Y.Doc()

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Collaboration.configure({
        document: doc
      })
    ],
    content: `
      <p>
        This is a radically reduced version of tiptap. It has support for a document, with paragraphs and text. That’s it. It’s probably too much for real minimalists though.
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

### **Connecting to the Collaboration Server**

For collaborative functionality, install the **`@hocuspocus/provider`** package:

```bash
npm install @hocuspocus/provider
```

Next, configure the Hocuspocus provider in your index.jsx file with your server details:

- **name**: Serves as the document identifier for synchronization.
- **appID**: Found in your Cloud account or replace `**appID`** with **`baseUrl`** for on-premises setups.
- **token**: Use the JWT from your Cloud interface for testing, but generate your own JWT for production.

Incorporate the following code to complete the setup:

```typescript
import './styles.scss'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'

// Importing the provider and useEffect
import {useEffect} from 'react'
import { TiptapCollabProvider } from '@hocuspocus/provider'

export default () => {
	const doc = new Y.Doc()

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
        This is a radically reduced version of tiptap. It has support for a document, with paragraphs and text. That’s it. It’s probably too much for real minimalists though.
      </p>
      <p>
        The paragraph extension is not really required, but you need at least one node. Sure, that node can be something different.
      </p>
    `,
  })

// Connect to your Collaboration server  
useEffect(() => {
    const provider = new TiptapCollabProvider({
      name: "document.name", // Unique document identifier for syncing
      appId: '7j9y6m10', // Your Cloud Dashboard AppID or `baseURL` for on-premises
      token: 'notoken', // Your JWT token
      document: doc,
    })
  })

  return (
    <EditorContent editor={editor} />
  )
}
```

After following these steps, you should be able to open two different browsers and connect to the same document simultaneously through separate WebSocket connections. To ensure distinct connections, especially for testing the collaborative features, it's recommended to use two different browsers.

### **Initializing Content Properly**

Upon implementing collaboration in your Tiptap Editor, you might notice that the initial content is repeatedly added each time the editor loads. To prevent this, use the **`.setContent()`** method to set the initial content only once.

```typescript
import './styles.scss'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

import * as Y from 'yjs'
import Collaboration from '@tiptap/extension-collaboration'
import {useEffect} from 'react'

import { TiptapCollabProvider } from '@hocuspocus/provider'

export default () => {
  const doc = new Y.Doc()

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Collaboration.configure({
        document: doc
      })
    ],
// Remove the automatic content addition on editor initialization.
  })
  
  useEffect(() => {
    const provider = new TiptapCollabProvider({
      name: "document.name", // document identifier - all connections sharing the same identifier will be synced
      appId: '7j9y6m10', // Replace this with your AppID from your Cloud Dashboard. In case you're developing on premises replace "appID" with "baseURL"
      token: 'notoken', // replace with your JWT
      document: doc,
      
// The onSynced callback ensures initial content is set only once using editor.setContent(), preventing repetitive content loading on editor syncs.
      onSynced() {

        if( !doc.getMap('config').get('initialContentLoaded') && editor ){
          doc.getMap('config').set('initialContentLoaded', true);

          editor.commands.setContent(`
          <p>
          This is a radically reduced version of tiptap. It has support for a document, with paragraphs and text. That’s it. It’s probably too much for real minimalists though.
        </p>
        <p>
          The paragraph extension is not really required, but you need at least one node. Sure, that node can be something different.
        </p>
          `)
        }

      }
    })
  })

  return (
    <EditorContent editor={editor} />
  )
}
```

This ensures the initial content is set only once. To test with new initial content, create a new document by changing the **`name`** parameter (e.g., from **`document.name`** to **`document.name2`**).

Following this guide will set up a basic, yet functional collaborative Tiptap Editor, synchronized through either the Collaboration Cloud or an on-premises backend.
