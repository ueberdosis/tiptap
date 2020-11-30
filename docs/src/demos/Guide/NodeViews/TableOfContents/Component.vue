<template>
  <node-view-wrapper class="toc">
    <ul class="toc__list">
      <li
        class="toc__item"
        :class="`toc__item--${heading.level}`"
        v-for="(heading, index) in headings"
        :key="index"
      >
        {{ heading.text }}
      </li>
    </ul>
  </node-view-wrapper>
</template>

<script>
export default {
  props: {
    editor: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      headings: [],
    }
  },

  methods: {
    handleUpdate() {
      const headings = []

      this.editor.state.doc.descendants(node => {
        if (node.type.name === 'heading') {
          headings.push({
            level: node.attrs.level,
            text: node.textContent,
          })
        }
      })

      this.headings = headings
    },
  },

  mounted() {
    this.editor.on('update', this.handleUpdate)
    this.handleUpdate()
  },
}
</script>

<style>

</style>

<style lang="scss">
/* Basic editor styles */
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }
}

.toc {
  opacity: 0.75;
  border-radius: 0.5rem;
  padding: 0.75rem;
  background: rgba(black, 0.1);

  &__list {
    list-style: none;
    padding: 0;

    &::before {
      display: block;
      content: "In this document";
      font-weight: 700;
      letter-spacing: 0.025rem;
      font-size: 0.75rem;
      text-transform: uppercase;
      opacity: 0.5;
    }
  }

  &__item {
    &--3 {
      padding-left: 1rem;
    }

    &--4 {
      padding-left: 2rem;
    }

    &--5 {
      padding-left: 3rem;
    }

    &--6 {
      padding-left: 4rem;
    }
  }
}
</style>
