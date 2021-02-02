<template>
  <Layout :show-sidebar="false">
    <app-section>
      <div class="text">
        <h1 class="is-large">
          A framework to build the editor you want
        </h1>
        <p class="is-large">
          tiptap is a headless wrapper around <a href="https://ProseMirror.net">ProseMirror</a> – a toolkit for building rich text WYSIWYG editors, which is already in use at many well-known companies such as <em>New York Times</em>, <em>The Guardian</em> or <em>Atlassian</em>.
        </p>
        <p class="is-large">
          Create exactly the rich text editor you want out of customizable building blocks. tiptap comes with sensible defaults, a lot of extensions and a friendly API to customize every aspect. It’s backed by a welcoming community, open source, and free.
        </p>
      </div>
    </app-section>

    <app-section>
      <demo name="Examples/CollaborativeEditing" inline />
    </app-section>

    <app-section>
      <feature-list>
        <feature-item>
          <h3 class="is-h2">
            Headless
          </h3>
          <p>
            We don’t tell you what a menu should look like or where it should be rendered in the DOM. That’s why tiptap is headless and comes without any CSS. You are in full control over markup, styling and behaviour.
          </p>
          <p>
            <g-link to="/guide/styling">
              Styling
            </g-link>
          </p>
        </feature-item>

        <feature-item>
          <h3 class="is-h2">
            Framework-agnostic
          </h3>
          <p>
            No matter what framework you use, you’ll enjoy tiptap. Out of the box, it works with plain JavaScript and Vue.js, but it’s also possible to use it in <g-link to="/guide/getting-started/react">
              React
            </g-link>, Svelte and others.
          </p>
          <p>
            <g-link to="/overview/installation">
              Installation
            </g-link>
          </p>
        </feature-item>

        <feature-item>
          <h3 class="is-h2">
            TypeScript
          </h3>
          <p>
            tiptap 2 is written in TypeScript. That helps us to find bugs early and gives you a nice autocomplete for the API (if your IDE supports that) on top of the extensive human written documentation.
          </p>
          <p>
            <g-link to="/guide/typescript">
              TypeScript
            </g-link>
          </p>
        </feature-item>

        <feature-item>
          <h3 class="is-h2">
            Collaborative
          </h3>
          <p>
            Real-time collaboration, syncing between different devices and working offline used to be hard. We provide everything you need to keep everything in sync, conflict-free with the power of <g-link to="https://github.com/yjs/yjs">
              Y.js
            </g-link>. Our production-grade setup requires less than 20 lines of code.
          </p>
          <p>
            <g-link to="/guide/collaborative-editing">
              Collaborative editing
            </g-link>
          </p>
        </feature-item>

        <feature-item>
          <h3 class="is-h2">
            Community
          </h3>
          <p>
            Over the years, a lovely community has grown around tiptap. There’s so much content shared, so many people helping out in issues and a ton of community extensions, you’ll be surprised how much that can help.
          </p>
        </feature-item>
      </feature-list>
    </app-section>

    <app-section>
      <div class="text">
        <h2 class="is-h1">
          Quickstart
        </h2>
        <p>
          To pull in tiptap for quick demos or giving it just a spin, grab the latest build via CDN. We use two different provides:
        </p>
<!-- eslint-disable -->
<prism>import { Editor } from '@tiptap/core'
import { defaultExtensions } from '@tiptap/starter-kit'

new Editor({
  element: document.querySelector('.element'),
  extensions: defaultExtensions(),
  content: '&lt;p&gt;Your content.&lt;/p&gt;',
})</prism>
        <!-- eslint-enable -->
        <p>
          <g-link to="/overview/installation">
            Learn more
          </g-link>
        </p>
      </div>
    </app-section>

    <app-section>
      <div class="text">
        <h2 class="is-h1">
          Who uses tiptap?
        </h2>
        <p>
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
        </p>
      </div>
    </app-section>

    <app-section>
      <div class="text">
        <h2 class="is-h1">
          License
        </h2>
        <p>
          tiptap is licensed under <g-link to="https://github.com/ueberdosis/tiptap-next/blob/main/LICENSE.md">
            MIT
          </g-link>, so you’re free to do whatever you want. If you’re using it in production, do the right thing and <g-link to="/sponsor">
            become one of our wonderful sponsors
          </g-link>(/sponsor) to fund the development, maintenance and support of tiptap and the whole ecosystem.
        </p>
      </div>
    </app-section>
  </Layout>
</template>

<script>
import AppSection from '@/components/AppSection'
import FeatureList from '@/components/FeatureList'
import FeatureItem from '@/components/FeatureItem'
import Prism from '~/components/Prism'

export default {
  components: {
    AppSection,
    FeatureList,
    FeatureItem,
    Prism,
  },
}
</script>
