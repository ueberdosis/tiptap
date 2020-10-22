<template>
  <div class="staffmember">
    <div class="staffmember__name">{{ name }}</div>
    <div class="staffmember__position">
      <slot><p>Chief Speculative Programming Officer</p></slot>
    </div>
  </div>
</template>

<script>

import Node from './Node'
import DefaultBlockSlotExtension from './DefaultBlockSlotExtension'

const component = {
  props: {
    name: {
      type: String,
      default: 'Mr En Jibby',
    },
  },
}

component.extensions = {
  DefaultBlockSlotExtension,
  NodeExtension: Node(component),
}

export default component

</script>
