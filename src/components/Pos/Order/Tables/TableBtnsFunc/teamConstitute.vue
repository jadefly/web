<template>
  <!-- 国际化：组成团队 -->
  <Dialog
    name="PosDialog.TeamConstitute"
    :title="$t('Dict.Btn.TeamConstitute')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :showSubmit="true"
    width="700px"
    top="10vh"
  >
    <div class="pos-dialog-content pos-team-constitute-wrapper">
      <div class="constitute-team-info">
        <!--  国际化：请选择需要组成团队的桌台：  -->
        <p>{{$t('Biz.Order.LongMsg010')}}</p>
      </div>
      <TablesFilter ref="teamTableFilter"
        :teamAreasId="teamAreasId"
        :areas="areas"
        :types="types"
        @choiceTypes="choiceTypes"
        @choiceAeras="choiceAeras"
        @choiceAllTypes="choiceAllTypes"
        @choiceAllAeras="choiceAllAeras" >
      </TablesFilter>
      <TablesList ref="teamTableList"
        :style="{paddingTop: `${162}px`, paddingBottom: `${58}px`}"
        :teamTablesListId="teamTablesListId"
        :ordeInfo="ordeInfo"
        :isMultiSelect="true"
         @multiSelectTables="multiSelectTables">
      </TablesList>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import FilterMixin from './Common/FilterMixin';
import TablesFilter from './Common/Filter';
import TablesList from './Common/List';
import { indexOf, join } from 'lodash';
import ajax from '@/common/js/ajax';

export default {
  components: { Dialog, TablesFilter, TablesList },
  mixins: [DialogMixin, FilterMixin],
  data() {
    return {
      // 客位信息
      ordeInfo: [],
      groupPointId: [],
    };
  },
  methods: {
    onOpen() {
      // 清空选中状态
      this.$nextTick(() => {
        if (this.$refs.teamTableList) {
          this.$refs.teamTableList.clearSelectedTable();
        }
      });
      // 客位信息
      this.ordeInfo = this.resData.pointListJson;
      this.ordeInfo.forEach((item) => {
        this.$set(item, 'user', `${item.peopleqty}/${item.defCapacity}`);
      });
      // 清空客位
      this.groupPointId = [];
      // 初始化过滤数据
      this.initFilterData();
      // 刷新分页
      this.refreshPager('teamConstitute');
    },
    // 客位表格多选
    multiSelectTables(item) {
      if (item.selected) {
        this.groupPointId.push(item.id);
      } else {
        const index = indexOf(this.groupPointId, item.id);
        if (index !== -1) {
          this.groupPointId.splice(index, 1);
        }
      }
    },
    // 提交
    onSubmit() {
      const groupPointIdStr = `${join(this.groupPointId, ',')},`;
      if (groupPointIdStr.length <= 1) {
        // 国际化：请选择需要组团的客位
        this.$message.error(this.$t('Biz.Order.LongMsg011'));
        return;
      }
      ajax('canyin.pos.teammangergroup.groupteam', {
        needToken: true,
        contentType: 'paramsEncoded',
        data: { groupPointIdStr },
      }).then((data) => {
        this.submit(data.data);
        this.close();
        // 国际化：组团成功
        this.$message.success(this.$t('Biz.Order.GroupTeamSuccess'));
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

.pos-team-constitute-wrapper {
  height: 546px !important;

  .constitute-team-info {
    position: absolute;
    top: 55px;
    left: 0;
    z-index: 1;
    .size(100%, 58px);
    line-height: 58px;
    padding-left: 18px;
    font-size: 16px;
    color: rgb(102, 102, 102);
    box-shadow: 0px 0px 10px 0px inset rgba(0, 0, 0, 0.2);
    background-color: #eee;
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
}
</style>
