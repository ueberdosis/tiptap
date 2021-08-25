<template>
  <Layout :show-sidebar="false">
    <app-section>
      <div class="text">
        <h1 class="is-large">
          The headless editor framework for web artisans.
        </h1>
        <p class="is-large">
          tiptap gives you full control about every single aspect of your text editor experience. It’s customizable, comes with a ton of extensions, is open source and has an extensive documentation. Join our welcoming community and start building cool things!
        </p>
        <btn-wrapper>
          <btn type="primary" icon="arrow-right-line" to="/installation">
            Get Started
          </btn>
          <btn
            type="secondary"
            icon="github-fill"
            icon-position="before"
            to="https://github.com/ueberdosis/tiptap"
          >
            View on GitHub
          </btn>
        </btn-wrapper>
      </div>
    </app-section>

    <app-section>
      <div style="margin: -1rem">
        <tiptap-demo name="Examples/CollaborativeEditing" inline />
      </div>
    </app-section>

    <app-section>
      <feature-list>
        <feature-item icon="contrast-fill">
          <h3 class="is-h2">
            Headless
          </h3>
          <p>
            It’s headless and comes without any CSS. You are in full control over markup, styling and behaviour.
          </p>
          <div>
            <btn type="tertiary" icon="arrow-right-line" to="/guide/styling">
              Styling
            </btn>
          </div>
        </feature-item>

        <feature-item icon="reactjs-fill">
          <h3 class="is-h2">
            Framework-agnostic
          </h3>
          <p>
            Out of the box, tiptap works with Vanilla JavaScript and Vue.js, but it’s also possible to use it in <g-link to="/installation/react">React</g-link>, <g-link to="/installation/svelte">Svelte</g-link> and others.
          </p>
          <div>
            <btn type="tertiary" icon="arrow-right-line" to="/installation">
              Installation
            </btn>
          </div>
        </feature-item>

        <feature-item icon="terminal-box-fill">
          <h3 class="is-h2">
            TypeScript
          </h3>
          <p>
            TypeScript helps to find bugs early and gives you a nice autocomplete for the API on top of the extensive human written documentation.
          </p>
          <div>
            <btn type="tertiary" icon="arrow-right-line" to="/guide/typescript">
              TypeScript
            </btn>
          </div>
        </feature-item>

        <feature-item icon="cursor-fill">
          <h3 class="is-h2">
            Collaborative
          </h3>
          <p>
            Real-time collaboration, syncing between different devices and working offline isn’t hard anymore. Keep everything in sync with the magic of <g-link to="https://github.com/yjs/yjs">Y.js</g-link>.
          </p>
          <div>
            <btn type="tertiary" icon="arrow-right-line" to="/guide/collaborative-editing">
              Collaborative editing
            </btn>
          </div>
        </feature-item>

        <feature-item icon="chat-smile-2-fill">
          <h3 class="is-h2">
            Community
          </h3>
          <p>
            There’s so much content shared, so many people helping out in issues and a ton of community extensions, you’ll be surprised how much that all can help.
          </p>
          <div>
            <btn type="tertiary" icon="arrow-right-line" to="https://github.com/ueberdosis/tiptap">
              GitHub
            </btn>
          </div>
        </feature-item>
      </feature-list>
    </app-section>

    <app-section>
      <div class="text">
        <h2 class="is-h1">
          Quickstart
        </h2>
        <p>
          For quick demos or to give it just a spin, grab the latest build from a CDN. Here is an example to get you started with tiptap:
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
    import StarterKit from 'https://cdn.skypack.dev/@tiptap/starter-kit?min'

    const editor = new Editor({
      element: document.querySelector('.element'),
      extensions: [
        StarterKit,
      ],
      content: '&lt;p&gt;Hello World :-)&lt;/p&gt;',
    })
  &lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;</prism>
        <!-- eslint-enable -->
        <div>
          <btn type="tertiary" icon="arrow-right-line" to="/installation">
            Learn more
          </btn>
        </div>
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
            to="https://github.com/nextcloud/text"
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
        </logo-list>
        <div>
          <btn type="tertiary" icon="arrow-right-line" to="https://github.com/ueberdosis/tiptap/network/dependents?package_id=UGFja2FnZS0xMzE5OTg0ODc%3D">
            And many more
          </btn>
        </div>
      </div>
    </app-section>

    <app-section>
      <div class="text">
        <h2 class="is-h1">
          License
        </h2>
        <p>
          tiptap is licensed under <g-link to="https://github.com/ueberdosis/tiptap/blob/main/LICENSE.md">MIT</g-link>, so you are free to do whatever you want. If you are using it commercially, <g-link to="/sponsor">become one of our wonderful sponsors</g-link> to fund the maintenance, support and development of tiptap now and in the future.
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
import Btn from '~/components/Btn'
import BtnWrapper from '~/components/BtnWrapper'

export default {
  components: {
    AppSection,
    FeatureList,
    FeatureItem,
    LogoList,
    LogoItem,
    Prism,
    Btn,
    BtnWrapper,
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
          content: 'https://www.tiptap.dev/images/og-image.png',
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
          content: 'https://www.tiptap.dev/images/og-image.png',
        },
        {
          name: 'twitter:site',
          content: '@tiptap_editor',
        },
      ],
    }
  },
}
</script>
