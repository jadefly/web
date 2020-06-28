<template>
  <div class="seafood-main">
    <div class="left">
      <div v-if="activeId" class="left-title">已选择：<span class="activeItem">{{displayName}}</span></div>
      <div v-else class="left-title">请从列表中选择要称重的品项</div>
      <div class="weight-screen">
        <div class="tare" v-if="weightNum.autoWeighTareValue > 0">
          <div class="tare-name">皮重：</div>
          <div class="tare-num">{{weightNum.autoWeighTareValue}}{{unit}}</div>
        </div>
        <div class="weight">
          {{weight}}<span class="unit">{{unit}}</span>
        </div>
      </div>
      <div class="btn-wrap">
        <template v-if="settingsData.isNetWeight === '1'">
          <el-button v-if="weightNum.autoWeighTareValue === 0" type="default" @click="setPz">去皮</el-button>
          <el-button v-if="weightNum.autoWeighTareValue > 0" type="default" @click="weightNum.autoWeighTareValue = 0">皮重清零</el-button>
        </template>
        <el-button type="primary" @click="done">确定</el-button>
      </div>
      <Paging
        slot="list"
        ref="itemsScreen"
        class="itemPaging"
        :itemWidth="146"
        :itemHeight="106"
        :data="groupByItem.weightData"
        :usePropSize="true"
        :itemStyle="{'position': 'relative','margin-top': '8px','padding-right': '8px'}">
        <Item
          slot-scope="props"
          :data="props.item"
          @click.native="clickItem(props.item)"
          :class="{'itemDiv-active': activeId === props.item.scId}"
        ></Item>
      </Paging>
        <PagingBtn
          class="itemBtnClass"
          ref="itemBtn"
          arrowDirection="up-down"
          :showInfo="true"
          :paging="$refs.itemsScreen">
        </PagingBtn>
    </div>
    <div class="right">
      <div class="right-title">已称重</div>
      <Paging
        slot="list"
        ref="alreadyItemsScreen"
        class="alreadyItemPaging"
        :itemWidth="180"
        :itemHeight="111"
        :data="groupByItem.alreadyWeightData"
        :usePropSize="true"
        :itemStyle="{'position': 'relative','margin-top': '8px','padding-right': '11px'}">
        <Item
          slot-scope="props"
          :data="props.item"
          :unit="unit"
          @click.native="clickAlreadyItem(props.item)"
          :showWight="true"
          :style="{'background': '#D2E2FB'}"
        ></Item>
      </Paging>
      <PagingBtn
        ref="alreadyItemBtn"
        class="alreadyItemBtnClass"
        arrowDirection="up-down"
        :showInfo="true"
        :paging="$refs.alreadyItemsScreen">
      </PagingBtn>
    </div>
  </div>
</template>

<script>
import { sortBy, partition, each, includes } from 'lodash';
import Paging from '@/components/Pos/Common/Paging';
import PagingBtn from '@/components/Pos/Common/PagingBtn';
import ajax from '@/common/js/ajax';
import WS from '@/common/js/WS';
import { mapGetters } from 'vuex';
import newWeightUnitConversion from '@/common/js/newWeightUnitConversion';
import LoadScaleMixin from '@/components/Pos/Common/LoadScaleMixin';
import Item from './Item';

export default {
  name: 'MainView',
  components: {
    Paging, PagingBtn, Item,
  },
  mixins: [LoadScaleMixin],
  data() {
    return {
      allData: [],
      settingsData: '',
      activeItem: '',
      activeId: '',
      unit: '', // 单位
      seaFoodWebSocket: null, // 单位
      weightNum: {
        autoWeighNetValue: 0, // 净重
        autoWeighTareValue: 0, // 皮重
      }, // 重量
    };
  },
  mounted() {
    this.$refs.itemBtn.bind(this.$refs.itemsScreen);
    this.$refs.alreadyItemBtn.bind(this.$refs.alreadyItemsScreen);
    this.getSettings();
    this.getSeaFoodData();
  },
  destroyed() {
    this.closeWebSocket();
  },
  computed: {
    ...mapGetters(['posDevice']),
    displayName() {
      if (this.activeItem) {
        if (this.activeItem.sizeId !== '-1') {
          return `(${this.activeItem.sizeName})${this.activeItem.itemName}`;
        }
        return this.activeItem.itemName;
      }
      return '';
    },
    weight() {
      if (this.weightNum.autoWeighTareValue === 0) {
        return this.weightNum.autoWeighNetValue;
      } if (this.weightNum.autoWeighTareValue > 0) {
        return parseFloat(this.weightNum.autoWeighNetValue - this.weightNum.autoWeighTareValue).toFixed(this.settingsData.POSReservedDecimal);
      }
      return 0;
    },
    // 分组，排序
    groupByItem() {
      const re = partition(this.allData, item => item.confirmWeighType === 2);// 分成已称重 未称重
      const alreadyWeightData = sortBy(re[0], item => -item.modifyTimeForTimeStamp); // 已称重 按修改时间倒序
      const weightData = sortBy(re[1], ['createTimeForTimeStamp', 'itemCode']); // 已称重 按创建时间正序，itemCode正序
      return { alreadyWeightData, weightData };
    },
  },
  methods: {
    // 获取设置
    getSettings() {
      const { filterid, posid } = this.$route.params;
      ajax('canyin.kitchen.kitchenseafoodweigh.seafoodweighsettinginit', {
        params: {
          itemFilterId: filterid,
          posId: posid,
        },
      }).then((data) => {
        this.settingsData = data;
        // 获取单位
        switch (this.settingsData.POSWeighingUnit) {
          case 0:
            this.unit = 'kg';
            break;
          default:
            this.unit = 'g';
        }
        this.initWebSocket(data.WS_CONTEXTPATH);
        this.initDevices();
      });
    },
    // 查询数据
    getSeaFoodData() {
      const { filterid, posid } = this.$route.params;
      ajax('canyin.kitchen.kitchenseafoodweigh.selectseafoodweighitem', {
        contentType: 'json',
        data: {
          itemFilterId: filterid,
          posId: posid,
        },
      }).then((data) => {
        this.allData = data;
        // this.groupByItem(data);
      });
    },
    // 初始化设备管理器
    initDevices() {
      this.$devices.init({
        onOpen: () => {
          console.info(this.settingsData);
          // 初始化电子秤
          if (this.settingsData.enableScale) {
            this.$devices.Scale.init({
              enabled: 1,
              scaleid: this.settingsData.scaleMode,
              com: this.settingsData.scalePort,
            }, (data) => {
              console.info(data);
              if (data.returnCode === 0) {
                setTimeout(() => {
                  this.$log.info('开始发送连续称重指令');
                  this.autoWeight();
                }, 200);
              } else if (data.returnCode === -1) {
                this.$message.error(this.$t('Biz.Order.ElectronicScaleRr01', { msg: data.returnText }));
              }
            });
          } else {
            this.$message.warning('未设置电子称的提示：未配置电子称，请前往后台设置中的pos设置进行配置');
          }
        },
        onError: () => {
          this.$log.info(this.$t('Biz.Order.DevicesWarnMsg01'));
        },
      });
    },
    // 自动称重
    autoWeight() {
      this.$devices.Scale.autoWeighStart((data) => {
        const newData = data;
        if (newData.returnCode == -1) {
          this.$message.error(`${this.$t('Biz.Order.WeightItemErrorMsg')}${data.returnText}`);
        } else {
          newData.autoWeighNetValue = newData.autoWeighNetValue ? newWeightUnitConversion(data.autoWeighNetValue, this.settingsData) : 0;
          this.weightNum.autoWeighNetValue = newData.autoWeighNetValue;
        }
      });
    },
    // 确定
    done() {
      const item = this.activeItem;
      if (!item) {
        this.$message.warning('请选择要称重的品项');
        return;
      }
      if (this.weight === 0) {
        this.$message.warning('请将品项放置好后重试');
        return;
      }
      ajax('canyin.kitchen.kitchenseafoodweigh.confirmseafoodweighitem', {
        contentType: 'json',
        data: {
          bsId: item.bsId,
          pointId: item.pointId,
          items: [{
            scId: item.scId,
            itemId: item.itemId,
            itemName: item.itemName,
            // qty: 188,
            qty: this.weight,
            auxiliaryUnitId: item.auxiliaryUnitId,
            auxiliaryUnitQty: item.auxiliaryUnitQty,
          }],
        },
      }).then(() => {
        if (this.groupByItem.weightData.length > 0) {
          this.activeItem = this.groupByItem.weightData[0];
          this.activeId = this.activeItem.scId;
        }
      });
    },
    // 设置皮重
    setPz() {
      this.weightNum.autoWeighTareValue = this.weightNum.autoWeighNetValue;
    },
    // 点击左侧品项
    clickItem(item) {
      this.activeId = item.scId;
      this.activeItem = item;
    },
    // 点击右侧已称重品项
    clickAlreadyItem(item) {
      this.$confirm('该品项已称重完成，是否确认重新称重？', this.$t('Dict.Tips'), {
        confirmButtonText: this.$t('Dict.Sure'),
        cancelButtonText: this.$t('Dict.Cancel'),
        type: 'warning',
      }).then(() => {
        ajax('canyin.kitchen.kitchenseafoodweigh.cancelseafoodweighitem', {
          contentType: 'json',
          data: {
            scId: item.scId,
          },
        }).then(() => {
          this.activeId = item.scId;
          this.activeItem = item;
        });
      }).catch(() => {});
    },
    // 初始化推送
    initWebSocket(path) {
      this.seaFoodWebSocket = new WS(`${path}/websocket/kitchenseafoodweighwebsocketserver`, {
        message: (message) => {
          console.info('海鲜称重 推送', message);
          switch (message.method) {
            case 'addOrder': // 加单
              const result = this.filterData(message.data);
              this.allData = this.allData.concat(result);
              break;
            case 'cancelOrder': // 退单
            case 'tranItem': // 单品转台
            case 'transferBills': // 转账
            case 'modifyPoint': // 更换客位
            case 'closeOrder': // 关台
              this.allData = this.filterData(message.data);
              // this.groupByItem(this.allData);
              break;
            case 'updateSeafoodWeighState': // 称重状态变化
              this.changeStatus(message.data);
              break;
            default:
              break;
          }
        },
      });
    },
    // 关闭推送
    closeWebSocket() {
      if (this.seaFoodWebSocket) {
        this.seaFoodWebSocket.close();
      }
    },
    // 过滤品项
    filterData(data) {
      const { itemIdList, smallClassIdList, areaIdList, saleIdList } = this.settingsData;
      return data.filter((item) => {
        const itemIdValidate = itemIdList
          && itemIdList.length > 0
          && (
            itemIdList.indexOf(item.itemId) >= 0
            || item.tempItemName != null
          );
        const smallClassIdValiate = smallClassIdList
          && smallClassIdList.length > 0
          && smallClassIdList.indexOf(item.smallClassId) >= 0;
        const areaIdValidate = !item.pointAreaId
          || item.pointAreaId === '9'
          || item.pointAreaId === '10'
          || !areaIdList.length
          || includes(areaIdList, item.pointAreaId);
        const saleIdValidate = !item.saleTypeId
          || includes(saleIdList, `${item.saleTypeId}`);
        return (itemIdValidate || smallClassIdValiate) && areaIdValidate && saleIdValidate;
      });
    },
    //  状态变化
    changeStatus(data) {
      each(this.allData, (item) => {
        if (item.scId === data.scId) {
          this.$set(item, 'confirmWeighType', data.isConfirmWeigh ? 2 : 1);
          this.$set(item, 'lastQty', data.lastQty);
          this.$set(item, 'modifyTimeForTimeStamp', data.modifyTimeForTimeStamp);
          this.$set(item, 'auxiliaryUnitQty', data.auxiliaryUnitQty);
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
  .seafood-main {
    position: relative;
    .left {
      width: calc(100% - 400px);
      height: 100%;
      background: #EEEEEE;
      margin-right: 400px;
      padding: 4px 24px;
      position: relative;
      .left-title{
        font-size: 16px;
        color: #666666;
        font-weight:bold;
        .activeItem{
          color: #333333;
        }
      }
      .weight-screen{
        background: #000000;
        width: 100%;
        height: 88px;
        border-radius: 12px;
        margin-top: 4px;
        padding: 0 16px;
        font-weight:bold;
        vertical-align: middle;
        .tare{
          float: left;
          color: #CCCCCC;
          height: 100%;
          vertical-align: middle;
          .tare-name{
            margin-top: 10px;
            font-size: 16px;
          }
          .tare-num{
            font-size: 30px;
          }
        }
        .weight{
          float: right;
          color: #5ADA6C;
          font-size:60px;
          vertical-align: middle;
          .unit{
            margin-left: 20px;
            font-size: 36px;
            color: #CCCCCC;
          }
        }
      }
      .btn-wrap {
        margin-top: 4px;
        display: flex;
        width: 100%;
        .el-button--primary {
          background-color: #16ABEC;
          border-color: #16ABEC;
          flex: 3;
          color: #ffffff;
        }
        .el-button--default {
          background-color: #EEEEEE;
          border: #16ABEC 2px solid;
          flex: 1;
          color: #16ABEC;
        }
        .el-button {
          font-size: 20px;
          font-weight: bold;
        }
      }
      .itemPaging{
        width: calc(100% + 10px);
        height: calc(100% - 230px);
      }
      .itemBtnClass{
        position: absolute;
        right: 24px;
        bottom: 9px;
      }
    }
    .right {
      width: 400px;
      height: 100%;
      background: #5A6D8A;
      position: absolute;
      top: 0;
      right: 0;
      padding: 4px 0 20px 24px;
      overflow: hidden;
      .right-title{
        font-size: 16px;
        color: #F0F0F0;
        font-weight:bold;
      }
      .alreadyItemPaging{
        height: 92%;
        width: 100%;
        overflow: hidden;
      }
      .alreadyItemBtnClass{
        position: absolute;
        right: 24px;
        bottom: 9px;
        button{
          background: #5A6D8A !important;
          color: white;
        }
      }
    }
  }

</style>
