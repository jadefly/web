<template>
  <SystemContent :title="$t('Dict.QuickLogin')">
    <div class="fast-login-wrapper">
      <div class="crm-wrapper">
        <div class="pic">
          <img src="@static/img/crm.png" alt="CRM">
        </div>
        <div class="text">
          <h3>CRM</h3>
          <div class="status">
            <i class="icon" :class="crmStatusObj.iconClass"></i>
            <span>{{ crmStatusObj.text }}</span>
          </div>
          <button type="button" class="btn" @click="changeCrmBind">
            {{ crmStatusObj.btn }}
          </button>
        </div>
        <CrmBindDialog
          ref="crmBindDialog"
          :crmBindStatus="crmBindStatus"
          :crmInfo="crmInfo"
        ></CrmBindDialog>
      </div>

      <div class="supply-wrapper">
        <div class="pic bottom">
          <img src="@static/img/supply-chain.png" :alt="$t('Dict.CloudSupplyChain')">
        </div>
        <div class="text">
          <h3>{{$t('Dict.CloudSupplyChain')}}</h3>
          <div class="status">
            <i class="icon" :class="supplyStatusObj.iconClass"></i>
            <span>{{ supplyStatusObj.text }}</span>
          </div>
          <button type="button" class="btn" @click="changeSupplyBind">
            {{ supplyStatusObj.btn }}
          </button>
        </div>
        <SupplyBindDialog
          ref="supplyBindDialog"
          :supplyBindStatus="supplyBindStatus"
          :supplyInfo="supplyInfo"
        ></SupplyBindDialog>
      </div>
    </div>
  </SystemContent>
</template>

<script>
import SystemContent from '@/components/Index/UserDesktop/base/SystemContent';
import CrmBindDialog from './CrmBindDialog';
import SupplyBindDialog from './SupplyBindDialog';
import ajax from '@/common/js/ajax';

export default {
  components: {
    SystemContent,
    CrmBindDialog,
    SupplyBindDialog,
  },
  data() {
    return {
      crmInfo: null,
      supplyInfo: null,
    };
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.gotoCrmOrSupplyMoudle('002').then(() => {
        vm.gotoCrmOrSupplyMoudle('003');
      });
    });
  },
  computed: {
    crmBindStatus() {
      return !!this.crmInfo;
    },
    supplyBindStatus() {
      return !!this.supplyInfo;
    },
    crmStatusObj() {
      return this.crmBindStatus
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
    },
    supplyStatusObj() {
      return this.supplyBindStatus
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
    },
  },
  methods: {
    gotoCrmOrSupplyMoudle(productId) {
      return new Promise((resolve) => {
        ajax('canyin.desktop.bindingrelation.query', {
          contentType: 'URLEncoded',
          data: { productId },
        }).then((data) => {
          const { id } = data;
          if (id) {
            if (productId === '002') {
              this.crmInfo = data;
            }
            if (productId === '003') {
              this.supplyInfo = data;
            }
          }
          resolve(data);
        });
      });
    },
    changeCrmBind() {
      this.$refs.crmBindDialog.open({ isCrm7: false });
    },
    changeSupplyBind() {
      this.$refs.supplyBindDialog.open();
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

@logo-width: 190px;
@logo-height: 105px;

.fast-login-wrapper {
  position: relative;
  padding-left: 205px;
  height: @logo-height;
  .crm-wrapper, .supply-wrapper {
    margin-bottom: 40px;
    > .pic {
      position: absolute;
      left: 0;
      top: 0;
      width: @logo-width;
      height: @logo-height;
      border: 1px solid #ddd;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      > img {
        display: block;
        width: 100%;
        height: 100%;
      }
      &.bottom {
        top: 143px;
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
      }
    }
  }
}
</style>
