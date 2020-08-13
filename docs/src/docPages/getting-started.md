# Getting started

tiptap is framework-agnostic and works with Vue.js and React. It even works with plain JavaScript, if that’s your thing. To keep everything as small as possible, we put the code to use tiptap with those frameworks in different packages.

## 1. Install the dependencies

We assume you already have a [Vue.js](https://cli.vuejs.org/) (or [Nuxt.js](https://nuxtjs.org/)) project. To connect tiptap with Vue.js you are going to need an adapter. You can install tiptap for Vue.js as a dependency in your project:

```bash
# Install Vue.js adapter with npm
npm install @tiptap/vue @tiptap/vue-starter-kit

# Or: Install Vue.js adapter with Yarn
yarn add @tiptap/vue @tiptap/vue-starter-kit
```

The `@tiptap/vue-starter-kit` includes a few basics you would probably need anyway. Cool, you have got everything in place to set up tiptap! 🙌

## 2. Create a new component

Create a new Vue component (you can call it `<Tiptap />`) and add the following content. This is the fastest way to get tiptap up and running with Vue.js. It will give you a very basic version of tiptap, without any buttons. No worries, you will be able to add more functionality soon.

<demo name="GettingStarted" />

> **Doesn’t work for you?** There are a few common pitfalls here, depending on your setup. If you have trouble getting started, try to read the related links down here.

Congrats! You’ve got it! 🎉 Let’s start to build your editor in the next step.

### Related links

* [Use tiptap with Nuxt.js](#)
* [tiptap doesn’t have a default styling](#)
