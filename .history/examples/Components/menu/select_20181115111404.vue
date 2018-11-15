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

<style lang="scss" scoped>
  .like_sel{
    display:inline-block;position:relative;
    .sel_box{
      position:relative;min-width:120px;}
  }
  .like_sel .sel_box{position:relative;min-width:120px;}
  .like_sel .sel_box.inp_box{height:39px;padding-right:40px}
  .like_sel .sel_box .iconfont{position:absolute;top:8px;right:10px;top:12px}
  .like_sel .sel_option{position:absolute;top:38px;left:0;padding-top:12px;z-index:200}
  .like_sel .sel_option ul{padding:10px;border:1px solid #dcdcdc;border-radius:2px;background:#fff}
  .like_sel .sel_option li{min-width:120px;padding:0 10px;height:35px;line-height:35px;cursor:pointer}
  .like_sel .sel_option li:hover{background:#f5f5f5}
</style>