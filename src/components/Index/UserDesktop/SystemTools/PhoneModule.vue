<template>
  <SystemContent :padding="false">
    <div class="system-phone-module">
      <ul class="system-tab">
        <li
        :class="[
          'system-tab-item',
          {
            'item-active': activeTab === item.name,
          }
        ]"
        @click="handleTabClick(item)"
        v-for="item of tabs"
        :key="item.name"
        >
          <span class="tab-item-name">
            {{item.label}}
          </span>
          <span :class="[
            'tab-item-bar',
            {
              'item-bar-active': activeTab === item.name,
            }
          ]"></span>
        </li>
      </ul>
      <div class="system-phone-content">
        <div class="system-phone-table" ref="systemTableBody">
          <el-table
            highlight-current-row
            :data="tableData"
            style="width: 100%">
            <el-table-column
              type="index"
              :label="$t('Dict.SerialNumber')"
              width="60"
            >
            </el-table-column>
            <el-table-column
              prop="dev_code"
              :label="$t('Biz.UserDesktop.SystemTools.PhoneModuleLabel2')"
            >
            </el-table-column>
            <el-table-column
              prop="dev_id"
              :label="$t('Biz.UserDesktop.SystemTools.PhoneModuleLabel3')">
            </el-table-column>
            <el-table-column
              prop="address"
              header-align="center"
              :label="$t('Dict.SerialNumber')">
              <template slot-scope="scope" >
                <div class="textCenter">
                  <el-button type="text" size="mini" @click="handleDelete(scope)">{{$t('Dict.Btn.DeleteItem')}}</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <div slot="foot">
      <el-button type="danger" size="mini" @click="clearAll()">{{$t('Dict.EmptyAll')}}</el-button>
      <Pagination :total="total" :limit="limit"></Pagination>
    </div>
  </SystemContent>
</template>
<script>
import { xorBy } from 'lodash';
import Pagination from '../base/Pagination';
import SystemContent from '../base/SystemContent';
import ajax from '@/common/js/ajax';

export default {
  name: 'PhoneModule',
  data() {
    return {
      total: 0,
      limit: 10,
      activeTab: 'mobileBank',
      tabs: [
        {
          label: this.$t('Biz.UserDesktop.SystemTools.PhoneModuleTab1'),
          name: 'mobileBank',
          url: 'canyin.desktop.bizmobileterminal.selectlistmobilecashdesk',
          deleteUrl: 'canyin.desktop.bizmobileterminal.mobilecashdesksave',
          params: 'cashDeskSearchName',
          dataArr: 'mobileCashDesk',
        },
        {
          label: this.$t('Biz.UserDesktop.SystemTools.PhoneModuleTab2'),
          name: 'plateOrdering',
          url: 'canyin.desktop.bizmobileterminal.selectlistandroid',
          deleteUrl: 'canyin.desktop.bizmobileterminal.androidordersave',
          params: 'androidOrderSearchName',
          dataArr: 'androidOrder',
        },
        {
          label: this.$t('Biz.UserDesktop.SystemTools.PhoneModuleTab3'),
          name: 'wisdomStreet',
          url: 'canyin.desktop.bizmobileterminal.selectlistsmartstreet',
          deleteUrl: 'canyin.desktop.bizmobileterminal.smartstreetsave',
          params: 'smartStreetSearchName',
          dataArr: 'smartStreet',
        },
      ],
      tableData: [],
      debounceFn: null,
    };
  },
  components: {
    Pagination,
    SystemContent,
  },
  mounted() {
    this.$nextTick(() => {
      const defaultUrl = 'canyin.desktop.bizmobileterminal.selectlistmobilecashdesk';
      this.getList(defaultUrl);
    });
  },
  methods: {
    clearAll() {
      this.$confirm(
        this.$t('Biz.UserDesktop.SystemTools.PhoneModuleConfirm'),
        this.$t('Dict.Tips')
).then(() => {
        this.clearAllHandle();
      }).catch(() => {});
    },
    async clearAllHandle() {
      const {
        deleteUrl,
        dataArr,
        params,
        url,
      } = this.tabs.find(item => item.name === this.activeTab);
      const res = await ajax(deleteUrl,
        {
          contentType: 'URLEncoded',
          data: {
            [dataArr]: JSON.stringify([]),
            [params]: '',
          },
        });
      if (res) {
        this.$message.success(this.$t('Biz.UserDesktop.SystemTools.PhoneModuleMsg2'));
        this.getList(url);
      }
    },
    async handleDelete({ row }) {
      const deleteObj = {
        dev_id: row.dev_id,
        dev_code: row.dev_code,
      };
      const {
        deleteUrl,
        dataArr,
        params,
        url,
      } = this.tabs.find(item => item.name === this.activeTab);
      const deleteData = xorBy(this.tableData, [deleteObj], 'dev_id');
      const res = await ajax(deleteUrl,
        {
          contentType: 'URLEncoded',
          data: {
            [params]: '',
            [dataArr]: JSON.stringify(deleteData),
          },
        });
      if (res) {
        this.$message.success(this.$t('Dict.DeleteSuccess'));
        this.getList(url);
      }
    },
    handleTabClick(item) {
      this.activeTab = item.name;
      this.getList(item.url);
    },
    async getList(url) {
      const res = await ajax(url, {
        params: {
          searchName: '',
        },
      });
      this.tableData = res;
      this.total = res.length;
    },
  },
};
</script>
<style lang="less" scope>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .system-phone-module{
    width: 100%;
    height: 100%;
    .system-tab{
      width: 100%;
      height: 56px;
      border-bottom: 2px solid #dcdee3;
      .system-tab-item{
        width: 90px;
        float: left;
        position: relative;
        text-align: center;
        height: 56px;
        line-height: 56px;
        cursor: pointer;
        .tab-item-bar{
          position: absolute;
          bottom: 0px;
          width: 90px;
          height: 2px;
          left: 0;
        }
      }
      .item-active{
        color: #00abb7;
      }
      .item-bar-active{
        background: #00abb7;
      }
    }
    .system-phone-content{
      position: relative;
      height: calc(100% - 56px);
      padding: 20px 17px;
      .system-phone-table{
        height: calc(100% - 36px);
      }
    }
    .textCenter {
      text-align: center;
    }
  }
</style>
<style lang="less">
.system-phone-module {
  .el-table {
    th {
      background-color: #fafafa;
    }
    td {
      padding: 8px 0;
    }
  }
  .el-table__body {
    tr.current-row {
      td {
        background-color: #f3f7ff;
      }
    }
  }
}
</style>
