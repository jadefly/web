<template>
  <Dialog
    name="ParameterSetting.FashionBookSetItems"
    :title="$t('Dict.AddItem')"
    ref="dialog"
    :showSubmit="true"
    @open="onOpen"
    width="800px"
    height="400px"
    :hotkeys="hotKeySet"
    @submit="setPointsData"
  >
    <div class="main-content">
      <div class="cat">
        <el-tree
          class="tree"
          :data="catData"
          :props="catProps"
          @node-click="handleNodeClick"
          node-key="id"
          :default-expanded-keys="['0']"
        ></el-tree>
      </div>
      <div class="content">
        <el-transfer
          class="transfer"
          v-model="selectedItems"
          :data="items"
          :titles="[$t('Dict.ListToBeSelected'), $t('Dict.SelectedList')]"
          filterable
          :filter-method="filterItems"
          :filter-placeholder="$t('Biz.UserDesktop.UserDesktopMsg015')"
        ></el-transfer>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { map, extend, filter } from 'lodash';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import ajax from '@/common/js/ajax';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  data() {
    return {
      catData: [],
      catProps: {
        children: 'children',
        label: 'text',
      },
      activeCat: '0',
      activeCatType: false,
      itemsData: [],
      selectedItems: [],
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.setPointsData();
        },
      };
    },
    items() {
      if (this.activeCat === '0') {
        return this.itemsData;
      }
      if (this.activeCatType) {
        return filter(this.itemsData, { smallClassId: this.activeCat });
      }
      return filter(this.itemsData, { bigClassId: this.activeCat });
    },
  },
  methods: {
    onOpen() {
      this.activeCat = '0';
      this.activeCatType = false;
      this.getItemsData();
    },
    setPointsData() {
      ajax('canyin.interfaces.shishangd.shishangdbooking.saveitems', {
        contentType: 'json',
        data: map(this.selectedItems, (idStr) => {
          const id = idStr.split('.');
          const itemId = id[0];
          const sizeId = id[1];
          return { itemId, sizeId };
        }),
      }).then(() => {
        this.close();
        this.submit();
      });
    },
    handleNodeClick(data) {
      this.activeCat = data.id;
      this.activeCatType = data.leaf;
    },
    filterItems(query, item) {
      return item.itemName.indexOf(query) > -1
        || item.itemCode.indexOf(query) > -1
        || item.itemPinyin.indexOf(query) > -1;
    },
    getItemsData() {
      ajax('canyin.interfaces.shishangd.shishangdbooking.getarchclassandarchitems').then((data) => {
        this.catData = data.itemClass;
        this.itemsData = map(data.items, (item) => {
          const key = `${item.itemId}.${item.sizeId}`;
          let label = item.itemName;
          if (item.sizeId !== '-1') {
            label = `（${item.sizeName}）${label}`;
          }
          const disabled = this.bindFlag;
          return extend({}, item, { key, label, disabled });
        });
        this.selectedItems = map(data.configedItems, item => `${item.itemId}.${item.SizeId}`);
      });
    },
  },
};
</script>

<style lang="less" scoped>
@side-width: 260px;
@cat-title-height: 50px;

.main-content {
  position: relative;
  height: 100%;
  padding-left: @side-width;
  background-color: #fff;
}

.cat {
  position: absolute;
  left: 0;
  top: 0;
  width: @side-width;
  height: 100%;
  border-right: 1px solid #f3f3f3;
  padding-left: 15px;
  overflow: scroll;
}

.content {
  height: 100%;
  padding: 15px;

  > .transfer {
    height: 100%;
  }
}
</style>
