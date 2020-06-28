<template>
  <div
    class="keyboard-warp"
    :class="[{'popover-keyboard':isPopover},{'size-keyboard':keyboardSize}]"
    :style="keyboardStyle"
    @mousedown.prevent
    v-show="show">
    <keyboard-switch-num
      v-if="keyboardType === 'num'"
      @switch-letter="switchKeyboard('letter')"
      @delete-letter="deleteLetter"
      @clear-letter="clearLetter"
      @close="close"
      @input="input">
    </keyboard-switch-num>
    <template v-else>
      <keyboard-switch-letter-nine
        v-if="letterType === 'nine'"
        @switch-num="switchKeyboard('num')"
        @input="input"
        @delete-letter="deleteLetter"
        @clear-letter="clearLetter"
        @close="close">
      </keyboard-switch-letter-nine>
      <keyboard-switch-letter-full
        v-else
        @input="input"
        @switch-num="switchKeyboard('num')"
        @delete-letter="deleteLetter"
        @clear-letter="clearLetter"
        @close="close">
      </keyboard-switch-letter-full>
    </template>
    <img
      class="cursor-img"
      v-if="isPopover"
      :class="[popoverPosition]"
      src="@/common/images/sl-msg/keybord_cursor.png">
  </div>
</template>
<script>

import { mapActions, mapMutations, mapGetters } from 'vuex';
import KeyboardSwitchNum from './KeyboardSwitchNum';
import KeyboardSwitchLetterFull from './KeyboardSwitchLetterFull';
import KeyboardSwitchLetterNine from './KeyboardSwitchLetterNine';
import KeyboardMixin from './KeyboardMixin';
import ajax from '@/common/js/ajax';

export default {
  mixins: [KeyboardMixin],
  components: {
    KeyboardSwitchNum,
    KeyboardSwitchLetterFull,
    KeyboardSwitchLetterNine,
  },
  data() {
    return {
      keyboardType: 'num',
    };
  },
  props: {
    letterType: {
      default: 'full',
    },
  },
  mounted() {
    setTimeout(() => {
      this.$von('closeKeyboardPayPageBus', () => {
        // 关闭虚拟键盘
        this.showPopover = false;
      });
    }, 10);
    // 客位界面默认数字键盘 加单页面默认字母拼音键盘
    // this.switchKeyboard(this.params, 111);
  },
  computed: {
    ...mapGetters([
      'posSettings',
    ]),
    ...mapGetters('KDS', ['config']),
  },
  watch: {
    showPopover(val) {
      // 结算界面-结算方式 和 活动方案 启用的虚拟键盘
      if (this.popoverPosition === 'left-left'
        || this.popoverPosition === 'right-right'
      ) {
        if (val) { // 结算界面虚拟键盘显示 终止结算结算界面的快捷键
          this.keyboardType = 'letter';
          // 重设置 软键盘规格参数
          this.letterType = 'nine';
          this.$hotKey.stop();
        } else { // 结算界面虚拟键盘关闭 启用结算结算界面的快捷键
          this.$hotKey.start();
          // 结算-结算方式-虚拟键盘关闭 清除输入框的内容 并让搜索输入框失去焦点
          if (this.popoverPosition === 'left-left') {
            this.$vemit('cancelSearchPaywayFocusBus');
          }
          // 结算-活动方案-虚拟键盘关闭 清除输入框的内容 并让搜索输入框失去焦点
          if (this.popoverPosition === 'right-right') {
            this.$vemit('cancelSearchDisPlanFocusBus');
          }
        }
      } else if (this.popoverPosition === 'top-left-kds') {
        this.keyboardType = 'letter';
        this.letterType = 'full';
      } else {
        this.baseVuexSetKeyboardType();
        // this.switchKeyboard();
      }
    },
  },
  methods: {
    ...mapActions([
      'setDefaultKyeBoardType',
    ]),
    ...mapActions('KDS', [
      'updateKitchenKeyBoardSysHabit',
    ]),
    ...mapMutations([
      'SET_DEFAULT_KEYBOARD_TYPE',
    ]),
    // 根据vuex设置键盘类型
    baseVuexSetKeyboardType() {
      const { pointKeyboardMode, addOrderKeyboardMode, searchMode } = this.posSettings;
      const { defaultKeyBoardPage } = this.params;
      if (!defaultKeyBoardPage) { // 除了客位和加单页面，其他用到虚拟键盘的地方不需要记录设置
        this.keyboardType = 'num';
        this.$nextTick(() => {
          this.elRect = this.$el.getBoundingClientRect();
        });
        return;
      }
      if (+searchMode === 3) { // 快餐下只有加单页面
        if (+addOrderKeyboardMode === 1) {
          this.keyboardType = 'num';
        } else {
          this.keyboardType = 'letter';
        }
        const paramsVal = this.keyboardType === 'num' ? 1 : 2;
        this.setKeyBoardHandler(4, paramsVal);
      } else if (+defaultKeyBoardPage === 3) { // 中餐下客位页面
        if (+pointKeyboardMode === 1) {
          this.keyboardType = 'num';
        } else {
          this.keyboardType = 'letter';
        }
        const paramsVal = this.keyboardType === 'num' ? 1 : 2;
        this.setKeyBoardHandler(3, paramsVal);
      } else if (+defaultKeyBoardPage === 4) { // 中餐下加单页面
        if (+addOrderKeyboardMode === 1) {
          this.keyboardType = 'num';
        } else {
          this.keyboardType = 'letter';
        }
        const paramsVal = this.keyboardType === 'num' ? 1 : 2;
        this.setKeyBoardHandler(4, paramsVal);
      } else if (+defaultKeyBoardPage === 11) { // 厨房管理页面
        console.log('xxxxxxxxxxxxx', this.config.kitchenKeyBoardSysHabit);
        if (this.config.kitchenKeyBoardSysHabit.value === 1) {
          this.keyboardType = 'num';
        } else {
          this.keyboardType = 'letter';
        }
        const paramsVal = this.keyboardType === 'num' ? 1 : 2;
        this.setKeyBoardHandler(11, paramsVal);
      }
    },
    // 键盘类型
    switchKeyboard(type) {
      const { pointKeyboardMode, searchMode } = this.posSettings;
      this.keyboardType = type;
      const { defaultKeyBoardPage } = this.params;
      if (!defaultKeyBoardPage) { // 除了客位和加单页面，其他用到虚拟键盘的地方不需要记录设置
        this.$nextTick(() => {
          this.elRect = this.$el.getBoundingClientRect();
        });
        return;
      }
      if (+searchMode === 3) {
        if (type === 'num') {
          this.setKeyBoardHandler(pointKeyboardMode, 1);
        } else {
          this.setKeyBoardHandler(pointKeyboardMode, 2);
        }
      } else if (type === 'num') {
        this.setKeyBoardHandler(defaultKeyBoardPage, 1);
      } else {
        this.setKeyBoardHandler(defaultKeyBoardPage, 2);
      }
    },
    // 重置弹出键盘
    resetPopover() {
      this.keyboardType = 'num';
    },
    // 设置软件盘样式
    setKeyBoardHandler(type, value) {
      ajax('canyin.pos.syshabit.updatehabit', {
        loading: false,
        contentType: 'json',
        data: {
          type,
          value,
        },
      }).then(() => {
        if (type === 11) {
          this.updateKitchenKeyBoardSysHabit({ value });
        } else {
          this.setDefaultKyeBoardType({ type, value });
        }
        this.$nextTick(() => {
          this.elRect = this.$el.getBoundingClientRect();
        });
      });
    },
  },
};
</script>
<style lang="less" scoped>
  @import './keyboard.less';


</style>
<style lang="less">
.size-keyboard {
    width: 344px;
    height: 279px;
    > .keyboard-content-warp {
      width: 344px;
      height: 279px;
      .key-item {
        width: 77px!important;
        height: 60px!important;
      }
        .big-item {
        height: 125px!important;
      }
    }
    > .cursor-img {
      display: none;
    }
  }

.top-left-kds {
  right: 0;
}
</style>
