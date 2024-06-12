---
title: React WYSIWYG
tableOfContents: true
---

# React

## Introduction
The following guide describes how to integrate Tiptap with your [React](https://reactjs.org/) project. We’re using [Create React App](https://reactjs.org/docs/getting-started.html) here, but the workflow should be similar with other setups.

## Create React App

### Quickstart
If you just want to get up and running with Tiptap you can use the [Tiptap Create React App template by @alb](https://github.com/alb/cra-template-tiptap) to create a new project with all the steps listed below completed already.

```bash
npx create-react-app my-tiptap-project --template tiptap
```

#### 1. Create a project (optional)
Let’s start with a fresh React project called `my-tiptap-project`. [Create React App](https://reactjs.org/docs/getting-started.html) will set up everything we need.

```bash
# create a project with npm
npx create-react-app my-tiptap-project

# change directory
cd my-tiptap-project
```

#### 2. Install the dependencies
Time to install the `@tiptap/react` package, `@tiptap/pm` (the ProseMirror library) and `@tiptap/starter-kit`, which includes the most popular extensions to get started quickly.

```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
```

If you followed step 1 and 2, you can now start your project with `npm run start`, and open [http://localhost:3000](http://localhost:3000) in your browser.

#### 3. Create a new component
To actually start using Tiptap we need to create a new component. Let’s call it `Tiptap` and put the following example code in `src/Tiptap.jsx`.

```jsx
// src/Tiptap.jsx
import { EditorProvider, FloatingMenu, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

// define your extension array
const extensions = [
  StarterKit,
]

const content = '<p>Hello World!</p>'

const Tiptap = () => {
  return (
    <EditorProvider extensions={extensions} content={content}>
      <FloatingMenu>This is the floating menu</FloatingMenu>
      <BubbleMenu>This is the bubble menu</BubbleMenu>
    </EditorProvider>
  )
}

export default Tiptap
```

**Important Note**: You can always use the `useEditor` hook if you want to avoid using the Editor context.

```jsx
// src/Tiptap.jsx
import { useEditor, EditorContent, FloatingMenu, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

// define your extension array
const extensions = [
  StarterKit,
]

const content = '<p>Hello World!</p>'

const Tiptap = () => {
  const editor = useEditor({
    extensions,
    content,
  })

  return (
    <>
      <EditorContent editor={editor} />
      <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>
      <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu>
    </>
  )
}

export default Tiptap
```

#### 4. Add it to your app
Finally, replace the content of `src/App.js` with our new `Tiptap` component.

```jsx
import Tiptap from './Tiptap.jsx'

const App = () => {
  return (
    <div className="App">
      <Tiptap />
    </div>
  )
}

export default App
```

#### 5. Consume the Editor context in child components

If you use the `EditorProvider` to setup your Tiptap editor, you can now easily access your editor instance from any child component using the `useCurrentEditor` hook.

```jsx
import { useCurrentEditor } from '@tiptap/react'

const EditorJSONPreview = () => {
  const { editor } = useCurrentEditor()

  return (
    <pre>
      {JSON.stringify(editor.getJSON(), null, 2)}
    </pre>
  )
}
```

**Important**: This won't work if you use the `useEditor` hook to setup your editor.

You should now see a pretty barebones example of Tiptap in your browser.

#### 6. Add before or after slots
Since the EditorContent component is rendered by the `EditorProvider` component, we now can't directly define where to render before or after content of our editor. For that we can use the `slotBefore` & `slotAfter` props on the `EditorProvider` component.

```jsx
<EditorProvider
  extensions={extensions}
  content={content}
  slotBefore={<MyEditorToolbar />}
  slotAfter={<MyEditorFooter />}
/>
```

#### 7. The complete setup (optional)
Ready to add more? Below is a demo that shows how you could set up a basic toolbar. Feel free to take it and start customizing it to your needs:

https://embed.tiptap.dev/preview/Examples/Default
