<template>
  <div>
    <ul class="pos-order-btns" id="posOrderTableBtns">
      <li v-for="(item, key) in tableFunctionsTest" :key="key">
        <button
          type="button"
          :id="item.name + 'Btn'"
          @click="clickHandler(item.name)"
          :disabled="item.disabled || isServer(item)"
        >
        {{ item.text === $t('Dict.Btn.CloseAccount')
            ? item.text + '/'+ $t('Biz.Order.UselessBill')
            : item.text }}
          <span class="hotKeyTip" v-show="item.hotKey">
            ({{ item.hotKey.includes('.') ? item.hotKeyTip : item.hotKey}})
          </span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: {
    tableFunctionsTest: Array,
  },
  data() {
    return {
      /* 客位功能按钮数据
       * 说明: 1. 数据结构含有'更多'弹窗里隐藏的操作功能, 根据后台传值实现按钮顺序调整
       *      2. 改变数据结构, 增加快捷键的参数, 按键禁止状态参数
       *      3. 所有业务, 均执行eventBus-'tableFunction'
       *      4. 循环生成快捷键回调对象, 设置执行 this.$hotKey.set(...)
      */
      moreBtns: [{
        name: 'moreTableBtns',
        text: `${this.$t('Dict.Btn.More')} >`,
        hotKey: 'F10.ctrl',
        disabled: false,
        hotKeyTip: 'Ctrl+F10',
      }],
      tableFunctions: [],
      clock: true,
    };
  },
  computed: {
    ...mapGetters(['posBaseInfo', 'ALL_POS_MODULE', 'getVuexPointData', 'posTables', 'posInfo']),
  },
  watch: {
    tableFunctionsTest(data) {
      if (data.length && this.clock) {
        this.createHotKey();
        this.clock = false;
      }
    },
  },
  mounted() {
    this.$von('changeClock', () => {
      this.clock = true;
    });
    // this.createHotKey()
  },
  methods: {
    // 生成热键 注意置灰状态和转账和撤销转账的特殊处理
    createHotKey() {
      const tmp = {};
      // 循环生成 热键回调对象
      this.tableFunctionsTest.forEach((item) => {
        if (item.hotKey) {
          tmp[item.hotKey] = () => {
            if (!this.isServer(item)) {
              this.$emit('tableFunction', item.name, false);
            }
          };
        }
      });
      // 配置当前 热键及回调
      this.$hotKey.set('Pos.Order', tmp);
    },
    disableBtn(item) {
      if (this.posBaseInfo) {
        if (+this.posBaseInfo.controlMode === 2 && item === 'deposit') {
          return true;
        }
      }
      return false;
    },
    clickHandler(item) {
      if (this.disableBtn(item)) {
        return;
      }
      this.$emit('tableFunction', item, false);
    },
    isServer(item) {
      const name = item.id;
      const checked = this.ALL_POS_MODULE.find((items) => {
        const changeUpdateList = items ? items.children : [];
        return changeUpdateList.find((tmp) => {
          if (String(tmp.id) === String(name)) {
            return !tmp.checked;
          }
          return false;
        });
      });
      return checked;
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

@pos-order-tables-btns-space: 1px;
@pos-order-tables-btns-text-shadow: 1px 1px 1px #091346;
@pos-order-tables-btns-item-bg: rgba(237, 254, 255, 0.5);

.pos-order-btns {
  position: absolute;
  bottom: @pos-order-tables-btns-offset-bottom;
  left: 0;
  .size(100%, @pos-order-tables-btns-height);

  > li {
    float: left;
    position: relative;
    .size(14.2%, 100%);
    padding-right: @pos-order-tables-btns-space;

    > button {
      display: block;
      .square(100%) !important;
      border: none;
      color: #273844;
      position:relative;
      background-color: @pos-order-tables-btns-item-bg;
      &[disabled] {
        cursor: not-allowed;
        color: #666;
      }
    }
    .hotKeyTip {
      width: 100%;
      position: absolute;
      bottom: 0px;
      text-align: center;
      transform: scale(0.9);
      font-size: 12px;
      color: #999;
      left:0;
    }
    &:last-child {
      padding-right: 0;
    }
  }
}
</style>
