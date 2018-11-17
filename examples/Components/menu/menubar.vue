<template>
  <div class="tiptap_menu_bar">
    <template v-for="(item,index) in menuBar">
      <tip-select class="item" :name="item.name" :type="item.type" :current="currentType" @active="activeSelect" :key="index" :list="item.list" :commands="commands" :isActive="isActive"></tip-select>
    </template>
  </div>
</template>
<script>
import tipSelect from './tip.select'
export default {
  props: ['commands', 'isActive'],
  data () {
    return {
      currentType: '',
      menuBar: [
        {
          name: 'edit',
          type: 'edit',
          list: [
            {
              name: 'undo',
              command: this.commands.undo,
              icon: 'icon-undo'
            },
            {
              name: 'redo',
              command: this.commands.redo,
              icon: 'icon-redo'
            }
          ]
        },
        {
          name: 'insert',
          type: 'insert',
          list: [
            {
              name: 'insert table',
              command: 'table',
              commandType: 'insertTable',
              icon: 'icon-inserttable'
            }
          ]
        },
        {
          name: 'table',
          type: 'table',
          list: [
            {
              name: 'insert table',
              command: 'table',
              commandType: 'insertTable',
              icon: 'icon-inserttable'
            },
            {
              name: 'delete table',
              command: 'table',
              commandType: 'deleteTable',
              icon: ''
            },
            {
              name: 'Row',
              child: true,
              list: [
                {
                  name: 'add row before',
                  command: 'table',
                  commandType: 'addRowBefore'
                },
                {
                  name: 'add row after',
                  command: 'table',
                  commandType: 'addRowAfter'
                },
                {
                  name: 'toggle header row',
                  command: 'table',
                  commandType: 'toggleHeaderRow'
                },
                {
                  name: 'delete row',
                  command: 'table',
                  commandType: 'deleteRow'
                }
              ]
            },
            {
              name: 'Col',
              child: true,
              list: [
                {
                  name: 'add column before',
                  command: 'table',
                  commandType: 'addColumnBefore'
                },
                {
                  name: 'add column after',
                  command: 'table',
                  commandType: 'addColumnAfter'
                },
                {
                  name: 'toggle header column',
                  command: 'table',
                  commandType: 'toggleHeaderColumn'
                },
                {
                  name: 'delete column',
                  command: 'table',
                  commandType: 'deleteColumn'
                }
              ]
            },
            {
              name: 'mergeCells',
              command: 'table',
              commandType: 'mergeCells',
              icon: ''
            },
            {
              name: 'splitCell',
              command: 'table',
              commandType: 'splitCell',
              icon: ''
            },
            {
              name: 'setCellBackground',
              command: 'table',
              commandType: 'setCellBackground',
              icon: ''
            },
            {
              name: 'removeCellBackground',
              command: 'table',
              commandType: 'setCellBackgroundNull',
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
