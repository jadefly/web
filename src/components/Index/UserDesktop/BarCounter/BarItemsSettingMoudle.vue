<template>
  <div class="bar-page">
    <SystemContent>
      <div class="system-content-head bar-items-setting-head" slot="head">
        <h3>{{$t('Biz.UserDesktop.InventoryItemSettings')}}</h3>
        <button
          type="button"
          class="btn btn-default bar-dialog-top-button btn-print"
          @click="printItem"
        >{{$t('Dict.Printing')}}</button>
        <button
          type="button"
          class="btn btn-default bar-dialog-top-button"
          @click="exportItem"
        >{{$t('Dict.Export')}}</button>
      </div>
      <div class="bar-wrap">
        <div class="bar-header">
          <button type="button" class="pull-left btn btn-primary" @click="setItems">+ {{$t('Dict.AddItem')}}</button>
            <Search class="pull-right search" @onSearch="onSearch"
                    :placeholder="$t('Biz.UserDesktop.UserDesktopMsg002')"></Search>
        </div>
        <div class="bar-content" ref="barContent">
          <el-table
            :data="tableData"
            highlight-current-row
            style="width: 100%;"
          >
              <el-table-column prop="itemCode" :label="$t('Dict.ItemNumber')"></el-table-column>
              <el-table-column prop="itemName" :label="$t('Dict.ItemName')"></el-table-column>
              <el-table-column prop="sizeName" :label="$t('Dict.SizeName')"></el-table-column>
              <el-table-column :label="$t('Dict.Operation')">
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="mini"
                  @click="deleteItem(scope.row)"
                >{{$t('Dict.Btn.DeleteItem')}}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="bar-footer">
          <el-button
            type="danger"
            size="medium"
            class="pull-left"
            @click="deleteAll"
          >{{$t('Dict.EmptyAll')}}</el-button>
          <Pagination
            :total="total"
            :limit="limit"
            :page="page"
            @handleChangePage="handleChangePage"
            class="pull-right"
          ></Pagination>
        </div>
      </div>
    </SystemContent>
    <SetItems ref="setItems"></SetItems>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import SystemContent from '../base/SystemContent';
import Search from '@/components/Index/UserDesktop/base/Search';
import Pagination from '@/components/Index/UserDesktop/base/Pagination';
import SetItems from './SetItems';
import ajax from '@/common/js/ajax';

export default {
  components: {
    SystemContent,
    Search,
    Pagination,
    SetItems,
  },
  data() {
    return {
      total: 0,
      limit: 10,
      page: 1,
      searchText: '',
      tableData: [],
    };
  },
  computed: {
    ...mapGetters(['deskPageBaseInfo']),
  },
  mounted() {
    this.resetData();
  },
  methods: {
    resetData() {
      this.page = 1;
      this.searchText = '';
      this.$nextTick(() => {
        this.calcPageSize();
        this.getTableData();
      });
    },
    // 根据高度获取每页显示多少条数据
    getPageSize(height) {
      const re = parseInt((height - 48) / 53, 0);
      if (re > 1) {
        return re;
      }
      return 1;
    },
    calcPageSize() {
      this.limit = this.getPageSize(this.$refs.barContent.offsetHeight);
    },
    getTableData() {
      ajax('canyin.desktop.bizsetcheckingitem.list', {
        contentType: 'URLEncoded',
        data: {
          page: this.page,
          limit: this.limit,
          searchValue: this.searchText,
        },
      }).then((data) => {
        this.total = data.total;
        this.tableData = data.datalist;
      });
    },
    // 添加品项
    setItems() {
      this.$refs.setItems.open({}, {
        submit: () => {
          this.resetTableData();
          this.getTableData();
        },
      });
    },
    // 搜索事件
    onSearch(value) {
      this.searchText = value;
      this.page = 1;
      this.getTableData();
    },
    // 重置数据
    resetTableData() {
      this.searchText = '';
      this.page = 1;
    },
    // 分页查询
    handleChangePage(page) {
      this.page = page;
      this.getTableData();
    },
    // 删除一个品项
    deleteItem(item) {
      ajax('canyin.desktop.bizsetcheckingitem.deletes', {
        contentType: 'URLEncoded',
        data: {
          itemIds: item.itemId,
          sizeIds: item.sizeId,
        },
      }).then(() => {
        this.getTableData();
      });
    },
    // 删除全部
    deleteAll() {
      this.$confirm(this.$t('Dict.EmptyAll'), this.$t('Dict.Tips')).then(() => {
        ajax('canyin.desktop.bizsetcheckingitem.clear').then(() => {
          this.resetTableData();
          this.getTableData();
        });
      }).catch(() => {});
    },
    getExportUrl() {
      const { HTTP_CONTEXTPATH } = this.deskPageBaseInfo;
      return `${HTTP_CONTEXTPATH}/canyin/desktop/bizsetcheckingitem/export`;
    },
    printItem() {
      const url = this.getExportUrl();
      this.$devices.XLSPrint.print(url);
    },
    exportItem() {
      window.open(this.getExportUrl());
    },
  },
};
</script>

<style lang="less" scoped>
.bar-items-setting-head {
  h3 {
    display: inline;
  }

  button {
    float: right;
    height: 44px;
    margin: 6px 4px;

    &.btn-print {
      margin-right: 20px;
    }
  }
}
</style>
