<template>
  <Dialog
    name="PosDialog.BilledCh"
    :title="$t('Dict.Tips')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :append-to-body="true"
    :showSubmit="true"
    :hotkeys="hotKeySet"
    width="400px"
  >
  <div class="content">
    <i class="el-icon-question"></i>
    <!-- 退单的提示语建议优化（原路退回仅支持CRM6）http://192.168.4.84:88/zentao/bug-view-71571.html -->
    <!-- <p class="tip-text">部分退款时会员卡退款原路返还，其他结算方式按人民币退款，是否确定退单？</p> -->
    <p class="tip-text">{{
      $t('Biz.Pos.More.ChargeBackConfirmP1', [this.setting.baseCurrency.name])
    }}</p>
  </div>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  props: {
  },
  data() {
    return {
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
    ...mapGetters(['setting']),
  },
  watch: {
  },
  methods: {
    onOpen() {
    },
    // 点击提交
    onSubmit() {
      this.$emit('submit');
      this.close();
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.content{
  background-color: @white;
  padding: 24px 20px;
}

.el-icon-question,.tip-text{
  display: inline-block;
}
.el-icon-question{
  color: #ffba00;
  font-size: 64px;
  margin-right: 12px;
  vertical-align: top;
}

.tip-text{
  font-size: 14px;
  color: #333333;
  width: 70%;
}
.seat-name{
  color: #0babb9;
}
</style>
