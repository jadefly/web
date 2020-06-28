/* title="品项规格" */
<template>
  <Dialog
    name="PosDialog.ItemSize"
    :title="moduleTitle"
    ref="dialog"
    width="477px"
    height="396px"
    @open="onOpen"
    @close="onClose"
    @submit="itemSizeSubmit"
    :showClose="false"
    :showCloseX="true"
    :hotkeys="hotKeySet"
    :submitId="submitId"
  >
    <div class="itemsize-content" v-if="sizeList.length">
      <!-- 请选择规格 -->
      <p>{{ $t('Biz.Order.PlsSelectSize') }}</p>
      <Paging
        :data="sizeList"
        :active.sync="activeItemSize"
        :itemWidth="106"
        :itemHeight="46"
        class="itemsize-list"
        ref="fastsizeList"
        :id="type + 'fastProductsizeList'"
      >
        <div
          slot-scope="props"
          :class="[
            'itemsize-li',
            {
              'sellout': props.item.isSellout
            }, {
              'active': props.item.size_id == activeItemSize.size_id
            }
          ]"
          @click="addItemSize(props.item)"
        >
          <span
            class="defaultItem"
            v-show="props.item.is_default"
          >{{ $t('Biz.Order.Default') }}</span>
          <span>{{props.item.name}}</span>
          <span>
            <i>{{props.item.std_price}}/{{props.item.unit_name}}</i>
            <i
              v-show="(!isSelloutFn(props.item) && props.item.isLimit)"
              class="itemSlimit"
            >{{ $t('Dict.LimitNum', [devLimitQty(props.item).devLimitQty]) }}</i>
            <!-- 估清 -->
            <i v-show="isSelloutFn(props.item)" class="itemSellout">{{ $t('Dict.Sellout') }}</i>
          </span>
        </div>
      </Paging>
      <div class="size-list-page-btn">
        <PagingBtn
          ref="fastsizeListBtn"
          :showInfo="true"
          class="pos-order-tables-pager"
        ></PagingBtn>
      </div>
    </div>
  </Dialog>
</template>
<script>
import { Message } from 'element-ui';
import { extend, cloneDeep } from 'lodash';
import { mapGetters, mapMutations } from 'vuex';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Dialog from '@/components/Pos/Common/Dialog';
import Paging from '@/components/Pos/Common/Paging';
import PagingBtn from '@/components/Pos/Common/PagingBtn';
/* 注: choiceSize 是点击确定 submit 回调的公共方法 回调的参数是被选中的进行数据修改完的规格品项数据 */
export default {
  props: {
    newAddItem: {
      type: Object,
      default: null,
    },
    areaType: {
      type: Number,
      default: 0,
    },
    submitId: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      default: '',
    },
  },
  components: { Dialog, Paging, PagingBtn },
  mixins: [DialogMixin],
  data() {
    return {
      // 模拟的数据到时修改这对数据就行
      sizeList: [],
      // 当时被选中的数据
      activeItemSize: null,
      // 选中的size
      activeItemSizeId: null,
      moduleTitle: '',
      num: 1, // 加单数量
      oldItem: null, // open时品项
      totalNum: 0, // 加单中-已点此品项数量和
    };
  },
  computed: {
    hotKeySet() {
      return {
        Enter: () => {
          this.itemSizeSubmit();
        },
        '↑': () => {
          this.$vemit('fastsizeListSelect', '↑');
        },
        '↓': () => {
          this.$vemit('fastsizeListSelect', '↓');
        },
        '←': () => {
          this.$vemit('fastsizeListSelect', '←');
        },
        '→': () => {
          this.$vemit('fastsizeListSelect', '→');
        },
      };
    },
    ...mapGetters(['posSettings', 'getVuexItemLimitsMap', 'getVuexPromoteItemLimitsMap', 'getVuexItemSelloutsMap']),
  },
  mounted() {
    this.$von('fastsizeListSelect', (direction) => {
      this.$refs.fastsizeList && this.$refs.fastsizeList.select(direction);
    });
  },
  methods: {
    ...mapMutations({
      setLimitsMap: 'SET_ITEMLIMITSMAP',
    }),
    onOpen() {
      setTimeout(() => {
        this.$refs.fastsizeList.refresh();
        this.$refs.fastsizeListBtn.bind(this.$refs.fastsizeList);
      }, 0);
      // 这是数据所有的 {sizeList: nowItem.sizeList, activeSizeId: nowItem.sizeId}
      this.oldItem = this.resData.item; // 当前项
      const { item } = this.resData; // 当前项
      const num = item.minAddQty > item.num ? item.minAddQty : item.num; // 加单数量
      this.num = num || 0;
      this.totalNum = this.resData.totalNum || 0;

      // 规格对象
      this.sizeList = this.resData.sizeList.map(item => this.devLimitQty(item, true));
      // 根据当前的客位的不同区域显示不同的 价格 0 不用管
      this.activeItemSizeId = this.resData.activeSizeId; // 这是只有修改规格的时候才有的属性 选择的sizeId
      this.moduleTitle = !this.resData.activeSizeId ? this.$t('Biz.Order.ItemSize') : this.$t('Biz.Order.ItemSizeModify');
      // 如果存在就找到对应的数据 否则为默认数据
      const tmpAct = this.sizeList.filter((list) => {
        // 根据当前的客位所在的区域不同设置不同的价格 添加条件 排除下 促销的价和时价的情况
        if ((!list.promotePrice && list.promotePrice != 0)
        && !list.isItemTimePrice
        && this.areaType != 0
        && (list[`other_price${this.areaType}`] || list[`other_price${this.areaType}`] == 0)) {
          this.$set(list, 'std_price', list[`other_price${this.areaType}`]);
          this.$set(list, 'salePrice', list[`other_price${this.areaType}`]);
        }
        if (list.is_default && !this.activeItemSizeId) {
          this.activeItemSizeId = list.size_id;
        }
        return list.size_id == this.activeItemSizeId;
      })[0];
      this.activeItemSize = tmpAct;
      // 如果有默认规格的话就走默认的如果没有就默认走第一个
      this.activeItemSize = this.activeItemSize ? this.activeItemSize : this.resData.sizeList[0];
      this.$log.info(`打开${this.moduleTitle}窗口,activeItemSizeId: ${this.activeItemSizeId}`);
    },
    onClose() {
      // 从新把选择的初始化下
      this.activeItemSizeId = null;
      this.oldItem = null;
    },
    isSelloutFn(sizeItem) {
      return this.getVuexItemSelloutsMap[`${sizeItem.item_id}_${sizeItem.size_id}`];
    },
    // 对数据的做下限量的数据处理
    devLimitQty(itemsize, isOpen = false) {
      if (itemsize.isLimit) {
        const limitItem = this.getVuexItemLimitsMap[`${itemsize.item_id}_${itemsize.size_id}`];
        itemsize.restQuantity = limitItem.maxLimit - this.totalNum; // 限量剩余数 重新计算
      }
      let promotemLimitData = {};
      if (
        isOpen
        && ((this.getVuexPromoteItemLimitsMap[`${itemsize.item_id}_${itemsize.size_id}_${itemsize.promotePlanId}`]
        && this.getVuexPromoteItemLimitsMap[`${itemsize.item_id}_${itemsize.size_id}_${itemsize.promotePlanId}`].isMemberExclusive
        && this.getVuexPromoteItemLimitsMap[`${itemsize.item_id}_${itemsize.size_id}_${itemsize.promotePlanId}`].restQuantity > 0)
        || itemsize.isMemberExclusive
        )
      ) {
        // 不是会员并且还有促销方案 要偶走普通价格【会员专享】
        if (!this.resData.isDomemberPrice && itemsize.priceType === 3) {
          promotemLimitData = {
            priceType: 1,
            copyPromotePrice: itemsize.promotePrice,
            promotePrice: null,
            std_price: itemsize.salePrice,
            defaultPriceType: 1,
            discFlg: 0,
          };
        }
      }
      // return extend({ devLimitQty: itemsize.restQuantity, id: itemsize.size_id }, itemsize);
      return {...itemsize, ...promotemLimitData};
    },
    addItemSize(itemsize) {
      // 进行处理下
      const newItemSize = this.devLimitQty(itemsize);

      // 这是估清和限量的判断
      if (newItemSize.isSellout) {
        // 此规格品项已估清!请选择其它规格
        this.isShowMessage(this.$t('Biz.Order.SelectItemSizeMsg'));
        return;
      }
      if (!this.posSettings.isAllowAddOrderWhenLimitZero && newItemSize.isLimit && newItemSize.devLimitQty <= 0) {
        // 此规格品项限量已售完!请选择其它规格
        this.isShowMessage(this.$t('Biz.Order.SelectItemSizeMsg01'), 'warning');
        return;
      }
      // 这给选择的规格添加active
      this.activeItemSize = newItemSize;
      this.activeItemSizeId = itemsize.size_id;
      // 选中后直接调用确认方法
      this.itemSizeSubmit();
    },
    isShowMessage(message, type, duration) {
      const options = {
        message: message || this.$t('Dict.PromptInfo'), // 提示的内容
        type: type || 'error', // 类型 success/warning/info/error
        duration: duration || 1500, // 显示的时间
        center: true, // 中间显示
      };
      Message(options); // 需要多的可以查看element-ui 的官网 Message组件
    },
    // 确定方法
    itemSizeSubmit() {
      const itemLimitsMap = _.cloneDeep(this.getVuexItemLimitsMap);
      const oldIdSizeId = `${this.oldItem.id}_${this.oldItem.sizeId}`;
      const newIdSizeId = `${this.activeItemSize.item_id}_${this.activeItemSize.size_id}`;

      // 把选中的itemsize_id 传给进行找到相应的对其进行加单操作
      if (this.activeItemSize) {
        if (this.getVuexItemSelloutsMap[newIdSizeId]) {
          // this.isShowMessage('此规格品项已估清!请选择其它规格');
          this.isShowMessage(this.$t('Biz.Order.SelectItemSizeMsg'));
          return;
        }
        if (!this.posSettings.isAllowAddOrderWhenLimitZero && itemLimitsMap[newIdSizeId]
        && itemLimitsMap[newIdSizeId].restQuantity < this.num) {
          // this.isShowMessage('此规格品项已超过限量!请选择其它规格', 'warning'); // ??
          this.isShowMessage(this.$t('Biz.Order.SelectItemSizeMsg01'), 'warning');
          return;
        }
        if (!this.posSettings.isAllowAddOrderWhenLimitZero && this.activeItemSize.restQuantity > 0 && this.activeItemSize.restQuantity < 1) {
          this.num = this.activeItemSize.restQuantity;
        }
        const itemSizeData = {
          costPrice: this.activeItemSize.cost_price,
          isLimit: this.activeItemSize.isLimit,
          isPromotePrice: this.activeItemSize.isPromotePrice, // 如果存在促销价格 则当前打折状态是4
          isSellout: this.activeItemSize.isSellout,
          isDefault: this.activeItemSize.is_default,
          limitQuantity: this.activeItemSize.limit_quantity,
          sizeName: this.activeItemSize.name,
          limit: this.activeItemSize.restQuantity,
          limitTotal: this.activeItemSize.rest_quantity,
          priceType: this.activeItemSize.priceType,
          salePrice: this.activeItemSize.salePrice,
          oldPrice: this.activeItemSize.salePrice, // 取当前规格的销售价格
          sizeId: this.activeItemSize.size_id,
          stdPrice: this.activeItemSize.std_price,
          num: this.num,
          promoteLimit: this.activeItemSize.promoteLimitedQty, // 快餐使用
          unitId: this.activeItemSize.unit_id,
          unitName: this.activeItemSize.unit_name,
          price: this.activeItemSize.std_price,
          // eslint-disable-next-line no-nested-ternary
          discFlg: (this.activeItemSize.discFlg || this.activeItemSize.discFlg === 0)
            ? this.activeItemSize.discFlg
            : (this.activeItemSize.isPromotePrice ? 4 : 0),
          promotePrice: this.activeItemSize.promotePrice ? this.activeItemSize.promotePrice : null,
          memberPrice: this.activeItemSize.memberPrice ? this.activeItemSize.memberPrice : null,
          isItemTimePrice: this.activeItemSize.isItemTimePrice ? this.activeItemSize.isItemTimePrice : false,
          isExchange: this.activeItemSize.isExchange,
        };
        // 这个加是会员专享并验证会员的时候的操作
        if (this.activeItemSize.defaultPriceType) {
          itemSizeData.defaultPriceType = this.activeItemSize.defaultPriceType;
        }
        if (this.activeItemSize.copyPromotePrice) {
          itemSizeData.copyPromotePrice = this.activeItemSize.copyPromotePrice;
        }
        if (this.resData.activeSizeId) { // 如果修改时，原数据未更改直接关闭
          if (oldIdSizeId === newIdSizeId) {
            this.$refs.dialog.close();
            return;
          }
          // 不相同,有限量时老数据加回来
          if (this.oldItem.isLimit) itemLimitsMap[oldIdSizeId].restQuantity += this.num;
        }
        // 第一次(加单)进来,或修改时不相同,更新限量数据
        if (!this.resData.activeSizeId || (this.resData.activeSizeId && oldIdSizeId !== newIdSizeId)) {
          if (this.activeItemSize.isLimit) {
            itemLimitsMap[newIdSizeId].restQuantity -= this.num;
            if (!this.posSettings.isAllowAddOrderWhenLimitZero && this.activeItemSize.restQuantity > 0 && this.activeItemSize.restQuantity < 1) {
              itemLimitsMap[newIdSizeId].restQuantity = 0;
            }
          }
        }
        this.setLimitsMap(itemLimitsMap);

        // 关闭模态框
        this.submit(itemSizeData);
        this.$refs.dialog.close();
        this.$log.info(`提交${this.moduleTitle}窗口,sizeName: ${itemSizeData.sizeName},sizeId: ${itemSizeData.sizeId},price: ${itemSizeData.price}`);
      } else {
        this.isShowMessage(this.$t('Biz.Order.PlsSelectSizeFirst'), 'info');
      }
    },
  },
};
</script>
<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

em,
i {
  font-style: normal;
}
.itemsize-content {
  font-size: 14px;
  background-color: #ffffff;
  position: relative;
  .size-list-page-btn {
    position: absolute;
    right: 10px;
    bottom: -43px;
  }
  p {
    padding: 20px 16px 11px 16px;
    color: #333333;
  }
  .itemsize-list {
    padding: 0px 10px 27px 10px;
    overflow: hidden;
    height: 240px;
    .itemsize-li {
      width: 106px;
      height: 46px;
      border: 1px solid #b5b5b5;
      display: inline-block;
      margin: 4px;
      float: left;
      overflow: hidden;
      border-radius: 5px;
      cursor: pointer;
      position: relative;
      padding: 4px 5px;
      > .defaultItem {
        font-size: 12px;
        position: absolute;
        width: 29px;
        padding: 0px 2px;
        background-color: #b5b5b5;
        color: #fbfbfb;
        top: -2px;
        line-height: 16px;
        right: 0px;
      }
      span {
        display: block;
        white-space: nowrap;
        width: 100%;
        height: 18px;
        line-height: 16px;
        overflow: hidden;
        text-align: left;
        color: #666666;
      }
      span:nth-of-type(1) {
        font-weight: 900;
        font-size: 14px;
        max-width: 68px;
      }
      span:nth-of-type(2) {
        font-size: 12px;
        i {
          display: inline-block;
          max-width: 68px;
          overflow: hidden;
        }
        .itemSellout {
          padding: 0px 5px;
          border-radius: 8px;
          background-color: #cccccc;
          text-align: center;
          color: #f9f9f9;
        }
        .itemSlimit {
          background-color: #ffa71d;
          padding: 0px 5px;
          border-radius: 8px;
          color: #f9f9f9;
        }
      }
    }
    //被选中的样式
    .active {
      border: 2px solid #0babb9;
      span {
        color: #0babb9;
      }
    }
  }
}
</style>
