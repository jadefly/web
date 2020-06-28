<template>
  <SystemContent :title="$t('Biz.UserDesktop.UserDesktopMsg155')">
    <div class="client-must-wrapper">
      <div class="pic">
        <img src="@static/img/client-must.png" :alt="$t('Dict.KeBiDe')">
      </div>
      <div class="text">
        <h3>{{$t('Dict.KeBiDe')}}</h3>
        <div class="status">
          <i class="icon" :class="statusObj.iconClass"></i>
          <span>{{ statusObj.text }}</span>
        </div>
        <button type="button" class="btn" @click="changeBindInfo">{{ statusObj.btn }}</button>
        <button type="button" class="btn sync" @click="syncTables" v-if="bindStatus">{{$t('Biz.UserDesktop.UserDesktopMsg156')}}</button>
      </div>
      <ClientMustBindDialog ref="clientMustBindDialog" @bindSuccess="bindSuccess"></ClientMustBindDialog>
    </div>
  </SystemContent>
</template>

<script>
import SystemContent from '../base/SystemContent';
import ajax from '@/common/js/ajax';
import ClientMustBindDialog from './ClientMustBindDialog';

export default {
  components: {
    SystemContent, ClientMustBindDialog
  },
  data() {
    return {
      bindStatus: false, // 绑定的状态
    }
  },
  beforeRouteEnter(to, from, next) {
    ajax('canyin.desktop.bizsyssetting.getkebideinfo').then((data) => {
      const { appId, queueId } = data;
      next((vm) => {
        if (appId && queueId) {
          vm.bindStatus = true;
        } else {
          vm.bindStatus = false;
        }
      });
    });
  },
  computed: {
    statusObj() {
      return this.bindStatus
        ? {
          iconClass: 'icon-success',
          text: this.$t('Dict.Bound'),
          btn: this.$t('Dict.ModifyBindingInformation'),
        }
        : {
          iconClass: 'icon-error',
          text: this.$t('Dict.Unbound'),
          btn: this.$t('Dict.AddBindings'),
        };
    }
  },
  methods: {
    changeBindInfo() {
      this.$refs.clientMustBindDialog.open();
    },
    syncTables() {
      ajax('canyin.desktop.bizsyssetting.getconfigpoints').then(() => {
        this.$message.success(this.$t('Biz.UserDesktop.UserDesktopMsg157'));
      });
    },
    bindSuccess() {
      if (this.bindStatus === false) {
        this.bindStatus = true;
      }
    },
  }
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

@client-logo-width: 190px;
@client-logo-height: 105px;

.client-must-wrapper {
  position: relative;
  padding-left: 205px;
  height: @client-logo-height;
  > .pic {
    position: absolute;
    left: 0;
    top: 0;
    width: @client-logo-width;
    height: @client-logo-height;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding-top: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    > img {
      display: block;
      width: 130px;
    }
  }

  > .text {
    > h3 {
      line-height: 28px;
      font-size: 18px;
      color: #000;
    }

    > .status {
      line-height: 34px;

      > .icon-success {
        color: #46bc15;
      }
      > .icon-error {
        color: #FF3000;
      }
      > span {
        font-size: 12px;
      }
    }

    > .btn {
      width: 130px;
      height: 40px;
      background-color: #fff;
      border: 1px solid #5584ff;
      color: #5584ff;
      &.sync {
        background-color: #5584ff;
        color: #fff;
      }
    }
  }
}
</style>
