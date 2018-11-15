<template>
  <div class="tiptap_menu_bar">
    <div class="item">
      <tip-select name="文件"></tip-select>
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
  border-bottom: 1px solid #ddd;
  .item {
    display: inline-block;
    font-size: 12px;
    padding: 0 5px;
    height: 35px;
    line-height: 35px;
  }
}
</style>
