<template>
  <!-- 国际化：转账 -->
  <Dialog
    name="PosDialog.TransferAccount"
    :title="$t('Dict.Btn.TransferAccount')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :showSubmit="true"
    :hotkeys="submitHotKey"
    width="700px"
    top="10vh"
  >
    <div class="pos-transfer-account-wrapper">
      <TableInfo :infoData="infoData"></TableInfo>
      <TablesFilter
        ref="teamTableFilter"
        :areas="areas"
        :types="types"
        :teamAreasId="teamAreasId"
        @choiceTypes="choiceTypes"
        @choiceAeras="choiceAeras"
        @choiceAllTypes="choiceAllTypes"
        @choiceAllAeras="choiceAllAeras"
      ></TablesFilter>
      <TablesList
        :style="{paddingTop: `${162}px`, paddingBottom: `${58}px`}"
        moudle="transferAccount"
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
import TableInfo from './Common/Info';
import TablesFilter from './Common/Filter';
import TablesList from './Common/List';
import FilterMixin from './Common/FilterMixin';
import ajax from '@/common/js/ajax';

export default {
  components: {
    Dialog, TableInfo, TablesFilter, TablesList,
  },
  mixins: [DialogMixin, FilterMixin],
  data() {
    return {
      transferAccountData: {},
      infoData: {},
      ordeInfo: [],
      // 选择的客位信息
      selectPointData: null,
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
  methods: {
    // 页面初始化
    onOpen() {
      // 清空选中状态
      this.$nextTick(() => {
        if (this.$refs.teamTableList) {
          this.$refs.teamTableList.clearSelectedTable();
        }
      });
      // 转账请求返回的所有信息
      this.transferAccountData = this.resData;
      // 顶部显示信息
      this.infoData = {};
      this.infoData.pointName = this.resData.pointName;
      this.infoData.openTime = this.resData.openTime;
      this.infoData.peopleQty = this.resData.peopleQty;
      // 客位信息
      this.ordeInfo = this.resData.points;
      this.ordeInfo.forEach((item) => {
        this.$set(item, 'user', `${item.peopleqty}/${item.defCapacity}`);
      });
      // 初始化filter数据
      this.initFilterData();
      // 刷新分页
      this.refreshPager('transferAccount');
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
    // 选择单个客位
    selectedPointTable(item) {
      this.selectPointData = item;
    },
    // 确认按钮提交方法
    onSubmit(authData = {}) {
      this.$vonce('authCode', (code) => {
        this.onSubmit(code);
      });
      if (!this.selectPointData) {
        // 国际化：请选择客位再进行操作
        this.$message.error(this.$t('Dict.PlsChoosePointToOperate'));
        return;
      }
      const requestParams = {
        fromPointId: this.resData.pointId,
        targetPointId: this.selectPointData.id,
        bsId: this.resData.bsId,
        pointId: this.selectPointData.id,
        loadmodule: 1,
        _t: (new Date()).getTime(),
        ...authData,
      };
      ajax('canyin.pos.transferbills.transferbill', {
        contentType: 'paramsEncoded',
        data: requestParams,
      }).then((data) => {
        if (data.success) {
          this.submit(this.selectPointData);
          this.close();
          // 国际化：转账成功
          this.$message.success(this.$t('Biz.Order.TransferSuccess'));
        }
      }).catch((msgCode, msg) => {
        this.$message.error(msg);
      });
    },
  },
};
</script>

<style lang="less">
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-transfer-account-wrapper {
  height: 546px;
}
.table-info-wrapper {
  position: absolute;
  top: 55px;
  left: 0;
  z-index: 1;
}

.tables-filter-wrapper {
  position: absolute;
  top: 113px;
  left: 0;
  z-index: 1;
}

.tables-list-wrapper {
  padding-top: 165px;
  padding-bottom: 58px;
}
</style>
