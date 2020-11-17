# Get started

## toc

## Introduction
tiptap is framework-agnostic and even works with plain JavaScript, if that’s your thing. To keep everthing as small and flexible as possible, it’s all very modular. Let’s take a few basic building blocks for a test drive.

## Requirements
The following guide assumes you’re working with Vue.js. Hopefully, that helps to get you going with other frameworks (or without a framework at all), while we’re working on more guides. We also assume you’ve [set up Node.js](https://nodejs.org/en/download/) on your machine already.

## 1. Create a new project

### Install Vue CLI (optional)
```bash
# with npm
npm install -g @vue/cli
# with Yarn
yarn global add @vue/cli
```

Let’s start with a fresh Vue.js project. If you already have an existing Vue.js project, that’s fine too. Just skip this first step and proceed with the next step.

### Create a project (optional)
Pick *Default ([Vue 2] babel, eslint)*

```bash
# create a project
vue create tiptap-example

# change directory
cd tiptap-example
```

### Install the dependencies
You can install tiptap for Vue.js as a dependency in your project:

```bash
# install the Vue.js adapter with npm
npm install @tiptap/core @tiptap/vue-starter-kit

# or: install the Vue.js adapter with Yarn
yarn add @tiptap/core @tiptap/vue-starter-kit
```

The `@tiptap/vue-starter-kit` includes a few basics you would probably need anyway. Cool, you have got everything in place to start fiddling around with tiptap! 🙌

Start your project with `$ yarn serve` or `$ npm run serve`. Open [http://localhost:8080/](http://localhost:8080/) in your favorite browser.

## 2. Create a new component
Create a new Vue component (you can call it `<tiptap />`) and add the following content. This is the fastest way to get tiptap up and running with Vue.js. It will give you a very basic version of tiptap, without any buttons. No worries, you will be able to add more functionality soon.

<demo name="Guide/GettingStarted" />

## 3. Add it to your app

```js
<template>
  <div id="app">
    <tiptap />
  </div>
</template>

<script>
import Tiptap from './components/Tiptap.vue'

export default {
  name: 'App',
  components: {
    Tiptap
  }
}
</script>
```

::: warning Nuxt.js
If you use Nuxt.js, note that tiptap needs to run in the client, not on the server. It’s required to wrap the editor in a `<client-only>` tag.
:::

Congrats! You’ve got it! 🎉 Let’s start to configure your editor in the next step.
