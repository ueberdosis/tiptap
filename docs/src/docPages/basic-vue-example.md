# Use tiptap with Vue.js

tiptap is framework-agnostic and works with plain JavaScript, Vue.js and React. To use tiptap with Vue.js or one of the tools that are based on Vue.js like Nuxt.js or Gridsome, you’ll need the tiptap Vue.js adapter. Install it as an dependency in your project:

```bash
# Install tiptap & Vue.js adapter with npm
npm install @tiptap/core @tiptap/starter-kit @tiptap/vue

# Install tiptap & Vue.js adapter with Yarn
yarn add @tiptap/core @tiptap/starter-kit @tiptap/vue
```

Create a new Vue component (e. g. `<Tiptap />`) and add the following content. That’s the shortest way to get tiptap up and running with Vue.js. No worries, you’ll be able to add more functionality soon.

<demo name="VueSetup" />