<template>
  <div :class="`icon icon--${size}`">
    <svg>
      <use :xlink:href="`${require('remixicon/fonts/remixicon.symbol.svg')}#ri-${name}`" />
    </svg>
  </div>
</template>

<script>
export default {
  name: 'Icon',

  props: {
    name: {
      type: String,
      default: '',
    },

    size: {
      type: String,
      default: 'normal',
    },
  },
}
</script>

<style lang="scss" src="./style.scss" scoped></style>
