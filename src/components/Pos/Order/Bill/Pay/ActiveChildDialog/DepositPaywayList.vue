<template>
  <Dialog
    name="PosDialog.DespositPaywayList"
    :title="$t('Biz.Settlement.LoginType')"
    ref="dialog"
    @submit="onSubmit"
    @close="onClose"
    @open="onOpen"
    :append-to-body="true"
    width="460px"
    height="310px"
    :showSubmit="true"
    top="26vh"
    :submitId="name + 'Submit'"
  >
    <div class="pos-dialog-content">
      <!-- 弹窗内容 -->
      <ul class="payway-list-wrapper" :id="pagerId">
        <li
        v-for="item in paywayList"
        :key="item.id"
        @click="selectDepositPayway(item)"
        :class="{'active': item.id === activeItem.id}"
        >
        {{ item.name }}
        </li>
      </ul>
      <div class="payway-pager">
      <Pager
       :showInfo="true"
       :pagerId="pagerId"
       ref="depositPaywayPager"
      >
      </Pager>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';
import { find } from 'lodash';

export default {
  props: ['name'],
  components: { Dialog, Pager },
  mixins: [DialogMixin],
  data() {
    return {
      paywayList: [],
      activeItem: {},
      pagerId: '',
    };
  },
  methods: {
    onOpen() {
      this.pagerId = this.name;
      this.paywayList = this.resData.paywayList;
      // 回显押金登记方式
      this.activeItem = find(this.paywayList, { id: this.resData.paywayId });
      // 刷新分页
      setTimeout(() => {
        if (this.$refs.depositPaywayPager) {
          this.$refs.depositPaywayPager.refresh();
        }
      }, 20);
    },
    selectDepositPayway(item) {
      this.activeItem = item;
    },
    onSubmit() {
      this.submit(this.activeItem);
      this.close();
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-dialog-content {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: white;
}

.payway-list-wrapper {
  position: relative;
  width: 100%;
  height: 200px !important;
  overflow: hidden;
  .clearfix();

  > li {
    float: left;
    .size(100px, 40px);
    line-height: 40px;
    font-size: 14px;
    margin-left: 12px;
    margin-top: 10px;
    overflow: hidden;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    &.active {
      background-color: #039eac;
      border-color: #047d88;
      color: white;
    }
  }
}

.payway-pager {
  width: 97%;
  text-align: right;
  padding-top: 10px;
}
</style>
