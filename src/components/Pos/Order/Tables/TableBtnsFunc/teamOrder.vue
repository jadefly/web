<template>
  <!-- 国际化：团队开单 -->
  <Dialog
    name="PosDialog.TeamOrder"
    :title="$t('Dict.Btn.TeamOrder')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :showSubmit="true"
    :disableSubmitBtn="isDisableSubmit"
    width="900px"
    top="4vh"
    submitId="teamOrderSubmit"
  >
    <div class="pos-dialog-content pos-team-order-wrapper">
      <div class="team-order-info">
        <div class="order-list-wrapper">
          <!-- 国际化：客位；人数；服务员；营销员 -->
          <div class="order-info-title">
            <span class="order">{{$t('Dict.Seat')}}</span>
            <span class="count">{{$t('Dict.NumberOfPeople')}}</span>
            <span class="waiter">{{$t('Dict.Waiter')}}</span>
            <span class="salesman">{{$t('Dict.Salesman')}}</span>
          </div>
          <ul class="order-info-content" id="teamOrderInfoList">
            <li v-for="(item, index) in orderTablesInfo" :key="index">
              <span class="order">{{ item.name }}</span>
              <span class="count">
                <el-input-number v-num-keyboard:bottom
                v-model="item.count" :min="0" :max="100" size="small" v-judge></el-input-number>
              </span>
              <span class="waiter">
                <el-input v-num-keyboard:bottom v-model="item.waiter"
                @change="waiterChange(item, index)" v-judge></el-input>
              </span>
              <span class="salesman">
                <el-input v-num-keyboard:bottom v-model="item.salesman"
                @change="salesmanChange(item, index)" v-judge></el-input>
              </span>
              <span><button type="button" @click="delOrderTab(item, index)" class="delete">
                {{$t('Dict.Btn.DeleteItem')}}</button></span>
            </li>
          </ul>
          <div class="pos-pager">
            <Pager :showInfo="true" arrowDirection="up-down"
            pagerId="teamOrderInfoList" ref="teamOrderPager"></Pager>
          </div>
        </div>
        <div class="team-order-type">
          <!-- 国际化：就餐类型： -->
          <h1 class="type">{{$t('Biz.Order.DinerTypeLabel')}}</h1>
          <ul id="teamOrderTypeList">
            <li v-for="(dinnerType, index) in dinnerTypeList"
             @click="choiceDinnerType(dinnerType, index)"
             :class="[{ active: index === selectedinnerTypeTab }]"
             :key="index">{{dinnerType.name}}</li>
          </ul>
          <Pager :showInfo="true" arrowDirection="up-down" pagerId="teamOrderTypeList"></Pager>
        </div>
      </div>
      <div class="team-order-tables">
        <TablesFilter
        ref="teamTableFilter"
        :areas="areas"
        :types="types"
        :teamAreasId="teamAreasId"
        typeId="teamTypeId"
        typePagerNum="3"
        @choiceTypes="choiceTypes"
        @choiceAeras="choiceAeras"
        @choiceAllTypes="choiceAllTypes"
        @choiceAllAeras="choiceAllAeras"
        ></TablesFilter>
        <TablesList
        ref="teamTableList"
        :teamTablesListId="teamTablesListId"
        :isMultiSelect="true"
        :ordeInfo="ordeInfo"
        @multiSelectTables="multiSelectTables"
        ></TablesList>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';
import ajax from '@/common/js/ajax';
import FilterMixin from './Common/FilterMixin';
import TablesFilter from './Common/Filter';
import TablesList from './Common/List';

export default {
  components: {
    Dialog, Pager, TablesFilter, TablesList,
  },
  mixins: [DialogMixin, FilterMixin],
  data() {
    return {
      teamOrderData: {},
      ordeInfo: [],
      dinnerTypeList: [],
      // 选择的客位信息
      selectPointData: null,
      selectedinnerTypeTab: 0,
      selectedinnerTypeTabData: null,
      orderTablesInfo: [{
        name: '普通包房002',
        count: 1,
        waiter: '001',
        salesman: '002',
      }, {
        name: '普通包房002',
        count: 1,
        waiter: '001',
        salesman: '002',
      }],
    };
  },
  computed: {
    isDisableSubmit() {
      return this.orderTablesInfo.length === 1;
    },
  },
  methods: {
    // 页面初始化
    onOpen() {
      // 团队开单求返回的所有信息
      this.teamOrderData = this.resData;
      // 客位信息
      this.ordeInfo = this.resData.pointListJson;
      this.ordeInfo.forEach((item) => {
        this.$set(item, 'user', `0/${item.defCapacity}`);
      });
      // 选择的客位信息清空
      this.orderTablesInfo = [];
      // 就餐类型信息
      this.dinnerTypeList = this.resData.dinnerTypeList;
      this.selectedinnerTypeTab = 0;
      this.selectedinnerTypeTabData = this.dinnerTypeList[0];
      // 初始化Filter数据
      this.initFilterData();
      // 刷新分页
      this.refreshPager('teamOrder');
    },
    // 客位表格多选
    multiSelectTables(item) {
      if (item.selected) {
        const pointData = {};
        pointData.pointId = item.id;
        pointData.name = item.name;
        pointData.count = item.defCapacity;
        pointData.waiter = null;
        pointData.salesman = null;
        pointData.waiterId = '';
        pointData.salesmanId = '';
        this.orderTablesInfo.push(pointData);
      } else {
        this.orderTablesInfo.forEach((orderTable, index) => {
          if (item.id === orderTable.pointId) {
            this.orderTablesInfo.splice(index, 1);
          }
        });
      }
      this.$refs.teamOrderPager.refresh();
    },
    // 就餐类型选择
    choiceDinnerType(dinnerType, index) {
      this.selectedinnerTypeTab = index;
      this.selectedinnerTypeTabData = dinnerType;
    },
    // 删除已选客位信息
    delOrderTab(item) {
      this.orderTablesInfo.forEach((orderTable, index) => {
        if (item.pointId === orderTable.pointId) {
          this.orderTablesInfo.splice(index, 1);
        }
      });
      this.ordeInfo.forEach((d) => {
        if (d.name === item.name) {
          this.$set(d, 'selected', false);
        }
      });
      this.$refs.teamOrderPager.refresh();
    },
    // 服务员文本输入监听
    waiterChange(item) {
      ajax('canyin.pos.bill.getempidname', {
        params: { empCode: item.waiter },
      }).then((data) => {
        if (data && data.id) {
          this.$set(item, 'waiterId', data.id);
        } else if (item.waiter === '') {
          this.$set(item, 'waiterId', '');
        } else {
          this.$set(item, 'waiterCode', item.waiter);
          this.$set(item, 'waiterId', null);
          if (item.waiter !== null) {
            this.$message.error(this.$t('Biz.Order.NoneServer', [item.waiter]));
          }
        }
      });
    },
    // 营销员文本输入监听
    salesmanChange(item) {
      ajax('canyin.pos.bill.getempidname', {
        params: { empCode: item.salesman },
      }).then((data) => {
        if (data && data.id) {
          this.$set(item, 'salesmanId', data.id);
        } else if (item.salesman === '') {
          this.$set(item, 'salesmanId', '');
        } else {
          this.$set(item, 'salesmanCode', item.salesman);
          this.$set(item, 'salesmanId', null);
          if (item.salesman !== null) {
            this.$message.error(this.$t('Biz.Order.NoneSalesman', item.salesman));
          }
        }
      });
    },
    // 延迟提交 搞定change事件
    onSubmit() {
      setTimeout(() => {
        this.submitTeamOrder();
      }, 200);
    },
    // 提交
    submitTeamOrder() {
      if (!this.orderTablesInfo || this.orderTablesInfo.length === 0) {
        // 国际化：请选择客位再进行操作
        this.$message.error(this.$t('Dict.PlsChoosePointToOperate'));
        return;
      }
      for (let i = 0; i < this.orderTablesInfo.length; i++) {
        if (this.orderTablesInfo[i].waiterId == null) {
          this.$message.error(this.$t('Biz.Order.NoneServer', [this.orderTablesInfo[i].waiter]));
          return;
        }
        if (this.orderTablesInfo[i].salesmanId == null) {
          this.$message.error(this.$t('Biz.Order.NoneServer', [this.orderTablesInfo[i].salesmanId]));
          return;
        }
      }
      const pointCheckeds = [];
      // 遍历当前菜品明细，组装到数组中，稍后提交
      this.orderTablesInfo.forEach((orderTable) => {
        const pointData = {};
        pointData.pointId = orderTable.pointId;
        pointData.peopleQty = orderTable.count;
        pointData.waiterId = orderTable.waiterId;
        pointData.salesmanId = orderTable.salesmanId;
        pointCheckeds.push(pointData);
      });
      const requestParams = {
        dinnerTypeId: this.selectedinnerTypeTabData && this.selectedinnerTypeTabData.id,
        orderOriginId: 1201,
        bizTeamBillDetailParams: pointCheckeds,
      };
      this.getToken((tokenId) => {
        requestParams.token_id = tokenId;
        ajax('canyin.pos.teambill.addteambill', {
          contentType: 'paramsEncoded',
          data: requestParams,
        }).then((res) => {
          if (res.success) {
            this.submit(res.data);
          }
          this.close();
          // 国际化：团队开单成功
          this.$message.success(this.$t('Biz.Order.TeamBillSuccess'));
        }).catch((errCode, msg) => {
          this.$message.error(msg);
        });
      });
    },
    getToken(next) {
      ajax('canyin.pos.token.get').then((tokenId) => {
        next(tokenId);
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-team-order-wrapper {
  position: relative;
  height: 618px;
  overflow: hidden;
  .clearfix();

  .team-order-info {
    float: left;
    .size(49.9%, 100%);
    position: relative;
  }

  .team-order-info {
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);

    .order-list-wrapper {
      position: relative;
      .size(100%, 78%);
      background-color: white;
    }

    .order-info-title {
      padding: 10px 18px;
      .size(100%, 40px);
      font-size: 14px;
      border-bottom: 1px solid #ccc;

      > span {
        display: inline-block;
        border-left: 1px solid #ccc;
        padding-left: 10px;

        &:first-child {
          border-left: none;
          padding-left: 0;
        }
      }
    }

    .order-info-content {
      padding-left: 18px;
      padding-right: 18px;
      height: 390px;
      overflow: hidden;
      border-bottom: 1px solid #ccc;
      > li {
        .size(100%, 70px);
        border-bottom: 1px solid #ccc;
        padding-top: 19px;
        padding-bottom: 19px;
        margin-bottom: 0 !important;
        > span {
          display: inline-block;
          vertical-align: center;

          &.order {
            position: relative;
            top: 5px;
            left: 0;
            white-space: nowrap;
            overflow: hidden;
          }

          > .delete {
            height: 32px;
            border: 1px solid #ccc;
            border-radius: 4px;
            color: rgb(102, 102, 102);
            background-color: white;
          }
        }
      }
    }

    .order-info-title,
    .order-info-content > li {
      > .order {
        width: 15%;
      }

      > .count {
        width: 32%;
      }

      > .waiter {
        width: 19%;
      }

      > .salesman {
        width: 19%;
      }
    }

    .pos-pager {
      position: absolute;
      bottom: 0;
      right: 0;
      .size(100%, 50px);
      text-align: right;
      padding-right: 8px;
      padding-top: 5px;
    }
  }

  .team-order-type {
    position: absolute;
    left: 0;
    bottom: 0;
    .size(100%, 115px);
    background-color: white;
    overflow: hidden;
    padding: 12px 16px;

    > h1 {
      padding-bottom: 16px;
    }

    > ul {
      .clearfix();
      font-size: 14px;
      line-height: 1.2;
      color: rgb(51, 51, 51);
      .size(280px, 40px);
      overflow: hidden;

      > li {
        float: left;
        .size(100px, 40px);
        line-height: 40px;
        text-align: center;
        border: 1px solid #ccc;
        border-radius: 4px;
        color: rgb(102, 102, 102);
        margin-right: 12px;
        overflow: hidden;
        &.active {
          color: white;
          background-color: #0babb9;
        }
      }
    }
  }

  .team-order-tables {
    float: right;
    .size(49.9%, 100%);
    position: relative;
    background-color: white;
  }
}

.lang-enUS {
  .pos-team-order-wrapper .team-order-info .order-info-title > .order,
  .pos-team-order-wrapper .team-order-info .order-info-content > li > .order {
    width: 12%;
  }
}
</style>

<style lang="less">
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.order-info-content {
  .el-input__inner {
    height: 32px;
    line-height: 32px;
    padding: 0 8px;
  }
}

.team-order-type {
  .pos-pager {
    width: 170px;
    position: absolute;
    right: 0;
    bottom: 25px;
  }
}

.team-order-tables {
  .tables-filter-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;

    .filter-item {
      height: 48px;
    }

    .filter-item li,
    .choice-all button {
      .size(80px, 32px);
      line-height: 32px;
    }
  }

  .common-tables-list-wrapper {
    padding-top: 100px;
    padding-bottom: 58px;

    > ul > li {
      .size(28%, 82px) !important;
    }
  }
}
</style>
