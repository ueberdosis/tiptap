# Getting started

## toc

## Introduction
tiptap 2 is framework-agnostic and even works with plain JavaScript, if that’s your thing. As the previous major version required Vue, we decided to focus on Vue in the first version of this guide. That said, it’s probably helpful for developers who work with different technologies too.

## Requirements
* [Node](https://nodejs.org/en/download/) installed on your machine
* Experience with [Vue](https://vuejs.org/v2/guide/#Getting-Started)

## 1. Install Vue CLI (optional)
Vue CLI aims to be the standard tooling baseline for the Vue ecosystem, and helps to create new projects quickly. If you’re working with Vue a lot, chances are you have this installed already. Just skip this step then.

Here is how you could install (or update) it:

```bash
# with npm
npm install -g @vue/cli

# with Yarn
yarn global add @vue/cli
```

From now on, the `vue` command is available globally. Test it with `vue --version`, this should output the current version.

## 2. Create a project (optional)
If you already have an existing Vue project, that’s fine too. Just skip this step and proceed with the next step.

For the sake of this guide, let’s start with a fresh Vue project called `tiptap-example`. The Vue CLI sets up everything we need, just select the default Vue 2 template.

```bash
# create a project
vue create tiptap-example

# change directory
cd tiptap-example
```

## 3. Install the dependencies
Okay, enough of the boring boilerplate work. Let’s finally install tiptap! For the following example you’ll need the `@tiptap/core` (the actual editor) and the `@tiptap/vue-starter-kit` which has everything to get started quickly, for example a few default extensions and a basic Vue component.

```bash
# install with npm
npm install @tiptap/core @tiptap/vue-starter-kit

# install with Yarn
yarn add @tiptap/core @tiptap/vue-starter-kit
```

If you followed step 1 and 2, you can now start your project with `npm run serve` or `yarn serve`, and open [http://localhost:8080/](http://localhost:8080/) in your favorite browser. This might be different, if you’re working with an existing project.

## 4. Create a new component
To actually start using tiptap, you’ll need to add a new component to your app. Let’s call it `Tiptap` and put the following example code in `src/components/Tiptap.vue`.

This is the fastest way to get tiptap up and running with Vue. It will give you a very basic version of tiptap, without any buttons. No worries, you will be able to add more functionality soon.

<demo name="Guide/GettingStarted" />

## 5. Add it to your app
Now, let’s replace the content of `src/App.vue` with the following example code to use our new `Tiptap` component in our app.

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

You should now see tiptap in your browser. You’ve successfully set up tiptap! Time to give yourself a pat on the back. Let’s start to configure your editor in the next step.
