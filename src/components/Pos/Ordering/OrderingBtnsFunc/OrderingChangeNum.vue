<template>
<!-- 修改菜品数量 -->
  <Dialog
    name="PosDialog.OrderingChangeNum"
    :title="$t('Biz.Order.ModifyItemNum')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :showSubmit="true"
    @submit="submitOrderingChangeNum"
    width="480px"
    :hotkeys="hotKeySet"
    submitId="changeNumSubmit"
    :append-to-body="isNest"
  >
    <div class="pos-dialog-content">
      <div class="ordering-changenum-wrap" v-show="list && list.length">
        <div class="ordering-changenum-form" v-keyboard:keyboard="{ mode: 'simple', autoSelect: true }">
          <div class="form-group">
            <!-- 已点菜品： -->
            <strong class="label2">{{ $t('Biz.Order.OrderedDishes') }}</strong>
            <p class="form-control-static">
              <span>{{
                list[0].name + (list[0].sizeName
                  ? ('（' + list[0].sizeName + '）')
                  : '')
              }}</span>
              <span>{{ list[0].price }} /{{ list[0].unitName }}</span>
            </p>
          </div>
          <div class="form-group">
            <!-- 已点数量： -->
            <label for="iChangeNum">{{ $t('Biz.Order.OrderedNum') }}</label>
            <div class="ordering-changenum-num">
              <button
                type="button"
                class="subtract"
                :disabled="changeNum <= 1 || (minAddQty !== 0 && changeNum <= minAddQty)"
                @click="subtractChangeNum">
                <i class="icon icon-subtract"></i>
              </button>
              <input
                type="text"
                name="changeNum"
                id="iChangeNum"
                ref="changeNum"
                v-judge
                @change="changeChangeNum"
                v-model="changeNum"
                >
              <button
                type="button"
                class="add"
                :disabled="maxAddQty !== 0 && changeNum >= maxAddQty"
                @click="addChangeNum"
              >
                <i class="icon icon-add"></i>
              </button>
              <span class="unitNameCls unitNameCls1">{{ list[0].unitName }}</span>
            </div>
          </div>
          <!-- 如果是称重品项并且存在了 -->
          <div
            class="form-group auxiliary-form"
            v-if="list && auxiliaryUnitData"
          >
            <label class="auxiliaryLabel" for="auxiliaryNum">{{ $t('Dict.AuxiliaryAmountLabel') }}</label>
            <NumberInput
              :changeData="auxiliaryUnitData"
              id="auxiliaryNum"
            >
            </NumberInput>
            <span class="unitNameCls">{{ list[0].auxiliaryUnitName }}</span>
          </div>
          <div class="form-group" v-if="isWeighed">
            <div class="ordering-weigh-num">
              <!-- 重新称重 -->
              <button type="button" class="btn btn-default" @click="reloadScale">{{ $t('Biz.BizComm.ReWeighing') }}</button>
            </div>
          </div>
        </div>
        <div class="ordering-changenum-keyboard">
          <KeyBoard ref="keyboard"></KeyBoard>
        </div>
      </div>
      <div class="ordering-changenum-error" v-show="!list">{{ $t('Biz.BizComm.BizCommTip08') }}</div>
    </div>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import {
  reduce, isNaN, first, cloneDeep,
} from 'lodash';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import LoadScaleMixin from '@/components/Pos/Common/LoadScaleMixin';
import { add, sub } from '@/common/js/math';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import NumberInput from '@/components/Pos/Common/NumberInput';
import { selectInput } from '@/common/js/dom';
import newWeightUnitConversion from '@/common/js/newWeightUnitConversion';
import { limitAcount } from '@/common/js/util';

export default {
  props: {
    isNest: {
      type: Boolean,
      default: false,
    },
  },
  components: { Dialog, KeyBoard, NumberInput },
  mixins: [DialogMixin, LoadScaleMixin],
  data() {
    return {
      list: [{}],
      changeNum: 0,
      enableHalf: false, // 是否允许半份
      minAddQty: 0, // 最小加单数量限制
      maxAddQty: 0, // 最大加单数量限制
      limitNum: 0, // 限量
      numTotal: 0, // 加单中同一品项数量总和
      auxiliaryUnitData: null,
      isClosed: false,
    };
  },
  computed: {
    ...mapGetters(['posDevice', 'posSettings', 'posFastFood', 'newWeightData', 'setting']),
    hotKeySet() {
      return {
        PgDn: () => {
          this.submitOrderingChangeNum();
        },
        Enter: () => {
          this.submitOrderingChangeNum();
        },
      };
    },
    totalNum() { // 当前品项数量
      return reduce(this.list, (sum, item) => add(sum, item.num), 0);
    },
    orderedNum() { // 已点该品项的数量(除去当前项)
      return this.numTotal - this.totalNum;
    },
    isWeighed() {
      return (this.list[0].isWeighed || this.list[0].isConfirmWeigh) && this.posDevice.enableScale;
    },
  },
  watch: {
    changeNum(value) {
      // 如果关闭的时候就不要执行监听的数据处理，避免关闭初始化造成的问题
      if (this.isClosed) {
        return !this.isClosed;
      }
      if (isNaN(Number(value))) {
        this.changeNum = this.totalNum;
      }
      if (parseFloat(value) < 1 && !this.enableHalf && !this.isWeighed) {
        // 此菜品未设置半价
        this.$message.warning(this.$t('Biz.BizComm.BizCommTip09'));
        this.changeNum = 1;
      }
      if (value.toString().indexOf('.') != -1 && value != 0) {
        const i = value.toString().indexOf('.');
        if (value.toString().substr(i + 1).length > 3 && !isNaN(Number(value))) {
          // 小数最多设置后三位
          this.$message.warning(this.$t('Biz.BizComm.BizCommTip10'));
          this.changeNum = this.changeNum.toString().substr(0, i + 4);
        }
      }
    },
  },
  methods: {
    onClose() {
      this.list = [];
      this.auxiliaryUnitData = null;
      this.isClosed = true;
      this.list[0] = {};
      this.list = [{}];
      this.numTotal = 0;
      this.changeNum = 1;
      this.enableHalf = false;
    },
    onOpen() {
      this.isClosed = false;
      this.list = this.resData.list;
      // 辅助单位的判断以及处理
      if (this.list[0].auxiliaryUnitId) {
        this.auxiliaryUnitData = { inputNum: this.list[0].auxiliaryUnitQty };
      }
      // this.changeItem.inputNum = 1;
      // 结束
      this.numTotal = this.resData.numTotal;
      this.changeNum = this.totalNum;
      this.enableHalf = this.list[0].enableHalf;
      // 如果是临时品项可以允许半份
      if (this.list[0].itemType === 2) {
        this.enableHalf = true;
      }
      this.selectInput();
      // 加单最大最小数量限制
      this.minAddQty = this.list[0].minAddQty ? this.list[0].minAddQty : 0;
      this.maxAddQty = this.list[0].maxAddQty ? this.list[0].maxAddQty : 0;
      if (this.list[0].isLimit) {
        this.limitNum = this.list[0].limitTotal ? this.list[0].limitTotal : 0;
      } else {
        this.limitNum = this.list[0].limit ? this.list[0].limit : 0;
      }
      const uiData = this.list[0];
      this.$log.info(`打开数量窗口：id:${uiData.id},itemName:${uiData.itemName},num:${uiData.num},price:${uiData.price}`);
    },
    subtractChangeNum() {
      this.changeNum = sub(this.changeNum, 1);
      this.selectInput();
    },
    addChangeNum() {
      this.changeNum = add(this.changeNum, 1);
      this.selectInput();
    },
    changeChangeNum() {
      this.changeNum = Number(this.changeNum);
    },
    selectInput() {
      this.$refs.changeNum ? selectInput(this.$refs.changeNum) : null;
    },
    submitOrderingChangeNum() {
      // 单数限制&限量
      const limitAcountData = limitAcount({
        from: this.from, // 来源
        num: this.changeNum, // 数量
        orderedNum: this.orderedNum, // 已点该品项的数量
        minAddQty: this.minAddQty, // 最小值
        maxAddQty: this.maxAddQty, // 最大值
        limitNum: this.limitNum, // 限量数
        isAllow0: this.posSettings.isAllowAddOrderWhenLimitZero, // 允许限量为 0 时继续加单
      });
      if (!limitAcountData.tag) {
        this.changeNum = limitAcountData.num;
        return;
      }
      this.submit(this.changeNum, this.auxiliaryUnitData ? this.auxiliaryUnitData.inputNum : null);
      this.close();
      const uiData = this.list[0];
      this.$log.info(`提交数量窗口：id:${uiData.id},itemName:${uiData.itemName},changeNum:${this.changeNum}`);
    },
    reloadScale() {
      if (this.posDevice.isNetWeight && this.posDevice.isSupportNewWeight) { // 新版去皮功能
        this.changeNum = this.newWeightData.autoWeighNetValue;
      } else {
        this.loadScale((weight, isError) => {
          let newWeight = weight;
          if (!isError) {
            newWeight = newWeightUnitConversion(newWeight, this.setting);
          }
          this.changeNum = newWeight;
        });
      }
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

  > .form-group {
    position: relative;
    padding-left: 70px;
    margin-bottom: 10px;
    &.auxiliary-form {
      margin-top: 30px;
    }
    .unitNameCls {
      position: absolute;
      right: -18px;
      top: 10px;
      width: 54px;
      white-space: nowrap;
      overflow: hidden;
      &.unitNameCls1 {
        right: -66px;
      }
    }
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
      &.auxiliaryLabel {
        text-align: left;
      }
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

.ordering-weigh-num {
  width: 130px;

  > button.btn {
    display: block;
    width: 100%;
  }
}
</style>
;
