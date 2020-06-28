<template>
  <Dialog
    name="PosDialog.PayMinimumConsumption"
    :title="$t('Dict.Btn.MinimumConsumption')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :hotkeys="PayMinimumConsumption"
    :append-to-body="true"
    top="25vh"
  >
   <div class="minimunextendbutton" slot="other-button">
    <button class="resumption-minimun-charges btn btn-default" @click="resumptionMinimun" type="button">{{$t('Biz.Settlement.RestoreMinConsumption')}}(F1)</button>
    <button class="exempt-charges btn btn-default" @click="exemptMinimun" type="button">{{$t('Biz.Settlement.Exempt')}}(F2)</button>
  </div>
  <div class="minimumConsumption-wrapper">
    <div class="content">
      <div class="form-info">
        <span class="form-info-left">{{$t('Biz.Settlement.CollectionMethod')}}:</span>
        <span class="form-info-right">{{miniMunextendMethod}}</span>
      </div>
      <div class="form-info">
        <span class="form-info-left">{{$t('Dict.Btn.MinimumConsumption')}}:</span>
        <span class="form-info-right">{{miniMunextendMoney}}</span>
      </div>
      <div class="form-info">
        <span class="form-info-left">{{$t('Biz.Settlement.NeedFilled')}}:</span>
        <span class="form-info-right need-complement">{{needComplement}}</span>
      </div>
    </div>

  </div>
  </Dialog>
</template>

<script>
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

export default {
  components: { Dialog },
  mixins: [DialogMixin],

  data() {
    return {
      miniMunextendMethod: '无', // 最低消费收取方式
      miniMunextendMoney: 0, // 最低消费
      needComplement: '',
    };
  },
  computed: {
    // 添加快捷键
    PayMinimumConsumption() {
      return {
        // 恢复最低消费F1
        F1: () => {
          this.resumptionMinimun();
        },
        // 免除F2
        F2: () => {
          this.exemptMinimun();
        },
      };
    },
  },
  methods: {
    onOpen() {
      // 获取结算页面信息
      ajax('canyin.pos.settlement.leastbuyview', {
        params: {
          pointid: this.resData[0],
          bsid: this.resData[1],
        },
      }).then((res) => {
        if (res.data.code === '1') {
          this.showMiniMunextend(res.data.data);
        }
      });
      this.$vonce('authCode', (code) => {
        this.exemptMinimun(code);
      });
    },
    showMiniMunextend(MiniMunextendData) {
      if (MiniMunextendData.minimunCharge) {
        if (MiniMunextendData.pointMng) {
          if (MiniMunextendData.pointMng.minimum_charge_type == 0) {
            this.miniMunextendMethod = `${this.$t('Biz.Settlement.NotCharged')}`;
          } else if (MiniMunextendData.pointMng.minimum_charge_type == 1) {
            this.miniMunextendMethod = `${this.$t('Biz.Settlement.ChargedPerGuest')}${MiniMunextendData.pointMng.minimum_charge}`;
          } else if (MiniMunextendData.pointMng.minimum_charge_type == 2) {
            this.miniMunextendMethod = `${this.$t('Biz.Settlement.ChargedPerPeople')}${MiniMunextendData.pointMng.minimum_charge}`;
          }
        }
        // 最低消费
        this.miniMunextendMoney = `${MiniMunextendData.minimunCharge.minimum_charge}`;
        // 补齐方式
        if (MiniMunextendData.minimunCharge.disc_type == 1) {
          this.needComplement = `${this.$t('Biz.Settlement.Exempt')}`;// 需要补齐
        } else {
          this.needComplement = `${MiniMunextendData.minimunCharge.orig_fee}`;
        }
      } else {
        this.miniMunextendMethod = `${this.$t('Biz.Settlement.NotCharged')}`;// 最低消费收取方式
        this.miniMunextendMoney = '0';// 最低消费
        this.needComplement = '0';// 需要补齐
      }
      this.$emit('minimumConsumption', [this.miniMunextendMoney, this.needComplement]);
    },
    // 免除最低消费
    exemptMinimun(authData = {}) {
      if (this.miniMunextendMoney == '0') {
        this.$message({
          type: 'error',
          message: `${this.$t('Biz.Settlement.Error76')}`,
        });
        return false;
      }
      const params = {
        pointId: this.resData[0],
        bsId: this.resData[1],
        ...authData,
      };
      ajax('canyin.pos.settlement.miniMumCharge.off', {
        contentType: 'paramsEncoded',
        data: params,
      })
        .then((res) => {
          if (res.result === 1) {
            this.needComplement = `${this.$t('Biz.Settlement.Exempt')}`;// 需要补齐
            this.$message({
              type: 'success',
              message: `${this.$t('Biz.Settlement.Success31')}`,
            });
            this.close();
            this.$emit('minimumConsumption', [this.miniMunextendMoney, `${this.$t('Biz.Settlement.Exempt')}`]);
          } else if (res.result === -1) {
            this.$message({
              type: 'error',
              message: `${this.$t('Biz.Settlement.Error76')}`,
            });
          }
        });
    },
    // 恢复服务费
    resumptionMinimun() {
      const params = {
        pointId: this.resData[0],
        bsId: this.resData[1],
      };
      ajax('canyin.pos.settlement.miniMumCharge.recover', {
        data: params,
        contentType: 'paramsEncoded',
      }).then((res) => {
        if (res.data.code === '1') {
          if (res.data.data.result === 1) {
            // console.log(res.data.data.orig_fee)
            // 最低消费
            this.miniMunextendMoney = `${res.data.data.data.minimum_charge}`;// 最低消费
            // 补齐方式
            this.needComplement = `${res.data.data.data.orig_fee}`;
            this.$message({
              type: 'success',
              message: `${this.$t('Biz.Settlement.Success32')}`,
            });

            this.$emit('minimumConsumption', [this.miniMunextendMoney, this.needComplement]);
            this.close();
          } else if (res.data.data.result === -1) {
            this.$message({
              type: 'error',
              message: `${this.$t('Biz.Settlement.Error77')}`,
            });
          }
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.minimunextendbutton {
  display: inline-block;
  > button {
    height: 44px;
    border: 1px solid #0babb9;
    color: #0babb9;
  }
}
.minimumConsumption-wrapper {
  width: 100%;
  height: 175px;
  padding: 16px;
  background-color: #fff;
  display: table;

  > .content {
    display: table-cell;
    vertical-align: middle;
    > .form-info {
      width: 100%;
      height: 47px;
      display: table;

      > .form-info-left {
        display: table-cell;
        vertical-align: middle;
        font-size: 15px;
        font-weight: bolder;
      }
      > .form-info-right {
        display: table-cell;
        vertical-align: middle;
        font-size: 15px;
        font-weight: bolder;
      }
      > .need-complement {
        color: #0babb9;
      }
    }
  }
}
</style>

