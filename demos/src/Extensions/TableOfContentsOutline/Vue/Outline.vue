<template>
  <p v-if="rows.length === 0" class="empty-state">No headings to show.</p>
  <ol v-else class="outline">
    <li
      v-for="row in rows"
      :key="row.pos"
      :style="{ '--depth': row.depth }"
      :data-level="row.level"
    >
      <button type="button" @click="$emit('select', row)">{{ row.textContent }}</button>
    </li>
  </ol>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    rows: {
      type: Array,
      required: true,
    },
  },

  emits: ['select'],
})
</script>
