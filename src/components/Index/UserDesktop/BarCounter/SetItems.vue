<template>
  <Dialog
    name="BarCounter.SetItems"
    :title="$t('Dict.AddItem')"
    ref="dialog"
    :showSubmit="true"
    @open="onOpen"
    width="900px"
    height="400px"
    :hotkeys="hotKeySet"
    @submit="setPointsData"
    :disableSubmitBtn="!this.selectedItems.length">
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
  import {extend, filter, find, map,} from 'lodash';
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
      configedItems: [],
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          if (this.selectedItems.length) {
            this.setPointsData();
          }
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
      const itemDetail = JSON.stringify(map(this.selectedItems, (idStr) => {
        const id = idStr.split('.');
        const itemId = id[0];
        const sizeId = id[1];
        let re = { itemId, sizeId };
        const finded = find(this.configedItems, re);
        if (finded) {
          const { modifyTime, bmsNum } = finded;
          re = extend({}, re, { modifyTime, bmsNum });
        } else {
          re = extend({}, re, { bmsNum: 0 });
        }
        return re;
      }));
      ajax('canyin.desktop.bizsetcheckingitem.update', {
        contentType: 'json',
        data: { itemDetail },
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
      ajax('canyin.desktop.bizsetcheckingitem.getarchitemtreeandlist').then((data) => {
        this.catData = data.itemClass;
        this.itemsData = map(data.items, (item) => {
          const key = `${item.itemId}.${item.sizeId}`;
          let label = item.itemName;
          if (item.sizeId !== '-1') {
            label = `（${item.sizeName}）${label}`;
          }
          return extend({}, item, { key, label });
        });
        this.configedItems = data.configedItems;
        this.selectedItems = map(data.configedItems, item => `${item.itemId}.${item.sizeId}`);
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
<style lang="less">
  .main-content {
    .content {
      .el-transfer-panel {
        width: 250px;
      }
    }
  }
</style>
