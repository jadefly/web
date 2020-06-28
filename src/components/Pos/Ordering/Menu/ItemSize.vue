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
    :append-to-body="isNest"
  >
    <div class="itemsize-content">
        <p>{{$t('Biz.Order.PlsSelectSize')}}</p>
        <Paging
            :data="sizeList"
            :active.sync="activeItemSize"
            :itemWidth="106"
            :itemHeight="46"
            class="itemsize-list"
            ref="sizeList"
            :id="type + 'ProductsizeList'"
        >
          <div
               slot-scope="props"
              :class="['itemsize-li',{defaultItem:props.item.is_default},{sellout: props.item.isSellout},{active: props.item.size_id == activeItemSize.size_id}]"
              @click="addItemSize(props.item)"
            >
              <span>{{props.item.name}}</span>
              <span>
                <i>{{props.item.std_price}}/{{props.item.unit_name}}</i>
                <i v-show="(!props.item.isSellout && props.item.isLimit)" class="itemSlimit">{{$t('Dict.LimitNum',[devLimitQty(props.item).devLimitQty])}}</i>
                <i v-show="props.item.isSellout" class="itemSellout">{{$t('Dict.Sellout')}}</i>
              </span>
            </div>
        </Paging>
        <div class="size-list-page-btn">
           <PagingBtn
            ref="sizeListBtn"
            :showInfo="true"
            class="pos-order-tables-pager"
          ></PagingBtn>
        </div>
        <!-- <ul class="itemsize-list" :id="submitId + 'List'">
            <li
              v-for="itemsize in sizeList"
              :key="itemsize.size_id"
              :class="[{defaultItem:itemsize.is_default},{sellout: itemsize.isSellout},{active: itemsize.size_id === activeItemSizeId}]"
              @click="addItemSize(itemsize)"
            >
              <span>{{itemsize.name}}</span>
              <span>
                <i>{{itemsize.std_price}}/{{itemsize.unit_name}}</i>
                <i v-show="(!itemsize.isSellout && itemsize.isLimit)" class="itemSlimit">限{{devLimitQty(itemsize).devLimitQty}}</i>
                <i v-show="itemsize.isSellout" class="itemSellout">估清</i>
              </span>
            </li>
        </ul> -->
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
/*
注:
choiceSize 是点击确定 submit 回调的公共方法 回调的参数是被选中的进行数据修改完的规格品项数据
* */
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
    isNest: {
      type: Boolean,
      default: false,
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
    };
  },
  computed: {
    hotKeySet() {
      return {
        Enter: () => {
          this.itemSizeSubmit();
        },
        '↑': () => {
          this.$vemit('sizeListSelect', '↑');
        },
        '↓': () => {
          this.$vemit('sizeListSelect', '↓');
        },
        '←': () => {
          this.$vemit('sizeListSelect', '←');
        },
        '→': () => {
          this.$vemit('sizeListSelect', '→');
        },
      };
    },
    ...mapGetters(['posSettings', 'getVuexItemLimitsMap', 'posOrderBill', 'getVuexPromoteItemLimitsMap']),
  },
  mounted() {
    this.$von('sizeListSelect', (direction) => {
      this.$refs.sizeList && this.$refs.sizeList.select(direction);
    });
  },
  methods: {
    ...mapMutations({
      setLimitsMap: 'SET_ITEMLIMITSMAP',
    }),
    onOpen() {
      this.$nextTick(() => {
        this.$refs.sizeList.refresh();
        this.$refs.sizeListBtn.bind(this.$refs.sizeList);
      });
      // 这是数据所有的 {sizeList: nowItem.sizeList, activeSizeId: nowItem.sizeId}
      // 规格对象
      this.sizeList = this.resData.sizeList.map(item => this.devLimitQty(item, true));
      // 根据当前的客位的不同区域显示不同的 价格 0 不用管
      this.activeItemSizeId = this.resData.activeSizeId; // 这是只有修改规格的时候才有的属性 选择的sizeId
      this.moduleTitle = !this.resData.activeSizeId ? this.$t('Biz.Order.ItemSize') : this.$t('Biz.Order.ItemSizeModify');
      // 如果存在就找到对应的数据 否则为默认数据
      this.activeItemSize = this.sizeList.filter((list) => {
        // 根据当前的客位所在的区域不同设置不同的价格 添加条件 排除下 促销的价和时价的情况
        if ((!list.promotePrice && list.promotePrice != 0) && !list.isItemTimePrice && this.areaType != 0 && (list[`other_price${this.areaType}`] || list[`other_price${this.areaType}`] == 0)) {
          this.$set(list, 'std_price', list[`other_price${this.areaType}`]);
          this.$set(list, 'salePrice', list[`other_price${this.areaType}`]);
        }
        if (list.is_default && !this.activeItemSizeId) {
          this.activeItemSizeId = list.size_id;
        }
        return list.size_id == this.activeItemSizeId;
      })[0];
      // 如果有默认规格的话就走默认的如果没有就默认走第一个
      this.activeItemSize = this.activeItemSize ? this.activeItemSize : this.resData.sizeList[0];
      // UI LOG
      this.$log.info(`打开${this.moduleTitle}窗口,activeItemSizeId: ${this.activeItemSizeId}`);
    },
    onClose() {
      // 从新把选择的初始化下
      // this.activeItemSize = null
      this.activeItemSizeId = null;
      this.sizeList = [];
      // 当时被选中的数据
      this.activeItemSize = null;
      // 选中的size
      this.moduleTitle = '';
    },
    // 对数据的做下限量的数据处理
    devLimitQty(itemsize, isOpen = false) {
      // //限量的总数
      // let limit_quantity = itemsize.rest_quantity
      //   ? itemsize.rest_quantity
      //   : 0;
      // //已售出的总数
      // let sales_quantity = itemsize.sales_quantity
      //   ? itemsize.sales_quantity
      //   : 0;
      // //所剩下的限量数
      // // let devLimitQty = (limit_quantity * 1000 - sales_quantity * 1000) / 1000;
      // let devLimitQty = limit_quantity;
      // itemsize.limit_quantity = limit_quantity;
      // itemsize.sales_quantity = sales_quantity;
      // 判断当前 品项是否是属于促销限量数据里 如果存在并且是 会员专享 的并且可售数大于0才去匹配价格
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
        if (!(this.posOrderBill && this.posOrderBill.crmMemberQueryData.data) && itemsize.priceType === 3) {
          promotemLimitData = {
            priceType: 1,
            copyPromotePrice: itemsize.promotePrice,
            promotePrice: null,
            std_price: itemsize.salePrice,
            discFlg: 0,
          };
        }
      }
      const devLimitQty = itemsize.restQuantity;
      return extend({ devLimitQty, id: itemsize.size_id }, itemsize, promotemLimitData);
    },
    addItemSize(itemsize) {
      // 进行处理下
      const newItemSize = this.devLimitQty(itemsize);
      // this.$refs.dialog.close()
      //! this.posSettings.isAllowAddOrderWhenLimitZero 判断为零的时候可以继续加单
      // 这是估清和限量的判断
      if (newItemSize.isSellout) {
        this.isShowMessage(this.$t('Biz.Order.SelectItemSizeMsg'));
        return;
      } if (!this.posSettings.isAllowAddOrderWhenLimitZero && newItemSize.isLimit && newItemSize.devLimitQty <= 0) {
        this.isShowMessage(this.$t('Biz.Order.SelectItemSizeMsg01'), 'warning');
        return;
      }
      // 这给选择的规格添加active
      this.activeItemSize = newItemSize;
      this.activeItemSizeId = itemsize.size_id;
      // this.$emit('add', itemsize.size_id)
      // this.$refs.dialog.close()
      // 选中后直接调用确认方法
      this.itemSizeSubmit();
    },
    isShowMessage(message, type, duration) {
      const options = {
        message: message || this.$t('Dict.PromptInfo '), // 提示的内容
        type: type || 'error', // 类型 success/warning/info/error
        duration: duration || 1500, // 显示的时间
        center: true, // 中间显示
      };
      Message(options); // 需要多的可以查看element-ui 的官网 Message组件
    },
    // 确定方法
    itemSizeSubmit() {
      const itemLimitsMap = cloneDeep(this.getVuexItemLimitsMap);
      let num = 1;
      // 把选中的itemsize_id 传给进行找到相应的对其进行加单操作
      if (this.activeItemSize) {
        // 这是估清和限量的判断
        this.activeItemSize = this.devLimitQty(this.activeItemSize);
        if (this.activeItemSize.isSellout) {
          this.isShowMessage(this.$t('Biz.Order.SelectItemSizeMsg'));
          return;
        } if (!this.posSettings.isAllowAddOrderWhenLimitZero && this.activeItemSize.isLimit && itemLimitsMap[`${this.activeItemSize.item_id}_${this.activeItemSize.size_id}`].restQuantity <= 0) {
          this.isShowMessage(this.$t('Biz.Order.SelectItemSizeMsg01'), 'warning');
          return;
        }
        if (!this.posSettings.isAllowAddOrderWhenLimitZero && this.activeItemSize.devLimitQty > 0 && this.activeItemSize.devLimitQty < 1) {
          num = this.activeItemSize.devLimitQty;
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
          sizeId: this.activeItemSize.size_id,
          stdPrice: this.activeItemSize.std_price,
          num,
          promoteLimit: this.activeItemSize.promoteLimitedQty,
          unitId: this.activeItemSize.unit_id,
          unitName: this.activeItemSize.unit_name,
          price: this.activeItemSize.std_price,
          discFlg: (this.activeItemSize.discFlg || this.activeItemSize.discFlg === 0)
            ? this.activeItemSize.discFlg
            : (this.activeItemSize.isPromotePrice ? 4 : 0),
          promotePrice: this.activeItemSize.promotePrice ? this.activeItemSize.promotePrice : null,
          memberPrice: this.activeItemSize.memberPrice ? this.activeItemSize.memberPrice : null,
          isItemTimePrice: this.activeItemSize.isItemTimePrice ? this.activeItemSize.isItemTimePrice : false,
          isExchange: this.isExchange,
        };
        if (this.activeItemSize.copyPromotePrice) {
          itemSizeData.copyPromotePrice = this.activeItemSize.copyPromotePrice;
        }
        if (this.activeItemSize.isLimit) {
          itemLimitsMap[`${this.activeItemSize.item_id}_${this.activeItemSize.size_id}`].restQuantity--;
          if (!this.posSettings.isAllowAddOrderWhenLimitZero && this.activeItemSize.devLimitQty > 0 && this.activeItemSize.devLimitQty < 1) {
            itemLimitsMap[`${this.activeItemSize.item_id}_${this.activeItemSize.size_id}`].restQuantity = 0;
          }
        }
        this.setLimitsMap(itemLimitsMap);
        // //关闭模态框
        //         // 会员价格
        // itemData.memberPrice = data[0].memberPrice;
        // // 促销价格
        // itemData.promotePrice = data[0].promotePrice;
        // // 销售价格
        // itemData.salePrice = data[0].salePrice;
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
em, i {
  font-style: normal;
}
.itemsize-content {
  font-size: 14px;
  background-color: #ffffff;
  position: relative;
  .size-list-page-btn{
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
    height:240px;
    overflow: hidden;
    .itemsize-li {
      width: 106px;
      height: 46px;
      border: 1px solid #b5b5b5;
      display: inline-block;
      margin: 4px;
      overflow: hidden;
      border-radius: 5px;
      cursor: pointer;
      float: left;
      position: relative;
      padding: 4px 5px;
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
      //限量的数显示样式
      // .itemSizelimit {
      //   em {
      //     background-color: #ffa71d;
      //   }
      // }
      //估清的标识样式
      // .itemSellout {
      //   em {
      //     background-color: #cccccc;
      //   }
      // }
    }
    //是默认规格的样式
    .defaultItem {
      &::before {
        content: "默认";
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
    }
    //被选中的样式
    .active {
      border: 2px solid  #0babb9;
      span {
        color: #0babb9;
      }
    }
  }
}
</style>
