<template>
  <div class="like_sel anim">
    <span class="sel_box inp_box" @click="activeClass">
      <em class="font_midd">{{name}}</em>
      <i class="iconfont icon-arrow-down"></i>
    </span>
    <transition name="slide" mode="out-in">
      <div class="sel_option" v-if="active">
        <div class="arrow_up">
          <span>
            <i class="iconfont icon-arrow-up"></i>
            <i class="iconfont icon-arrow-up spe"></i>
          </span>
        </div>
        <ul class="ul_list">
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
  props: ['name'],
  data () {
    return {
      active: false
    }
  },
  methods: {
    activeClass () {
      this.active = !this.active
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
  .font_midd{
    display: in
  }
  .sel_box {
    position: relative;
    min-width: 120px;
    &.inp_box {
      height: 39px;
    }
    .iconfont {
      position: absolute;
      top: 8px;
      right: 10px;
      top: 12px;
    }
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
    transition: all 0.2s linear;
    transition-delay: 50ms;
  }
  .slide-leave-active {
    transition: all 0.2s ease-in-out;
    transition-delay: 50ms;
  }
  .sel_option {
    position: absolute;
    top: 38px;
    left: 0;
    padding-top: 12px;
    z-index: 200;
    .ul_list {
      list-style: none;
      padding: 10px;
      border: 1px solid #dcdcdc;
      border-radius: 2px;
      background: #fff;
      .col {
        min-width: 120px;
        padding: 0 10px;
        height: 35px;
        line-height: 35px;
        cursor: pointer;
        &:hover {
          background: #f5f5f5;
        }
      }
    }
  }
}
</style>