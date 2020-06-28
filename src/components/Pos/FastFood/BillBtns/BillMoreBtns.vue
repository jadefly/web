<template>
  <Dialog
    name="PosDialog.fastFoodBillMoreBtns"
    :title="$t('Biz.Order.MoreOrderTitle')"
    ref="dialog"
    @close="onClose"
    :hotkeys="hotKeySet"
  >
    <div class="pos-dialog-content">
      <div class="more-bill-wrap">
        <ul class="row">
          <!-- <li class="col-xs-2">
            <button
              type="button"
              @click="clickHandler('modifyItemPackage')"
              :disabled="!checkPackageState"
            >修改套餐<span>(A)</span>
            </button>
          </li> -->
          <!-- <li class="col-xs-2">
            <button
              id="changeWaiterBtn"
              type="button"
              @click="clickHandler('changeWaiter')"
            >改点菜员<span>(B)</span></button>
          </li> -->
          <!-- <li class="col-xs-2">
            <button
              id="skipKitchenListBtn"
              type="button"
              @click="clickHandler('skipKitchenList')"
            >{{ unKitchenPrinting ? '取消免厨打' : '免厨打' }}<span>(C)</span></button>
          </li> -->
          <!-- <li class="col-xs-2">
            <button
              id="teamAddBtn"
              type="button"
              @click="clickHandler('teamAdd')"
              :disabled="!isTeam"
            >{{ isTeamAdd ? '取消团队加单' : '团队加单' }}<span>(D)</span></button>
          </li> -->
          <!-- <li class="col-xs-2">
            <button
              id="grouponBtn"
              type="button"
              @click="clickHandler('groupon')"
              :disabled="groupDisabled"
            >团购验券<span>(E)</span></button>
          </li> -->
          <!-- <li class="col-xs-2">
            <button
              id="openCopyBtn"
              type="button"
              @click="clickHandler('openCopy')"
            >复制菜品</button>
          </li> -->
          <!-- <li class="col-xs-2">
            <button
              id="clearItemBtn"
              type="button"
              @click="clickHandler('clearItem')"
              :disabled="!hasItems"
            >清空</button>
          </li> -->
          <!-- 179又没发出去，暂时屏蔽掉，封版后在180恢复 -->
          <!-- <li class="col-xs-2">
            <button
              id="openSpellBtn"
              type="button"
              @click="clickHandler('spellFood')"
              :disabled="!isSpellFood"
            >拼菜<span>(F9)</span></button>
          </li> -->
        </ul>
      </div>
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
    unKitchenPrinting: {
      type: Boolean,
      default: false,
    },
    isTeamAdd: {
      type: Boolean,
      default: false,
    },
    isTeam: {
      type: Boolean,
      default: false,
    },
    guestList: {
      type: Array,
    },
    activeList: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      activeItem: null,
    };
  },
  computed: {
    ...mapGetters(['ALL_POS_MODULE']),
    hotKeySet() {
      return {
        ESC: () => {
          this.onClose();
        },
      };
    },
    // 当前的菜是否允许拼菜 activeList 是当前选中的品项是否是品项是可以用,否则禁用
    isSpellFood() {
      return !!(this.activeList && this.activeList.isPincai);
    },
    hasItems() {
      return this.guestList && this.guestList.length;
    },
    // 团购验券是否disabled
    groupDisabled() {
      const pointServiceItem = this.ALL_POS_MODULE.find(({ id }) => id === '173');
      if (pointServiceItem) {
        const pointServiceList = pointServiceItem.children;
        return !pointServiceList.find(({ id }) => id === '913').checked;
      }
      return false;
    },
  },
  methods: {
    clickHandler(method) {
      this.$emit('control', method);
      this.close();
    },
    setActiveItem(elId) {
      this.activeItem = elId || null;
    },
  },
};
</script>


<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.more-bill-wrap {
  padding: 25px 30px;

  > ul {
    margin-bottom: 10px;

    button {
      .size(100%, 80px);
      margin-top: 10px;
      margin-bottom: 10px;
      background-color: @white;
      border: none;
      border-radius: 4px;
      color: #344b5b;

      &:hover {
        background-color: #defcff;
      }

      &:disabled {
        color: #777;
        cursor: not-allowed;
      }
    }
  }
}
</style>
