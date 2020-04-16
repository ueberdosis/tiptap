<template>
  <div></div>
</template>

<script>
import React from 'react'
import ReactDOM from 'react-dom'
import ReactTestComponent from '~/components/ReactTestComponent/index.jsx'

export default {
  mounted(){
    ReactDOM.render(React.createElement(ReactTestComponent, this.$props), this.$el)
  },

  beforeDestroy(){
    ReactDOM.unmountComponentAtNode(this.$el)
  }
}
</script>