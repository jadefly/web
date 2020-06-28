<template>
  <div>
    <!-- Transfer": "单品转台", -->
    <Dialog
      name="PosDialog.Transfer"
      :title="$t('Dict.Btn.Transfer')"
      ref="dialog"
      @close="onClose"
      @open="onOpen"
      @submit="tranferSubmit"
      :showSubmit="true"
      width="900px"
      :hotkeys="hotKeySet"
      submitId="singleItemTransferSubmit"
    >
    <div class="item-transfer">
      <div class="current-point">
        <div class="current-point-header">
          <div class="name">{{ $t('Biz.Order.CurrentSeats') }}{{singleItemTransfer.pointName}}</div>
          <div>{{ $t('Dict.OpeningTime') }}{{singleItemTransfer.openTime}}</div>
          <div class="counts">{{ $t('Biz.Order.DinerPersonNumLabel') }}{{singleItemTransfer.peopleQty}}</div>
          <div class="tranIcon" @click="allItemTransfer">
            <img src="~@/common/images/pos/singleItemTransfer/transfer.png" alt="">
          </div>
        </div>
      <div class="current-point-content">
          <div class="current-point-content-info">
            <span class="cheader-item-order"></span>
            <span class="cheader-item-name">{{ $t('Dict.Item') }}</span>
            <span class="cheader-item-number">|&nbsp;&nbsp;{{ $t('Dict.Amount') }}</span>
            <span class="cheader-item-price">|&nbsp;&nbsp;{{ $t('Dict.AuxiliaryUnitQty') }}</span>
            <span class="cheader-item-transfer">|&nbsp;&nbsp;{{ $t('Biz.Order.TransferBtn') }}</span>
          </div>
          <ul class="current-point-content-list" id="currentPointListId">
            <li v-for="(item , index) in filterCurrentItems" :key="index">
              <span class="clist-item-order">{{ index + 1 }}</span>
              <!-- Mixing： 拼 -->
              <span class="clist-item-name">{{ item.mergeScId ? $t('Biz.Order.SpellqtyFoodText') : '' }}<span v-show="item.itemSizeName">({{ item.itemSizeName }})</span>{{ item.name }}</span>
              <span class="clist-item-number">{{ item.lastQty }}{{ item.unitName }}</span>
              <span class="clist-item-price" >
                {{ item.auxiliaryUnitId ? item.auxiliaryUnitQty+item.auxiliaryUnitName : '' }}
              </span>
              <span class="clist-item-transfer" @click="itemTransfer(item, index)" :id="'singleItemTransferConfirm' + index"  v-autotest>
                <img src="~@/common/images/pos/singleItemTransfer/transfer.png" alt="">
              </span>
              <p v-if="item.methodText" class="methodText">{{ $t('Dict.Notes01') }}{{ item.methodText }}</p>
            </li>
          </ul>
      </div>
        <div class="current-point-footer">
          <div class="current-point-footer-search">
            <Search v-model="keyword" searchId="singleItemTransferSearch"></Search>
          </div>
          <div class="current-point-footer-pager">
            <Pager
            pagerId="currentPointListId"
            itemTag="li"
            :showInfo = "true"
            ref="leftPager"
            scrollMode="simple"
            arrowDirection="up-down"></pager>
          </div>
        </div>
      </div>
      <div class="transfer-point">
        <div class="transfer-point-header">
          <!-- "TransferSeats": "转台客位：", -->
          <div class="name">
            {{$t('Biz.Order.TransferSeats')}}{{singleItemTransfer.toPointName ? (singleItemTransfer.toPointName.split('-')[1] ? singleItemTransfer.toPointName.split('-')[1]: singleItemTransfer.toPointName) : singleItemTransfer.toPointName}}
          </div>
          <div>{{ $t('Dict.OpeningTime') }}{{singleItemTransfer.toOpentime}}</div>
          <div class="counts">{{ $t('Biz.Order.DinerPersonNumLabel') }}{{singleItemTransfer.toPeopleqty}}</div>
          <div class="tranIcon" @click="allRevokeTransfer">
            <img src="~@/common/images/pos/singleItemTransfer/repeal.png" alt=""/>
          </div>
        </div>
        <div class="transfer-point-content">
          <div class="transfer-point-content-info">
            <span class="theader-item-order"></span>
          <span class="theader-item-name">{{ $t('Dict.Item') }}</span>
          <span class="theader-item-number">|&nbsp;&nbsp;{{ $t('Dict.Amount') }}</span>
          <span class="theader-item-price">|&nbsp;&nbsp;{{ $t('Dict.AuxiliaryUnitQty') }}</span>
          <!-- "CancelTf": "撤销" -->
          <span class="theader-item-repeal">|&nbsp;&nbsp;{{ $t('Dict.Revoke') }}</span>

          </div>
          <ul class="transfer-point-content-list" id="transferPointListId">
            <li v-for="(item , index) in transferItems" :key="index">
              <span class="tlist-item-order">{{ index + 1}}</span>
              <span class="tlist-item-name">
                <span v-show="item.itemSizeName">({{ item.itemSizeName }})</span>
                {{ item.name }}
              </span>
              <span class="tlist-item-number">{{ item.lastQty }}{{ item.unitName }}</span>
              <span class="tlist-item-price">
                {{ item.auxiliaryUnitId ? item.auxiliaryUnitQty+item.auxiliaryUnitName : '' }}
              </span>
              <span class="tlist-item-repeal" @click="revokeTransfer(item,index)">
                <img src="~@/common/images/pos/singleItemTransfer/repeal.png" alt=""/>
              </span>
              <p v-if="item.methodText" class="methodText">{{ $t('Dict.Notes01') }}{{ item.methodText }}</p>
            </li>
          </ul>
        </div>
        <div class="transfer-point-footer">
          <div class="transfer-point-footer-pager">
            <Pager
            pagerId="transferPointListId"
            itemTag="li"
            scrollMode="simple"
            :showInfo = "true"
            arrowDirection="up-down"
            ref="rightPager"
            ></pager>
          </div>
        </div>
      </div>
    </div>
    </Dialog>
    <Dialog
      name="PosDialog.Transfer.ChangNum"
      @open="changeNumOpen"
      @submit="submitChangeNum"
      ref="changeNumDialog"
      title="单品转台-设定转移数量"
      :showSubmit="true"
      width="518px"
      submitId="TransferChangNumSubmit"
    >
      <div class="changeNumLeftDiv" v-keyboard:keyboard="{ mode: 'simple', autoSelect: true }">
        <!-- "ExistingNum": "现有数量: ", -->
        <p class="nowCount">{{ $t('Biz.Order.ExistingNum', [changeNumItem.num]) }}</p>
        <div class="changeCount">
          <!-- "TransferNum": "转移数量：" -->
          <label>{{ $t('Biz.Order.TransferNum') }}</label>
          <div class="countBox">
            <span @click="numHandle('-')">-</span>
            <input
              v-judge
              v-autotest
              id="TransferChangNumInput"
              class="changeNum"
              ref="changeNum"
              type="text"
              v-model.trim="changeNumItem.changeNum"
            />
            <span @click="numHandle('+')">+</span>
          </div>
          <span>{{ changeNumItem.unitName }}</span>
        </div>
        <p class="nowCount" v-if="changeNumItem.auxiliaryUnitId">
          {{ $t('Biz.Order.ExistingNum', [changeNumItem.auxNum]) }}
        </p>
        <div class="changeCount" v-if="changeNumItem.auxiliaryUnitId">
          <!-- "TransferNum": "转移数量：" -->
          <label>{{ $t('Dict.AuxiliaryAmountLabel') }}</label>
          <div class="countBox" :class="+changeNumItem.changeNum === +changeNumItem.num ? 'count-disabled': ''">
            <span @click="numAuxHandle('-')">-</span>
            <input
              v-judge
              v-autotest
              id="TransferChangNumInputAux"
              class="changeNumAux"
              ref="changeNumAux"
              type="text"
              v-model.trim="changeNumItem.changeAuxNum"
              @input="changeAuxNum"
            />
            <span @click="numAuxHandle('+')">+</span>
          </div>
          <span>{{ changeNumItem.auxiliaryUnitName }}</span>
        </div>
      </div>
      <div class="changeNumRightDiv">
          <div class="ordering-changeprice-keyboard">
            <KeyBoard ref="keyboard"></KeyBoard>
          </div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';
import Search from '@/components/Pos/Order/Tables/Search';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import quickSearch from '@/common/js/quicksearch';
import { add, sub } from '@/common/js/math';
import { cloneDeep } from 'lodash';

export default {
  components: {
    Dialog, Pager, Search, KeyBoard,
  },
  mixins: [DialogMixin],
  data() {
    return {
      currentItems: [], // 品项列表信息
      initcurrentItems: [], // 弹框打开初始时右侧的数据
      singleItemTransfer: {}, // 所有数据
      transferItems: [], // 转入的品项
      activeItem: {}, // 点击操作的当前数据
      changeNumItem: {}, // 选数量弹框的数据库
      keyword: '', // 搜索的关键字
      noFixedMethodPriceType: 1, // 品项做法的价格类型 1为固定加价
      fixedMethodPriceType: 2, // 品项做法的价格类型 2为联动随着品项数量加价
    };
  },
  computed: {
    // 过滤后的左侧列表
    filterCurrentItems() {
      const keywordList = quickSearch(this.keyword);
      return this.currentItems.filter((item) => {
        if (keywordList.length === 0) { return true; }
        return keywordList.find(keyword => item.pinyin.indexOf(keyword.toUpperCase()) >= 0 || item.code.indexOf(keyword.toUpperCase()) >= 0);
      });
    },
    hotKeySet() {
      return {
        PgDn: () => {
          this.tranferSubmit();
        },
      };
    },
  },
  updated() {
    if (this.$refs.rightPager) {
      this.$refs.rightPager.refresh();
    }
    if (this.$refs.leftPager) {
      this.$refs.leftPager.refresh();
    }
    // if (this.$refs.changeNum) {
    //   this.$refs.changeNum.focus();
    // }
  },
  methods: {
    onOpen() {
      this.keyword = '';
      this.transferItems = [];// 初始化下被转的品项列表
      this.singleItemTransfer = cloneDeep(this.resData);
      if (this.resData.serviceContents) {
        this.initcurrentItems = cloneDeep(this.resData.serviceContents);
        this.currentItems = this.singleItemTransfer.serviceContents;
      }
      this.$vonce('authCode', (code) => {
        this.tranferSubmit(code);
      });
    },
    changeAuxNum(val) {
      const taleNumTest = /^[1-9]\d*$/g;
      const vuxval = val.target.value;
      if (!taleNumTest.test(vuxval)) {
        this.$message.warning(this.$t('Dict.Validate.NumberMessage')); // 请输入正确数量
        this.$set(this.changeNumItem, 'changeAuxNum', vuxval.toString().substr(0, vuxval.toString().length - 1));
      }
    },
    // 左侧菜品转台点击事件
    itemTransfer(item) {
      // 判断数量是否大于1 的如果大于就弹出选择数量的框
      // isNotFollowAmount判断此套餐是否是联动,isNotFollowAmount为true的时候是不联动要置灰色 只要选中就是全选
      if (item.lastQty > 1 && !item.isNotFollowAmount) {
        this.activeItem = item;
        this.$refs.changeNumDialog.open();
        return;
      }
      this.transferItems = this.transferFn(this.transferItems, item, true);
      // 匹配 当前点击项, 从currentItems(总数据中)删除
      // this.currentItems.map((_item, _index, _arr) => {
      //   if (+_item.scId === +item.scId) {
      //     _arr.splice(_index, 1);
      //   }
      //   return _item;
      // });
      this.currentItems = this.currentItems.filter(currentItem => currentItem.scId !== item.scId);
      // 分页刷新
      this.$refs.rightPager.refresh();
      this.$refs.leftPager.refresh();
    },
    // isTransfer 转移的为true 撤销的为false或者undefind
    transferFn(items, activeItem, isTransfer) {
      // isNewItem是否为新的
      let isNewItem = false;
      items.forEach((currentItem) => {
        // 找到已存在的合并，否则新添加
        if (currentItem.scId === activeItem.scId) {
          if (isTransfer && activeItem.methodList && activeItem.methodList.length) {
            currentItem.methodText = activeItem.methodText;
          }
          this.$set(currentItem, 'lastQty', add(currentItem.lastQty, activeItem.lastQty));
          if (currentItem.auxiliaryUnitId) {
            this.$set(currentItem, 'auxiliaryUnitQty', add(currentItem.auxiliaryUnitQty, activeItem.auxiliaryUnitQty));
          }
          isNewItem = true;
        }
      });
      if (!isNewItem) {
        items.push(activeItem);
      }
      return items;
    },
    // 全部品项转台事件
    allItemTransfer() {
      // slice(0) 数组的深度拷贝 concat()
      // es6 数组拷贝
      // 左侧转到右侧: 当前过滤出的结果
      if (this.currentItems.length) {
        // 逐个添加过滤后结果, 不会丢失已转移品项
        this.filterCurrentItems.map((_) => {
          this.transferItems = this.transferFn(this.transferItems, _, true);
          return _;
        });
        // 清空所有
        this.currentItems.splice(0, this.currentItems.length);
      }

      // this.transferItems = this.initcurrentItems.slice(0)
      // let beginIndex = this.transferItems.length
      // this.transferItems.splice(beginIndex,0,this)
    },
    // 撤销转台事件
    revokeTransfer(item, index) {
      // 右侧数据删除
      this.transferItems.splice(index, 1);
      // 左侧添加数据
      this.currentItems = this.transferFn(this.currentItems, item);
    },
    // 全部撤销事件
    allRevokeTransfer() {
      if (this.transferItems.length) {
        // 给左侧数据 初始最全的数据
        // [...this.currentItems] = this.initcurrentItems;
        this.currentItems = cloneDeep(this.initcurrentItems);
        // 清空右侧列表
        this.transferItems.splice(0, this.transferItems.length);
      }
    },
    // 修改数量的弹框打开事件
    changeNumOpen() {
      console.log(this.activeItem);
      this.changeNumItem = {
        num: this.activeItem.lastQty,
        changeNum: this.activeItem.lastQty,
        unitName: this.activeItem.unitName,
        auxNum: this.activeItem.auxiliaryUnitQty,
        auxiliaryUnitId: this.activeItem.auxiliaryUnitId,
        changeAuxNum: this.activeItem.auxiliaryUnitQty,
        auxiliaryUnitName: this.activeItem.auxiliaryUnitName,
      };
      // 添加辅助单位数据
      setTimeout(() => {
        // 输入框 全选中 输入内容
        if (this.$refs.keyboard) {
          this.$refs.keyboard.reSelect();
        }
      }, 0);
    },
    // - + 按钮事件
    numHandle(btnName) {
      if (btnName === '-') {
        if (+this.changeNumItem.changeNum === 0) {
          return;
        }
        this.changeNumItem.changeNum = sub(this.changeNumItem.changeNum, 1);
      } else {
        if (this.changeNumItem.changeNum === this.changeNumItem.num) {
          // 如果数值为最大话 辅助单位也为最大
          if (this.changeNumItem.auxiliaryUnitId) {
            this.changeNumItem.changeAuxNum = this.changeNumItem.auxNum;
          }
          return;
        }
        this.changeNumItem.changeNum = add(this.changeNumItem.changeNum, 1);
      }
    },
    // 辅助代码的加减事件auxNum
    numAuxHandle(btnName) {
      if (btnName === '-') {
        if (+this.changeNumItem.changeAuxNum === 1) {
          return;
        }
        this.changeNumItem.changeAuxNum = sub(this.changeNumItem.changeAuxNum, 1);
        console.log();
      } else {
        if (this.changeNumItem.changeAuxNum === this.changeNumItem.auxNum) {
          // 如果辅助数量为最大 主数量也需要为最大
          this.changeNumItem.changeNum = this.changeNumItem.num;
          return;
        }
        this.changeNumItem.changeAuxNum = add(this.changeNumItem.changeAuxNum, 1);
      }
    },
    // 修改数量的弹框, 确认事件
    submitChangeNum() {
      // "TransferErrorMsg": "转移数量格式不对",
      if (!Number(this.changeNumItem.changeNum)
      || (this.changeNumItem.auxiliaryUnitId && !Number(this.changeNumItem.auxNum))
      ) {
        this.$message.error(this.$t('Biz.Order.TransferErrorMsg'));
        return;
      }
      if (`${this.changeNumItem.auxNum}`.indexOf('.') !== -1 && this.changeNumItem.auxiliaryUnitId) {
        this.$message.error(this.$t('Biz.Order.TransferErrorMsg04'));
        return;
      }
      // 添加 this.changeNumItem.changeNum 格式转换: 参数为Number时, indexOf语法报错,会中断js执行
      if ((`${this.changeNumItem.changeNum}`).indexOf('.') !== -1) {
        if (!String(this.changeNumItem.changeNum).split('.')[0].length) {
          this.$message.error(this.$t('Biz.Order.TransferErrorMsg'));
          return;
        }
        if (String(this.changeNumItem.changeNum).split('.')[1].length > 3) {
          // "TransferErrorMsg01": "转移数量小数点后保留3位",
          this.$message.error(this.$t('Biz.Order.TransferErrorMsg01'));
          return;
        }
      }

      if (this.changeNumItem.changeNum <= 0) {
        // "TransferErrorMsg02": "转移数量必须大于0",
        this.$message.error(this.$t('Biz.Order.TransferErrorMsg02'));
        return;
      }

      if (this.changeNumItem.changeNum > this.changeNumItem.num
      || (this.changeNumItem.auxiliaryUnitId && this.changeNumItem.changeAuxNum > this.changeNumItem.auxNum)) {
        // "TransferErrorMsg03": "转移数量不能超过现有数量"
        this.$message({
          type: 'error',
          message: this.$t('Biz.Order.TransferErrorMsg03'),
        });
        return;
      }
      if (
        this.changeNumItem.auxiliaryUnitId
        && ((+this.changeNumItem.changeNum === +this.changeNumItem.num
         && this.changeNumItem.changeAuxNum !== +this.changeNumItem.auxNum)
         || (
           +this.changeNumItem.changeNum !== +this.changeNumItem.num
            && this.changeNumItem.changeAuxNum === +this.changeNumItem.auxNum
         ))
      ) {
        this.$message({
          type: 'error',
          message: this.$t('Biz.Order.TransferErrorMsg04'),
        });
        return;
      }
      // 修改的数小于现有的数
      if (this.changeNumItem.changeNum < this.changeNumItem.num) {
        this.$set(this.activeItem, 'lastQty', this.changeNumItem.num - this.changeNumItem.changeNum);
        // 设置下辅助数量

        this.$set(this.activeItem, 'auxiliaryUnitQty', this.changeNumItem.auxNum - this.changeNumItem.changeAuxNum);
        const newChangeItem = cloneDeep(this.activeItem);
        // 判断是否还有固定加价做法，如果存在部分转台的时候不显示做法
        if (this.itemMethodTypeFn(newChangeItem) === this.fixedMethodPriceType) {
          this.$delete(newChangeItem, 'methodText');
        }
        this.$set(newChangeItem, 'auxiliaryUnitQty', this.changeNumItem.changeAuxNum);
        this.$set(newChangeItem, 'lastQty', this.changeNumItem.changeNum);
        this.transferItems = this.transferFn(this.transferItems, newChangeItem, true);
      } else if (+this.changeNumItem.changeNum === +this.changeNumItem.num) {
        // 修改的数等于现有的数
        this.transferItems = this.transferFn(this.transferItems, this.activeItem, true);
        const index = this.currentItems.indexOf(this.activeItem);
        this.currentItems.splice(index, 1);
      }
      this.$refs.changeNumDialog.close();
    },
    // 判断品项做法是否是固定加价还是随着品项数量加价1 : 联动, 2: 固定加价
    itemMethodTypeFn(item) {
      const methodPriceType = { type: this.NoFixedMethodPriceType };
      if (item.methodList && item.methodList.length) {
        if (item.methodList.some(value => !value.isRelaCount && value.price)) {
          methodPriceType.type = this.fixedMethodPriceType;
        }
      }
      return methodPriceType.type;
    },
    // 确认事件
    tranferSubmit(authData = {}) {
      if (!this.transferItems.length) {
        // "PlsSelectItem": "请选择要操作的品项"
        this.$message.error(this.$t('Biz.Order.PlsSelectItem'));
        return;
      }
      const items = [];
      this.transferItems.forEach((item) => {
        items.push({
          itemId: item.itemId, // itemId
          itemSizeId: item.itemSizeId, // 规格id
          qty: item.lastQty, // 数量
          scId: item.scId, // 服务id
          isNotFollowAmount: !!item.isNotFollowAmount, // 针对套餐isNotFollowAmount 为true是不联动否则为联动
          auxiliaryUnitId: item.auxiliaryUnitId,
          auxiliaryUnitQty: item.auxiliaryUnitQty,
          auxiliaryUnitName: item.auxiliaryUnitName,
        });
      });
      const params = {
        bsId: this.singleItemTransfer.bsId, //
        fromPointId: this.singleItemTransfer.fromPointId, // 品项转出客位的id
        items, // 要进行操作的品项列表
        modify_time: +new Date(this.singleItemTransfer.modify_time.replace('T', ' ')), // 时间戳
        pointId: this.singleItemTransfer.pointId, // 客位id
        teamFlg: this.singleItemTransfer.is_team, // 团队标识
        toPointBsCode: this.singleItemTransfer.toPointBsCode,
        ...authData,
      };
      const options = {
        params,
        url: '/tranitem/tranitemv2', // url
      };
      // 请求接口
      ajax('canyin.pos.tranItem.tranItem', {
        contentType: 'paramsEncoded',
        data: params,
      }).then((res) => {
        if (+res.data.result === 1) {
          this.$message({
            type: 'success',
            message: res.data.data.msg,
          });
          // 关闭窗口
          this.close();
          // 执行刷新客位账单
          this.$vemit('loadBill', res.data.data.pointId);
          // 刷新客位显示
          this.$vemit('updatePoint');
        } else {
          this.$message({
            type: 'error',
            message: res.data.msg,
          });
        }
      });
    },

  },
  // 监听修改数量的值
  watch: {
    // 'changeNumItem.changeNum': function (val, oldVal) {
    //   //对输入的数据进行判断
    //   if(/[^\d]/g.test(val)){

    //     }else {
    //        this.$message({
    //         type: 'error',
    //         message: '请输入数字'
    //     })
    //   }
    // }
  },

};
</script>


<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.item-transfer::after {
  content: "";
  display: block;
  clear: both;
}
.item-transfer {
  background-color: #fff;

  > .current-point {
      width: 451px;
      float: left;
      box-shadow: 8px 0px 8px 0px #d8d8d8;

    > .current-point-header {
        display: flex;
        border-bottom: 1px solid #b5b5b5;
        line-height: 48px;
        height: 48px;
        padding-left: 16px;
        padding-right: 16px;
        position: relative;
      > div {
          margin-right: 8px;
          font-size: 14px;
          font-weight: 400;
      }
      > div.name{
        max-width: 143px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      > div.counts{
        margin-right: 0;
      }
      >.tranIcon {
        position: absolute;
        right: 22px;
        width: 48px;
        text-align: center;
        cursor: pointer;
        margin-right: 17px;
      }
    }
    > .current-point-content {
        height: 451px;
        padding: 4px 14px 0px 14px;

      > .current-point-content-info {
          height: 24px;
          line-height: 24px;
          background-color: #7bcad6;
        > span {
            display: inline-block;
            text-align: left;
            font-size: 13px;
            color: #fff;
        }

        > .cheader-item-order {
          width: 8%;
        }
        > .cheader-item-name {
          width: 35%;
        }
        > .cheader-item-number {
          width: 15%;
        }
        > .cheader-item-price {
          width: 21%;
        }
        > .cheader-item-transfer {
          width: 17%;
        }
      }

      > .current-point-content-list {
        height: 392px!important;
        overflow-x: hidden;

        > li {
          border-bottom: 1px solid #b5b5b5;

          > span {
            max-height: 48px;
            vertical-align: middle;
            font-size: 14px;
            font-weight: 600;
            display: inline-block;
            overflow: hidden;
          }
          > .clist-item-order{
              width: 8%;
              height: 48px;
              line-height: 48px;
              text-align: center;
          }
          > .clist-item-name{
              width: 35%;
          }
          > .clist-item-number{
              padding-left:10px;
              width: 15%;
          }
          > .clist-item-price{
              padding-left:10px;
              width: 21%;
          }
          > .clist-item-transfer{
              cursor: pointer;
              padding-left:10px;
              width: 17%;
           > img {
              width: 28px;
              height: 28px;

           }
          }
        }
      }
    }
    .current-point-footer::after{
      content: "";
      display: block;
      clear: both;
    }
    > .current-point-footer {
      height: 54px;
      padding: 10px 16px;

      > .current-point-footer-search {
        position: relative;
        background-color: #dddddd;
        float: left;
        border-radius: 18px;
      }

      > .current-point-footer-pager{
        float: right;
      }
    }
  }

  > .transfer-point {
    margin-left: 451px;

    > .transfer-point-header {
      border-bottom: 1px solid #b5b5b5;
      line-height: 48px;
      height: 48px;
      margin-left: 16px;
      margin-right: 16px;
      position: relative;
      display: flex;
      > div {
        margin-right: 8px;
        font-size: 14px;
        font-weight: 400;
      }
      > div.name{
        max-width: 143px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      > div.counts{
        margin-right: 0;
      }
      >.tranIcon {
        position: absolute;
        right: 10px;
        width: 48px;
        text-align: center;
        cursor: pointer;
        margin-right: 17px;
      }
    }

    > .transfer-point-content {
      height: 451px;
      padding: 4px 14px 0px 14px;

      > .transfer-point-content-info {
        height: 24px;
        line-height: 24px;

        background-color: #7bcad6;

        > span {
          display: inline-block;
          text-align: left;
          font-size: 13px;
          color: #fff;
        }

        > .theader-item-order {
          width: 8%;
        }
        > .theader-item-name {
          width: 35%;
        }
        > .theader-item-number {
          width: 15%;
        }
        > .theader-item-price {
          width: 21%;
        }
        > .theader-item-repeal {
          width: 17%;

        }
      }

      > .transfer-point-content-list {
        height: 392px;
        overflow-x: hidden;

        > li {
          border-bottom: 1px solid #b5b5b5;
          > span {
            max-height: 48px;
            vertical-align: middle;
            font-size: 14px;
            font-weight: 600;
            display: inline-block;
            overflow: hidden;
          }

          > .tlist-item-order{
               width: 8%;
               height: 48px;
               line-height: 48px;
               text-align: center;
          }
          > .tlist-item-name{
              width: 35%;
          }
          > .tlist-item-number{
            padding-left:10px;
            width: 15%;
          }
          > .tlist-item-price{
            padding-left:10px;
            width: 21%;
          }
          > .tlist-item-repeal{
            padding-left:10px;
            width: 17%;
            cursor: pointer;
            > img {
             width: 28px;
             height: 28px;

           }

          }
        }
      }
    }
    > .transfer-point-footer {
      height: 54px;
      height: 54px;
      padding: 10px 16px;
      text-align: right;
    }
  }
}
.changeNumLeftDiv {
    width: 316px;
    float: left;
    height: 266px;
    background: #fff;
    padding: 10px;
    padding-right: 5px;
    padding-top: 23px;
  >p{
    font-size: 16px;
    font-weight: bold;
    color: #666;
    margin-bottom: 20px;
  }
  >.changeCount {
    position: relative;
    >label {
      line-height: 48px;
      height: 48px;
      font-size: 16px;
      color: #666;
    }
    >span {
      width: 50px;
      position: absolute;
      top: 14px;
      right: 0px;
      overflow: hidden;
      white-space: nowrap;
    }
    >.countBox {
      float: right;
      height: 40px;
      line-height: 40px;
      margin-top: 4px;
      border: 1px solid #ddd;
      position: absolute;
      left: 80px;
      top: 0px;
      &.count-disabled{
        pointer-events: none;
        opacity: 0.5;
      }
      >input {
        width: 63px;
        height: 36px;
        border: none;
      }
      >span {
        display: inline-block;
        width: 42px;
        text-align: center;
        cursor: pointer;
      }
      >span:nth-of-type(1) {
        border-right: 1px solid #ddd;
      }
      >span:nth-of-type(2) {
        border-left: 1px solid #ddd;
      }
    }
  }
}
.changeNumRightDiv {
  width: 194px;
  float: right;
  background: #fff;
  padding-top: 10px;
  height: 266px;
  position: absolute;
  right: 0px;
}
// .changeNum {
//       >input::-webkit-outer-spin-button,
//     >input::-webkit-inner-spin-button {
//       -webkit-appearance: none;
//     }
//     >.form-number{
//       -moz-appearance: textfield;
//     }
// }
.methodText {
  padding-left: 8%;
}
.lang-enUS{
  .item-transfer {
    > .current-point {
      > .current-point-header {
        display: flex;
        border-bottom: 1px solid #b5b5b5;
        line-height: 48px;
        height: 48px;
        padding-left: 16px;
        padding-right: 16px;
        position: relative;
        font-size: 12px;
        > div {
          margin-right: 8px;
          font-size: 12px;
          font-weight: 400;
        }
      }
    }
    > .transfer-point {
      > .transfer-point-header {
        border-bottom: 1px solid #b5b5b5;
        line-height: 48px;
        height: 48px;
        margin-left: 16px;
        margin-right: 16px;
        position: relative;
        display: flex;
        font-size: 12px;
        > div {
          margin-right: 8px;
          font-size: 12px;
          font-weight: 400;
        }
      }
    }
  }
}
</style>
