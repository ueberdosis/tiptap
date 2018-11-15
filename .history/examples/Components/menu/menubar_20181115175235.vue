<template>
  <div class="tiptap_menu_bar">
    <template v-for="(item,index) in menuBar">
      <tip-select class="item" :name="item.name" :type="item.type" :current="currentType" @active="activeSelect" :key="index" :list="item.list"></tip-select>
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
              command: this.nodes.table.command({type: 'deleteTable'}),
              active: this.nodes.table.active(),
              icon: ''
            },
            {
              name: '行',
              child: true,
              list: [
                {
                  name: 'add row before',
                  nodes: ''
                  command: this.nodes.table.command({type: 'addRowBefore'}),
                  active: this.nodes.table.active()
                },
                {
                  name: 'add row after',
                  command: this.nodes.table.command({type: 'addRowAfter'}),
                  active: this.nodes.table.active()
                },
                {
                  name: 'toggle header row',
                  command: this.nodes.table.command({type: 'toggleHeaderRow'}),
                  active: this.nodes.table.active()
                },
                {
                  name: 'delete row',
                  command: this.nodes.table.command({type: 'deleteRow'}),
                  active: this.nodes.table.active()
                }
              ]
            },
            {
              name: '列',
              child: true,
              list: [
                {
                  name: 'add column before',
                  command: this.nodes.table.command({type: 'addColumnBefore'}),
                  active: this.nodes.table.active()
                },
                {
                  name: 'add column after',
                  command: this.nodes.table.command({type: 'addColumnAfter'}),
                  active: this.nodes.table.active()
                },
                {
                  name: 'toggle header column',
                  command: this.nodes.table.command({type: 'toggleHeaderColumn'}),
                  active: this.nodes.table.active()
                },
                {
                  name: 'delete column',
                  command: this.nodes.table.command({type: 'deleteColumn'}),
                  active: this.nodes.table.active()
                }
              ]
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
