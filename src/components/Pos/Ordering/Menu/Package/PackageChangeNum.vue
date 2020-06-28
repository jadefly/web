<template>
  <!-- 国际化：修改菜品数量 -->
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
      <div class="ordering-changenum-wrap" v-if="list">
        <div class="ordering-changenum-form" v-keyboard:keyboard="{ mode: 'simple', autoSelect: true }">
          <div class="form-group">
            <!-- 国际化：已点菜品： -->
            <strong class="label2">{{$t('Biz.Order.OrderedDishes')}}</strong>
            <p class="form-control-static">
              <span>{{itemList.itemName}}</span>
            </p>
          </div>
          <!-- 入库套餐的修改联动的时候显示的总数 -->
          <div class="show_total" v-if="list.isHaveScIdFollowAmount">
            <label for="TChangeNum">已点总数量:</label>
            <span v-html="lastTotalObject ? lastTotalObject.totalText : ''"></span>
          </div>
          <div class="form-group">
            <!-- 国际化：已点数量： -->
            <label for="iChangeNum">{{$t('Biz.Order.OrderedNum')}}</label>
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
                v-judge
                :id="submitId + 'Input'"
                type="text"
                name="changeNum"
                v-model="itemList.num"
                ref="changeNum"
                v-autotest
              >
              <button
                type="button"
                class="add"
                @click="changeNumHandle('+')"
              >
                <i class="icon icon-add"></i>
              </button>
              <span>{{list.itemUnitName}}</span>
            </div>
          </div>
          <div
            class="form-group auxiliary-form"
            v-if="list && auxiliaryUnitData"
          >
            <label class="auxiliaryLabel" for="auxiliaryNum">{{ $t('Dict.AuxiliaryAmountLabel') }}</label>
            <NumberInput
              :changeData="auxiliaryUnitData"
              :id="`auxiliaryNum${submitId}`"
            >
            </NumberInput>
            <span class="unitNameCls">{{ list.auxiliaryUnitName }}</span>
          </div>
          <div v-if="list.isHaveScIdFollowAmount">
            {{ $t('Biz.Pos.ExplainContent') }}
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
import { Message } from 'element-ui';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import NumberInput from '@/components/Pos/Common/NumberInput';
import { multi } from '@/common/js/math';

export default {
  components: { Dialog, KeyBoard, NumberInput },
  mixins: [DialogMixin],
  props: {
    submitId: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      list: null,
      auxiliaryUnitData: null,
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.submitChangeNum();
        },
      };
    },
    isDisabled() {
      // 如果num 数据小于等于1就要把减的按钮设为不可点 否则可点
      return this.list ? this.list.num <= 1 : false;
    },
    // 监听下数据中的num变化
    itemList() {
      return this.list || '';
    },
    // 如果是对联动并且提交过的套餐明细修改数量匹配下总数 明细数*套餐数
    lastTotalObject() {
      if (this.list.isHaveScIdFollowAmount) {
        // 如果存在辅助单位
        // zTotalNum 主单位数量,fTotalNum辅助单位的数量 totalText 显示内容
        if (this.list.auxiliaryUnitQty) {
          // return `${multi(this.list.num, this.list.pkgMainQty)}${this.list.itemUnitName || ''}' '${multi(this.list.auxiliaryUnitQty, this.list.pkgMainQty)}${this.list.auxiliaryUnitName}`;
          return {
            zTotalNum: multi(this.list.num, this.list.pkgMainQty),
            fTotalNum: multi(this.list.auxiliaryUnitQty, this.list.pkgMainQty),
            totalText: `${multi(this.list.num, this.list.pkgMainQty)}${this.list.itemUnitName || ''}' '${multi(this.list.auxiliaryUnitQty, this.list.pkgMainQty)}${this.list.auxiliaryUnitName}`,
          };
        }
        return { zTotalNum: multi(this.list.num, this.list.pkgMainQty), totalText: `${multi(this.list.num, this.list.pkgMainQty)}${this.list.itemUnitName || ''}` };
      }
      return null;
    },
  },
  methods: {
    onOpen() {
      // 打开弹框的时候进行赋值
      this.list = this.resData;
      // 辅助单位数量
      this.auxiliaryUnitData = this.list.auxiliaryUnitQty ? { inputNum: this.list.auxiliaryUnitQty } : null;
      console.log(this.list);
      const _this = this;
      // 打开进行input 聚焦
      setTimeout(() => {
        _this.$refs.changeNum.focus();
        if (_this.$refs.keyboard) {
          _this.$refs.keyboard.reSelect();
        }
      }, 200);
    },
    onClose() {
      this.list = null;
      this.auxiliaryUnitData = null;
    },
    submitChangeNum() {
      // 确认事件 要判断当前的数值 情况 为零或者是空的时候提示
      if (this.itemList.num == '' || this.itemList.num == '0') {
        const messageString = this.itemList.num == '' ? this.$t('Dict.ItemsCannotBeEmpty') : this.$t('Dict.NumCannotBeEmpty');
        this.isShowMessage(messageString);
        this.$refs.changeNum.focus();
      } else {
        // 进行回调 添加总数的信息不存就为null；
        this.submit(Object.assign({}, this.itemList, {
          total: this.lastTotalObject,
          auxiliaryUnitQty: this.auxiliaryUnitData ? this.auxiliaryUnitData.inputNum : null,
        }));
      }
    },
    // 加加 减减 按钮事件
    changeNumHandle(btnName) {
      if (btnName == '-') {
        if (this.itemList.num <= 1) {
          return;
        }
        this.itemList.num = (this.itemList.num * 1000 - 1 * 1000) / 1000;
      } else {
        this.itemList.num = (this.itemList.num * 1000 + 1 * 1000) / 1000;
      }
    },
    isShowMessage(message, type, duration) {
      const options = {
        message: message || this.$t('Dict.PromptInfo '), // 提示的内容
        type: type || 'error', // 类型 success/warning/info/error
        duration: duration || 1500, // 显示的时间
        center: true, // 中间显示
      };
      Message(options); // 需要多的可以查看element-ui 的官网 Message组件
    },
  },
};
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
  > .show_total{
    > label {
      font-weight: normal;
    }
    > input {
      pointer-events: none;
      cursor: default;
      border: none;
    }
  }
  > .form-group {
    position: relative;
    padding-left: 70px;
    margin-bottom: 10px;

    .label2,
    label {
      position: absolute;
      left: 0;
      top: 0;
      width: 70px;
      height: 36px;
      line-height: 36px;
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
  > span {
    position: absolute;
    right: -50px;
    top: 10px;
    width: 42px;
    white-space: nowrap;
    overflow: hidden;
  }
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
.unitNameCls {
  position: absolute;
  right: 0px;
  top: 10px;
  width: 42px;
  white-space: nowrap;
  overflow: hidden;
}
</style>
