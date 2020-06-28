<template>
  <Dialog
    name="PosDialog.DinerType"
    :title="title"
    ref="dialog"
    @close="onClose"
    append-to-body
    @open="onOpen"
    top="30%"
    :showSubmit="true"
    @submit="submitType"
    :hotkeys="hotKeySet"
  >
    <div class="pos-dialog-content">
       <div>
         <ul  class="ordering-changemethods-checked-list">
           <li v-for="(item, index) in list"
            :key="index">
            <button
              type="button"
              :class="{ 'active': currentClass == item.id }"
              @click="clickHandler(item)">{{ item.name }}</button>
            </li>
         </ul>
       </div>
    </div>
  </Dialog>
</template>

<script>
import { find } from 'lodash';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  data() {
    return {
      title: '',
      currentClass: null,
      list: [],
      checkedItem: null,
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.submitType();
        },
      };
    },
  },
  methods: {
    onOpen() {
      // console.info(this.resData);
      // 传入的数据列表
      this.list = this.resData.list;
      // 如果为自定义标签功能打开, 则默认第一个选中
      if (this.resData.type === 'customTag' && !this.resData.checkedItemId) {
        this.currentClass = this.resData.list[0].id;
        this.checkedItem = this.resData.list[0];
      } else {
      // 否则 均使用传递来参数选中
        this.currentClass = this.resData.checkedItemId;
        this.checkedItem = find(this.list, ['id', this.currentClass]);
      }
      if (this.resData.type === 'diner') {
        this.title = this.$t('Biz.Order.DinerType');
      } else {
        this.title = this.$t('Biz.Order.CustomLabel');
      }
      // console.info(this.currentClass);
    },
    onClose() {
      this.title = '';
      this.list = [];
      this.currentClass = null;
      this.checkedItem = null;
    },
    clickHandler(data) {
      this.currentClass = data.id;
      this.checkedItem = data;
    },
    submitType() {
      this.close();
      this.submit(this.checkedItem);
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
.ordering-changemethods-checked-list {
  .clearfix();
  height: 100%;
  padding: 0px 14px;
  > li {
    float: left;
    width: 20%;
    padding: 5px 4px;
     > button {
      display: block;
      .size(100%, 44px);
      background-color: @white;
      border: 1px solid #b5b5b5;
      border-radius: 3px;
      .text-overflow();
      &.active {
        border-color: @brand-primary;
        color: @brand-primary;
      }
      }
  }
}
</style>
