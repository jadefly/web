<template>
<!-- $t-修改菜品价格 -->
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
  >
    <div class="pos-dialog-content">
      <div class="ordering-changeprice-wrap" v-if="list && list.length">
        <div class="ordering-changeprice-form">
          <div class="form-group">
            <!-- $t-已点菜品： -->
            <strong class="label">{{ $t('Biz.Order.OrderedDishes')}}</strong>
            <p class="form-control-static">
              <span>
                {{ list[0].name + (list[0].sizeName ? ('（' + list[0].sizeName + '）') : '') }}
              </span>
            </p>
          </div>
          <div class="form-group">
            <!-- $t-已点数量： -->
            <strong class="label">{{ $t('Biz.Order.OrderedNum') }}</strong>
            <p class="form-control-static">{{ totalNum }}</p>
          </div>
          <div class="form-group">
            <!-- $t-小计 -->
            <strong class="label">{{ $t('Dict.Subtotal1') }}</strong>
            <p class="form-control-static">
              <span>{{ subTotal }}</span>
              <del v-if="subTotal != originTotal">{{ originTotal }}</del>
            </p>
          </div>
          <div class="form-group">
            <!-- $t-原单价： -->
            <strong class="label">{{ $t('Biz.BizComm.OriginalPrice')}}</strong>
            <p class="form-control-static">{{ list[0].stdPrice }}</p>
          </div>
          <div class="form-group">
            <!-- $t-修改为： -->
            <label for="iChangePrice">{{ $t('Biz.Order.RevisedTo') }}</label>
            <div class="form-control" v-if="isOpen">
              <i></i>
              <input
                type="text"
                name="changePrice"
                id="iChangePrice"
                ref="changePrice"
                @change="changeChangePrice"
                v-model="changePrice"
                v-judge
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
      <!-- $t-没有选中要改价的菜 -->
      <div class="ordering-changeprice-error" v-else>{{ $t('Biz.BizComm.BizCommTip15') }}</div>
    </div>
  </Dialog>
</template>

<script>
import { mapState } from 'vuex';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import { reduce, isNaN } from 'lodash';
import { add, multi } from '@/common/js/math';
import KeyBoard from '@/components/Pos/Common/KeyBoard';

export default {
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin],
  data() {
    return {
      list: null,
      changePrice: 0,
      isOpen: false,
    };
  },
  computed: {
    ...mapState('fastFood', ['maxPrice']),
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
      } else if (parseFloat(value) > this.maxPrice) {
        this.changePrice = this.maxPrice;
        this.$message.error(this.$t('Dict.MaximumMessage', [99999.99]));
      } else if (value[value.length - 1] !== '.' && value[value.length - 2] + value[value.length - 1] !== '.0') {
        this.changePrice = parseInt(multi(+value, 100), 10) / 100;
      }
    },
  },
  mounted() {
    this.$von('closeFastFoodChangePriceModal', () => {
      this.close();
    });
  },
  methods: {
    onOpen() {
      this.isOpen = true;
      this.list = this.resData;
      this.changePrice = this.list[0].price;
    },
    onClose() {
      this.isOpen = false;
    },
    changeChangePrice() {
      this.changePrice = Number(this.changePrice);
    },
    submitOrderingChangePrice() {
      this.submit(this.changePrice);
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
  .form-group {
    padding-left: 125px;
  }
  .ordering-changenum-form{
    .form-group{
      padding-left: 83px;
      > label{
        line-height: 1.3;
      }
    }
  }
}

</style>
