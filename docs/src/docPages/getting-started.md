# First steps with tiptap

tiptap is framework-agnostic and works with plain JavaScript, Vue.js and React. To use tiptap with Vue.js or one of the tools that are based on Vue.js like Nuxt.js or Gridsome, you’ll need the tiptap Vue.js adapter. Install it as an dependency in your project:

```bash
# Install Vue.js adapter with npm
npm install @tiptap/core @tiptap/starter-kit @tiptap/vue

# Install Vue.js adapter with Yarn
yarn add @tiptap/core @tiptap/starter-kit @tiptap/vue
```

Create a new Vue component (e. g. `<Tiptap />`) and add the following content. That’s the shortest way to get tiptap up and running with Vue.js. No worries, you’ll be able to add more functionality soon.

<demo name="GettingStarted" />

Does that work for you? There are a few common pitfalls here, if you have trouble getting started, try to read more here:

* [tiptap doesn’t have a default styling](#)
* [Use tiptap with Nuxt.js](#)

Most people would expect a text editor to have buttons to make the text bold or add links. tiptap has all of that, but it is very modular. You are free to decided what you use and how you use it. Use it as a more powerful textarea or build a full-blown editor. tiptap is ready for both.

But let’s try to add a menu in the next step.