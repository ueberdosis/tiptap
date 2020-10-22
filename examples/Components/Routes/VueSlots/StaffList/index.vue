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

import Node from '../../../../../packages/tiptap/src/Utils/Node'
import toggleWrap from '../../../../../packages/tiptap-commands/src/commands/toggleWrap'

const component = {}

const Extension = class extends Node {
  get name() {
    return 'stafflist'
  }

  get schema() {
    return {
      content: 'defaultblockslot staffmemberslot',
      group: 'block',
      defining: true,
      selectable: true,
      draggable: true,
      parseDOM: [{
        tag: 'staff-list',
      }],
      toDOM: () => ['staff-list', 0],
    }
  }

  get view() {
    return component
  }

  commands({ type }) {
    return () => toggleWrap(type)
  }
}

component.Extension = Extension

export default component

</script>
