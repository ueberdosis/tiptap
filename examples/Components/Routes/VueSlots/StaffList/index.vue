<template>
  <div class="stafflist">
    <div class="stafflist__content">
      <slot>
        <h3>Our Team</h3>
        <p>Meet them all.</p>
      </slot>
    </div>
    <div class="stafflist__itemsregion">
      <staff-member name="Mr Default Value"><p>Junior Not Meant To Be Here Clerk</p></staff-member>
    </div>
  </div>
</template>

<script>

import Node from './Node'
import DefaultBlockSlotExtension from './DefaultBlockSlotExtension'
import StaffMemberSlotExtension from './StaffMemberSlotExtension'
import StaffMember from '../StaffMember'

const component = {
  components: {
    'staff-member': StaffMember,
  },
}

component.extensions = {
  DefaultBlockSlotExtension,
  StaffMemberSlotExtension,
  NodeExtension: Node(component),
}

export default component

</script>
