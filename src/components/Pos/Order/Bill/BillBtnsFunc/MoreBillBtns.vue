<template>
  <!-- $t-更多客单操作 -->
  <Dialog
    name="PosDialog.MoreBillBtns"
    :title="$t('Biz.Order.MoreOrdersOpt')"
    ref="dialog"
    :hotkeys="tmps"
    @close="onClose"
  >
    <div class="pos-dialog-content">
      <div class="more-bill-wrap">
        <ul class="row">
          <li v-for="(item,index) in moreBillFunctionsTest" :key="index" class="col-xs-2">
            <button :id="item.name + 'Btn'" :class="{'disableBtn':item.disabled || isServer(item.id)}" :disabled="item.disabled || isServer(item.id)"  type="button" @click="clickHandler(item)">{{ item.text }}<span v-if="item.hotKey">({{ item.hotKey }})</span></button>
          </li>
        </ul>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import { mapGetters, mapMutations } from 'vuex';

export default {
  props: {
    moreBillFunctionsTest: Array,
  },
  components: { Dialog },
  mixins: [DialogMixin],
  data() {
    return {
      activeClass: false,
    };
  },
  watch: {
    getIsbatchOperation(data) {
      if (data) {
        this.activeClass = 'batchOperation';
      } else {
        this.activeClass = '';
      }
    },
  },
  computed: {
    ...mapGetters(['getIsbatchOperation', 'ALL_POS_MODULE', 'getVuexPointData', 'posInfo']),
    tmps() {
      const tmp = {};
      this.moreBillFunctionsTest.forEach((_) => {
        if (_.hotKey) {
          tmp[_.hotKey] = () => {
            this.$emit('billFunction', _.name);
          };
        }
      });
      return tmp;
    },
  },
  methods: {
    ...mapMutations({
      setIsBatchOperation: 'IS_BATCH_OPERATION',
    }),
    isServer(name) {
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
    clickHandler(item) {
      if (item.name === 'batchOperation') {
        if (this.activeClass) {
          this.activeClass = '';
        } else {
          this.activeClass = 'batchOperation';
        }
        this.setIsBatchOperation(this.activeClass === 'batchOperation');
      }
      this.$emit('billFunction', item.name);
      this.close();
    },
  },
};
</script>


<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.disableBtn{
  background: #eee !important;
  color: #888 !important;
  cursor: not-allowed;
}
.more-bill-wrap {
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
    }
  }
}
</style>
