<template>
  <div class="like_sel" v-if="itemShow">
    <span class="sel_box inp_box" @click="activeClass">
      <em class="title font_midd">{{name}}</em>
      <i class="iconfont icon-arrow-down font_midd"></i>
    </span>
    <transition name="slide" mode="out-in">
      <div class="sel_option" :class="{arrow: arrow}" v-if="active">
        <ul class="ul_list">
          <li class="col" v-for="(item,index) in list" :class="{child: item.child}" :key="index">
            <template v-if="item.command === 'table' && item.commandType">
              <label @click="commands.table({type: item.commandType})">
                <em class="font_midd">
                  <i v-if="item.icon" :class="'iconfont ' + item.icon"></i>
                </em>
                <span class="font_midd">{{item.name}}</span>
              </label>
            </template>
            <template v-else>
              <label @click="commandHandle(item.command)">
                <em class="font_midd">
                  <i v-if="item.icon" :class="'iconfont ' + item.icon"></i>
                </em>
                <span class="font_midd">{{item.name}}</span>
              </label>
            </template>
            <!-- insert table -->
            <div v-if="item.commandType === 'insertTable'" class="menu_item table_insert">
              <table @mouseleave="initTableSel" @click="insertTable">
                <tr v-for="row in 10" :key="row">
                  <td v-for="col in 10" :key="col" ref="tableTd" @mouseover="selectTable(row, col)">
                    <a :class="{'sel_active': (row <= tableRows && col <= tableCols)}"></a>
                  </td>
                </tr>
              </table>
              <p class="alg_c">{{tableCols}} x {{tableRows}}</p>
            </div>
            <template v-if="item.child">
              <div class="menu_item">
                <ul class="ul_list">
                  <template v-for="(sitem,sindex) in item.list">
                    <!-- table handle -->
                    <template v-if="sitem.command === 'table' && sitem.commandType">
                      <li class="col" :class="{'is-active': isActive.table()}" @click="commands.table({type: sitem.commandType})">{{sitem.name}}</li>
                    </template>
                    <template v-else>
                      <li class="col" :class="{'is-active': item.active}">{{sitem.name}}</li>
                    </template>
                  </template>
                </ul>
              </div>
              <i class="child_icon iconfont icon-arrow-right"></i>
            </template>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  props: ['name', 'list', 'arrow', 'type', 'current', 'commands', 'isActive'],
  data () {
    return {
      active: false,
      tableRows: 1,
      tableCols: 1
    }
  },
  computed: {
    itemShow () {
      if (['file', 'edit', 'insert'].includes(this.type)) {
        return true
      } else {
        return this.isActive[this.type]()
      }
    }
  },
  created () {
    this.domClickHandle('like_sel', _ => {
      this.active = false
    })
  },
  methods: {
    commandHandle (command) {
      if (command) return command()
    },
    activeClass () {
      this.active = !this.active
      if (this.active) {
        this.$emit('active', this.type)
      }
    },
    domClickHandle (cname, done) {
      try {
        document.addEventListener('click', function (e) {
          let classNameArr = []
          for (let item of e.path) {
            item.className && classNameArr.push(item.className)
          }
          if (!String(classNameArr).includes(cname)) {
            if (done) done()
          }
        })
      } catch (err) {
        console.log('domClickHandle:error', err)
      }
    },
    selectTable (row, col) {
      this.tableRows = row
      this.tableCols = col
    },
    initTableSel () {
      this.tableRows = 1
      this.tableCols = 1
    },
    insertTable () {
      this.commands.table({type: 'insert', options: {rows: this.tableRows, cols: this.tableCols, headerRow: false}})
      this.initTableSel()
    }
  },
  watch: {
    current (val) {
      if (val !== this.type) this.active = false
    }
  }
}
</script>

<style lang="scss" scoped>
.like_sel {
  .alg_c {
    text-align: center;
  }
  em {
    font-style: normal;
  }
  display: inline-block;
  position: relative;
  .title {
    padding: 0 0 0 5px;
  }
  .font_midd {
    display: inline-block;
    vertical-align: middle;
  }
  .sel_box {
    position: relative;
    min-width: 120px;
    cursor: pointer;
  }
  .slide-enter,
  .slide-leave-to {
    transform: translateY(-10%);
    opacity: 0;
  }
  .slide-leave {
    transform: translateY(0);
    opacity: 1;
  }
  .slide-enter-active {
    transition: all 0.3s cubic-bezier(0.83, -0.55, 0.38, 1.75);
    transition-delay: 50ms;
  }
  .slide-leave-active {
    transition: all 0.2s ease-in-out;
    transition-delay: 50ms;
  }
  .sel_option {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 200;
    .ul_list {
      list-style: none;
      padding: 10px 0;
      border: 1px solid #dcdcdc;
      border-radius: 2px;
      background: #fff;
      .col {
        min-width: 140px;
        padding: 0 10px;
        height: 30px;
        line-height: 30px;
        cursor: pointer;
        position: relative;
        white-space: nowrap;
        label {
          display: block;
          em {
            width: 20px;
          }
          cursor: pointer;
        }
        .iconfont {
          margin-right: 5px;
          font-size: 14px;
          color: #888;
        }
        &:hover {
          background: #f5f5f5;
          .menu_item {
            display: block;
          }
        }
        &.child {
          position: relative;
          .child_icon {
            position: absolute;
            right: 0;
            top: 0px;
            font-size: 16px;
          }
        }
        .menu_item {
          display: none;
          position: absolute;
          left: 100%;
          top: 0;
          min-width: 130px;
          padding: 5px;
          border: 1px solid #dcdcdc;
          background: #fff;
        }
        .ul_list {
          padding: 0;
          border: none;
        }
      }
    }
    &.arrow {
      top: 110%;
      &:before {
        position: absolute;
        display: inline-block;
        top: -6px;
        left: 10px;
        width: 0;
        height: 0px;
        content: '';
        border-style: solid;
        border-width: 6px;
        border-color: #fff #fff #ddd #ddd;
        transform: rotate(135deg);
      }
      &:after {
        position: absolute;
        display: inline-block;
        top: -5px;
        left: 10px;
        width: 0;
        height: 0px;
        content: '';
        border-style: solid;
        border-width: 6px;
        border-color: #fff #fff;
        transform: rotate(135deg);
      }
    }
  }
  .table_insert {
    border-collapse: collapse;
    table-layout: fixed;
    margin: 0;
    overflow: hidden;
    td {
      border: 1px solid #ddd;
      vertical-align: top;
      box-sizing: border-box;
      position: relative;
      a {
        display: block;
        width: 1em;
        height: 1em;
        padding: 3px 5px;
        cursor: pointer;
        &.sel_active{
          background: #9df1ef;
        }
      }
    }
    p {
      margin: 5px 0;
      line-height: 16px;
    }
  }
}
</style>