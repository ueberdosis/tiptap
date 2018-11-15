<template>
  <div class="like_sel">
    <span class="sel_box inp_box" @click="activeClass">
      <em class="title font_midd">{{name}}</em>
      <i class="iconfont icon-arrow-down font_midd"></i>
    </span>
    <transition name="slide" mode="out-in">
      <div class="sel_option" :class="{arrow: arrow}" v-if="active">
        <ul class="ul_list">
          <li class="col" v-for="(item,index) in list" :key="index">
            <label><i v-if="item.icon" :class="'font_midd iconfont ' + item.icon"></i><span class="font_midd">{{item.name}}</span></label>
            <div v-if="type === 'insert' && item.commond === 'insertTable'" class="menu_item table_insert">
              <table @mouseover="selectTable">
                <tr v-for="i in 10" :key="i">
                  <td v-for="j in 10" :key="j" ref="tableTd"><a></a></td>
                </tr>
              </table>
              <p class="alg_c">10 x 10</p>
            </div>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  props: ['name', 'list', 'arrow', 'type', 'current'],
  data () {
    return {
      active: false
    }
  },
  created () {
    this.domClickHandle('like_sel', _ => {
      this.active = false
    })
  },
  methods: {
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
    selectTable (e) {
      console.log('-------', e.pageX, e.pageY)
      console.log(this.$refs.tableTd)
      this.$refs.tableTd.forEach()
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
  .alg_c{text-align: center}
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
        min-width: 120px;
        padding: 0 10px;
        height: 30px;
        line-height: 30px;
        cursor: pointer;
        position: relative;
        .iconfont{margin-right: 5px;font-size: 14px;color:#888;}
        &:hover {
          background: #f5f5f5;
          .menu_item{
            display: block;
          }
        }
        .menu_item{
          display: none;
          position: absolute;
          left: 100%;
          top: 0;
          min-width: 120px;
          padding: 5px;
          border: 1px solid #dcdcdc;
          background: #fff;
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
  .table_insert{
    border-collapse: collapse;
    table-layout: fixed;
    margin: 0;
    overflow: hidden;
    td {
      border: 1px solid #ddd;
      vertical-align: top;
      box-sizing: border-box;
      position: relative;
      a{
        display: block;
        width: 1em;
        height: 1em;
        padding: 3px 5px;
        cursor:pointer;
      }
    }
    p{margin: 5px 0;line-height:16px;}
  }
}
</style>