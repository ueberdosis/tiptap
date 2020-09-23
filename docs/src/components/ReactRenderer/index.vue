<template>
  <div></div>
</template>

<script>
import React from 'react'
import ReactDOM from 'react-dom'

export default {
  props: {
    component: {
      required: true,
    },
  },

  mounted() {
    ReactDOM.render(React.createElement(this.component), this.$el)
  },

  beforeDestroy() {
    ReactDOM.unmountComponentAtNode(this.$el)
  },
}
</script>
