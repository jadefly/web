<template>
<!-- $t-修改菜品数量 -->
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
    :appendToBody="appendToBody"
  >
    <div class="pos-dialog-content">
      <div class="ordering-changenum-wrap" v-if="list && list.length">
        <div class="ordering-changenum-form">
          <div class="form-group">
            <!-- $t-已点菜品： -->
            <strong class="label2">{{ $t('Biz.Order.OrderedDishes')}}</strong>
            <p class="form-control-static">
              <span>
                {{ list[0].name + (list[0].sizeName ? ('（' + list[0].sizeName + '）') : '') }}
              </span>
              <span>{{ list[0].price }}/{{ list[0].unitName }}</span>
            </p>
          </div>
          <div class="form-group">
            <!-- $t-已点数量： -->
            <label for="iChangeNum">{{ $t('Biz.Order.OrderedNum') }}</label>
            <div class="ordering-changenum-num">
              <button
                type="button"
                class="subtract"
                :disabled="changeNum <= 1 || (minAddQty !== 0 && changeNum <= minAddQty)"
                @click="subtractChangeNum"
              >
                <i class="icon icon-subtract"></i>
              </button>
              <input
                type="text"
                name="changeNum"
                id="iChangeNum"
                ref="changeNum"
                @change="changeChangeNum"
                @input="changeChangeNum2"
                v-model="changeNum"
                v-judge
                v-keyboard:keyboard="{ mode: 'simple', autoSelect: true }"
                v-autotest
              >
              <button
                type="button"
                class="add"
                :disabled="maxAddQty !== 0 && changeNum >= maxAddQty"
                @click="addChangeNum"
              >
                <i class="icon icon-add"></i>
              </button>
            </div>
            <!--注：已点数量范围为00-99(00为半份)-->
            <div class="zhushi" v-show="from==='signMenu'">{{ $t('Biz.BizComm.BizCommNote') }}</div>
          </div>
          <div class="form-group" v-if="isWeighed">
            <div class="ordering-weigh-num">
              <!-- $t-重新称重 -->
              <button type="button" class="btn btn-default" @click="reloadScale">{{ $t('Biz.BizComm.ReWeighing') }}</button>
            </div>
          </div>
        </div>
        <div class="ordering-changenum-keyboard">
          <KeyBoard ref="keyboard"></KeyBoard>
        </div>
      </div>
      <!-- $t-没有选中要改量的菜 -->
      <div class="ordering-changenum-error" v-else>{{ $t('Biz.BizComm.BizCommTip08') }}</div>
    </div>
  </Dialog>
</template>

<script>
import { reduce, isNaN, first } from 'lodash';
import { mapGetters } from 'vuex';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import LoadScaleMixin from '@/components/Pos/Common/LoadScaleMixin';
import { add, sub } from '@/common/js/math';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import { selectInput } from '@/common/js/dom';
import newWeightUnitConversion from '@/common/js/newWeightUnitConversion';
import { limitAcount } from '@/common/js/util';

export default {
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin, LoadScaleMixin],
  props: {
    appendToBody: {
      type: Boolean,
      default: false,
    },
    from: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      list: null,
      changeNum: 0,
      enableHalf: false, // 是否允许半份
      minAddQty: 0, // 最小加单数量限制
      maxAddQty: 0, // 最大加单数量限制
      limitNum: 0, // 限量
      numTotal: 0,
    };
  },
  computed: {
    ...mapGetters(['posDevice', 'posSettings', 'setting', 'posBaseInfo']),
    hotKeySet() {
      return {
        PgDn: () => {
          this.submitOrderingChangeNum();
        },
      };
    },
    totalNum() { // 当前品项数量
      return reduce(this.list, (sum, item) => add(sum, item.num), 0);
    },
    orderedNum() { // 已点该品项的数量
      return this.numTotal - this.totalNum;
    },
    isWeighed() {
      return first(this.list).isWeighed && this.posDevice.enableScale;
    },
  },
  watch: {
    changeNum(value) {
      if (isNaN(Number(value))) {
        this.changeNum = this.totalNum;
      }
      if (parseFloat(value) < 1 && !this.enableHalf && !this.isWeighed) {
        // this.$message.warning('此菜品未设置半价');
        this.$message.warning(this.$t('Biz.BizComm.BizCommTip09'));
        this.changeNum = 1;
      }
      if (value.toString().indexOf('.') !== -1 && +value !== 0) {
        const i = value.toString().indexOf('.');
        if (value.toString().substr(i + 1).length > 3 && !isNaN(Number(value))) {
          // this.$message.warning('小数最多设置后三位');
          this.$message.warning(this.$t('Biz.BizComm.BizCommTip10'));
          this.changeNum = this.changeNum.toString().substr(0, i + 4);
        }
      }
    },
  },
  methods: {
    onClose() {
      this.list = null;
    },
    onOpen() {
      this.list = this.resData.list;
      this.numTotal = this.resData.numTotal;
      this.changeNum = this.totalNum;
      this.enableHalf = this.list[0].enableHalf;
      if (this.list[0].itemType === 2) {
        this.enableHalf = true;
      }
      // 加单最大最小数量限制
      this.minAddQty = this.list[0].minAddQty ? this.list[0].minAddQty : 0;
      this.maxAddQty = this.list[0].maxAddQty ? this.list[0].maxAddQty : 0;
      if (this.list[0].isLimit) {
        this.limitNum = this.list[0].limitTotal ? this.list[0].limitTotal : 0;
      } else {
        this.limitNum = this.list[0].limit ? this.list[0].limit : 0;
      }
      this.selectInput();
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
      console.log('1')
      this.changeNum = Number(this.changeNum);
    },
    changeChangeNum2(e) {
      console.log('2', e.target.value);
      if (this.from === 'signMenu') {
        this.changeNum = e.target.value.replace(/[^0-9]$/g, '');
      }
    },
    selectInput() {
      if (this.$refs.changeNum) {
        selectInput(this.$refs.changeNum);
      }
    },
    submitOrderingChangeNum() {
      console.log('submit:', this.changeNum, this.maxAddQty, this.limitNum);
      // 单数限制&限量
      let limitAcountData = limitAcount({
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
      
      this.submit(this.changeNum);
      this.close();
    },
    reloadScale() {
      this.loadScale((weight, isError) => {
        let newWeight = weight;
        if (!isError) {
          newWeight = newWeightUnitConversion(newWeight, this.setting);
        }
        this.changeNum = newWeight;
      });
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
    padding-left: 75px;
    margin-bottom: 10px;

    .label2,
    label {
      position: absolute;
      left: 0;
      top: 0;
      width: 70px;
      height: 36px;
      margin-bottom: 0;
      font-weight: normal;
      text-align: right;
      display: flex;
      line-height: 1.3;
      align-items: center;
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
    .zhushi { color: red; margin-top: 7px;}
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
