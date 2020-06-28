<template>
  <SystemContent>
    <div class="system-content-head" slot="head">
      <!-- <h3 class="system-content-title">扫码付设置</h3> -->
      <h3 class="system-content-title">{{$t('Biz.UserDesktop.UserDesktopMsg158')}}</h3>
      <el-switch
        v-model="isEnable"
        class="system-content-switch"
        @change="changeState"
      ></el-switch>
    </div>
    <div class="card" :class="{ 'disabled': !isEnable }">
      <h4>
        <el-button type="primary" plain :disabled="!isEnable" @click="scyncPaysetFn">
          {{$t('Biz.UserDesktop.UserDesktopMsg159')}}
        </el-button>
      </h4>
      <p>
        {{$t('Biz.UserDesktop.UserDesktopMsg160')}}<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{$t('Biz.UserDesktop.UserDesktopMsg161')}}<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{$t('Biz.UserDesktop.UserDesktopMsg162')}}
      </p>
    </div>
    <div class="card" :class="{ 'disabled': !isEnable }">
      <h4>
        <el-button type="primary" plain :disabled="!isEnable" @click="maunalupLoadPayorderFn">
          {{$t('Biz.UserDesktop.UserDesktopMsg163')}}
        </el-button>
      </h4>
      <p>
        {{$t('Biz.UserDesktop.UserDesktopMsg164')}}<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{$t('Biz.UserDesktop.UserDesktopMsg165')}}<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{$t('Biz.UserDesktop.UserDesktopMsg166')}}<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{$t('Biz.UserDesktop.UserDesktopMsg167')}}
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
      isEnable: false,
    };
  },
  mounted() {
    // 扫码付是否开启
    ajax('canyin.desktop.bizsyssetting.getenablepaymentcodedirect').then((data) => {
      if (data.enablePaymentCodeDirect === '1') {
        this.isEnable = true;
      } else {
        this.isEnable = false;
      }
    });
  },
  methods: {
    // 启用/关闭 付款码的直连模式
    changeState(isEnable) {
      ajax('canyin.desktop.bizsyssetting.saveenablepaymentcodedirect', {
        params: { enablePaymentCodeDirect: isEnable ? '1' : '0' },
      }).then(() => {}).catch(() => {
        this.isEnable = !isEnable;
      });
    },
    // 同步账户配置信息
    scyncPaysetFn() {
      ajax('canyin.pos.settlement.pay.scancodepay.scyncpayset')
        .then((res) => {
          this.$message.success(res.msg);
        });
    },
    // 手动上传交易数据
    maunalupLoadPayorderFn() {
      ajax('canyin.pos.settlement.pay.scancodepay.maunaluploadpayorder')
        .then((res) => {
          this.$message.success(res.msg);
        });
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
