<template>
<!-- ModifyItemNum 修改菜品数量 -->
  <Dialog
    name="Package.ChangeNum"
    :title="$t('Biz.Order.ModifyItemNum')"
    ref="dialog"
    :showSubmit="true"
    width="480px"
    @open="onOpen"
    @submit="submitChangeNum"
    append-to-body
    :hotkeys="hotKeySet"
    :submitId="submitId"
  >
    <div class="pos-dialog-content">
      <div class="ordering-changenum-wrap" v-if="isOpen">
        <div class="ordering-changenum-form">
          <!--       "OrderedNum": "已点数量",
      "OrderedDishes": "已点菜品：" -->
          <div class="form-group">
            <strong class="label2">{{ $t('Biz.Order.OrderedDishes') }}</strong>
            <p class="form-control-static">
              <span>{{itemList.itemName}}</span>
            </p>
          </div>
          <div class="form-group">
            <label for="iChangeNum">{{ $t('Biz.Order.OrderedNum') }}</label>
            <div class="ordering-changenum-num">
              <button
                type="button"
                class="subtract"
                :disabled="isDisabled"
                @click="changeNumHandle('-')"
              >
                <i class="icon icon-subtract"></i>
              </button>
              <input
                type="text"
                name="changeNum"
                v-model="itemList.num"
                v-keyboard:keyboard="{ mode: 'simple', autoSelect: true }"
                ref="changeNum"
                v-judge
                v-autotest
              >
              <button
                type="button"
                class="add"
                @click="changeNumHandle('+')"
              >
                <i class="icon icon-add"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="ordering-changenum-keyboard">
          <KeyBoard ref="keyboard"></KeyBoard>
        </div>
      </div>
    </div>
  </Dialog>
</template>
<script>
import Dialog from '@/components/Pos/Common/Dialog'
import DialogMixin from '@/components/Pos/Common/DialogMixin'
import KeyBoard from '@/components/Pos/Common/KeyBoard'
import { Message } from 'element-ui'
export default {
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin],
  props: {
    submitId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      list: null,
      isDisabled: false,
      isOpen: false,
    }
  },
  computed: {
    hotKeySet() {
      return {
        'PgDn': () => {
          this.submitChangeNum()
        }
      }
    },
    //监听下数据中的num变化
    itemList() {
      //this.list 存在赋值
      if(this.list) {
        //如果num 数据小于等于1就要把减的按钮设为不可点 否则可点
        this.isDisabled = this.list.num <= 1 ?  true : false
        return this.list
      }else{
        return ''
      }
    }
  },
  methods: {
    onClose() {
      this.isOpen = false;
    },
    onOpen() {
      this.isOpen = true;
      //打开弹框的时候进行赋值
      this.list = this.resData
      let _this = this
      //打开进行input 聚焦
      setTimeout(function(){
        _this.$refs.changeNum.focus()
        if(_this.$refs.keyboard) {
          _this.$refs.keyboard.reSelect()
        }
      },200)
    },
    submitChangeNum() {
      //确认事件 要判断当前的数值 情况 为零或者是空的时候提示
      // "ItemsCannotBeEmpty": "所改的菜品数量不能为空",
      // "NumCannotBeEmpty": "所改的菜品数量不能为零"
      if(this.itemList.num == "" || this.itemList.num == "0") {
        let messageString = this.itemList.num == "" ? this.$t('Dict.ItemsCannotBeEmpty') : this.$t('Dict.NumCannotBeEmpty')
        this.isShowMessage(messageString)
        this.$refs.changeNum.focus()
        return
      }else{
        //进行回调
        this.submit(this.itemList)
      }
    },
    //加加 减减 按钮事件
    changeNumHandle (btnName) {
      if(btnName == '-') {
        if(this.itemList.num <= 1) {
          return
        }
        this.itemList.num =  (this.itemList.num*1000 - 1*1000)/1000
      }else{
        this.itemList.num = (this.itemList.num*1000 + 1*1000)/1000
      }
    },
    isShowMessage(message, type, duration) {
      let options = {
        message: message ? message : this.$t('Dict.PromptInfo'), //提示的内容
        type: type ? type : "error", //类型 success/warning/info/error
        duration: duration ? duration : 1500, //显示的时间
        center: true //中间显示
      }
      Message(options); //需要多的可以查看element-ui 的官网 Message组件
    },
  }
}
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.ordering-changenum-wrap {
  padding-top: 12px;
  padding-bottom: 25px;
  background-color: @white;
  .clearfix();
}

.ordering-changenum-form {
  float: left;
  width: 280px;
  padding-left: 15px;
  padding-right: 15px;

  > .form-group {
    position: relative;
    padding-left: 77px;
    margin-bottom: 10px;

    .label2,
    label {
      position: absolute;
      left: 0;
      top: 0;
      width: 70px;
      height: 36px;
      line-height: 1.1;
      margin-bottom: 0;
      font-weight: normal;
      text-align: right;
    }

    > .form-control-static {
      padding-top: 5px;
      padding-bottom: 5px;
      line-height: 26px;
      min-height: 26px;

      > span {
        margin-right: 20px;
      }
    }
  }
}

.ordering-changenum-num {
  position: relative;
  padding-left: 40px;
  padding-right: 40px;
  .size(130px, 36px);

  > button {
    position: absolute;
    top: 0;
    .square(36px);
    border: 1px solid #999;
    background-color: transparent;
    border-radius: 3px;

    > i.icon {
      color: #999;
    }

    &.subtract {
      left: 0;
    }

    &.add {
      right: 0;
    }

    &:disabled {
      border-color: #ccc;
      cursor: not-allowed;

      > i.icon {
        color: #ccc;
      }
    }
  }

  > input {
    display: block;
    .size(100%, 36px);
    border: 1px solid #999;
    border-radius: 3px;
    text-align: center;
  }
}

.ordering-changenum-keyboard {
  float: left;
  width: 186px;
}

.ordering-changenum-error {
  padding: 15px;
}
</style>
