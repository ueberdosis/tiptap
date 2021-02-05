<template>
  <footer class="page-footer">
    <div class="page-footer__section">
      <div class="page-footer__column">
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M15.9999 1C13.2726 1 10.7152 1.72789 8.51156 3H23.4883C21.2846 1.72789 18.7273 1 15.9999 1ZM26.198 5H5.80177C5.14307 5.61097 4.53933 6.28039 3.99881 7H28.001C27.4605 6.28039 26.8568 5.61097 26.198 5ZM29.2698 9H2.73C2.39138 9.6406 2.09779 10.3087 1.85344 11H30.1464C29.902 10.3087 29.6084 9.6406 29.2698 9ZM30.6999 13H1.29996C1.16756 13.6523 1.07748 14.32 1.03271 15H30.9671C30.9223 14.32 30.8323 13.6523 30.6999 13ZM30.9671 17H1.03271C1.07748 17.68 1.16756 18.3477 1.29996 19H30.6999C30.8323 18.3477 30.9223 17.68 30.9671 17ZM30.1464 21H1.85344C2.09779 21.6913 2.39138 22.3594 2.73 23H29.2698C29.6084 22.3594 29.902 21.6913 30.1464 21ZM28.001 25H3.99881C4.53933 25.7196 5.14307 26.389 5.80177 27H26.198C26.8568 26.389 27.4605 25.7196 28.001 25ZM23.4883 29H8.51156C10.7152 30.2721 13.2726 31 15.9999 31C18.7273 31 21.2846 30.2721 23.4883 29Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>

    <div class="page-footer__section">
      <div class="page-footer__column">
        <h3>
          Legal
        </h3>
        <ul>
          <li>
            <g-link to="/impressum">
              Impressum
            </g-link>
          </li>
          <li>
            <g-link to="/privacy-policy">
              Privacy Policy
            </g-link>
          </li>
        </ul>
      </div>

      <div class="page-footer__column">
        <h3>
          Community
        </h3>
        <ul>
          <li>
            <g-link to="https://github.com/ueberdosis/tiptap-next">
              GitHub
            </g-link>
          </li>
          <li>
            <g-link to="https://twitter.com/tiptap_editor">
              Twitter
            </g-link>
          </li>
        </ul>
      </div>

      <div class="page-footer__column">
        <h3>
          Links
        </h3>
        <ul>
          <li>
            <g-link to="/experiments">
              Experiments
            </g-link>
          </li>
          <li>
            <g-link to="https://v1.tiptap.dev">
              Docs for tiptap 1.x
            </g-link>
          </li>
        </ul>
      </div>

      <div class="page-footer__column">
        <h3>
          Licence
        </h3>
        <ul>
          <li>
            <a href="https://github.com/ueberdosis/tiptap-next/blob/main/LICENSE.md">MIT</a>
          </li>
        </ul>
      </div>

      <div class="page-footer__column">
        <a :href="editLink" target="_blank">Edit this page on GitHub</a>
      </div>
    </div>

    <div class="page-footer__section">
      <div class="page-footer__small-text text">
        <p>
          Made with ♥️ by <a href="https://twitter.com/_ueberdosis">überdosis</a>
          &middot;
          Based on <a href="https://prosemirror.net/">ProseMirror</a> by Marijn Haverbeke
        </p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  computed: {
    currentPath() {
      return this.$route.matched[0].path
    },

    editLink() {
      const { currentPath } = this

      if (process.env.NODE_ENV === 'development') {
        if (currentPath === '') {
          return `vscode://file${this.cwd}/src/pages/index.vue`
        }

        return `vscode://file${this.cwd}/src/docPages${currentPath}.md`
      }

      if (currentPath === '') {
        return 'https://github.com/ueberdosis/tiptap-next/blob/main/docs/src/pages/index.vue'
      }

      return `https://github.com/ueberdosis/tiptap-next/blob/main/docs/src/docPages${currentPath}.md`
    },
  },
}
</script>

<style lang="scss" src="./style.scss" scoped></style>
