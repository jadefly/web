<template>
<!-- 修改菜品价格 -->
  <Dialog
    name="PosDialog.OrderingChangePrice"
    :title="$t('Biz.BizComm.ChangeDishPrice')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :showSubmit="true"
    @submit="submitOrderingChangePrice"
    width="480px"
    :hotkeys="hotKeySet"
    :append-to-body="isNest"
    :submitId="type + 'ChangePriceSubmit'"
    :appendToBody="appendToBody"
  >
    <div class="pos-dialog-content">
      <div class="ordering-changeprice-wrap">
        <div class="ordering-changeprice-form">
          <div class="form-group">
            <!-- 已点菜品： -->
            <strong class="label">{{ $t('Biz.Order.OrderedDishes') }}</strong>
            <p class="form-control-static">
              <span>{{
                list[0].name + (
                  list[0].sizeName
                    ? ('（' + list[0].sizeName + '）')
                    : ''
                )
              }}</span><span>{{
                list[0].price
              }} /{{
                list[0].unitName
              }}</span>
            </p>
          </div>
          <div class="form-group">
            <!-- 已点数量： -->
            <strong class="label">{{ $t('Biz.Order.OrderedNum') }}</strong>
            <p class="form-control-static">{{ totalNum }}</p>
          </div>
          <div class="form-group">
            <!-- 小计： -->
            <strong class="label">{{ $t('Dict.Subtotal1') }}</strong>
            <p class="form-control-static">
              <span>{{ subTotal }}</span>
              <del v-if="subTotal != originTotal">{{ originTotal }}</del>
            </p>
          </div>
          <div class="form-group">
            <!-- 原单价： -->
            <strong class="label">{{ $t('Biz.BizComm.OriginalPrice') }}</strong>
            <p class="form-control-static">{{ list[0].stdPrice }}</p>
          </div>
          <div class="form-group">
            <!-- 修改为： -->
            <label for="iChangePrice">{{ $t('Biz.Order.RevisedTo') }}</label>
            <div class="form-control" v-if="isOpen">
              <input
                type="text"
                name="changePrice"
                id="iChangePrice"
                ref="changePrice"
                v-judge
                @change="changeChangePrice"
                v-model="changePrice"
                maxlength="8"
                v-keyboard:keyboard="{ mode: 'simple', autoSelect: true }"
              >
            </div>
          </div>
        </div>
        <div class="ordering-changeprice-keyboard">
          <KeyBoard ref="keyboard"></KeyBoard>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { reduce, isNaN } from 'lodash';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import { add, multi } from '@/common/js/math';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import { selectInput } from '@/common/js/dom';

export default {
  props: {
    isNest: {
      type: Boolean,
      default: false,
    },
    appendToBody: {
      type: Boolean,
      default: false, // 这是饿了么组件弹框嵌套的设置 true证明是在弹框的基础上弹框
    },
    type: {
      type: String,
      default: '',
    },
  },
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin],
  data() {
    return {
      list: [{}],
      changePrice: 0,
      isOpen: false,
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.submitOrderingChangePrice();
        },
      };
    },
    totalNum() {
      return reduce(this.list, (sum, item) => add(sum, item.num), 0);
    },
    subTotal() {
      return multi(this.totalNum, this.changePrice);
    },
    originTotal() {
      return multi(this.totalNum, this.list[0].stdPrice);
    },
  },
  watch: {
    changePrice(value) {
      if (isNaN(Number(value))) {
        this.changePrice = this.list[0].price;
      }
      if (parseFloat(value) < 0) {
        this.changePrice = 0;
      } else if (parseFloat(value) > 99999.99) {
        this.changePrice = 99999.99;
        // 最大值为99999.99
        this.$message.error(this.$t('Dict.MaximumMessage', [99999.99]));
      } else if (value[value.length - 1] !== '.' && value[value.length - 2] + value[value.length - 1] !== '.0') {
        this.changePrice = ((multi(+value, 100) >> 0) / 100);
      }
    },
  },
  methods: {
    onOpen() {
      this.isOpen = true;
      this.list = this.resData;
      this.changePrice = this.list[0].price;
      const uiData = this.list[0];
      this.$log.info(`打开价格窗口：id:${uiData.id},itemName:${uiData.itemName},num:${uiData.num},price:${uiData.price}`);
      this.selectInput();
    },
    onClose() {
      this.list = [{}];
      this.resData = [];
      this.isOpen = false;
    },
    selectInput() {
      this.$refs.changePrice ? selectInput(this.$refs.changePrice) : null;
    },
    changeChangePrice() {
      this.changePrice = Number(this.changePrice);
    },
    submitOrderingChangePrice() {
      this.submit(this.changePrice);
      this.close();
      const uiData = this.list[0];
      this.$log.info(`提交价格窗口：id:${uiData.id},itemName:${uiData.itemName},changePrice:${this.changePrice}`);
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.ordering-changeprice-wrap {
  padding-top: 12px;
  padding-bottom: 25px;
  background-color: @white;
  .clearfix();
}

.ordering-changeprice-form {
  float: left;
  width: 280px;
  padding-left: 15px;
  padding-right: 15px;

  > .form-group {
    position: relative;
    padding-left: 70px;
    margin-bottom: 10px;

    .label,
    label {
      color: #000;
      position: absolute;
      left: 0;
      top: -1px;
      .size(70px, 36px);
      line-height: 26px;
      margin-bottom: 0;
      font-weight: normal;
      padding: 5px .6em;
      text-align: left;
      font-size: 14px;
      white-space: nowrap;
    }

    > .form-control-static {
      margin-left: 1rem;
      padding-top: 5px;
      padding-bottom: 5px;
      line-height: 26px;
      min-height: 26px;
      word-wrap: break-word;

      > span,
      > del {
        margin-right: 20px;
      }

      > del {
        color: #999;
      }
    }

    > .form-control {
      .size(120px, 36px);
      position: relative;
      padding: 0;
      padding-left: 24px;
      margin-left: 1rem;

      > i {
        position: absolute;
        left: 0;
        top: 0;
        .size(24px, 34px);
        line-height: 34px;
        text-align: center;
        font-style: normal;
      }

      > input {
        display: block;
        width: 100%;
        border: none;
        height: 34px;
        padding-right: 5px;
      }
    }
  }
}

.ordering-changeprice-keyboard {
  float: left;
  width: 186px;
}

.ordering-changeprice-error {
  padding: 15px;
}
.lang-enUS {
  .ordering-changeprice-form > .form-group {
    padding-left: 120px;
  }
}
</style>
