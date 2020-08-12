# Getting started

tiptap is framework-agnostic and works with Vue.js and React. It even works with plain JavaScript, if that’s your thing. To keep everything as small as possible, we put the code to use tiptap with those frameworks in different packages. To use tiptap with Vue.js (or Nuxt.js), you’ll need the tiptap Vue.js adapter. You can install it as an dependency in your project:

```bash
# Install Vue.js adapter with npm
npm install @tiptap/core @tiptap/starter-kit @tiptap/vue

# Install Vue.js adapter with Yarn
yarn add @tiptap/core @tiptap/starter-kit @tiptap/vue
```

Now you have got everything in place to add tiptap to your Vue.js project.

## Create a new component

Create a new Vue component (e. g. `<Tiptap />`) and add the following content. That is the shortest way to get tiptap up and running with Vue.js. It’s a pretty basic version of tiptap but no worries, you will be able to add more functionality soon.

<demo name="GettingStarted" />

Does that work for you? There are a few common pitfalls here, depending on your setup. If you have trouble getting started, try to read the related links down here.

Otherwise: Congrats! You’ve got it! Let’s start with the confiuration in the next step.

### Related links

* [Use tiptap with Nuxt.js](#)
* [tiptap doesn’t have a default styling](#)
