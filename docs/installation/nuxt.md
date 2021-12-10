---
title: Nuxt.js WYSIWYG
tableOfContents: true
---

# Nuxt.js

## Introduction
The following guide describes how to integrate Tiptap with your [Nuxt.js](https://nuxtjs.org/) project.

## Requirements
* [Node](https://nodejs.org/en/download/) installed on your machine
* Experience with [Vue](https://vuejs.org/v2/guide/#Getting-Started)

## 1. Create a project (optional)
If you already have an existing Vue project, that’s fine too. Just skip this step and proceed with the next step.

For the sake of this guide, let’s start with a fresh Nuxt.js project called `my-tiptap-project`. The following command sets up everything we need. It asks a lot of questions, but just use what floats your boat or use the defaults.

```bash
# create a project
npm init nuxt-app my-tiptap-project

# change directory
cd my-tiptap-project
```

## 2. Install the dependencies
Okay, enough of the boring boilerplate work. Let’s finally install Tiptap! For the following example you’ll need the `@tiptap/vue-2` package, with a few components, and `@tiptap/starter-kit` which has the most common extensions to get started quickly.

```bash
npm install @tiptap/vue-2 @tiptap/starter-kit
```

If you followed step 1 and 2, you can now start your project with `npm run serve`, and open [http://localhost:8080/](http://localhost:8080/) in your favorite browser. This might be different, if you’re working with an existing project.

## 3. Create a new component
To actually start using Tiptap, you’ll need to add a new component to your app. Let’s call it `Tiptap` and put the following example code in `src/components/Tiptap.vue`.

This is the fastest way to get Tiptap up and running with Vue. It will give you a very basic version of Tiptap, without any buttons. No worries, you will be able to add more functionality soon.

```html
<template>
  <editor-content :editor="editor" />
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import StarterKit from '@tiptap/starter-kit'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
    }
  },

  mounted() {
    this.editor = new Editor({
      content: '<p>I’m running Tiptap with Vue.js. 🎉</p>',
      extensions: [
        StarterKit,
      ],
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
```

## 4. Add it to your app
Now, let’s replace the content of `pages/index.vue` with the following example code to use our new `Tiptap` component in our app.

```html
<template>
  <div id="app">
    <client-only>
      <tiptap />
    </client-only>
  </div>
</template>
```

Note that Tiptap needs to run in the client, not on the server. It’s required to wrap the editor in a `<client-only>` tag. [Read more about cient-only components.](https://nuxtjs.org/api/components-client-only)

You should now see Tiptap in your browser. Time to give yourself a pat on the back! :)

## 5. Use v-model (optional)
You’re probably used to bind your data with `v-model` in forms, that’s also possible with Tiptap. Here is a working example component, that you can integrate in your project:

https://embed.tiptap.dev/preview/GuideGettingStarted/VModel

```html
<template>
  <editor-content :editor="editor" />
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import StarterKit from '@tiptap/starter-kit'

export default {
  components: {
    EditorContent,
  },

  props: {
    value: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      editor: null,
    }
  },

  watch: {
    value(value) {
      // HTML
      const isSame = this.editor.getHTML() === value

      // JSON
      // const isSame = JSON.stringify(this.editor.getJSON()) === JSON.stringify(value)

      if (isSame) {
        return
      }

      this.editor.commands.setContent(value, false)
    },
  },

  mounted() {
    this.editor = new Editor({
      content: this.value,
      extensions: [
        StarterKit,
      ],
      onUpdate: () => {
        // HTML
        this.$emit('input', this.editor.getHTML())

        // JSON
        // this.$emit('input', this.editor.getJSON())
      },
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
```
