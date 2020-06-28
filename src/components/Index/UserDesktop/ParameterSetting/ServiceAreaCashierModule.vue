<template>
  <SystemContent>
    <div class="system-content-head" slot="head">
      <!-- <h3 class="system-content-title">扫码付设置</h3> -->
      <h3 class="system-content-title">启用多人收银模式</h3>
      <el-switch
        v-model="isEnable"
        class="system-content-switch"
        @change="changeState"
        :active-value=1
        :inactive-value=0
      ></el-switch>
    </div>
    <div class="card">
      <h4>
        <p>开启此选项时：</p>
      </h4>
      <p>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1. 同一个营业POS上将允许多个操作人同时进行开班营业；<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2. 系统将要求操作人在移动银台、安卓平板、IOS平板上开班，系统将在记账POS上为每一个操作人单独创建一个班次流水。<br>
      </p>
    </div>
    <div class="card">
      <h4>
        <p>关闭此选项时：</p>
      </h4>
      <p>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1. 同一个营业POS，当前操作人不结班，不允许其他操作人进行开班营业。<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2. 系统将不要求操作人在移动银台、安卓平板、IOS平板上开班，但记账POS不开班，移动银台、安卓平板、IOS平板将不允许登录<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3. 记账POS结班，移动银台、安卓平板、IOS平板产生的营业数据将统计到记账POS上。
      </p>
    </div>
  </SystemContent>
</template>

<script>
import SystemContent from '../base/SystemContent';
import ajax from '@/common/js/ajax';

export default {
  components: {
    SystemContent,
  },
  data() {
    return {
      isEnable: 0,
    };
  },
  mounted() {
    this.getState();
  },
  methods: {
    // 启用/关闭 多人收银
    changeState(isEnable) {
      ajax('canyin.pos.posserial.updatecashiermode', {
        contentType:"json",data:{
          type:9,
          value: this.isEnable
        }
      }).then(() => {}).catch((code,msg) => {
        this.isEnable = isEnable === 1 ? 0 : 1;
        this.$message({type: 'error', message: msg,});
      });
    },
    // 获取状态
    getState() {
      ajax('canyin.pos.posserial.getcashiermode', {}).then((data) => {
        this.isEnable = data;
      }).catch(() => {});
    },
  },
};
</script>

<style lang="less" scoped>
  .system-content-title {
    display: inline-block;
    vertical-align: middle;
  }

  .system-content-switch {
    display: inline-block;
    vertical-align: middle;
    margin-left: 10px;
  }

  .card {
    margin-bottom: 10px;

    > p {
      padding-top: 10px;
      padding-bottom: 5px;
    }

    &.disabled {
      > p {
        color: #d6d6d6;
      }
    }
  }
</style>
