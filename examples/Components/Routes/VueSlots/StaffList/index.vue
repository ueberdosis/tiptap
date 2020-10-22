<template>
  <div class="stafflist">
    <div class="stafflist__content">
      <slot>
        <h3>Our Team</h3>
        <p>Meet them all.</p>
      </slot>
    </div>
    <div class="stafflist__itemsregion">
    </div>
  </div>
</template>

<script>

import Node from './Node'
import DefaultBlockSlotExtension from './DefaultBlockSlotExtension'
import StaffMemberSlotExtension from './StaffMemberSlotExtension'

const component = {}

component.extensions = {
  DefaultBlockSlotExtension,
  StaffMemberSlotExtension,
  NodeExtension: Node(component),
}

export default component

</script>
