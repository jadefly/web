<template>
  <div class="thanks" v-if="thanks" @click="close">
    <div class="thanks-dialog">
      <table>
        <tr>
          <th>出品人：</th>
          <td>刘世睦</td>
        </tr>
        <tr>
          <th>总导演：</th>
          <td>李建福</td>
        </tr>
        <tr>
          <th>执行导演：</th>
          <td>庞坤龙、陈磊</td>
        </tr>
        <tr>
          <th>编剧：</th>
          <td>王英飞、张晓燕、金立敏、魏国丹、郑建超、赵伟、李宝华、刘佳</td>
        </tr>
        <tr>
          <th>特别出演：</th>
          <td>王晨（吾享产品中心）</td>
        </tr>
        <tr>
          <th>友情出演：</th>
          <td>于宝龙、扈健成</td>
        </tr>
        <tr>
          <th>主演：</th>
          <td>
            马秋瑶&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;饰&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;店长<br>
            杨&nbsp;&nbsp;&nbsp;&nbsp;杰&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;饰&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;大堂经理<br>
            王&nbsp;&nbsp;&nbsp;&nbsp;磊&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;饰&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;收银员<br>
            谭&nbsp;&nbsp;&nbsp;&nbsp;鑫&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;饰&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;厨师长<br>
            袁宝玉&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;饰&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;服务员<br>
            张莹莹&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;饰&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;外卖员<br>
            寇&nbsp;&nbsp;&nbsp;&nbsp;蕾&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;饰&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;运营经理<br>
            杨家华&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;饰&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;保洁
          </td>
        </tr>
        <tr>
          <th>特别支持：</th>
          <td>刘朝新（技术中心）、朱磊、耿达</td>
        </tr>
        <tr>
          <th>质量审核：</th>
          <td>汪占祥、李琢、郝静、马芳艳、饶静雅、时梓译、肖健、张雯、周培越、郝晓静、宋丹丹、魏小璐、张亭亭、张作帅、付亚丽、侯晓琳、尹鑫、赵学萍</td>
        </tr>
        <tr>
          <th>营销统筹：</th>
          <td>李倩、梁宝兴、李诚诚、罗莉</td>
        </tr>
        <tr>
          <th>艺术总监：</th>
          <td>孔令允（技术中心）</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    thanks: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    close() {
      this.$emit('close');
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.thanks {
  position: fixed;
  z-index: 100;
  left: 0;
  top: 0;
  .square(100%);
  background-color: rgba(0, 0, 0, .6);
}
.thanks-dialog {
  position: absolute;
  left: 50%;
  top: 50%;
  .size(656px, 659px);
  padding-top: 144px;
  padding-right: 134px;
  padding-left: 117px;
  margin-left: 656px / -2;
  margin-top: 659px / -2;
  background-repeat: no-repeat;
  background-position: 0 0;
  background-image: url(~@/common/images/index/thanks.png);

  table th,
  table td {
    padding: 3px 0;
  }

  table th {
    width: 70px;
    font-weight: normal;
    text-align: right;
    vertical-align: top;
  }
}
</style>
