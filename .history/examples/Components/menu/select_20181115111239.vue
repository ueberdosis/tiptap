<template>
  <div class="like_sel anim">
    <span class="sel_box inp_box" id="orderStatus" data-val=""><em class="font_midd">全部</em><i class="iconfont icon_down"></i></span>
    <div class="sel_option fadeDown time_01 anim_player">
      <div class="arrow_up">
          <span><i class="iconfont icon_arrow_up"></i><i class="iconfont icon_arrow_up spe"></i></span>
      </div>
      <ul>
        <% if (customer.customer_type != 0){%>

        <% }else{%>
        <li data-val="">全部</li>
        <li data-val="0">充值中</li>
        <li data-val="1">充值成功</li>
        <li data-val="2">充值失败</li>
        <%}%>
      </ul>
    </div>
</div>
</template>