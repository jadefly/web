<template>
  <Dialog
    class="kds-change-num"
    name="KDS.Main.ChangeNum"
    title="数量选择"
    ref="dialog"
    :hotkeys="addHotKey"
    @open="onOpen"
    @close="onClose"
    @submit="submit"
    :append-to-body="true"
    :showSubmit="true"
    width="500px"
    height="480px"
    id="changeNum"
  >
    <div class="wrap" v-if="dish">
      <div class="top">
        <div class="title">{{ code }}</div>
        <div class="code">{{ displayName }}</div>
        <p class="method">{{ dish.methodText }}</p>
      </div>
      <div class="bottom">
        <div class="left">
          <div class="dish-num">点菜数量：{{ dish.num }}</div>
          <div class="change-num">
            <span>数量选择：</span>
            <span class="btn-wrap">
              <button class="border" @click="sub">
                <i class="icon icon-subtract"></i>
              </button>
              <input
                class="border"
                type="text"
                v-model="selectNum"
                v-keyboard:keyboard="{
                  mode: 'simple',
                  autoSelect: true,
                }"
              >
              <button class="border" @click="add">
                <i class="icon icon-add"></i>
              </button>
            </span>
          </div>
        </div>
        <div class="right">
          <KeyBoard ref="keyboard" @chopstickenter="submit"></KeyBoard>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import {
  each, find, map, filter,
} from 'lodash';
import { add, sub } from '@/common/js/math';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';

export default {
  mixins: [DialogMixin],
  components: {
    Dialog,
    KeyBoard,
  },
  data() {
    return {
      dish: null,
      code: '',
      list: [],
      toCheck: [],
    };
  },
  computed: {
    ...mapGetters('KDS', ['checkedArr']),
    addHotKey() {
      const keymap = {};
      keymap.PgDn = () => {
        this.submit();
      };
      return keymap;
    },
    checked() {
      const checked = [];
      each(this.checkedArr, (kscId) => {
        if (find(this.list, { kscId })) {
          checked.push(kscId);
        }
      });
      return checked;
    },
    ignoreCoUnknowList() {
      return filter(this.list, item => item.coUnknowQty === 0);
    },
    displayName() {
      if (this.dish) {
        if (this.dish.sizeId !== '-1') {
          return `(${this.dish.sizeName})${this.dish.itemName}`;
        }
        return this.dish.itemName;
      }
      return '';
    },
    selectNum: {
      get() {
        if (this.toCheck.length) {
          let lastQty = 0;
          let coUnknowQty = 0;
          each(this.toCheck, (kscId) => {
            const finded = find(this.list, { kscId });
            lastQty = add(lastQty, finded.lastQty);
            coUnknowQty = add(coUnknowQty, finded.coUnknowQty);
          });
          return add(lastQty, coUnknowQty);
        }
        return 0;
      },
      set(val) {
        this.toCheck = [];
        const check = [];
        let inputNum = val;
        each(this.ignoreCoUnknowList, (dish) => {
          if (inputNum < dish.lastQty) {
            return false;
          }
          check.push(dish.kscId);
          inputNum = sub(inputNum, dish.lastQty);
          return true;
        });
        this.toCheck = check;
      },
    },
  },
  methods: {
    ...mapMutations('KDS', {
      updateChecked: 'UPDATE_CHECKED',
    }),
    submit() {
      this.updateChecked({
        check: this.toCheck,
        unCheck: this.checked,
      });
      this.close();
    },
    onOpen() {
      const { code, dish, list } = this.resData;
      this.dish = dish;
      this.code = code;
      this.list = list;
      if (this.checked.length === 0) {
        this.toCheck = map(list, 'kscId');
      } else {
        this.toCheck = this.checked;
      }
    },
    onClose() {
      this.dish = null;
      this.code = '';
      this.list = [];
      this.toCheck = [];
    },
    sub() {
      this.selectNum = sub(this.selectNum, 1);
    },
    add() {
      this.selectNum = add(this.selectNum, 1);
    },
  },
};
</script>
<style lang="less" scoped>
  .wrap {
    height: 100%;
    background-color: #FFFFFF;
    .top {
      padding: 20px 28px;
      background-color: #EDEDED;
      .title {
        font-size: 16px;
        font-weight: bold;
        color: #2A54A3;
      }
      .code {
        margin: 10px 0;
        font-weight: bold;
        color: #333333;
      }
      .method {
        color: #333333;
      }
    }
    .bottom {
      padding: 20px 28px;
      box-sizing: border-box;
      font-size: 16px;
      color: #333333;
      .left {
        float: left;
        width: 50%;
        .change-num {
          margin-top: 25px;
          > span {
            display: inline-block;
          }
          .btn-wrap {
            > button {
              width: 36px;
              height: 36px;
              background-color: transparent;
            }
            button:disabled {
              cursor: not-allowed;
            }
            input {
              width: 51px;
              padding: 0 3px;
              height: 36px;
              text-align: center;
            }
            .border {
              border-radius: 4px;
              border: 1px solid #999999;
            }
          }
        }
      }
      .right {
        float: right;
      }
    }
  }
</style>
<style lang="less">
  .kds-change-num {
    .btn-primary {
      background-color: #16ABEC !important;
      border-color: #16ABEC !important;
    }
  }
</style>
