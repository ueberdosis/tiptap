# Adding offline support to your editor

Easily add offline functionality to your collaborative editor by using the [Y IndexedDB](https://docs.yjs.dev/ecosystem/database-provider/y-indexeddb) extension. This tool from the Y.js ecosystem enhances your editor with offline data storage and sync capabilities.

## Integrating offline support

Begin by adding the Y IndexedDB adapter to your project:

```bash
npm install y-indexeddb
```

Connect Y Indexeddb with a Y document to store it locally.

```typescript
import { Editor } from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'
import { IndexeddbPersistence } from 'y-indexeddb'

const ydoc = new Y.Doc()

// Set up IndexedDB for local storage of the Y document
new IndexeddbPersistence('example-document', ydoc)

const editor = new Editor({
  extensions: [
    // Other extensions...
    Collaboration.configure({
      document: ydoc,
    }),
  ],
});
```

The IndexedDB adapter ensures that every change to your document is stored locally in the browser. This means your work is saved even if you close the tab, lose your internet connection, or edit offline. When you're back online, it automatically syncs these changes.
