<template>
  <div class="like_sel anim">
    <span class="sel_box inp_box" id="orderStatus" data-val=""><em class="font_midd">全部</em><i class="iconfont icon_down"></i></span>
    <div class="sel_option fadeDown time_01 anim_player">
      <div class="arrow_up">
          <span><i class="iconfont icon_arrow_up"></i><i class="iconfont icon_arrow_up spe"></i></span>
      </div>
      <ul>
        <li data-val="">全部</li>
        <li data-val="1">充值中</li>
        <li data-val="3">充值成功</li>
        <li data-val="4">充值失败</li>
        <li data-val="-1">失败退款</li>
      </ul>
    </div>
</div>
</template>

<script>
  export default {
    data () {
      return {

      }
    }
  }
</script>