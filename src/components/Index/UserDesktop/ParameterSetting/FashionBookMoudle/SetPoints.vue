<template>
  <Dialog
    name="ParameterSetting.FashionBookSetPoints"
    :title="$t('Dict.AddPassengerSeat')"
    ref="dialog"
    :showSubmit="true"
    @open="onOpen"
    width="880px"
    height="400px"
    :hotkeys="hotKeySet"
    @submit="setPointsData"
  >
    <div class="main-content">
      <div class="cat">
        <el-tree
          class="tree"
          :data="areaData"
          :props="areaProps"
          @node-click="handleNodeClick"
          node-key="id"
          :default-expanded-keys="['0']"
        ></el-tree>
      </div>
      <div class="content">
        <el-transfer
          class="transfer"
          v-model="selectedPoints"
          :data="points"
          :titles="[$t('Dict.ListToBeSelected'), $t('Dict.SelectedList')]"
          filterable
          :filter-method="filterPoints"
          :filter-placeholder="$t('Biz.UserDesktop.UserDesktopMsg138')"
        ></el-transfer>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import { map, extend, filter } from 'lodash';
import ajax from '@/common/js/ajax';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  data() {
    return {
      areaData: [],
      areaProps: {
        children: 'children',
        label: 'name',
      },
      activeArea: '0',
      pointsData: [],
      selectedPoints: [],
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
    points() {
      if (this.activeArea === '0') {
        return this.pointsData;
      }
      return filter(this.pointsData, { areaid: this.activeArea });
    },
  },
  methods: {
    onOpen() {
      this.activeArea = '0';
      this.getPointsData();
    },
    setPointsData() {
      ajax('canyin.interfaces.shishangd.shishangdbooking.savepoints', {
        contentType: 'json',
        data: this.selectedPoints,
      }).then(() => {
        this.close();
        this.submit();
      });
    },
    handleNodeClick(data) {
      this.activeArea = data.id;
    },
    filterPoints(query, item) {
      return item.name.indexOf(query) > -1
       || item.code.indexOf(query) > -1;
    },
    getPointsData() {
      ajax('canyin.interfaces.shishangd.shishangdbooking.getarchareaandarchpoints').then((data) => {
        this.areaData = [{
          id: '0',
          name: this.$t('Dict.ConsumptionArea'),
          children: data.areas,
        }];
        this.pointsData = map(data.points, item => extend({}, item, {
          key: item.id,
          label: item.name,
          disabled: item.bindFlag,
        }));
        this.selectedPoints = data.configedPoints;
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
  .lang-enUS{
    .main-content .content .el-transfer-panel{
      width: 230px;
    }
    .el-transfer-panel .el-transfer-panel__header .el-checkbox .el-checkbox__label{
      font-size: 12px;
    }
  }
  .main-content .content .el-transfer-panel{
    width: 230px;
  }
</style>
