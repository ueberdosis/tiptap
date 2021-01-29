<template>
  <Layout :show-sidebar="false">
    <app-section>
      <h1>
        Headless WYSIWYG Text Editor
      </h1>
      <p>
        tiptap is a headless wrapper around [ProseMirror](https://ProseMirror.net) – a toolkit for building rich text WYSIWYG editors, which is already in use at many well-known companies such as *New York Times*, *The Guardian* or *Atlassian*.
      </p>
      <p>
        Create exactly the rich text editor you want out of customizable building blocks. tiptap comes with sensible defaults, a lot of extensions and a friendly API to customize every aspect. It’s backed by a welcoming community, open source, and free.
      </p>
    </app-section>

    <app-section>
      <iframe
        v-resize
        src="demos/Examples/CollaborativeEditing"
        style="background-color: white; border-radius: 8px;"
        width="100%"
        height="400"
        frameborder="0"
      />
      <demo name="Examples/CollaborativeEditing" :show-source="false" inline />
    </app-section>

    <app-section>
      <h2>
        Features
      </h2>

      <h3>
        Headless
      </h3>
      <p>
        We don’t tell you what a menu should look like or where it should be rendered in the DOM. That’s why tiptap is headless and comes without any CSS. You are in full control over markup, styling and behaviour.
      </p>

      <h3>
        Framework-agnostic
      </h3>
      <p>
        No matter what framework you use, you’ll enjoy tiptap. Out of the box, it works with plain JavaScript and Vue.js, but it’s also possible to use it in [React](/guide/getting-started/react), Svelte and others.
      </p>

      <h3>
        TypeScript
      </h3>
      <p>
        tiptap 2 is written in TypeScript. That helps us to find bugs early and gives you a nice autocomplete for the API (if your IDE supports that) on top of the extensive human written documentation.
      </p>

      <h3>
        Collaborative
      </h3>
      <p>
        Real-time collaboration, syncing between different devices and working offline used to be hard. We provide everything you need to keep everything in sync, conflict-free with the power of [Y.js](https://github.com/yjs/yjs). Our production-grade setup requires less than 20 lines of code.
      </p>

      <h3>
        Community
      </h3>
      <p>
        Over the years, a lovely community has grown around tiptap. There’s so much content shared, so many people helping out in issues and a ton of community extensions, you’ll be surprised how much that can help.
      </p>
    </app-section>

    <app-section>
      <h2>
        Who uses tiptap?
      </h2>
      - [GitLab](https://gitlab.com)
      - [Statamic CMS](https://statamic.com)
      - [Twill CMS](https://twill.io)
      - [ApostropheCMS](https://apostrophecms.com)
      - [Directus CMS](https://directus.io)
      - [Nextcloud](https://apps.nextcloud.com/apps/text)
      - [DocIQ](https://www.dociq.io)
      - [ycode](https://www.ycode.com/)
      - [Scrumpy](https://www.scrumpy.io)
      - … and [many more](https://github.com/ueberdosis/tiptap/network/dependents?package_id=UGFja2FnZS0xMzE5OTg0ODc%3D)
    </app-section>

    <app-section>
      <h2>
        License
      </h2>
      <p>
        tiptap is licensed under [MIT](https://github.com/ueberdosis/tiptap-next/blob/main/LICENSE.md), so you’re free to do whatever you want. If you’re using it in production, do the right thing and [become one of our wonderful sponsors](/sponsor) to fund the development, maintenance and support of tiptap and the whole ecosystem.
      </p>
    </app-section>
  </Layout>
</template>

<script>
import AppSection from '@/components/AppSection'

export default {
  components: {
    AppSection,
  },
}
</script>
