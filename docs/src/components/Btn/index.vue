<template>
  <component :is="tag" v-bind="props" :class="`btn btn--${type}`">
    <icon
      class="btn__icon"
      :name="icon"
      v-if="icon && iconPosition === 'before'"
    />
    <span class="btn__text">
      <slot />
    </span>
    <icon
      class="btn__icon"
      :name="icon"
      v-if="icon && iconPosition === 'after'"
    />
  </component>
</template>

<script>
import Icon from '~/components/Icon'

export default {
  components: {
    Icon,
  },

  props: {
    to: {
      default: null,
      type: String,
    },

    type: {
      default: 'primary',
      type: String,
    },

    icon: {
      type: String,
      default: null,
    },

    iconPosition: {
      type: String,
      default: 'after',
    },
  },

  computed: {
    tag() {
      if (this.to) {
        return 'g-link'
      }

      return 'button'
    },

    props() {
      if (this.to) {
        return {
          to: this.to,
        }
      }

      return {
        type: 'button',
      }
    },
  },
}
</script>

<style lang="scss" src="./style.scss"></style>
