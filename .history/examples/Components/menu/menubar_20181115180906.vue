<template>
  <div class="tiptap_menu_bar">
    <template v-for="(item,index) in menuBar">
      <tip-select class="item" :name="item.name" :type="item.type" :current="currentType" @active="activeSelect" :key="index" :list="item.list" :nodes="nodes" :marks="marks"></tip-select>
    </template>
  </div>
</template>
<script>
import tipSelect from './select'
export default {
  props: ['nodes', 'marks', 'modules'],
  data () {
    return {
      currentType: '',
      menuBar: [
        {
          name: '文件',
          type: 'file',
          list: [
            {
              name: '打印',
              icon: 'icon-print'
            }
          ]
        },
        {
          name: '插入',
          type: 'insert',
          list: [
            {
              name: '插入表格',
              commandType: 'insertTable',
              icon: 'icon-inserttable'
            }
          ]
        },
        {
          name: '表格',
          type: 'table',
          list: [
            {
              name: '插入表格',
              commandType: 'insertTable',
              icon: 'icon-inserttable'
            },
            {
              name: '删除表格',
              nodes: 'table',
              commandType: 'deleteTable',
              icon: ''
            },
            {
              name: '行',
              child: true,
              list: [
                {
                  name: 'add row before',
                  nodes: 'table',
                  commandType: 'addRowBefore'
                },
                {
                  name: 'add row after',
                  nodes: 'table',
                  commandType: 'addRowAfter'
                },
                {
                  name: 'toggle header row',
                  nodes: 'table',
                  commandType: 'toggleHeaderRow'
                },
                {
                  name: 'delete row',
                  nodes: 'table',
                  commandType: 'deleteRow'
                }
              ]
            },
            {
              name: '列',
              child: true,
              list: [
                {
                  name: 'add column before',
                  nodes: 'table',
                  commandType: 'addColumnBefore'
                },
                {
                  name: 'add column after',
                  nodes: 'table',
                  commandType: 'addColumnAfter'
                },
                {
                  name: 'toggle header column',
                  nodes: 'table',
                  commandType: 'toggleHeaderColumn'
                },
                {
                  name: 'delete column',
                  nodes: 'table',
                  commandType: 'deleteColumn'
                }
              ]
            },
            {
              name: '合并单元格',
              nodes: 'table',
              commandType: 'mergeCells',
              icon: ''
            },
            {
              name: '拆分单元格',
              nodes: 'table',
              commandType: 'splitCell',
              icon: ''
            },
            {
              name: '设置单元格背景',
              nodes: 'table',
              commandType: 'setCellBackground',
              icon: ''
            },
            {
              name: '设置单元格背景',
              nodes: 'table',
              commandType: 'setCellBackground',
              icon: ''
            }
          ]
        }
      ]
    }
  },
  components: {
    tipSelect
  },
  methods: {
    activeSelect (type) {
      this.currentType = type
    }
  }
}
</script>

<style lang="scss" scoped>
.tiptap_menu_bar {
  padding: 0 5px;
  border-bottom: 1px solid #ddd;
  .item {
    display: inline-block;
    font-size: 12px;
    height: 28px;
    line-height: 28px;
  }
}
</style>
