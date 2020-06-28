<template>
  <Dialog
      name="PosDialog.ration"
      :title="$t('Biz.Settlement.Ration')"
      ref="dialog"
      @close="onClose"
      @open="onOpen"
      @submit="onSubmit"
      :hotkeys="ration"
      :showSubmit="true"
      :append-to-body="true"
      width="360px !important"
      height="450px"
    >
    <div class="ration">
        <div >
          <form action="" v-keyboard:keyboard="{ mode: 'simple', autoSelect: true }" v-if="isOpen">
            <div>
              <span>{{$t('Biz.Settlement.Ration01')}}</span>
              <input
                type="text"
                ref="rationInput"
                class="rationInput"
                v-model="rationInputCount"
                v-judge
                v-autotest
              >
            </div>
            <div class="maxCount">
              <span>{{$t('Biz.Settlement.MaxDiscount')}}</span>
              <span
               style="color: #ffa200; font-weight: bold;"
              >
              {{maxFixMoney}}
              </span>
            </div>
          </form>
        </div>
        <div class="ration-keyboard">
          <KeyBoard ref="keyboard"></KeyBoard>
        </div>
    </div>
  </Dialog>
</template>

<script>
import { mapActions } from 'vuex';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';

export default {
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin],
  props: {
    bsId: {
      type: String,
      default: '',
    },
    pointId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      rationInputCount: 0,
      maxFixMoney: 0,
      baseBs: {}, // 流水数据
      isTeamSettlementFlg: 0, // 是否是团队结算
      isTeamBill: 0, // 是否是团队账单
      isOpen: false, // 解决关闭打开后input不动聚焦
    };
  },
  computed: {
    // 添加快捷键
    ration() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  methods: {
    onOpen() {
      this.$nextTick(() => {
        this.isOpen = true;
      });
      this.rationInputCount = 0;
      this.maxFixMoney = this.resData.maxFixMoney;
      this.baseBs = this.resData.baseBs;
      this.isTeamSettlementFlg = this.resData.isTeamSettlementFlg;
      this.isTeamBill = this.resData.isTeamBill;
      setTimeout(() => {
        this.$refs.rationInput.focus();
      }, 100);
      this.$vonce('authCode', (code) => {
        this.onSubmit(code);
      });
    },
    onClose() {
      this.isOpen = false;
    },
    onSubmit(authData = {}) {
      if (!(/^\d+(\.\d+)?$/ig.test(this.rationInputCount))) {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning11')}`);
        return;
      }
      if (Number(this.rationInputCount) > Number(this.maxFixMoney)) {
        this.$message.error(`${this.$t('Biz.Settlement.Error1')}`);
        return;
      }
      let url = 'canyin.pos.settlement.fiexd';
      const params = {
        bsId: this.bsId,
        pointId: this.pointId,
        money: this.rationInputCount,
        foId: null,
        ...authData,
      };
      const { isTeamSettlementFlg, isTeamBill } = this;
      if (+isTeamSettlementFlg === 1 && +isTeamBill === 1) {
        params.teamPointIds = this.baseBs.teamPointIds;
        params.teamBsIds = this.baseBs.teamBsIds;
        url = 'canyin.pos.settlement.teamfiexd';
      }
      ajax(url, {
        contentType: 'paramsEncoded',
        data: params,
      }).then((data) => {
        if (data.success) {
          // 上传优惠类型到VueX
          this.setDiscTypeCache(params);
          this.submit(this.rationInputCount);
          this.$message.success(`${this.$t('Biz.Settlement.Success6')}`);
          this.close();
        } else {
          this.$message({
            message: data.msg,
            type: 'warning',
          });
        }
      }).catch((msgCode, msg) => {
        this.$message({
          message: msg,
          type: 'warning',
        });
      });
    },
    // 上传优惠类型到Vuex
    setDiscTypeCache(data) {
      this.setSettleDiscType({ list: data });
    },
    ...mapActions([
      'setSettleDiscType',
    ]),
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .ration{
      width: 100%;
      height: 100%;
      background: #fff;
      form{
        padding:15px;
        padding-bottom: 5px;
        text-align: center;
        .maxCount{
          padding: 5px;
          text-align: right;
        }
      }
  }
  .rationInput{
    width: 250px;
    height: 40px;
    text-align: right;
    border-radius: 5px;
    border: 1px solid #b5b5b5;
    padding: 5px;
  }
  .ration-keyboard{
    .keyboard {
      margin: auto;
    }
  }
  .lang-enUS{
    .rationInput{
      width: 215px;
    }
  }
</style>
