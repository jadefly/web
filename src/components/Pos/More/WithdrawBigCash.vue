<template>
  <Dialog
    name="PosDialog.withdrawBigCash"
    :title="$t('Biz.Pos.MoreModuleSpan12')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="smokeSubmit"
    :hotkeys="AddPayHotkey"
    :closeByClickModel="false"
    :showSubmit="true"
    width="700px"
    height="330px"
    top="10vh">
    <button
      slot="other-button"
      type="button"
      class="btn btn-default"
      @click="openCash('')"
      :disabled="disable || isServer('1037', '173')">{{$t('Dict.OpenCashBox')}}(F1)</button>
    <div class="withdraw-big-cash">
      <div class="input-wrap">
        <div class="input">
          <span>{{ $t('Biz.Pos.More.WBigCashSpan1', [this.setting.baseCurrency.name]) }}</span>
          <el-input
            :disabled="true"
            v-model="cashInfo.incomeCash">
          </el-input>
        </div>
        <div class="input">
          <span>{{ $t('Biz.Pos.More.WBigCashSpan2', [this.setting.baseCurrency.name]) }}</span>
          <el-input
            :disabled="true"
            v-model="cashInfo.okSmokeCash">
          </el-input>
        </div>
        <div class="input">
          <span>{{ $t('Biz.Pos.More.WBigCashSpan3', [this.setting.baseCurrency.name]) }}</span>
          <el-input
            :disabled="true"
            v-model="cashInfo.noSmokeCash">
          </el-input>
        </div>
        <div class="input">
          <span>{{ $t('Biz.Pos.More.WBigCashSpan4', [this.setting.baseCurrency.name]) }}</span>
          <el-input
            ref="reqSmokeCash"
            v-model="cashInfo.reqSmokeCash">
          </el-input>
        </div>
      </div>
      <div class="keyboard-warp">
        <KeyboardNum class="keyboard"></KeyboardNum>
      </div>
    </div>
  </Dialog>
</template>
<script>
import $ from 'jquery';
import { mapGetters } from 'vuex';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';
import KeyBoard from '@/components/Pos/Common/KeyBoard';

export default {
  name: 'withdrawBigCash',
  // abstract: true,
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin],
  data() {
    return {
      cashInfo: {
        incomeCash: 0, // 本班人民币收入金额
        noSmokeCash: 0, // 本班未抽取人民币金额
        okSmokeCash: 0, // 本班已抽取人民币金额
        reqSmokeCash: 998, // 本班抽取人民币金额
        authId: 0, // 授权人id 默认为0
        psId: '', // 结班流水id
        statTime: '', // 结班数据汇总时间
        watchWhich: '', // 点击开钱箱或者确认按钮来$vonce某个事件  openCash / smokeCash
      },
      disable: false, // 是否为录单模式
    };
  },
  computed: {
    ...mapGetters(['posBaseInfo', 'ALL_POS_MODULE', 'getVuexPosMode', 'allPosModule', 'setting']),
    AddPayHotkey() {
      const _hotkeyTmp = {};
      _hotkeyTmp.Esc = () => {
        this.close();
      };
      _hotkeyTmp.PgDn = () => {
        this.smokeSubmit();
      };
      _hotkeyTmp.F1 = () => {
        this.openCash();
      };
      return _hotkeyTmp;
    },
  },
  methods: {
    onOpen() {
      this.$nextTick(() => {
        this.$refs.reqSmokeCash.$el.children[0].focus();
      });
      if (this.posBaseInfo.controlMode == 2) {
        this.disable = true;
      } else {
        this.disable = false;
      }
      this.$vonce('authCode', (code) => {
        if (this.watchWhich === 'openCash') {
          this.openCash(code);
        } else if (this.watchWhich === 'smokeCash') {
          this.smokeSubmit(code);
        }
      });
      this.selectSmokeInfo();
    },
    onClose() {
      this.watchWhich = '';
    },
    isServer(name, type) {
      const item = type;
      const changeUpdateItem = this.ALL_POS_MODULE.find(({ id }) => id === item);
      if (changeUpdateItem) {
        const changeUpdateList = changeUpdateItem.children;
        for (let i = 0, len = changeUpdateList.length; i < len; i += 1) {
          if (changeUpdateList[i].id == name && !changeUpdateList[i].checked) { // 未在后台选中，则置灰不可点
            return !changeUpdateList[i].checked;
          }
        }
      }
      return false;
    },
    getToken(next) {
      ajax('canyin.pos.token.get').then((tokenId) => {
        next(tokenId);
      });
    },
    selectSmokeInfo() {
      ajax('canyin.pos.smokecash.selectsmokeinfo', {
        needToken: true,
        contentType: 'URLEncoded',
      })
        .then((res) => {
          if (res) this.cashInfo = { ...res };
        });
    },
    smokeSubmit(authData = {}) {
      const { reqSmokeCash, noSmokeCash } = this.cashInfo;
      const re = /^\d+(?=\.{0,1}\d+$|$)/;
      if (!re.test(reqSmokeCash)) {
        this.$message({
          type: 'warn',
          message: this.$t('Biz.Pos.More.WBigCashMsg1'),
        });
        return;
      }
      if (reqSmokeCash > noSmokeCash) {
        this.$message({
          type: 'success',
          message: this.$t('Biz.Pos.More.WBigCashMsg2'),
        });
        return;
      }
      this.watchWhich = 'smokeCash';
      const data = {
        ...this.cashInfo,
        ...authData,
      };
      this.getToken((tokenId) => {
        data.tokenId = tokenId;
        ajax('canyin.pos.smokecash.smokesubmit', {
          needToken: true,
          contentType: 'json',
          data,
        })
          .then((res) => {
            const { data, msg } = res;
            if (data.result && +data.result === -2) { // 判断-2为没有权限 弹出授权框
              this.$vemit('posAuthCheck', {
                message: data.msg,
              });
              return;
            }
            this.$message({
              type: 'success',
              message: `${msg}`,
            });
            this.close();
          });
      });
    },
    openCash(authData = {}) {
      if (!this.$store.state.pos.device.enableCashbox) {
        this.$message({
          message: this.$t('Biz.Pos.More.MoneyBoxModalMsg2'),
          type: 'warning',
        });
        return;
      }
      this.watchWhich = 'smokeCash';
      ajax('canyin.pos.cashbox.opencashbox', {
        needToken: true,
        contentType: 'paramsEncoded',
        data: {
          rzOpencashId: 19,
          ...authData,
        },
      })
        .then((data) => {
          this.$devices.Cashbox.open();
          // this.close();
        });
    },
  },
};
</script>
<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .withdraw-big-cash {
    display: flex;
    padding: 10px 20px;
    .input-wrap {
      flex: 2;
      margin-right: 20px;
      .input {
        display: flex;
        align-items: center;
        margin: 5px 0 22px 0;
        > span {
          flex: 1;
          font-size: 16px;
          font-weight: bold;
          color: #333;
        }
        > div {
          flex: 1;
        }
      }
    }

  }
</style>
<style>
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  input[type="number"]{
    -moz-appearance: textfield;
  }
</style>
