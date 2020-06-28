<template>
  <Dialog
    name="PosDialog.associatedTable"
    :title="$t('Biz.Pos.More.AssociatedTitle1')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :showSubmit="true"
    :hotkeys="submitHotKey"
    :appendToBody="true"
    width="700px"
    height="604px"
    top="6vh"
    submitId="changeTableSubmit">
    <div class="pos-dialog-content pos-change-tables-wrapper">
      <div class="change-table-info-wrapper">
        <div class="table-info">
          <span class="current-table">{{$t('Biz.Pos.More.AssociatedSpan1')}}</span>
          <strong>{{ currentBuffetInfo.code }}</strong>
          <i class="icon icon-right-arrow"></i>
          <span class="target-table">{{$t('Biz.Pos.More.AssociatedTitle101')}}</span>
          <strong class="color">{{ currentAssociatedTableName }}</strong>
          <span class="diner-amount">{{$t('Dict.NumberOfPeople01')}}</span>
          <strong>{{currentBuffetInfo.peopleQty}}</strong>
        </div>
        <div class="order-info">
          <span class="order-time color">{{ currentAssociatedTableName }}</span>
          <span class="diner-amount">{{$t('Biz.Pos.More.AssociatedSpan3')}}</span>
          <strong class="no-padding color">{{ hadAssociateOrder }}</strong>
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
        ref="teamTableList"
        :teamTablesListId="teamTablesListId"
        :ordeInfo="ordeInfo"
        :isAssociatedTable="isAssociatedTable"
        @selectedPointTable="selectedPointTable"
      ></TablesList>
    </div>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import TablesFilter from '@/components/Pos/Order/Tables/TableBtnsFunc/Common/Filter';
import TablesList from '@/components/Pos/Order/Tables/TableBtnsFunc/Common/BuffetDepositList';
import FilterMixin from '@/components/Pos/Order/Tables/TableBtnsFunc/Common/FilterMixin';
import ajax from '@/common/js/ajax';
import * as tableState from '@/common/dictionary/pos-order-table-state';

export default {
  name: 'associatedTable',
  components: {
    Dialog, TablesFilter, TablesList,
  },
  mixins: [DialogMixin, FilterMixin],
  props: {
    associateInfo: {
      type: Object,
      default: () => ({}),
    },
    openBuffetDeposit: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      ordeInfo: [], // list的客位列表
      selectPointData: null, // 选择的客位信息
      tableState,
      isAssociatedTable: true, // 和换台公用的一个list组件，通过传参执行不同逻辑
      currentAssociatedTableName: '', // 当前关联客位名称
      currentAssociatedTableData: null, // 当前关联客位
      currentBuffetInfo: {}, // 当前押金单信息
      associateTableInfo: null, // 关联客位所需信息
      hadAssociateOrder: '', // 当前客位已关联押金单
      hadChange: false, // 打开页面后是否做了什么操作
      whoOpen: '', // 那个页面打开的此页面（押金管理，登记押金）
    };
  },
  computed: {
    ...mapGetters(['posBaseInfo']),
    submitHotKey() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  methods: {
    // 查询客位列表
    queryPointList() {
      const { id } = this.posBaseInfo;
      return ajax('canyin.pos.buffetdeposit.querypointlistwithdeposit', {
        contentType: 'URLEncoded',
        data: {
          posId: id,
        },
      });
    },
    // 押金单关联客位
    associateTable() {
      const { currentBuffetInfo, associateTableInfo } = this;
      const data = {
        id: currentBuffetInfo ? currentBuffetInfo.id : '', // 押金单id
        code: currentBuffetInfo ? currentBuffetInfo.code : '', // 押金单号
        pointId: associateTableInfo ? associateTableInfo.id : '', // 客位Id
      };
      ajax('canyin.pos.buffetdeposit.depositwithpoint', { params: { ...data } }).then((res) => {
        this.$message({
          type: 'success',
          message: `${res.msg}`,
          duration: 1000,
        });
        if (this.whoOpen === 'payIndex') {
          this.$vemit('refreshBill', '1'); // 关联客位后刷新结算页面来获取最新的押金金额
        }
        this.$emit('refreshDepositList');
        this.close();
      });
    },
    // 确认按钮提交方法
    onSubmit() {
      if (!this.hadChange) {
        this.$message({
          type: 'error',
          message: this.$t('Dict.PlsChoosePointToOperate'),
          duration: 1000,
        });
        return;
      }
      if (this.whoOpen === 'registerDeposit') { // 通过登记押金页面打开的此页面，不走接口关联
        this.$vemit('associated', this.currentAssociatedTableData);
        this.close();
      } else {
        this.associateTable();
      }
    },
    // 页面初始化
    async onOpen() {
      // 当前押金单的信息，包含已关联客位的id和名称
      this.currentBuffetInfo = this.resData.currentBuffetDepositData;
      // 那个页面打开的此页面
      this.whoOpen = this.resData.source;
      await this.searchTables();
      // 权限验证
      this.$vonce('authCode', (code) => {
        this.onSubmit(code);
      });
    },
    // 查询关联客位的列表
    async searchTables() {
      // 类型，区域，客位列表
      const pointListData = await this.queryPointList();
      // 如果不是自助押金的 则不显示未开台的客位
      if (!this.openBuffetDeposit) {
        pointListData.pointList = pointListData.pointList.filter((item) => {
          if (item.bizPointStateDTO) {
            return item.bizPointStateDTO.state === 2;
          }
          return false;
        });
      }
      // 客位类型列表
      this.types = pointListData ? pointListData.pointTypeList : [];
      // 消费区域列表
      this.areas = pointListData ? pointListData.areaList : [];
      // 所有客位列表
      this.ordeInfo = pointListData ? pointListData.pointList : [];
      // 复制的换客位页面方法，感觉不需要set这个属性
      this.ordeInfo.map((item) => {
        this.$set(item, 'user', `0/${item.defCapacity}`);
        this.$set(item, 'checked', false);
        if (item.id === this.currentBuffetInfo.relationPointId) { // 根据押金单关联的客位id找到客位列表下的对应客位
          item.checked = true;
          // 当前押金单关联的客位名称
          this.currentAssociatedTableName = item.pointFullName;
          this.currentAssociatedTableData = item;
          if (item.buffetDepositList && item.buffetDepositList.length > 0) {
            this.hadAssociateOrder = item.buffetDepositList.reduce((a, b) => a += `${b.code}，`, '');
          }
        }
        return item;
      });
      // 初始化filter数据
      this.$vemit('initFilterHeader');
      // 重置搜索框
      this.$vemit('clearSearch');
      // 刷新分页
      this.refreshPager('changeTable');
    },
    onClose() {
      this.currentBuffetInfo = {};
      this.currentAssociatedTableName = '';
      this.currentAssociatedTableData = null;
      this.hadAssociateOrder = '';
      this.ordeInfo = [];
      this.hadChange = false;
    },
    // 选择客位
    selectedPointTable(point) {
      this.hadChange = true;
      if (point) {
        const { buffetDepositList, pointFullName } = point;
        this.currentAssociatedTableName = pointFullName;
        this.currentAssociatedTableData = point;
        this.hadAssociateOrder = buffetDepositList.reduce((a, b) => a += `${b.code}，`, '');
        this.associateTableInfo = point;
      } else {
        this.currentAssociatedTableName = '';
        this.currentAssociatedTableData = null;
        this.hadAssociateOrder = '';
        this.associateTableInfo = null;
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
    overflow: auto;
    strong {
      font-weight: normal;
    }

    .table-info {
      > i {
        padding-left: 6px;
        padding-right: 6px;
      }
      .no-padding {
        padding: 0;
      }
      .color {
        color: #0babb9;
      }
      .diner-amount {
        padding-left: 20px;
      }
    }

    .order-info {
      .diner-amount {
        padding-left: 5px;
      }
      .color {
        color: #0babb9;
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
