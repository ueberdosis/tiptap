<template>
  <div class="like_sel">
    <span class="sel_box inp_box" @click="activeClass">
      <em class="title font_midd">{{name}}</em>
      <i class="iconfont icon-arrow-down font_midd"></i>
    </span>
    <transition name="slide" mode="out-in">
      <div class="sel_option" :class="{arrow: arrow}" v-if="active">
        <ul class="ul_list">
          <li class="col" v-for="(item,index) in list" :key="index"><i v-if="item.icon" :class="'iconfont ' + item."></i>{{item.name}}</li>
          <li class="col" data-val="">全部</li>
          <li class="col" data-val="1">充值中</li>
          <li class="col" data-val="3">充值成功</li>
          <li class="col" data-val="4">充值失败</li>
          <li class="col" data-val="-1">失败退款</li>
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
        &:hover {
          background: #f5f5f5;
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
}
</style>