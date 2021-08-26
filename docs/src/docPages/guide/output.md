---
tableOfContents: true
---

# Output

## toc

## Introduction
You can store your content as a JSON object or as a good old HTML string. Both work fine. And of course, you can pass both formats to the editor to restore your content. Here is an interactive example, that exports the content as HTML and JSON when the document is changed:

## Export

### Option 1: JSON
JSON is probably easier to loop through, for example to look for a mention and it’s more like what tiptap uses under the hood. Anyway, if you want to use JSON to store the content we provide a method to retrieve the content as JSON:

```js
const json = editor.getJSON()
```

You can store that in your database (or send it to an API) and restore the document initially like that:

```js
new Editor({
  content: {
    "type": "doc",
    "content": [
      // …
    ]
  },
})
```

Or if you need to wait for something, you can do it later through the editor instance:

```js
editor.commands.setContent({
  "type": "doc",
  "content": [
    // …
  ]
})
```

Here is an interactive example where you can see that in action:

<tiptap-demo name="GuideContent/ExportJSON" hideSource></tiptap-demo>

### Option 2: HTML
HTML can be easily rendered in other places, for example in emails and it’s wildly used, so it’s probably easier to switch the editor at some point. Anyway, every editor instance provides a method to get HTML from the current document:

```js
const html = editor.getHTML()
```

This can then be used to restore the document initially:

```js
new Editor({
  content: `<p>Example Text</p>`,
})
```

Or if you want to restore the content later (e. g. after an API call has finished), you can do that too:
```js
editor.commands.setContent(`<p>Example Text</p>`)
```

Use this interactive example to fiddle around:

<tiptap-demo name="GuideContent/ExportHTML" hideSource></tiptap-demo>

### Option 3: Y.js
Our editor has top notch support for Y.js, which is amazing to add features like [realtime collaboration, offline editing, or syncing between devices](/guide/collaborative-editing).

Internally, Y.js stores a history of all changes. That can be in the browser, on a server, synced with other connected clients, or on a USB stick. But, it’s important to know that Y.js needs those stored changes. A simple JSON document is not enough to merge changes.

Sure, you can import existing JSON documents to get started and get a JSON out of Y.js, but that’s more like an import/export format. It won’t be your single source. That’s important to consider when adding Y.js for one of the mentioned use cases.

That said, it’s amazing and we’re about to provide an amazing backend, that makes all that a breeze.

### Not an option: Markdown
Unfortunately, **tiptap doesn’t support Markdown as an input or output format**. We considered to add support for it, but those are the reasons why we decided to not do it:

* Both, HTML and JSON, can have deeply nested structures, Markdown is flat.
* Markdown standards vary.
* tiptap’s strength is customization, that doesn’t work very well with Markdown.
* There are enough packages to convert HTML to Markdown and vice-versa.

You should really consider to work with HTML or JSON to store your content, they are perfectly fine for most use cases.

If you still think you need Markdown, ProseMirror has an [example on how to deal with Markdown](https://prosemirror.net/examples/markdown/), [Nextcloud Text](https://github.com/nextcloud/text) uses tiptap 1 to work with Markdown. Maybe you can learn from them. Or if you are looking for a really good Markdown editor, try [CodeMirror](https://codemirror.net/).

That said, tiptap does support [Markdown shortcuts](/examples/markdown-shortcuts) to format your content. Also you’re free to let your content look like Markdown, for example add a `#` before an `<h1>` with CSS.

## Listening for changes
If you want to continuously store the updated content while people write, you can [hook into events](/api/events). Here is an example how that could look like:

```js
const editor = new Editor({
  // intial content
  content: `<p>Example Content</p>`,

  // triggered on every change
  onUpdate() {
    const json = this.getJSON()
    // send the content to an API here
  },
})
```

## Rendering

### Option 1: Read-only instance of tiptap
To render the saved content, set the editor to read-only. That’s how you can achieve the exact same rendering as it’s in the editor, without duplicating your CSS and other code.

<tiptap-demo name="GuideContent/ReadOnly"></tiptap-demo>

### Option 2: Generate HTML from ProseMirror JSON
If you need to render the content on the server side, for example to generate the HTML for a blog post which has been written in tiptap, you’ll probably want to do just that without an actual editor instance.

That’s what the `generateHTML()` is for. It’s a helper function which renders HTML without an actual editor instance.

<tiptap-demo name="GuideContent/GenerateHTML"></tiptap-demo>

By the way, the other way is possible, too. The below examples shows how to generate JSON from HTML.

<tiptap-demo name="GuideContent/GenerateJSON"></tiptap-demo>

## Migration
If you’re migrating existing content to tiptap we would recommend to get your existing output to HTML. That’s probably the best format to get your initial content into tiptap, because ProseMirror ensures there is nothing wrong with it. Even if there are some tags or attributes that aren’t allowed (based on your configuration), tiptap just throws them away quietly.

We’re about to go through a few cases to help with that, for example we provide a PHP package to convert HTML to a compatible JSON structure: [ueberdosis/prosemirror-to-html](https://github.com/ueberdosis/html-to-prosemirror).

[Share your experiences with us!](mailto:humans@tiptap.dev) We’d like to add more information here.

## Security
There is no reason to use one or the other because of security concerns. If someone wants to send malicious content to your server, it doesn’t matter if it’s JSON or HTML. It doesn’t even matter if you’re using tiptap or not. You should always validate user input.
