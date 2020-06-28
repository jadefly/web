<template>
  <Dialog
    name="PosDialog.PayWayRunModal"
    :title="payWayInfo.name"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :hotkeys="PayWayRunModal"
    :append-to-body="true"
    :showSubmit="true"
    width="436px"
    id="posDialogPayWayRunModal"
  >
  <div class="run-modal">
    <div class="item">
      <span class="title"><b>{{$t('Biz.Settlement.RunningAmount')}}</b></span>
      <div class="content">
        <span class="line-through">
          <span class="run-money">{{amountToBePaid | keepTwo}}</span>
        </span>
      </div>
    </div>
    <div class="item">
      <span class="title">{{$t('Biz.Settlement.RunningReason')}}</span>
      <div class="content">
        <div class="btn-item" v-for="item in reasonList" :key="item.id">
          <button v-autotest type="button" class="btn btn-default"
            :class="{'btn-primary':currentReason && currentReason.id === item.id}"
            @click="changeReason(item)">{{item.name}}</button>
        </div>
      </div>
    </div>
    <div class="remark-item">
      <span class="title">{{$t('Dict.Remarkss')}}</span>
      <div>
        <el-input
          type="textarea"
          v-model="remark"
          :maxlength="80"
          :autosize="{ minRows: 2, maxRows: 4}"
          :placeholder="$t('Dict.EnterSomething')"
          v-autotest>
        </el-input>
      </div>
    </div>
  </div>
  </Dialog>
</template>

<script>
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import numberformat from '@/common/js/numberformat';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  props: {
    bsData: {
      type: Object,
    },
    // 待付金额
    amountToBePaid: {
      default: 0,
    },
  },
  data() {
    return {
      payWayInfo: {
        name: '',
      },
      reasonList: [],
      currentReason: null,
      remark: '',
    };
  },
  filters: {
    keepTwo(val) {
      return numberformat(val);
    },
  },
  computed: {
    // 添加快捷键
    PayWayRunModal() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  methods: {
    // 修改跑单原因
    changeReason(reason) {
      this.currentReason = reason;
    },
    onOpen() {
      this.payWayInfo = this.resData;
      this.currentReason = null;
      this.remark = '';
      ajax('canyin.pos.settlement.pay.escapedtypepayway', {
        params: {
          paywayid: this.resData.id,
          bsid: this.bsData.id,
        },
      }).then((data) => {
        this.reasonList = data.skips;
        const [first] = data.skips;
        this.currentReason = first;
      });
    },
    // 点击提交
    onSubmit(authCode = {}) {
      this.$vonce('authCode', (code) => {
        this.onSubmit(code);
      });
      ajax('canyin.pos.settlement.judgeempifhaspaywayopset', {
        params: {
          payTypeId: this.resData.payway_type_id,
          payMoney: this.amountToBePaid,
          ...authCode,
        },
      }).then(() => {
        this.$emit('add-pay-way', {
          name: this.payWayInfo.name,
          payway_id: this.payWayInfo.id,
          payway_type_id: this.payWayInfo.payway_type_id,
          take_money: Number(this.amountToBePaid),
          is_confirm_delete: this.payWayInfo.isconfirmdelete,
          use_alone: this.payWayInfo.is_use_alone,
          isolpayway: this.payWayInfo.isolpayway,
          dis_name: this.currentReason.name,
          remark: this.remark,
          reason_id: this.currentReason.id,
        });
        this.close();
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.run-modal{
  padding: 16px;
}
.item{
  display: table;
  width: 100%;
  margin-bottom: 10px;
  >*{
    display: table-cell;
  }
  .line-through {
    color: #ffffff;
    text-decoration: line-through;
  }
  .run-money{
    font-size: 18px;
    color: #0babb9;
    font-weight: bold;
  }
  .btn-item{
    padding: 6px;
    display: inline-block;
    width: 33.3%;
  }
  button{
    width: 100%;
  }
}
.title{
  width: 78px;
  font-size: 14px;
}
.remark-item{
  .title{
    display: block;
    margin-bottom: 8px;
  }
}
</style>
