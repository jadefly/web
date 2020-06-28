<!--
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-03-19 17:01:42
 * @LastEditTime: 2019-08-09 17:01:56
 * @LastEditors: Please set LastEditors
 -->
<template>
  <div class="pos-order-btns">
    <ul class="pos-order-btns-list">
      <li v-for="(item, index) in billFunctionsTest" :key="index"  >
        <button
        :class="{'active-bg-color':activeClass === item.name }"
          type="button"
          :disabled="item.disabled || isServer(item.id)"
          @click="clickHandler(item)"
          :id="item.name + 'Btn'"
          v-autotest
          >
          {{ item.text }}
          <span class="hotKeyTip" v-show="item.hotKey">
            ({{ item.hotKey.includes('.') ? item.hotKeyTip : item.hotKey }})
          </span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';

export default {
  props: {
    billFunctionsTest: Array,
  },
  data() {
    return {
      billFunctions: [],
      moreBtns: [
        {
          // name: 'moreBillBtns', hotKey: 'F9.ctrl', hotKeyTip: 'ctrl+F9', text: '更多', disabled: false, isShow: true,
          name: 'moreBillBtns', hotKey: 'F9.ctrl', hotKeyTip: 'ctrl+F9', text: this.$t('Dict.Btn.More'), disabled: false, isShow: true,
        },
      ],
      activeClass: false,
      isClcok: true,
    };
  },
  computed: {
    ...mapGetters(['ALL_POS_MODULE', 'getVuexPointData', 'getIsbatchOperation', 'posInfo', 'getVuexPosMode']),
  },
  methods: {
    ...mapMutations({
      setIsBatchOperation: 'IS_BATCH_OPERATION',
    }),
    clickHandler(item) {
      if (item.name === 'batchOperation') {
        if (this.activeClass) {
          this.activeClass = '';
        } else {
          this.activeClass = 'batchOperation';
        }
        this.setIsBatchOperation(this.activeClass === 'batchOperation');
      }
      this.$log.info(`当前点击客单的方法名称：${item.name}`);
      this.$emit('billFunction', item.name, false);
    },
    isServer(itemName) {
      const name = itemName;
      const checked = this.ALL_POS_MODULE.find((items) => {
        const changeUpdateList = items ? items.children : [];
        return changeUpdateList.find((item) => {
          if (item.id === name) {
            return !item.checked;
          }
          return false;
        });
      });
      return checked;
    },
  },
  watch: {
    getIsbatchOperation(data) {
      this.activeClass = data ? 'batchOperation' : '';
    },
  },
};
</script>
<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
@import "./btns.less";

.hotKeyTip {
  width: 100%;
  position: absolute;
  bottom: 0;
  text-align: center;
  transform: scale(0.9);
  font-size: 12px;
  color: #999;
}
.active-bg-color{
  background-color: #0babb9 !important;
  color:#fff !important;
}
.lang-enUS {
  .pos-order-btns {
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
