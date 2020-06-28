<template>
  <div class="pos-fastfood-billBtns">
    <div :class="{'fastfood-billBtns-Mask-layer':isMask}"></div>
    <ul class="pos-order-btns-list" id="posOrderingBtns">
        <li v-for="(item,index) of addMenuBtnsTest" :key="index">
        <button
          type="button"
          @click="clickHandler(item.name ? item.name : checkGiveState)"
          :disabled="!item.disabled || isForbiddenEditBillAmount"
          :id="!item.name ? 'GiveStateBtn':item.name + 'Btn'"
        >
          {{item.text}}
          <span class="hotKeyTip" v-show="item.hotKey">{{item.hotKetTip !== undefined ? item.hotKetTip:`(${item.hotKey})`}}</span>
        </button>
      </li>
    </ul>
  </div>
</template>
<script>
import { find } from 'lodash';
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      activeItem: null,
      isMask: false,
    };
  },
  props: {
    guestList: Array,
    checkGiveState: String,
    addMenuBtnsTest: Array,
  },
  mounted() {
    this.$von("maskLayerBus", (val) => {
      this.maskLayer(val);
    });
  },
  computed: {
    ...mapGetters(['getSelectDiscountPlanData', 'posFastFood']),
    // 争鲜 后台设置 是否开启不允许修改账单金额 功能 this.posFastFood.isForbiddenEditBillAmount 为true 开启
    isForbiddenEditBillAmount() {
      return this.posFastFood.isForbiddenEditBillAmount;
    },
  },
  methods: {
    clickHandler(method) {
      // 如果打折活动方案存在的时候不能进行处理
      if (this.getSelectDiscountPlanData) {
        this.$message.warning(`${this.$t('Biz.Order.CancelDiscountMsg')}${this.getSelectDiscountPlanData.discountPlanName}`);
        return false;
      }
      // 争鲜不允许修改账单金额设置    1开启；0未开启 就是不允许加单
      if (this.posFastFood.isForbiddenEditBillAmount) {
        this.$message.warning(this.$t('Biz.Order.CannotMdBillAmountMsg'));
        return false;
      }
      this.$emit('control', method);
      return true;
    },
    setActiveItem(item) {
      this.activeItem = item || null;
    },
    maskLayer(val) {
      this.isMask = val;
    },
  },
};
</script>
<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
@import "~@/components/Pos/Order/Bill/btns.less";
.pos-fastfood-billBtns {
  position: absolute;
  right: 0;
  top: 0;
  width: 60px;
  height: 100%;
  padding-top: 18px;
  padding-bottom: 18px;
}
.pos-order-btns-list .scaleFontSize {
  font-size: 22px;
}
.fastfood-billBtns-Mask-layer{
  position: absolute;
  height: 95%;
  background-color: #b1d0d7;
  width: 100%;
  opacity: 0.1;
  z-index: 100;
}
.lang-enUS {
    .pos-fastfood-billBtns {
        right: -24px;
        width: 84px;
        .pos-order-btns-list {
            > li {
                > button {
                    padding: 0;
                    font-size: 12px;
                }
            }
        }
    }
}
</style>
