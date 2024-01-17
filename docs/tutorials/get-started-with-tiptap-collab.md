# Getting started with Tiptap Collab

## Introduction

**Welcome** to the first of a series of tutorials about collaboration in Tiptap (or Lexical, Quill, Slate, and others that have a [Yjs editor binding](https://docs.yjs.dev/ecosystem/editor-bindings)) using Tiptap Collab. This series will start covering the basics, and expand to more specific use cases in the next posts. For today, we’ll start moving from a simple textarea box to a fully collaborative editor instance.

Imagine that you are building a simple sticky note app, where a user can create notes.

So let's say you have a few textareas. Depending on your framework (Vue, React, ..), the code probably looks similar to this:

<tiptap-demo name="Tutorials/1-1-textarea"></tiptap-demo>

## Setting Up Tiptap

In order to incorporate the Tiptap editor instance for better collaboration and formatting options, you start by modifying your code to include Tiptap in the Note component.

You begin by importing the necessary Tiptap components and creating a new editor instance within the Note component.

```bash
npm install @tiptap/vue-3 @tiptap/pm @tiptap/starter-kit
# for React: npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
```

<tiptap-demo name="Tutorials/1-2-tiptap"></tiptap-demo>

Now your Note component has a fully functional Tiptap editor instance! The user can now format their text (see https://tiptap.dev/guide/menus on how to add a menu bar, in our example, you can make text bold using cmd+b). But what about collaboration?

## Adding Yjs

To enable collaboration, you need to add the Collaboration extension to your editor instance. This extension allows multiple users to edit the same document simultaneously, with changes being synced in realtime.


To add the Collaboration extension to your editor instance, you first need to install the `@tiptap/extension-collaboration` package:

```bash
npm install @tiptap/extension-collaboration yjs
```

Then, you can import the `Collaboration` extension and add it to your editor extensions:

<tiptap-demo name="Tutorials/1-3-yjs"></tiptap-demo>

ok, so what have we done?

We just added the collaboration extension as well as the technology behind it, Yjs. Instead of raw text we are passing the Y.Doc which basically takes care of merging changes. But so far, there is no collaboration...

## Real-Time Collaboration with Tiptap Collab

To enable real-time collaboration, we need to connect the Y.Doc with the TiptapCollabProvider. The TiptapCollabProvider is a package that provides a simple way to synchronize Y.Doc's across different clients.

To start using TiptapCollabProvider, we need to create a new instance of the TiptapCollabProvider class and pass our Y.Doc. We also need to provide a document name.

To get started, let's sign up for a Tiptap Pro account, which comes with a free licence of Tiptap Collab:

!!tiptap-collab-cta

After you signed up, click on "Join the Beta". Just follow the instructions and you'll be set up within a few minutes.

Your app ID is shown in the collab admin interface: https://collab.tiptap.dev/ - just copy that and also already get the JWT from the settings area. It's valid for two hours, so more than enough for our quick test. We'll cover generating JWTs using your secret later.


Now, back to our application:

```bash
npm install @hocuspocus/provider
```

Let's now create the TiptapCollabProvider to finally get syncing:

<tiptap-demo name="Tutorials/1-4-collab"></tiptap-demo>

And that's it! With these changes, our Tiptap note-taking application is now fully collaborative. Notes will get synced to other users in realtime.


We've only scratched the surface of what Tiptap Collab and Hocuspocus can do. Keep an eye out for future articles where we'll delve into more complex scenarios like permissions, presence indicators, and beyond. Don't miss out!
