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
# install with npm
npx create-react-app my-tiptap-project --template tiptap

# install with Yarn
yarn create react-app my-tiptap-project --template tiptap
```

### Step by step
All steps are listed below, but if you prefer to watch a video we’ve got something for you, too:

https://tiptap.dev/screencasts/installation/install-tiptap-with-create-react-app

#### 1. Create a project (optional)
Let’s start with a fresh React project called `my-tiptap-project`. [Create React App](https://reactjs.org/docs/getting-started.html) will set up everything we need.

```bash
# create a project with npm
npx create-react-app my-tiptap-project

# or if you prefer Yarn
yarn create react-app my-tiptap-project

# change directory
cd my-tiptap-project
```

#### 2. Install the dependencies
Time to install the `@tiptap/react` package and our [`StarterKit`](/api/extensions/starter-kit), which has the most popular extensions to get started quickly.

```bash
# install with npm
npm install @tiptap/react @tiptap/starter-kit

# install with Yarn
yarn add @tiptap/react @tiptap/starter-kit
```

If you followed step 1 and 2, you can now start your project with `npm run start` or `yarn start`, and open [http://localhost:3000](http://localhost:3000) in your browser.

#### 3. Create a new component
To actually start using Tiptap we need to create a new component. Let’s call it `Tiptap` and put the following example code in `src/Tiptap.jsx`.

```jsx
// src/Tiptap.jsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const Tiptap = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: '<p>Hello World!</p>',
  })

  return (
    <EditorContent editor={editor} />
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

You should now see a pretty barebones example of Tiptap in your browser.

#### 5. The complete setup (optional)
Ready to add more? Below is a demo that shows how you could set up a basic toolbar. Feel free to take it and start customizing it to your needs:

https://embed.tiptap.dev/preview/Examples/Default
