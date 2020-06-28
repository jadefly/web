<template>
  <Dialog
    name="PosDialog.MoreOrderingBtns"
    :title="$t('Biz.Order.MoreOrderTitle')"
    ref="dialog"
    @close="onClose"
    :hotkeys="hotKeySet"
  >
    <div class="pos-dialog-content">
      <div class="more-bill-wrap">
        <ul class="row">
          <li class="col-xs-2" v-for="(item,index) of moreAddBtns" :key="index">
            <button
              :id="!item.name ? 'GiveStateBtn':item.name + 'Btn'"
              type="button"
              :disabled="!item.disabled"
              @click="clickHandler(item.name ? item.name : checkGiveState)"
            >
              {{item.text}}
            </button>
            <span
              class="hotKeyTip"
              v-show="item.hotKey">{{
                item.hotKetTip !== undefined
                  ? item.hotKetTip
                  : `(${item.hotKey})`
              }}</span>
          </li>
        </ul>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  props: {
    checkGiveState: String,
    guestList: {
      type: Array,
    },
    moreAddBtnsTest: Array,
  },
  data() {
    return {
      activeItem: null,
    };
  },
  computed: {
    ...mapGetters(['ALL_POS_MODULE', 'posInfo']),
    moreAddBtns() {
      return this.moreAddBtnsTest.slice(10);
    },
    hotKeySet() {
      const hotKey = {};
      this.moreAddBtns.forEach((item) => {
        hotKey[item.hotKey] = () => {
          if (item.name === '') {
            if (item.disabled) {
              this.clickHandler(this.checkGiveState);
            }
          } else if (item.disabled) {
            this.clickHandler(item.name);
          }
        };
      });
      return {
        ESC: () => {
          this.onClose();
        },
        ...hotKey,
      };
    },
  },
  methods: {
    clickHandler(method) {
      this.$emit('control', method);
      this.close();
    },
    setActiveItem(elId) {
      this.activeItem = elId || null;
    },
  },
};
</script>


<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.more-bill-wrap {
  padding: 25px 30px;

  > ul {
    margin-bottom: 10px;
    li {
      position: relative;
    }
    button {
      .size(100%, 80px);
      margin-top: 10px;
      margin-bottom: 10px;
      background-color: @white;
      border: none;
      border-radius: 4px;
      color: #344b5b;
      word-break: break-word;
      &:hover {
        background-color: #defcff;
      }

      &:disabled {
        color: #777;
        cursor: not-allowed;
      }
    }
    .hotKeyTip{
      position: absolute;
      bottom:11px;
      left:50%;
      transform: translateX(-50%);
      color: #777;
    }
  }
}
</style>
