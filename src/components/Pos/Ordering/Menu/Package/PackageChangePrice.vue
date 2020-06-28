<template>
  <!-- 国际化：修改套餐价格 -->
  <Dialog
    name="Package.ChangePrice"
    :title="$t('Biz.Order.MdyPackagePrice')"
    ref="dialog"
    :showSubmit="true"
    width="480px"
    @open="onOpen"
    @submit="submitChangePrice"
    append-to-body
    :hotkeys="hotKeySet"
    :submitId="type + 'Submit'"
  >
    <div class="pos-dialog-content">
      <div class="ordering-changeprice-wrap">
        <!-- 国际化：套餐名称:，套餐数量:，原价格:，套餐总价:，修改为: -->
        <div class="ordering-changeprice-form">
          <p><span class="pkgName">{{$t('Dict.PkgName')}}</span><span class="pkgNameContent">{{list.name}}</span></p>
          <p><span class="pkgName">{{$t('Dict.PkgNumber')}}</span><span>{{list.lastQty}}</span></p>
          <p><span class="pkgName">{{$t('Dict.OriginalPrice')}}</span><span>{{list.originalPrice}}</span></p>
          <p><span class="pkgName">{{$t('Biz.Order.PkgTotalPrice')}}</span><span>{{subTotal}}</span></p>
          <p>
            <span class="pkgName">{{$t('Biz.Order.RevisedTo')}}</span>
            <input
              v-judge
              :id="type + 'Input'"
              name="changePrice"
              class="changePrice"
              v-model.trim="list.price"
              type="text"
              ref="changePrice"
              @input="handleInput"
              v-keyboard:keyboard="{ mode: 'simple', autoSelect: true }"
              maxlength="9"
            >
            <!-- <input name="changePrice"
            class="changePrice"
            ref="changePrice"
            type="number"
            @input="oninput"
            v-model.trim="list.price"
            v-keyboard:keyboard="{ mode: 'simple', autoSelect: true }"

            > -->
          </p>
        </div>
          <div class="ordering-changeprice-keyboard">
            <KeyBoard ref="keyboard"></KeyBoard>
          </div>
      </div>
    </div>
  </Dialog>
</template>
<script>
import { Message } from 'element-ui';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import { add, multi } from '@/common/js/math';
import KeyBoard from '@/components/Pos/Common/KeyBoard';

export default {
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin],
  props: {
    type: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      list: {},
      isShow: false,
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.submitChangePrice();
        },
      };
    },
    subTotal() {
      if (this.isShow) {
        return multi(this.list.lastQty, this.list.price);
      }
    },
  },
  methods: {
    onOpen() {
      this.list = this.resData;
      this.isShow = true;
      const _this = this;
      setTimeout(() => {
        _this.$refs.changePrice.focus();
        if (_this.$refs.keyboard) {
          _this.$refs.keyboard.reSelect();
        }
      }, 200);
    },
    handleInput(e) {
      // 输入数字和小数点.
      // let reg = /^\d+(\.\d{0,2})?$/
      // e.target.value = e.target.value.replace(/[^\d+(\.\d{0,2})?$]/g,'');
      e.target.value = e.target.value.replace(/[^\d.+]/g, '');
      e.target.value = e.target.value.replace(/\.\d*\./g, '.');
      // reg.test(e.target.value)
      // e.target.value.indexOf('.').length &&
      this.list.price = e.target.value;
    },
    submitChangePrice() {
      let messageString = '';
      if (this.list.price == '') {
        messageString = this.$t('Biz.Order.MdyPkgPriceError');
        this.isShowMessage(messageString);
        setTimeout(() => {
          this.$refs.changeNum.focus();
        }, 0);
      } else {
        // 进行回调
        if (!this.subTotal) {
          this.isShowMessage(this.$t('Biz.Order.LimitMsg004'));
          this.$refs.changePrice.focus();
          this.$refs.changePrice.select();
          return;
        }
        if (this.list.price > 99999.99) {
          this.isShowMessage(this.$t('Dict.MaximumMessage', [99999.99]));
          this.$refs.changePrice.focus();
          this.$refs.changePrice.select();
          return;
        }
        this.submit(this.list);
      }
    },
    isShowMessage(message, type, duration) {
      const options = {
        message: message || this.$t('Dict.PromptInfo '), // 提示的内容
        type: type || 'error', // 类型 success/warning/info/error
        duration: duration || 1500, // 显示的时间
      };
      Message(options); // 需要多的可以查看element-ui 的官网 Message组件
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
  width: 245px;
  float: left;
  padding: 20px;
  padding-right: 5px;
  >p {
    width: 100%;
    overflow: hidden;
    height: 32px;
    margin: 5px;
    >span {
      display: inline-block;
      &.pkgName {
        display: inline-block;
        min-width: 72px;
        margin-right: 10px;
      }
      &.pkgNameContent {
        width: 147px;
        position: absolute;
        overflow: hidden;
        white-space: nowrap;
        text-overflow:ellipsis;
      }
    }
    >.changePrice {
      width: 80px;
    }
    >label {
      font-weight: 100;
    }
  }
}
.ordering-changeprice-keyboard {
  float: right;
  margin-right: 15px;
  width: 186px;
  overflow: hidden;
}
</style>
