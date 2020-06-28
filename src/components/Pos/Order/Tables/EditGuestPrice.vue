<template>
  <Dialog
    name="PosDialog.EditGuestPrice"
    :title="titleTxt"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :append-to-body="true"
    :showSubmit="true"
    width="500px"
  >
    <div class="guestPriceBox">
      <PagerSlot class="list_all" style="height:186px;"
      ref="ref_list"
        :listAll="listAll" :pageSize="pageSize" :curPage="curPage" :paginationShow="paginationShow">
        <template slot="list" slot-scope="scope">
          <li v-for="(item, index) in scope.showList" :key="index" @click="selectItem(item)">
            <button class="btn btn-default" :class="item.isDefault?'selected':''">{{ item.itemName }}</button>
          </li>
        </template>
      </PagerSlot>
    </div>
    
  </Dialog>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
const PagerSlot = () => import('@/components/Pos/Common/PagerSlot');

export default {
  components: { Dialog, PagerSlot },
  mixins: [DialogMixin],
  data() {
    return {
      titleTxt: this.$t('Dict.GuestPrice'), // 客人价格
      listAll: [],
      selectedItem: null, // 选中的项-单选
      pageSize: 0,
      curPage: 1,
      paginationShow: true,
    }
  },
  computed: {
    ...mapGetters(['posSettings']),
  },
  methods: {
    onOpen() {
      this.listAll = this.resData.list;
      this.selectedItem = this.resData.selectedItem ? this.resData.selectedItem : this.listAll[0]; // 默认为第一项
      this.pageSize = this.resData.pageSize;
      this.paginationShow = this.resData.paginationShow;
      this.$refs.ref_list.init(); // 子组件更新数据
    },
    onSubmit() {
      this.submit(this.selectedItem); // 传给父组件
      this.close();
    },
    onClose() { },
    selectItem(itemData) {
      this.listAll.forEach((item) => {
        item.isDefault = false; // 清空
        if (itemData.itemId === item.itemId) {
          item.isDefault = true;
          this.selectedItem = item;
        }
      });
    },
  },
};
</script>
<style lang="less" scoped>
.guestPriceBox {
  background: #fff;
  padding: 12px 6px;
  .list_all {
    li {
      // width: 109px;
      padding: 0 6px 12px;
      // height: 40px;
      float: left;
      > button { width: 109px; height: 40px; }
    }
    .selected{
      background: #039eac;
      color: #fff;
      border-color: #039eac;
    }
  }
  .pos-pager { margin-right: 16px; }
}
</style>
