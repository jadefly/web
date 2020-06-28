<template>
  <Dialog
    name="PosDialog.ChangeTable"
    :title="$t('Dict.Btn.ChangeTable')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :showSubmit="true"
    :hotkeys="submitHotKey"
    width="700px"
    height="604px"
    top="10vh"
    submitId="changeTableSubmit"
  >
    <div class="pos-dialog-content pos-change-tables-wrapper">
      <div class="change-table-info-wrapper">
        <div class="table-info">
          <span class="current-table">{{$t('Biz.Order.CurrentSeats')}}</span>
          <strong>{{changeTableData.pointName}}</strong>
          <i class="icon icon-right-arrow"></i>
          <span class="target-table">{{$t('Biz.Order.TargetSeats')}}</span>
          <strong v-if="selectPointData">{{selectPointData.pointFullName}}</strong>
        </div>
        <div class="order-info">
          <span class="order-time">{{$t('Dict.OpeningTime')}}</span>
          <strong>{{changeTableData.openTime}}</strong>
          <span class="diner-amount">{{$t('Biz.Order.DinerPersonNumLabel')}}</span>
          <strong>{{changeTableData.peopleQty}}</strong>
        </div>
      </div>
      <TablesFilter
        ref="teamTableFilter"
        :areas="areas"
        :types="types"
        :teamAreasId="teamAreasId"
        @choiceTypes="choiceTypes"
        @choiceAeras="choiceAeras"
        @choiceAllTypes="choiceAllTypes"
        @choiceAllAeras="choiceAllAeras"
      >
      </TablesFilter>
      <TablesList
        :style="{paddingTop: `${189}px`, paddingBottom: `${58}px`}"
        ref="teamTableList"
        :teamTablesListId="teamTablesListId"
        :ordeInfo="ordeInfo"
        @selectedPointTable="selectedPointTable"
      ></TablesList>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import TablesFilter from './Common/Filter';
import TablesList from './Common/List';
import FilterMixin from './Common/FilterMixin';
import ajax from '@/common/js/ajax';
import * as tableState from '@/common/dictionary/pos-order-table-state';

export default {
  components: {
    Dialog, TablesFilter, TablesList,
  },
  mixins: [DialogMixin, FilterMixin],
  data() {
    return {
      changeTableData: {},
      ordeInfo: [],
      // 选择的客位信息
      selectPointData: null,
      tableState,
    };
  },
  computed: {
    submitHotKey() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
        '↑': () => {
          this.$refs.teamTableList.selectTableDir('↑');
        },
        '↓': () => {
          this.$refs.teamTableList.selectTableDir('↓');
        },
        '←': () => {
          this.$refs.teamTableList.selectTableDir('←');
        },
        '→': () => {
          this.$refs.teamTableList.selectTableDir('→');
        },
        'Enter': () => {
          this.$refs.teamTableList.enterHotKeyProccess();
        },
        'BackSpace': () => {
          this.$refs.teamTableList.delWordInBlur();
        },
        ...this.setKeySearchHotKey(),
      };
    },
  },
  created() {

  },
  methods: {
    // 页面初始化
    onOpen() {
      // 清空选中状态
      this.$nextTick(() => {
        if (this.$refs.teamTableList) {
          this.selectPointData = null;
          this.$refs.teamTableList.clearSelectedTable();
        }
      });
      // 更换客位请求返回的所有信息
      this.changeTableData = this.resData;
      // 客位信息
      this.ordeInfo = this.resData.pointListJson;
      this.ordeInfo.forEach((item) => {
        this.$set(item, 'user', `0/${item.defCapacity}`);
      });
      // 初始化filter数据
      this.initFilterData();
      // 刷新分页
      this.refreshPager('changeTable');
      this.$vonce('authCode', (code) => {
        this.onSubmit(code);
      });
    },
    // 获取搜索框用的快捷键
    setKeySearchHotKey() {
      const searchKeys = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890'.split('');
      const keysObj = {};
      searchKeys.forEach((item) => {
        keysObj[item] = () => {
          this.$refs.teamTableList.addWordInBlur(item);
        };
      });
      return keysObj;
    },
    // 确认按钮提交方法
    onSubmit(authData = {}) {
      if (!this.selectPointData) {
        this.$message.error(this.$t('Dict.PlsChoosePointToOperate'));
        return;
      }
      const requestParams = {
        pointId: this.resData.pointId,
        targetPointId: this.selectPointData.id,
        bsId: this.resData.bsId,
        peopleQty: this.resData.peopleQty,
        loadmodule: 1,
        _t: (new Date()).getTime(),
        ...authData,
      };
      ajax('canyin.pos.modifypoint.modifypoint', {
        contentType: 'paramsEncoded',
        data: requestParams,
      }).then((data) => {
        if (data.printD) {
          this.$devices.Printer.print(data.printD);
        }
        this.submit(this.selectPointData);
        this.close();
        this.$message.success(this.$t('Biz.Order.ChangeTableSuccess'));
      }).catch((errCode, msg) => {
        this.$message.error(msg);
      });
    },
    // 选择单个客位
    selectedPointTable(item) {
      this.selectPointData = item;
      // 预订客位直接进行确认换台
      if (this.selectPointData.state === this.tableState.BOOKING) {
        this.onSubmit();
      }
    },
  },
};
</script>

<style lang="less">
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-change-tables-wrapper {
  height: 546px !important;

  .change-table-info-wrapper {
    position: absolute;
    top: 55px;
    left: 0;
    z-index: 1;
    .size(100%, 85px);
    line-height: 1.8;
    font-size: 15px;
    box-shadow: 0px 0px 10px 0px inset rgba(0, 0, 0, 0.2);
    background-color: #eee;
    padding: 18px;

    strong {
      font-weight: normal;
    }

    .table-info {
      > i {
        padding-left: 12px;
        padding-right: 12px;
      }

      > strong:last-child {
        font-weight: bold;
        color: #0babb9;
      }
    }

    .order-info {
      .diner-amount {
        padding-left: 20px;
      }
    }
  }

  .tables-filter-wrapper {
    position: absolute;
    top: 140px;
    left: 0;
    z-index: 1;
  }

  .tables-list-wrapper {
    padding-top: 192px;
    padding-bottom: 58px;
  }
}
</style>
