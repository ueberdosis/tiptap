# Installation

## toc

## Introduction
There are a few different ways to install tiptap, depending on your development setup. We have put together integration guides for a few popular frameworks to get you started quickly. You can even use tiptap without any front-end framework, too. Choose the way that fits your workflow and start building cool things!

## Integration guides
* [Vue.js](/guide/getting-started/vue)
* [Nuxt.js](/guide/getting-started/nuxt)
* [React](/guide/getting-started/react) (Draft)
* [Svelte](/guide/getting-started/svelte) (Draft)
* [Alpine.js](/guide/getting-started/alpine) (Draft)
* [Livewire](/guide/getting-started/livewire) (Draft)

Don’t see your framework here? That shouldn’t stop you from installing tiptap. Just use the Vanilla JavaScript version, that should work fine, too.

## Vanilla JavaScript
Use tiptap with vanilla JavaScript for a very lightweight and raw experience. If you feel like it, you can use that version to connect tiptap with other frameworks not mentioned here, too.

```bash
# with npm
npm install @tiptap/core @tiptap/starter-kit

# with Yarn
yarn add @tiptap/core @tiptap/starter-kit
```

Great, that’s all you need for now. Here is the boilerplate code to start your first tiptap instance:

```js
import { Editor } from '@tiptap/core'
import { defaultExtensions } from '@tiptap/starter-kit'

new Editor({
  element: document.querySelector('.element'),
  extensions: defaultExtensions(),
  content: '<p>Your content.</p>',
})
```

## CDN
For testing purposes or demos, use our [Skypack](https://www.skypack.dev/) CDN builds. Here are the few lines of code you need to get started:

```html
<!doctype html>
<head>
  <meta charset="utf-8">
</head>
<body>
  <div class="element"></div>
  <script type="module">
    import { Editor } from 'https://cdn.skypack.dev/@tiptap/core?min'
    import { defaultExtensions } from 'https://cdn.skypack.dev/@tiptap/starter-kit?min'
    const editor = new Editor({
      element: document.querySelector('.element'),
      extensions: defaultExtensions(),
      content: '<p>Your content.</p>',
    })
  </script>
</body>
</html>
```

## CodeSandbox
CodeSandbox is an online coding environment. It’s great to fiddle around without setting up a local project and to share your code with others.

<iframe
  src="https://codesandbox.io/embed/tiptap-issue-template-b83rr?fontsize=14&hidenavigation=1&module=%2Fsrc%2Fcomponents%2FTiptap.vue&theme=dark"
  style="width:100%; height:400px; border:0; border-radius: 4px; overflow:hidden;"
  title="tiptap-issue-template"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

It’s also amazing for bug reports. Try to recreate a bug there and share it with us before you [file an issue on GitHub](https://github.com/ueberdosis/tiptap-next/issues/new/choose). That helps us to reproduce the bug easily, and release a fix faster.
