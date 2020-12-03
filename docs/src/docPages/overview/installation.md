# Installation

## toc

## Introduction
You’re free to use tiptap with the framework of your choice. Depending on what you want to do, there are a few different ways to install tiptap in your project. Choose the way that fits your workflow.

## Option 1: Vanilla JavaScript
Use tiptap with vanilla JavaScript for a very lightweight and raw experience. If you feel like it, you can even use it to connect tiptap with other frameworks not mentioned here.

```bash
# with npm
npm install @tiptap/core @tiptap/starter-kit

# with Yarn
yarn add @tiptap/core @tiptap/starter-kit
```

Great, that should be enough to start. Here is the most essential code you need to get a running instance of tiptap:

```js
import { Editor } from '@tiptap/core'
import { defaultExtensions } from '@tiptap/starter-kit'

new Editor({
  element: document.querySelector('.element'),
  extensions: defaultExtensions(),
  content: '<p>Your content.</p>',
})
```

## Option 2: Vue.js
To use tiptap with Vue.js (and tools that are based on Vue.js) install tiptap together with the Vue.js adapter in your project. We even prepared a Vue.js starter kit, which gives you a good headstart.

```bash
# with npm
npm install @tiptap/core @tiptap/vue @tiptap/vue-starter-kit

# with Yarn
yarn add @tiptap/core @tiptap/vue @tiptap/vue-starter-kit
```

Create a new component and add the following content to get a basic version of tiptap:

<demo name="Overview/Installation" />

### Nuxt.js
Note that tiptap needs to run in the client, not on the server. It’s required to wrap the editor in a `<client-only>` tag.

[Read more](https://nuxtjs.org/api/components-client-only)

## Option 3: CodeSandbox
CodeSandbox is an online coding environment. It’s great to fiddle around without setting up a local project and to share your code with others.

<iframe
  src="https://codesandbox.io/embed/tiptap-issue-template-b83rr?fontsize=14&hidenavigation=1&module=%2Fsrc%2Fcomponents%2FTiptap.vue&theme=dark"
  style="width:100%; height:400px; border:0; border-radius: 4px; overflow:hidden;"
  title="tiptap-issue-template"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

It’s also amazing for bug reports. Try to recreate a bug there and share it with us before when you [file an issue on GitHub](https://github.com/ueberdosis/tiptap-next/issues/new/choose). That helps us to reproduce the bug quickly, and fix them faster.


## Option 4: CDN (Draft)
To pull in tiptap for quick demos or just giving it a spin, grab the latest build via CDN. We use two different provides:

### Skypack (ES Modules)
Skypack enables you to use ES modules, which should be supported in all modern browsers. The packages are smaller, that’s great, too. So here is how to use it:

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

### ~~Unpkg (UMD, deprecated)~~
We also have an UMD build on unpkg. Those UMD builds are larger, but should work even in older browsers. As tiptap doesn’t work in older browsers anyway, we tend to remove those builds. What do you think? Anyway, here‘s how you can use it:

```html
<!doctype html>
<head>
  <meta charset="utf-8">
  <script src="https://unpkg.com/@tiptap/core@latest"></script>
  <script src="https://unpkg.com/@tiptap/starter-kit@latest"></script>
</head>
<body>
  <div class="element"></div>
  <script>
    const { Editor } = window['@tiptap/core']
    const { defaultExtensions } = window['@tiptap/starter-kit']
    const editor = new Editor({
      element: document.querySelector('.element'),
      extensions: defaultExtensions(),
      content: '<p>Your content.</p>',
    })
  </script>
</body>
</html>
```
