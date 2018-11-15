<template>
  <div class="tiptap_menu_bar">
    <div class="item">
      <tip-select name=""></tip-select>
    </div>
  </div>
</template>
<script>
import tipSelect from './select'
export default {
  props: ['nodes', 'marks', 'modules'],
  data () {
    return {

    }
  },
  components: {
    tipSelect
  }
}
</script>

<style lang="scss" scoped>
.tiptap_menu_bar {
  .item {
    font-size: 12px;
    padding: 5px 10px;
  }
}
</style>
