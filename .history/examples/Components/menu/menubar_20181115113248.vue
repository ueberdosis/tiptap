<template>
  <div class="tiptap_menu_bar">
    <div class="item">
      <select></select>
    </div>
  </div>
</template>
<script>
import select from './select'
export default {
  props: ['nodes', 'marks', 'modules'],
  data () {
    return {

    }
  },
  components: {
    select
  }
}
</script>

<style lang="scss" scoped>
.tiptap_menu_bar {
  .item {
    padding: 5px 10px;
  }
}
</style>
