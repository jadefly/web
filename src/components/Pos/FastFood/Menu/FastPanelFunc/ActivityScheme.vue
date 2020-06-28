<template>
  <Dialog
    name="PosDialog.ActivityScheme"
    :title="$t('Dict.ProgrammeOfActivities')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    width="533px"
    submitId="activityScheme"
  >
    <div class="pos-dialog-content pos-activity-scheme-wrapper">
      <ul>
        <li v-for="(list, index) in discountPlanList" :key="index"
          :class="{active: (getSelectDiscountPlanData &&
          list.discountPlanId == getSelectDiscountPlanData.discountPlanId)}">
          <button @click="selectPlanBtn(list)" class="planListBtn">
            {{list.discountPlanName}}
          </button>
        </li>
      </ul>
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
  data() {
    return {
      // 方案的列表
      discountPlanList: [],
    };
  },
  computed: {
    ...mapGetters(['getSelectDiscountPlanData']),
    // discountPlanList() {
    //   console.log(this.resData)
    //   return this.resData ? this.resData : []
    // }
  },
  methods: {
    onOpen() {
      this.discountPlanList = this.resData ? this.resData : [];
    },
    // 选择要这行的打折
    selectPlanBtn(selectPlanList) {
      if (selectPlanList) {
        this.submit(selectPlanList);
        this.close();
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.pos-activity-scheme-wrapper {
  height: 286px;
  background-color: #ffffff;
  >ul {
    height: 100%;
    padding: 10px;
    >li {
      width: 118px;
      height: 42px;
      border:1px solid #b5b5b5;
      border-radius: 5px;
      overflow: hidden;
      margin: 5px;
      float: left;
      .planListBtn {
        height: 100%;
        width: 100%;
        overflow: hidden;
        border: none;
        background-color: #ffffff;
      }
      &.active {
        border:1px solid #0babb9;
        color: #0babb9;
      }
    }
  }
}
</style>
