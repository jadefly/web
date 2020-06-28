<template>
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
  >
    <div class="pos-dialog-content">
      <div class="ordering-changeprice-wrap">
        <div class="ordering-changeprice-form">
          <p><span class="pkgName">{{ $t('Dict.PkgName') }}</span><span class="pkgNameContent">{{list.name}}</span></p>
          <p><span class="pkgName">{{ $t('Dict.PkgNumber') }}</span><span>{{list.lastQty}}</span></p>
          <!-- / OriginalPrice 原价格 -->
          <p><span class="pkgName">{{ $t('Dict.OriginalPrice') }}</span><span>{{list.originalPrice}}</span></p>
          <p><span class="pkgName">{{ $t('Biz.Order.PkgTotalPrice') }}</span><span>{{subTotal}}</span></p>
          <p>
            <!-- "RevisedTo": "修改为：" -->
            <span class="pkgName">{{ $t('Biz.Order.RevisedTo') }}</span>
            <label></label>
            <input
              name="changePrice"
              class="changePrice"
              v-model.trim="list.price"
              type="text"
              ref="changePrice"
              @input="handleInput"
              v-keyboard:keyboard="{ mode: 'simple', autoSelect: true }"
              maxlength="9"
              v-judge
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
import { multi } from '@/common/js/math';
import KeyBoard from '@/components/Pos/Common/KeyBoard';

export default {
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin],
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
      return '';
    },
  },
  methods: {
    onOpen() {
      this.list = this.resData;
      this.isShow = true;
      const _this = this;
      setTimeout(function(){
        _this.$refs.changePrice.focus()
        if (_this.$refs.keyboard) {
          _this.$refs.keyboard.reSelect()
        }
      },200);
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
        // "MdyPkgPriceError": "所改套餐价格不能为空"
        messageString = this.$t('Biz.Order.MdyPkgPriceError');
        this.isShowMessage(messageString);
        setTimeout(() => {
          this.$refs.changeNum.focus();
        }, 0);
      } else if (!this.subTotal) {
        // TempItemMessage03 =  "请输入正确的价格"
        this.isShowMessage(this.$t('Biz.Order.TempItemMessage03'));
        this.$refs.changePrice.focus();
        this.$refs.changePrice.select();
      } else if (this.list.price > 99999.99) {
        // "MaximumMessage01": "最大值为99999.99"
        this.isShowMessage(this.$t('Dict.MaximumMessage', [99999.99]));
        this.$refs.changePrice.focus();
        this.$refs.changePrice.select();
      } else {
        this.submit(this.list);
      }
    },
    isShowMessage(message, type, duration) {
      let options = {
        message: message ? message : this.$t('Dict.PromptInfo'), // 提示的内容
        type: type ? type : "error", // 类型 success/warning/info/error
        duration: duration ? duration : 1500 // 显示的时间
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
    display: flex;
    >span {
      &.pkgName {
        width: 72px;
        margin-right: 10px;
        display: flex;
        align-items: center;
      }
      &.pkgNameContent {
        width: 147px;
        display: flex;
        align-items: center;
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

.lang-enUS{
  .ordering-changeprice-form{
    p{
      font-size: 12px;
    }
  }
}

</style>
