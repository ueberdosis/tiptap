---
title: Next.js WYSIWYG
tableOfContents: true
---

# Next.js

## Introduction
The following guide describes how to integrate Tiptap with your [Next.js](https://nextjs.org/) project.

## Requirements
* [Node](https://nodejs.org/en/download/) installed on your machine
* Experience with [React](https://reactjs.org/)

## 1. Create a project (optional)
If you already have an existing Next.js project, that’s fine too. Just skip this step and proceed with the next step.

For the sake of this guide, let’s start with a new Next.js project called `tiptap-example`. The following command sets up everything we need to get started.
```bash
# create a project
npx create-next-app Tiptap-example

# change directory
cd Tiptap-example
```

## 2. Install the dependencies
Now that we have a standard boilerplate set up we can get started on getting Tiptap up and running! For this we will need to install two packages: `@tiptap/react` and `@tipta/starter-kit` which includes all the extensions you need to get started quickly.

```bash
# install with npm
npm install @tiptap/react @tiptap/starter-kit

# install with Yarn
yarn add @tiptap/react @tiptap/starter-kit
```

If you followed step 1 and 2, you can now start your project with `npm run dev` or `yarn dev`, and open [http://localhost:3000/](http://localhost:3000/) in your favorite browser. This might be different, if you’re working with an existing project.

## 3. Create a new component
To actually start using Tiptap, you’ll need to add a new component to your app. To do this, first create a directory called `components/`. Now it's time to create our component which we'll call `Tiptap`. To do this put the following example code in `components/Tiptap.js`.

```jsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const Tiptap = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: '<p>Hello World! 🌎️</p>',
  })

  return (
    <EditorContent editor={editor} />
  )
}

export default Tiptap;
```

## 4. Add it to your app
Now, let’s replace the content of `pages/index.js` with the following example code to use our new `Tiptap` component in our app.

```jsx
import Tiptap from '../components/Tiptap'

export default function Home() {
    return (
         <Tiptap />
    )
}
```
You should now see Tiptap in your browser. Time to give yourself a pat on the back! :)
