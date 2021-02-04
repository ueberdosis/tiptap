<template>
  <Layout :show-sidebar="false">
    <app-section>
      <div class="text">
        <h1 class="is-large">
          The headless editor framework for web artisans.
        </h1>
        <p class="is-large">
          tiptap gives you full control about every single aspect of your text editor experience. It’s customizable, comes with a ton of extensions, is open-source, has an extensive documentation, and is simply a joy to use. Join our welcoming community and start building cool things! It’s free.
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
          For quick demos or to give it just a spin, grab the latest build from a CDN. Here is a quick example to get you started with tiptap:
        </p>
<!-- eslint-disable -->
<prism language="html">&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
&lt;head&gt;
  &lt;meta charset="UTF-8"&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;div class="element"&gt;&lt;/div&gt;

  &lt;script type="module"&gt;
    import { Editor } from 'https://cdn.skypack.dev/@tiptap/core?min'
    import { defaultExtensions } from 'https://cdn.skypack.dev/@tiptap/starter-kit?min'

    const editor = new Editor({
      element: document.querySelector('.element'),
      extensions: defaultExtensions(),
      content: '&lt;p&gt;Hello World :-)&lt;/p&gt;',
    })
  &lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;</prism>
        <!-- eslint-enable -->
        <p>
          <g-link to="/overview/installation">
            Learn More
          </g-link>
        </p>
      </div>
    </app-section>

    <app-section>
      <div class="text">
        <h2 class="is-h1">
          Who uses tiptap?
        </h2>
        <logo-list>
          <logo-item
            title="GitLab"
            image="gitlab"
            to="https://gitlab.com"
          />
          <logo-item
            title="Statamic CMS"
            image="statamic"
            to="https://statamic.com"
          />
          <logo-item
            title="Twill CMS"
            image="twill"
            to="https://twill.io"
          />
          <logo-item
            title="ApostropheCMS"
            image="apostrophe"
            to="https://apostrophecms.com"
          />
          <logo-item
            title="Directus CMS"
            image="directus"
            to="https://directus.io"
          />
          <logo-item
            title="Nextcloud"
            image="nextcloud"
            to="https://apps.nextcloud.com/apps/text"
          />
          <logo-item
            title="ycode"
            image="ycode"
            to="https://www.ycode.com/"
          />
          <logo-item
            title="DocIQ"
            image="dociq"
            to="https://www.dociq.io/"
          />
          <!-- <logo-item
            title="Scrumpy"
            image="scrumpy"
            to="https://www.scrumpy.io"
          /> -->
        </logo-list>
        <p>
          <g-link to="https://github.com/ueberdosis/tiptap/network/dependents?package_id=UGFja2FnZS0xMzE5OTg0ODc%3D">
            And Many More
          </g-link>
        </p>
      </div>
    </app-section>

    <app-section>
      <div class="text">
        <h2 class="is-h1">
          License
        </h2>
        <p>
          tiptap is licensed under <a href="https://github.com/ueberdosis/tiptap-next/blob/main/LICENSE.md">MIT</a>, so you are free to do whatever you want. If you are using it commercially, do the right thing and <g-link to="/sponsor">
            become one of our wonderful sponsors<!--
          -->
          </g-link> to fund the maintenance, support and development of tiptap now and in the future. That’s all we ask for.
        </p>
      </div>
    </app-section>
  </Layout>
</template>

<script>
import AppSection from '@/components/AppSection'
import FeatureList from '@/components/FeatureList'
import FeatureItem from '@/components/FeatureItem'
import LogoList from '@/components/LogoList'
import LogoItem from '@/components/LogoItem'
import Prism from '~/components/Prism'

export default {
  components: {
    AppSection,
    FeatureList,
    FeatureItem,
    LogoList,
    LogoItem,
    Prism,
  },

  metaInfo() {
    const title = 'Headless WYSIWYG Text Editor'

    return {
      title,
      meta: [
        /* OpenGraph */
        {
          property: 'og:title',
          content: title,
        },
        {
          property: 'og:image',
          content: 'https://next.tiptap.dev/og-image.png',
        },
        /* Twitter */
        {
          name: 'twitter:title',
          content: title,
        },
        {
          name: 'twitter:card',
          content: 'summary_large_image',
        },
        {
          name: 'twitter:image',
          content: 'https://next.tiptap.dev/og-image.png',
        },
        {
          name: 'twitter:site',
          content: '@_ueberdosis',
        },
      ],
    }
  },
}
</script>
