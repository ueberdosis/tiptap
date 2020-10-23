<template>
  <div class="stafflist">
    <div class="stafflist__content">
      <slot>
        <h3>Our Team</h3>
        <p>Meet them all.</p>
      </slot>
    </div>
    <div class="stafflist__itemsregion">
      <slot name="staff-members">
        <staff-member name="Mr Default Value">
          <template v-slot:default="slotProps">
            <p>Junior Not Meant To Be Here Clerk</p>
          </template>
        </staff-member>
      </slot>
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

component.Extension = Node(component)
component.slotExtensions = {
  default: DefaultBlockSlotExtension,
  'staff-members': StaffMemberSlotExtension,
}

export default component

</script>
