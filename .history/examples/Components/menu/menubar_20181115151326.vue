<template>
  <div class="tiptap_menu_bar">
    <tip-select class="item" name="文件"></tip-select>
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
  padding: 2px 0;
  border-bottom: 1px solid #ddd;
  .item {
    display: inline-block;
    font-size: 12px;
    height: 30px;
    line-height: 
  }
}
</style>
