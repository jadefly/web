<template>
  <div class="tilingCon" v-if="editData && billSelected">
    <!--品项数量-->
    <section class="eItem">
      <div class="tit">品项数量:</div>
      <div class="rig">
        <numberAddDel
          :inputNum="editData.num"
          :limitMin="editData.minAddQty"
          :limitMax="editData.maxAddQty?editData.maxAddQty:Number.MAX_VALUE"
          :limitNum="typeof getVuexItemLimitsMap[`${editData.id}_${editData.sizeId}`]==='undefined'?-1:getVuexItemLimitsMap[`${editData.id}_${editData.sizeId}`].maxLimit"
          :orderedNum="orderedNum"
          :isAllow0="posSettings.isAllowAddOrderWhenLimitZero"
          :showToast="true"
          keyboard_align="bottom"
          :decimalDigit="3"
          :setTimeoutNum="1800"
          :numAllowZero="false"
          @changeLimit="changeLimit_num">
        </numberAddDel>
        <ul class="editBtn">
          <li @click="changeHalfNum" :class="{gray: !(editData.enableHalf && !editData.minAddQty)}">
            <svg class="svgIcon" aria-hidden="true"><use xlink:href="#icon-half"></use></svg>
            半份
          </li>
          <li @click="deleteItem">
            <svg class="svgIcon" aria-hidden="true"><use xlink:href="#icon-delete"></use></svg>
            删除
          </li>
          <li @click="give">
            <svg class="svgIcon" aria-hidden="true"><use xlink:href="#icon-zengsong"></use></svg>
            {{+editData.discFlg === 1 ? '取消赠送' : '赠送'}}
          </li>
        </ul>
      </div>
    </section>
    <!--品项变价-->
    <section class="eItem">
      <div class="tit">品项变价:</div>
      <div class="rig eItem_price">
        现价格：{{ priceoRiginal }} <span class="mlSpace">变更价格：</span>
        <numberAddDel
          :inputNum="editData.price"
          :limitMax="maxPrice"
          :showToast="true"
          keyboard_align="bottom"
          :decimalDigit="2"
          @changeLimit="changeLimit_price">
        </numberAddDel>
      </div>
    </section>
    <!--制作方法-->
    <section>
      <div class="eItem">
        <div class="tit">制作方法:</div>
        <ul class="method_tab">
          <li v-for="item in methodTab" :key="item.type"
          @click="TabFn(item)"
          :class="{active: item.isSlected}
          ">
            {{ item.name }}
          </li>
        </ul>
      </div>
      <div class="methodCon methodCon_public" v-show="methodTab[0].isSlected">
        <PagerSlot class="category" ref="category" :style="{height: publicMethodClass.length>4?'220px':'auto'}"
          :listAll="publicMethodClass" :pageSize="4" :paginationShow="false" arrowAlign="center">
          <template slot="list" slot-scope="scope">
            <li v-for="(item, index) in scope.showList" :key="item.id"
            :class="{active: currentClassId===item.id}"
            @click="methodsChange(item.id)">
              {{item.name}}
            </li>
          </template>
        </PagerSlot>

        <PagerSlot class="categoryMethods btnList" ref="categoryMethod_public"
          :listAll="currentMethods" :pageSize="9" :paginationShow="false" arrowAlign="right">
          <template slot="list" slot-scope="scope">
            <li v-for="(item, index) in scope.showList" :key="item.id"
            :class="{active: item.isSlected}"
            @click="selectFn(item, 'public')">
              <button>{{item.name}}</button>
            </li>
          </template>
        </PagerSlot>
      </div>
      <!--专有做法-->
      <PagerSlot class="methodCon methodCon_private btnList" v-show="methodTab[1] && methodTab[1].isSlected"
        ref="categoryMethod_private"
        :listAll="editData.methodsInfo && editData.methodsInfo.privateMethodJson"
        :pageSize="12" :paginationShow="false" arrowAlign="right">
        <template slot="list" slot-scope="scope">
          <li v-for="(item, index) in scope.showList" :key="item.id"
          :class="{active: item.isSlected}"
          @click="selectFn(item, 'private')">
            <button>{{item.name}}</button>
          </li>
        </template>
      </PagerSlot>
    </section>
    <!-- 品项规格 -->
    <section v-if="editData.sizeList && editData.sizeList.length">
      <div class="tit">品项规格:</div>
      <PagerSlot class="btnList"
        ref="refGuige"
        :listAll="editData.sizeList"
        :pageSize="4" :paginationShow="false" arrowAlign="right">
        <template slot="list" slot-scope="scope">
          <li v-for="(item, index) in scope.showList" :key="item.size_id"
          :class="{active: item.is_default}"
          @click="selectSize(item, index)">
            <button class="guigeBtn">
              <strong>{{item.name}}</strong>
              <div class="guigePrice">
                <!-- <i>￥{{item.std_price}}/{{item.unit_name}}</i> -->
                <i v-if="(!item.isSellout && item.isLimit)" class="itemSlimit">
                  限{{ getVuexItemLimitsMap[`${item.item_id}_${item.size_id}`].restQuantity }}
                </i>
                <i v-if="getVuexItemSelloutsMap[`${item.item_id}_${item.size_id}`]" class="itemSellout">估清</i>
              </div>
            </button>
          </li>
        </template>
      </PagerSlot>
    </section>
    <ChangeMethodPrice ref="changeMethodPrice"></ChangeMethodPrice>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
import { cloneDeep, extend } from 'lodash';
import "@static/fonts/tiling/iconfont.js";
import { add, sub, multi } from '@/common/js/math';
import numberAddDel from '@/components/Pos/More/numberAddDel';
const PagerSlot = () => import('@/components/Pos/Common/PagerSlot');
const ChangeMethodPrice = () => import('@/components/Pos/Ordering/OrderingBtnsFunc/ChangeMethodPrice');
export default {
  props: {
    editData: {
      type: Object,
      default: () => null,
    },
    guestList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      orderedNum: 0, // 已点该品项的数量(不包含选中项) 用于限量
      priceoRiginal: '', // 现价
      newIdSizeId: '', // 选中的id_sizeId
      currentClassId: '', // 当前做法分类的id
      currentMethods: [], // 当前做法分类中的方法
      methodTab: [],
      selectedMethods: [], // 选中的做法
      publicMethodJson: [], // 所有通用做法
    };
  },
  computed: {
    ...mapState('fastFood', ['billSelected', 'maxPrice', 'billCurrentIndex']),
    ...mapState({
      // itemInfo: state => state.pos.itemInfo,
    }),
    ...mapGetters(['posSettings', 'getVuexItemLimitsMap', 'getVuexItemSelloutsMap']),
    publicMethodClass() { // 所有通用做法分类
      let list = cloneDeep(this.editData.methodsInfo && this.editData.methodsInfo.methodClassList) || [];
      list.unshift({ name: '全部分类', id: '' }); // 添加全部分类
      return list;
    }
  },
  components: {
    numberAddDel,
    PagerSlot,
    ChangeMethodPrice,
  },
  methods: {
    ...mapMutations('fastFood', ['SET_BILLSELECTED', 'setHasDialog']),
    ...mapMutations({
      setLimitsMap: 'SET_ITEMLIMITSMAP',
    }),
    changeHalfNum() { // 半份
      if (!(this.editData.enableHalf && !this.editData.minAddQty)) return;
      this.$parent.changeHalfNum();
    },
    deleteItem() { // 删除
      this.$parent.deleteItem();
      this.SET_BILLSELECTED(0);
    },
    changeLimit_num(val) { // 修改数量
      this.$parent.changeItemNumSumit(val);
    },
    changeLimit_price(val) { // 改价
      this.$parent.orderingChangePrice(val);
    },
    give() { // 赠送
      this.SET_BILLSELECTED(0); // 关闭弹层
      const method = this.editData.discFlg === 1 ? 'cancelGive' : 'give';
      const orderingMethod = this.editData.discFlg === 1 ? 'orderingCancelGive' : 'orderingGive';
      if (this.posSettings.isShowPresentReason) { // 开启【赠送时，不进行赠送原因选择，请使用以下默认赠送原因】时，取默认赠送原因
        this.$parent[orderingMethod](this.editData.num, this.posSettings.defaultPresentReason);
      } else {
        this.$parent[method]();
      }
    },
    TabFn(item) {
      this.methodTab.forEach((item) => item.isSlected = false);
      item.isSlected = true;
      this.$refs['categoryMethod_'+item.type].init();
    },
    methodsChange(id) { // 做法分类切换
      this.currentClassId = id;
      this.currentMethods = id ? this.getCurrentMethods(id) : this.publicMethodJson;
      this.$refs.categoryMethod_public.init(); // 更新做法翻页数据
    },
    getCurrentMethods(id) {
      return this.publicMethodJson.filter(item => item.parentId === id);
    },
    selectFn(item, type) { // 选择做法
      if (this.selectedMethods && this.selectedMethods.length) {
        // 做法带价格的做法分为两种根据isRelaCount字段判断，为true是联动，false为固定类型，两种不能共存
        if (item.fee) {
          const has = this.selectedMethods.some(method => (method.fee || method.price) && method.isRelaCount !== item.isRelaCount);
          if (has) {
            let messgeText = '';
            if (!item.isRelaCount) {
              messgeText = '已添加按数量加价的制作方法，不能再添加固定加价的制作方法';
            } else {
              messgeText = '已添加固定加价的制作方法，不能再添加按数量加价的制作方法';
            }
            this.$message.error(`${messgeText}`);
            return;
          }
        }
        
        // 判断专用做法也同时在通用的做法里 ,只能选择一个
        let idx = this.selectedMethods.findIndex(el => el.id === item.id);
        if (idx !== -1 && !item.isSlected) {
          return;
        }
      }

      // 做法价格可修改的弹框
      if (item.isFeeEditable && !item.isSlected) {
        const methodData = cloneDeep(item);
        this.$refs.changeMethodPrice.open(methodData, {
          submit: (method) => {
            if (method.fee) {
              this.$set(item, 'fee', method.fee); // 费用修改
              this.addSelectMethods(item, type);
              this.$refs.changeMethodPrice.close();
              setTimeout(() => this.setHasDialog(false), 0);
            }
          },
        });
      } else {
        this.addSelectMethods(item, type);
      }
    },
    // 添加选中的做法
    addSelectMethods(item, type) {
      let methodList = [];
      this.$set(item, 'isSlected', !item.isSlected);
      this.$set(item, 'type', type);
      item.price = item.price ? item.price : null;
      // 是否计费
      if (item.isNeedFee) {
        item.price = item.price || item.fee;
        item.vprice = item.price;
      }
      // 目前的现状是初始的时候后端没有给数量qty字段 ,现在做法还有价格的时候要有数量所以手动添加个默认为1
      if (item.fee) this.$set(item, 'qty', item.qty ? item.qty : 1);
      if (!this.selectedMethods || !this.selectedMethods.length) { // 无选中的做法
        let tmp = cloneDeep(item);
        delete tmp.isSlected;
        this.selectedMethods.push(item);
      } else {
        const findIdx = this.selectedMethods.findIndex(el => el.id === item.id);
        if (findIdx !== -1) {
          this.selectedMethods.splice(findIdx, 1); // 删除此项
        } else {
          let tmp = cloneDeep(item);
          delete tmp.isSlected;
          this.selectedMethods.push(tmp);
        }
      }
      const lastMethodFeeTotal = this.selectedMethods.reduce((total, cur) => {
        const p = cur.price ? multi(cur.price, cur.qty) : 0;
        return add(total, p);
      }, 0);
      const methodData = {
        methodList: this.selectedMethods, // 做法的列表
        publicIsValid: false, // 是否对整单有效
        lastMethodFeeTotal, // 做法加价的总额
      };
      this.$parent.fastFoodChangeMethods(methodData); // 做法更新
    },
    // 修改规格
    selectSize(item, idx) {
      this.newIdSizeId = `${item.item_id}_${item.size_id}`;
      this.orderedNum = this.getOrderedNum(item.item_id, item.size_id);
      // 估清和限量的判断
      if (this.getVuexItemSelloutsMap[this.newIdSizeId]) {
        this.$message.warning('此规格品项已估清!请选择其它规格');
        return;
      }
      const newItem = this.getVuexItemLimitsMap[this.newIdSizeId];
      if (!this.posSettings.isAllowAddOrderWhenLimitZero
      && newItem && sub(newItem.maxLimit, this.orderedNum) < this.editData.num) {
        this.$message.warning('此规格品项已超过限量!请选择其它规格'); // ??
        this.orderedNum = 0;
        return;
      }
      this.updateLimits(item); // 更新限量数据

      if (!this.posSettings.isAllowAddOrderWhenLimitZero && item.restQuantity > 0 && item.restQuantity < 1) {
        this.editData.num = item.restQuantity;
      }
      const itemSizeData = {
        costPrice: item.cost_price,
        isLimit: item.isLimit,
        isPromotePrice: item.isPromotePrice, // 如果存在促销价格 则当前打折状态是4
        isSellout: item.isSellout,
        isDefault: true,
        limitQuantity: item.limit_quantity,
        sizeName: item.name,
        limit: item.restQuantity,
        limitTotal: item.rest_quantity,
        priceType: item.priceType,
        salePrice: item.salePrice,
        oldPrice: item.salePrice, // 取当前规格的销售价格
        sizeId: item.size_id,
        stdPrice: item.std_price,
        num: this.editData.num,
        promoteLimit: item.promoteLimitedQty, // 快餐使用
        unitId: item.unit_id,
        unitName: item.unit_name,
        price: item.std_price,
        discFlg: item.discFlg || (item.isPromotePrice ? 4 : 0),
        promotePrice: item.promotePrice || null,
        memberPrice: item.memberPrice || null,
        isItemTimePrice: item.isItemTimePrice ? item.isItemTimePrice : false,
      };
      this.$parent.updateItemSize(itemSizeData, idx);
    },
    // 更新规格品项的限量
    updateLimits(itemsize, first = false) {
      const oldIdSizeId = `${this.editData.id}_${this.editData.sizeId}`;
      // 首次进来 不限制都要更新
      // 非首次&相同为修改时未更改规格
      if (this.newIdSizeId === oldIdSizeId && !first) return;
      // 不相同, 新老数据重新计算
      let itemLimitsMap = cloneDeep(this.getVuexItemLimitsMap);
      let newItem = itemLimitsMap[this.newIdSizeId];
      let oldItem = itemLimitsMap[oldIdSizeId];
      
      if (newItem) {
        const rest = sub(newItem.maxLimit, this.orderedNum);
        itemsize.restQuantity = sub(rest, this.editData.num);
        newItem.restQuantity = itemsize.restQuantity;
      }
      if (oldItem && !first) {
        const num = this.getOrderedNum(oldItem.itemId, oldItem.sizeId);
        oldItem.restQuantity = sub(oldItem.maxLimit, num);
      }
      if (!this.posSettings.isAllowAddOrderWhenLimitZero
      && newItem && newItem.restQuantity < 0) {
        this.$message.warning('此规格品项已超过限量!请选择其它规格'); // ??
        this.orderedNum = 0;
      }
      if ((newItem && this.newIdSizeId) || oldItem) {
        this.setLimitsMap(itemLimitsMap);
      }
    },
    getOrderedNum(id, sizeId) { // 计算-已点该品项的数量(不包含选中项) 用于限量
      let total = 0;
      total = this.guestList.reduce((t, cur, idx) => {
        if (this.billCurrentIndex === idx) return t;
        if (id === cur.id && sizeId === cur.sizeId) return t + cur.num;
        return t;
      }, 0);
      return total || 0;
    },
    init(from) {
      // console.log('---------init-tilingEdit：', this.billSelected, this.orderedNum, this.editData);
      this.currentClassId = ''; // 默认打开为全部
      this.selectedMethods = [];
      this.priceoRiginal = this.editData.price;
      this.orderedNum = this.getOrderedNum(this.editData.id, this.editData.sizeId);
      // 方法
      this.methodTab = [{ name: '通用做法', type: 'public', isSlected: true }];
      if (this.editData.methodsInfo && this.editData.methodsInfo.privateMethodJson.length) {
        this.methodTab.push({ name: '专用做法', type: 'private', isSlected: false });
      }
      // 如果品项之前有做法,就要回显
      // 套餐里明细的做法的key为method_list 其他的是methodList
      const methodListData = this.editData.method_list ? this.editData.method_list : this.editData.methodList;
      if (methodListData) this.selectedMethods = cloneDeep(methodListData);
      this.publicMethodJson = this.editData.methodsInfo && cloneDeep(this.editData.methodsInfo.publicMethodJson);
      this.currentMethods = this.publicMethodJson || [];
      setTimeout(() => {
        if (this.billSelected) {
          if (this.selectedMethods && this.selectedMethods.length) {
            this.publicMethodJson.forEach((item) => {
              this.$set(item, 'isSlected', false);
              this.selectedMethods.forEach((selectedItem) => {
                if (item.id === selectedItem.id) this.$set(item, 'isSlected', true);
              });
            });
          }
          this.$refs.categoryMethod_public.init();

          // 规格初始化
          if (this.editData.sizeId !== '-1') {
            this.editData.sizeList.forEach((t) => {
              t.is_default = false;
              if (this.editData.sizeId === t.size_id) {
                t.is_default = true;
                this.newIdSizeId = `${t.item_id}_${t.size_id}`;
                this.updateLimits(t, true); // 限量数据重新计算
              }
            });
          }
        }
      }, 0);
    },
  },
  watch: {
    billSelected(state) {
      if (state === 1) this.init(state);
    },
    editData(newVal) {
      if (this.billSelected === 2) {
        this.init(newVal);
      }
    },
  },
};
</script>
<style lang="less" scoped>
/* 平铺展示-鲜果 */
@btnHide-leftW: 306px;
.svgIcon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
.tilingCon {
  width:488px;
  overflow: hidden;
  max-height:100%;
  background: #fff;
  box-shadow:0px 1px 10px 0px rgba(0, 0, 0, 0.75);
  border-radius:6px;
  padding: 0 16px;
  position: absolute;
  left: calc(@btnHide-leftW + 12px);
  top: -18px;
  z-index: 100;
  .eItem {
    display: flex;
  }
  > section {
    border-bottom: 1px dashed #ddd;
    padding: 14px 0;
    font-size:14px;
    color:#333;
    line-height: 36px;
    &:nth-last-of-type(1) { border-bottom: 0; }
    .tit{
      width: 83px;
      font-weight: bold;
    }
    .eItem_price {
      display: flex;
      .mlSpace{ margin-left: 15px; }
    }
    .method_tab {
      width: 400px;
      display: flex;
      li {
        width: 60px;
        margin-right: 30px;
        &.active{ color: #0BABB9; border-bottom: 3px solid #0BABB9; font-weight: bold;}
      }
    }
    .editBtn {
      clear: both;
      margin-top:10px;
      display: flex;
      > li{
        width: 100px;
        height: 40px;
        line-height: 40px;
        border:1px solid #B5B5B5;
        margin-right: 10px;
        text-align: center;
        border-radius: 4px;
        cursor: pointer;
      }
      .gray { background: #eee; cursor:not-allowed; }
    }
    
    .methodCon {
      overflow: hidden;
      margin-top:12px;
      height: 220px;
      border:1px solid #ddd;
      &.methodCon_public{
        display: flex;
        border-left: 0;
      }
      &.methodCon_private {
        padding: 13px 10px 0;
      }
      .category{
        width: 108px;
        background: #eee;
        color:#666;
        text-align: center;
        line-height: 44px;
        .pageList ul {
          li {
            cursor: pointer;
            margin: 0;
            width: 100%;
            height: 44px;
          }
          .active{
            background: #fff;
            color:#333;
          }
        }
      }
      .categoryMethods{
        height: 100%;
        width: calc(100% - 108px);
        padding: 13px 10px 0;
      }
    }

    .btnList .pageList ul {
      li {
        width: 100px;
        height: 40px;
        margin: 0 4px 10px;
        overflow: hidden;
        float: left;
        cursor: pointer;
        &.active{
          button {
            color:#0BABB9;
            background: #DCF9FB;
            border-color:#0BABB9;
          }
        }
        button {
          display: block;
          width: 100%; height: 100%;
          border:0; outline: none;
          border-radius: 4px;
          border: 1px solid #B5B5B5;
          color:#666;
          background: #fff;
          line-height: 1.3;
        }
      }
      .guigeBtn {
        // text-align: left;
        .guigePrice {
          font-size: 12px;
          i { font-style: normal; }
          .itemSellout{
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
            float:right;
          }
        }
      }
      
    }
  }
}
</style>
<style lang="less">
.tilingCon {
  .numberAddDell {
    font-size:16px;
    .count-input { width: 70px;}
  }

  .category .pageSlotBox .pos-pager{
    button{ background: transparent;}
  }
}
</style>
