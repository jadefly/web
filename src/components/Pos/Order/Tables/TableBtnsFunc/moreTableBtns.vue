<template>
  <Dialog
    name="PosDialog.MoreTableBtns"
    :title="$t('Biz.Order.MoreTablesOperation')"
    ref="dialog"
    @close="onClose"
    :hotkeys="tmp"
    closeId="moreTableBtnsClose"
  >
    <div class="pos-dialog-content">
      <div class="more-table-wrap">
        <ul class="row">
          <li v-for="(item, index) in tableFunctionsTest" :key="index" class="col-xs-2">
            <button type="button"
            @click="clickHandler(item.name)"
            :id="item.name + 'Btn'"
            :class="{'disableBtn': disableBtn(item.name)}"
            :disabled="item.disabled || isServer(item)"
            >
              <span>{{ item.text }}</span>
              <span v-show="item.hotKey">({{ item.hotKey }})</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { find } from 'lodash';
import { mapGetters } from 'vuex';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import btnOptions from '@/common/dictionary/pos-order-btnoptions';
// import * as tableState from '@/common/dictionary/pos-order-table-state';

// const ISTEAM = 1
// const ISNOTTEAM = 0

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  props: {
    tableFunctionsTest: Array,
  },
  data() {
    return {
      tmp: {},
      clock: true,
      moreTableFunctions: [],
    };
  },
  computed: {
    ...mapGetters(['posBaseInfo', 'ALL_POS_MODULE', 'getVuexPointData', 'posTables']),
  },
  mounted() {
    this.$von('changeClock', () => {
      this.clock = true;
    });
  },
  methods: {
    createHotKey() {
      const tmp = {};
      this.tableFunctionsTest.forEach((_) => {
        if (_.hotKey) {
          tmp[_.hotKey] = () => {
            if (!this.isServer(_)) {
              this.close();
              this.$emit('tableFunction', _.name);
            }
          };
        }
      });
      this.tmp = tmp;
    },
    findBtn(name) {
      const finded = find(btnOptions(), { name });
      if (finded) {
        return finded;
      }
      return {
        text: this.$t('Biz.Settlement.UnKnow'),
        method: null,
      };
    },
    clickHandler(item) {
      if (this.disableBtn(item)) {
        return false;
      }
      // 防'退出团队'多次点击, 立即执行关闭
      this.close();
      this.$emit('tableFunction', item);
      return true;
    },
    disableBtn(item) {
      if (this.posBaseInfo) {
        if (+this.posBaseInfo.controlMode === 2 && item === 'deposit') {
          return true;
        }
      }
      return false;
    },
    isServer(item) {
      const name = item.id;
      const checked = this.ALL_POS_MODULE.find((items) => {
        const changeUpdateList = items ? items.children : [];
        return changeUpdateList.find((item) => {
          if (item.id == name) {
            return !item.checked;
          }
          return false;
        });
      });
      return checked;
    },
  },
  watch: {
    tableFunctionsTest(data) {
      if (data.length && this.clock) {
        this.createHotKey();
        this.clock = false;
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.more-table-wrap {
  padding: 25px 30px;

  > ul {
    margin-bottom: 10px;

    button {
      .size(100%, 80px);
      margin-top: 10px;
      margin-bottom: 10px;
      background-color: @white;
      border: none;
      border-radius: 4px;
      color: #344b5b;

      &:hover {
        background-color: #defcff;
      }

      &[disabled] {
        background-color: #eee;
        cursor: not-allowed;
        color: #888;
      }
    }
  }
}
.disableBtn{
  background: #eee;
  color: #888;
  cursor: not-allowed;
}
</style>
