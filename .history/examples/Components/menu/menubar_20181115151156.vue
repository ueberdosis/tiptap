<template>
  <div class="tiptap_menu_bar">
    <div class="item">
      
    </div>
    <tip-select class="item" name="表格"></tip-select>
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
  border-bottom: 1px solid #ddd;
  .item {
    display: inline-block;
    font-size: 12px;
    padding: 2px 5px;
    height: 26px;
    line-height: 26px;
  }
}
</style>
