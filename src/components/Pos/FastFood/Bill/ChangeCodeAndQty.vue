<template>
  <Dialog
    name="PosDialog.changeCodeAndQty"
    :title="titleTxt"
    ref="dialog"
    :class="posSettings.isOpenBuffetDeposit?'isBuffetOpen':''"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :append-to-body="true"
    :showSubmit="true"
    width="555px"
    :hotkeys="hotkeys"
  >
    <div class="content payway-check-modal">
      <div class="form" v-keyboard:keyboard="{ autoSelect: true }">
        <div v-show="isShowOrderCode" class="money-item">
          <label class="item-title">{{ $t('Dict.OrderCode01') }}</label>
          <div class="item-content">
            <el-input class="text-right"
              v-judge
              :placeholder="$t('Biz.Order.CodePlaceholder')"
              v-model="orderCode"
              onkeyup="value=value.replace(/[^\d]/g,'')"
              :maxlength="4"></el-input>
          </div>
        </div>
        <!--非自助餐-->
        <template v-if="posSettings.isOpenBuffetDeposit===0">
          <div class="money-item">
            <label class="item-title">{{ $t('Dict.NumberOfPeople') }}: </label>
            <div class="item-content">
              <el-input class="text-right"
                v-judge
                :placeholder="$t('Biz.Order.PeoplePlaceholder')"
                v-model="peopleQty"
                size="medium"
                :maxlength="maxLength"></el-input>
            </div>
          </div>
          <div class="m_lr orderCodeAndQtyWrap">
            <p class="orderCodeAndQtyTitle">{{$t('Biz.Order.SalesType01')}}</p>
            <div class="orderCodeAndQtyBox">
              <span
                :class="{active: sale.activeIndex == index}"
                v-for="(item, index) in sale.name"
                :key="index"
                v-show=" (baseData && baseData.saleTypeVal) ? index < 2 : index < 3"
                @click="saleToggle(index)"
                >{{ item }}</span>
            </div>
          </div>
          <!-- 桌号 -->
          <div class="m_lr table-number" v-show="baseData.bsOrderCodeMode === '4'">
            <label class="item-title">{{ $t('Dict.TableCode') }}：</label>
            <div class="item-content">
              <el-input
                type="textarea"
                :rows="4"
                :placeholder="$t('Dict.EnterSomething')"
                v-judge
                v-autotest
                v-model="tableCode">
              </el-input>
            </div>
          </div>
          <button
            type="button"
            class="btn btn-default handWritingBtn"
            @click="handWriting"
            v-hideHandwritingBoard
            v-if="baseData.bsOrderCodeMode === '4'"
          >
            <i class="icon icon-edit"></i>
            <span>{{ $t('Dict.WritingPad') }}</span>
          </button>
        </template>
        <!--自助餐-->
        <template v-else>
          <PagerSlot class="buffetUl"
            :style="{height: eaters.length>5?'290px':'auto'}"
            type="scroll"
            :listAll="eaters" :pageSize="pageSize" :paginationShow="paginationShow" :paginationBtnShow="eaters.length>5">
            <template slot="list" slot-scope="scope">
              <li v-for="(eater, index) in scope.showList" :key="eater.id">
                <label class="item-title" :for="eater.id+'_'+index">{{eater.name}}:</label>
                <input type="text" class="txt_default" autocomplete="off"
                  disabled="true"
                  :placeholder="$t('Biz.Order.PeoplePlaceholder')"
                  v-model="eater.eaterQty"
                  :id="eater.id+'_'+index" />
                <!-- <button class="selectBtn" @click="editPrice(eater, index)" v-if="eater.guestPriceItems.length>0">
                  {{eater.itemName}}
                  <i class="icon icon-edit"></i>
                </button> -->
              </li>
            </template>
          </PagerSlot>
          <div class="m_lr form-group">
            <label class="item-title" for="idDeposit">{{ $t('Dict.Btn.Deposit') }}:</label>
            <input id="idDeposit" type="text" class="txt_default txt_dep" autocomplete="off"
            :disabled="posSettings.isOpenDepositSet===1"
            :placeholder="$t('Biz.Pos.More.DepositMsg3')"
            v-model="deposit" @input="InputDeposit">
          </div>
        </template>

      </div>
      <div class="info-keybord">
        <KeyBoard class="keybord" ref="keyboard"></KeyBoard>
      </div>
    </div>
    <!-- <EditGuestPrice ref="refEditPrice"></EditGuestPrice> 客人价格选择-品项选择 -->
  </Dialog>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';
import _ from 'lodash';
import ajax from '@/common/js/ajax';
import { getByteLength } from '@/common/js/math';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import numberformat from '@/common/js/numberformat';
import PageMixin from '@/common/util/PaginationMixin';
import { decimal } from '@/common/util/RegExpCheck';

const PagerSlot = () => import('@/components/Pos/Common/PagerSlot');
const EditGuestPrice = () => import('@/components/Pos/Order/Tables/EditGuestPrice');

export default {
  components: {
    Dialog, KeyBoard, PagerSlot, EditGuestPrice,
  },
  mixins: [DialogMixin, PageMixin],
  data() {
    return {
      titleTxt: this.$t('Biz.Order.ModifyCodeTitle'),
      baseData: '', // 打开页面后传递的基础数据
      orderCode: 1,
      peopleQty: '',
      eaters: [], // 客人类型数据集
      deposit: '', // 押金金额
      pageSize: 5, // 客人类型页面显示个数 多于5个翻页
      paginationShow: false,
      paginationBtnShow: false,
      maxLength: 6,
      isShowOrderCode: true,
      // 堂食,外带,外卖模式
      sale: {
        name: [],
        activeIndex: 0,
      },
      tableCode: '', // 桌号输入文本
      closeHandWriting: false, // 是否关闭手写板
    };
  },
  computed: {
    ...mapState('fastFood', [
      'isContainKDS',
      'buffetDeposit',
    ]),
    ...mapGetters(['posBaseInfo', 'posSettings', 'getFastFoodBillData']),
    // 添加快捷键
    hotkeys() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  methods: {
    ...mapMutations('fastFood', [
      'setOrderCode',
      'setPeopleQty',
      'SetSaleActiveState',
      'setBuffetDeposit',
    ]),
    ...mapMutations({
      setFastFoodBillData: 'SET_FASTTFOODBILL_DATA',
    }),
    onOpen() {
      // console.log('pointbsinfov2:', this.getFastFoodBillData)
      this.baseData = this.resData; // this.resData父组件通过回调传递的页面基础数据
      // 根据传入数据 联动显示父组件数据状态
      // 如果设置了结算完后自动生成牌号话牌号默认为空
      if (this.baseData.bsOrderCodeMode === '4') {
        this.orderCode = '';
      } else {
        this.orderCode = (this.resData.orderCode === '' || this.resData.orderCode === undefined) ? 1 : this.resData.orderCode;
      }
      // 桌号内容
      this.tableCode = this.getFastFoodBillData.bsData.tableCode || '';
      this.peopleQty = this.resData.peopleQty;
      this.sale.name = this.baseData.name;
      this.sale.activeIndex = this.baseData.saleActiveState;
      // 输入框 全选中 输入内容
      setTimeout(() => {
        // 如果开启了结算自动后自动生成牌号，光标在桌号输入框
        if (this.$refs.tableNumber && this.baseData.bsOrderCodeMode === '4') {
          this.$refs.tableNumber.focus();
        } else if (this.$refs.keyboard) {
          this.$refs.keyboard.reSelect();
        }
      }, 100);
      // 后台配置 牌号可编辑状态
      if (
        // 如果 牌号设置'自动',后者是结算自动生成牌号 不可能改牌号
        this.baseData.bsOrderCodeMode === '1'
        || this.baseData.bsOrderCodeMode === '4'
        // 如果 牌号设置'手动和自动', 且切换到外带或外卖时, 不可改牌号
        || (this.baseData.bsOrderCodeMode === '3' && this.baseData.saleActiveState != 0)
        // 开启kds，牌号设置'手动'，无kds方案品项时，号牌不可编辑
        || (this.posBaseInfo.isGenerMarkToKDS && !this.isContainKDS && this.baseData.bsOrderCodeMode === '2')
      ) {
        this.titleTxt = this.$t('Biz.Order.ModifyCodeTitle1');
        this.isShowOrderCode = false;
      } else {
        this.titleTxt = this.$t('Biz.Order.ModifyCodeTitle');
        this.isShowOrderCode = true;
      }
      // 自助餐-客人类型&押金
      if (this.posSettings.isOpenBuffetDeposit) {
        this.eaters = _.cloneDeep(this.getFastFoodBillData.bsData.eaters); // 客人类型数据集 ??
        this.deposit = this.buffetDeposit;
      }

      // 解决自助餐中接口数据动态创建的input，数据慢小键盘失效的问题
      setTimeout(() => {
        if (this.$refs.keyboard) this.$refs.keyboard.reSelect();
      }, 0);
    },
    onClose() {
      if (this.closeHandWriting) {
        this.$devices.Handwriting.close();
      }
      this.closeHandWriting = false;
    },
    // 堂食外卖外带模式切换
    saleToggle(index) {
      this.sale.activeIndex = index;
      // 重新聚焦 当前显示的输入框(前提时 牌号的显示必须用v-if处理)
      setTimeout(() => {
        this.$refs.keyboard.reSelect();
      }, 40);
      // 牌号设置-'自动': 堂食,外带均为接口数据更新牌号
      if (this.baseData.bsOrderCodeMode == '1') {
        this.loadNewOrderCode((data) => {
          this.orderCode = data;
        });
        this.isShowOrderCode = false;
      } else if (this.baseData.bsOrderCodeMode == '2') {
      // 牌号设置-'手动': 所有销售类型均不更新,使用手动填入牌号
        this.isShowOrderCode = true;
        // 如果存在牌号切换的时候不更新牌号,不存在直接设为1
        this.orderCode = this.orderCode || 1;
      } else if (this.baseData.bsOrderCodeMode == '3') {
      // 牌号设置-'自动+手动': 外带外卖均为接口数据更新牌号, 堂食需要手动设置赋值为 ''空
        if (index == 0) {
          this.isShowOrderCode = true;
          this.orderCode = 1;
        } else {
          this.isShowOrderCode = false;
          this.loadNewOrderCode((data) => {
            this.orderCode = data;
          });
        }
      }
    },
    // 查询后台设置的牌号接口
    loadNewOrderCode(callback) {
      ajax('canyin.pos.bill.findautoordercode', {
        params: {
          bsId: this.baseData.id,
        },
      }).then((data) => {
        callback && callback(data);
      });
    },
    // 手写键盘功能按钮
    handWriting() {
      this.closeHandWriting = !this.closeHandWriting;
      if (!this.closeHandWriting) {
        this.$devices.Handwriting.close();
      } else {
        this.$devices.Handwriting.open();
        setTimeout(() => {
          this.$refs.tableNumber.focus();
        });
      }
    },
    // 点击提交
    onSubmit() {
      console.log('submit', this.eaters);
      // 限制牌号和人数 数值
      if (this.orderCode > 9999 || this.peopleQty > 999) {
        this.$message.warning(this.$t('Biz.Order.CodeWarnText'));
        return;
      }
      if (!/^[0-9]*$/.test(this.orderCode)) { // 牌号 非法校验 -- 只允许输入正整数
        this.$message.warning(this.$t('Biz.Order.CodeWarnText1'));
        return;
      }
      const cloneBillData = _.cloneDeep(this.getFastFoodBillData);
      if (this.posSettings.isOpenBuffetDeposit) { // 自助餐 无【桌号】
        // if (+this.deposit > 999.99) {
        //   this.$message.warning(this.$t('Dict.MaximumMessage', [999.99]));
        //   return;
        // }
        this.setBuffetDeposit(this.deposit);
        this.$set(cloneBillData.bsData, 'eaters', this.eaters);
        this.$set(cloneBillData.bsData, 'buffetDeposit', this.deposit);
      } else {
        if (!/^[0-9]*$/.test(this.peopleQty)) { // 人数 非法校验 -- 只允许输入正整数
          this.$message.warning(this.$t('Biz.Order.CodeWarnText2'));
          return;
        }
        if (this.baseData.bsOrderCodeMode === '4') {
          const tableNumberTest = /^[\u4E00-\u9FA5A-Za-z0-9_]+$/g;
          // 最多支持输入30个汉字 60个字符
          if (getByteLength(this.tableCode) > 60) {
            this.$message.error({ message: this.$t('Biz.Order.CodeWarnText3') });
            return;
          }
          if (this.tableCode.length && !tableNumberTest.test(this.tableCode)) {
            this.$message.error({ message: this.$t('Biz.Order.CodeWarnText4') }); // 桌号内容不可用
            return;
          }
          // 更新下桌号内容
          this.$set(cloneBillData.bsData, 'tableCode', this.tableCode);
        }
      }
      // vuex更新数据
      if (this.isShowOrderCode) this.setOrderCode(this.orderCode);
      this.setPeopleQty(this.peopleQty);
      this.SetSaleActiveState(this.sale.activeIndex);
      this.setFastFoodBillData(cloneBillData);

      // 返回结算数据
      if (!_.isEmpty(this.resData.paymentData)) {
        this.$vemit('returnPayemntDataBus', this.resData.paymentData);
      }
      this.close();
    },
    InputDeposit(e) { // 两位小数 ??
      let val = e.target.value;
      val = decimal(val, 2);
      if (+val > 999.99) {
        this.$message.warning(this.$t('Dict.MaximumMessage', [999.99]));
        val = 999.99;
      }
      if (+this.deposit !== +val) this.deposit = val;
    },
    // editPrice(eaterItem, index) { // 快餐不能选客人价格
    //   console.log('客人价格', eaterItem, index);
    //   this.$refs.refEditPrice.open({
    //     list: eaterItem.guestPriceItems,
    //     pageSize: 1, // 每页显示个数
    //     paginationShow: true, // 页码
    //     curPage: 1,
    //   }, {
    //     submit: (priceItem) => {
    //       this.$set(this.eaters[index], 'itemId', priceItem.itemId);
    //       this.$set(this.eaters[index], 'itemSizeId', priceItem.itemSizeId);
    //       this.$set(this.eaters[index], 'itemName', priceItem.itemName);
    //     },
    //   });
    // },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
//主要信息的字体颜色
@main-font-color: #0babb9;
.content{
  display: flex;
  width: 100%;
  // >*{
  //   display: table-cell;
  //   vertical-align: top;
  // }
  .form{
    width: 356px;
    background-color: @white;
    padding: 16px 0;
    border-right: 1px solid #ddd;
    > div {
      overflow: hidden;
    }
    .m_lr {
      margin: 0 16px;
    }
  }
}

.isBuffetOpen {
  .orderCodeAndQtyWrap { display: none; } /* 自助餐-去掉销售类型 */
  .buffetUl {
    margin-left: 16px;
    margin-bottom: 14px;
    li {
      display: flex;
      margin-bottom: 14px;
      align-items: center;
      .selectBtn {
        margin-left:6px;
        width: 105px;
        height: 38px;
        overflow: hidden;
        border-radius: 4px;
        border:1px solid #ccc;
        background: #fff;
      }
      &:nth-last-child(1) { margin-bottom: 0; }
    }
  }
  .txt_default { width: 92px; height:38px;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    padding: 0 5px;
    outline:none;
    background: #fff;
    &:focus {
      border-color: @brand-primary;
      .box-shadow(inset 0 1px 1px #aff9ff);
    }
    &:disabled {
      cursor: not-allowed;
      background-color: #f0f0f0;
    }
  }
  .form-group {
    display: flex; align-items: center;
    .txt_dep { width: 130px; }
  }
}
.money-item{
  margin:0 16px 14px;
  display: flex;
  align-items: center;
}
.handWritingBtn {
 margin-left: 72px;
}
.table-number {
    display: table;
    margin-bottom: 10px;
    > label {
      vertical-align: top;
    }
    >*{
      display: table-cell;
    }
}
.item-title{
  font-size: 14px;
  color: #333;
  font-weight: normal;
  width: 70px;
  margin-bottom: 0;
}
.item-content{ width: 196px;}
.cardtype-item{
  margin-bottom: 4px;
}
.cardtype-list{
  margin: 0 -6px;
  height: 92px;
  .btn-item{
    padding: 6px;
    display: inline-block;
    width: 33.3%;
  }
  button{
    width: 100%;
  }
}
.info-keybord{
  background-color: #f5f5f5;
  padding: 4px;
  .keybord{
    text-align: center;
    margin: 0 auto;
  }
}
.money-info{
  line-height: 60px;
  border-bottom: 1px dashed #b5b5b5;
  padding: 0 16px;
  font-weight: bold;
  font-size: 14px;

  .title{
    color: #333;
  }
  .money{
    float: right;
    color: #0babb9;
  }
}

.pos-pager{
  position: relative;
  height: 50px;
}

.orderCodeAndQtyWrap {
  // width: 100%;
  margin-top: 10px;
}
.orderCodeAndQtyTitle {
  float: left;
  line-height: 31px;
}

.orderCodeAndQtyBox {
  height: 32px;
  line-height: 31px;
  float: right;
  text-align: center;
  border-radius: 18px;
  border:1px solid #d5d8d8;
  background-color: #f9fbfc;
  > span {
    display: block;
    float: left;
    border-radius: 15px;
    color: #999999;
    width: 42px;
    cursor: pointer;

    &.active {
      background-color: @main-font-color;
      color: #ffffff;
    }
  }
}
</style>
<style lang="less">
.payway-check-modal{
  .text-right{
    .el-input__inner{
      text-align: right;
    }
  }
}
.buffetUl .pos-pager { margin:10px 8px 0 0;}
</style>
