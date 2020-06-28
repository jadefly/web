<!--临时作为微生活模块开发，原始的是人民币结算方式，后面让后台单独添加一个微生活结算方式-->
<template>
  <Dialog
    name="PosDialog.PayWayEasyLifeRechargeModal"
    title="微生活充值"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="recharge"
    :hotkeys="PayWayEasyLifeRechargeModal"
    :append-to-body="true"
    :showSubmit="true"
    :submit-text="$t('Dict.Confirm')"
    width="728px"
    id="PayWayEasyLifeRechargeModal">
    <div class="easy-life body">
      <!--左侧布局-->
      <div class="list-area body-left" v-keyboard:keyboard>
        <p>{{$t('Biz.Settlement.Tip42')}}</p>
        <!--列表数据-->
        <div class="list">
          <div class="table-body">
            <ul class="table-body-ul">
              <li
                class="table-body-ul-li"
                v-for="(item, index) in showList"
                :key="index"
                @click="chooseRechargeRules(index)"
                :class="index === currentActiveRuleIndex ? 'active' : ''">
                <!--如果送钱+券-->
                <div v-if="item.gift">
                  <div class="rule-list-content" v-if="+item.gift_percent === 0">
                    <div class="list-wrap-left">
                      充<strong>{{ item.price }}</strong>
                    </div>
                    <div class="list-wrap-right">
                      送{{ item.money }}
                      <span v-for="(item2, index2) in item.gift" :key=" '' + index + index2">
                        送{{ item2.name }} {{ item2.number }} 张
                      </span>
                    </div>
                  </div>
                  <div class="rule-list-content" v-else>
                    <div class="list-wrap-left">
                      充<strong>{{ item.price }}</strong>
                    </div>
                    <div class="list-wrap-right">
                      送实收金额的{{ item.gift_percent * 100 }}%({{ item.price * item.gift_percent }})
                      <span v-for="(item2, index2) in item.gift" :key=" '' + index + index2">
                        送{{ item2.name }} {{ item2.number }} 张
                      </span>
                    </div>
                  </div>
                </div>
                <!--如果只送钱-->
                <div v-else>
                  <div class="rule-list-content" v-if="+item.gift_percent === 0">
                    <div class="list-wrap-left">
                      充<strong>{{ item.price }}</strong>
                    </div>
                    <div class="list-wrap-right">
                      送{{ item.money }}
                    </div>
                  </div>
                  <div class="rule-list-content" v-else>
                    <div class="list-wrap-left">
                      充<strong>{{ item.price }}</strong>
                    </div>
                    <div class="list-wrap-right">
                      送实收金额的{{ item.gift_percent * 100 }}%({{ item.price * item.gift_percent }})
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <!--其他规则与分页按钮-->
        <div class="other-rules">
          <!--分页按钮-->
          <div class="pos-pager pos-takeout-pager">
          <span class="page-info">
            {{$t('Dict.Altogether')}}{{rulesLists.length}}{{$t('Dict.Strip')}}，{{currentPage}}/{{pageCount(rulesLists)}}{{$t('Dict.Page')}}
          </span>
            <button class="prev" @click="upPage">
              <i class="el-icon-arrow-up"></i>
            </button>
            <button class="next" @click="downPage(rulesLists)">
              <i class="el-icon-arrow-down"></i>
            </button>
          </div>
        </div>
        <!--自定义充值金额-->
        <div class="diy-recharge">
          <p>{{$t('Biz.Settlement.otherRule')}}</p>
          <div>
            <span>{{$t('Biz.Settlement.DiyRechargeRule')}}:</span>
            <div class="item-content">
              <div class="item-input">
                <input
                  v-model="diyRecharge"
                  maxlength="8"
                  @focus="clearChooseRechargeRule"
                  @keyup="InputNumber('diyRecharge', 2)"
                  v-autotest />
              </div>
              <div
                class="rule-detail"
                :class="error ? 'error' : ''"
              >
                {{ diyRechargeText }}
              </div>
            </div>
          </div>
        </div>
        <!--支付方式-->
        <div class="pay-type">
          <p>{{$t('Dict.PaymentMethod')}}:</p>
          <div class="btn-wrap">
            <button
              class="btn btn-default"
              v-for="(item, index) in payTypeList"
              :key="item.type"
              :class="index === currentPayTypeIndex ? 'active' : ''"
              @click="chooseRechargeType(index)">
              {{ item.text }}
            </button>
          </div>
        </div>
        <!--备注-->
        <div class="remark-wrap">
          <div class="remark-label">
            <label for="modifyBillRemark">{{$t('Dict.Remarkss')}}</label>
          </div>
          <div class="remark-content">
            <textarea
              type="textarea"
              :maxlength="80"
              ref="iBillRemark"
              id="modifyBillRemark"
              class="form-control"
              v-model="remark"
              @focus="showAndroidInput('remark')">
            </textarea>
            <button
              type="button"
              class="btn btn-default"
              @click = "handWriting"
              v-hideHandwritingBoard>
              <i class="icon icon-edit"></i>
              <span>{{$t('Dict.WritingPad')}}</span>
            </button>
          </div>
        </div>
      </div>
      <!--右侧布局-->
      <div class="money-area body-right">
        <div class="item to-be-pay">
          <div>
            <span class="title"><b>{{$t('Dict.CardNumberLabel')}}</b></span>
            <div class="content"><span class="payouts-money">{{cardNumber}}</span></div>
          </div>
          <div>
            <span class="title"><b>{{$t('Biz.Settlement.CurrentCardBalance')}}</b></span>
            <div class="content"><span class="payouts-money">{{cardBalance}}</span></div>
          </div>
        </div>
        <div class="info-area">
          <div class="keybord-content">
            <KeyBoard class="keybord" ref="keyboard"></KeyBoard>
          </div>
        </div>
      </div>
    </div>
    <AndroidInput ref="AndroidInput"></AndroidInput>
  </Dialog>
</template>

<script>
import AndroidInput from '@/components/Pos/Common/AndroidInput';
import AndroidInputMixin from '@/components/Pos/Common/AndroidInputMixin';
import { mapGetters } from 'vuex';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import numberformat from '@/common/js/numberformat';
import PageMixin from '@/common/util/PaginationMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';


export default {
  components: { Dialog, KeyBoard, AndroidInput },
  mixins: [DialogMixin, PageMixin, AndroidInputMixin],
  data() {
    return {
      resData: null,
      prePageSize: 3,
      rulesLists: [], // 充值规则
      payTypeList: [], // 支付方式
      rewardMoney: '', // 充值赠送的钱，给接口传参用
      currentActiveRuleIndex: 0, // 当前选中充值规则
      currentPayTypeIndex: 0, // 当前选中支付方式
      currentPage: 1, // 当前页数
      rechargeList: [], // 充值奖励规则
      currentPayWay: null, // 支付方式
      diyRecharge: 0, // 自定义充值金额
      diyRechargeText: '', // 自定义充值奖励规则
      remark: '', // 备注
      cardNumber: '', // 卡号
      cardBalance: 0, // 当前卡内余额
      closeHandWriting: false, // 手写板
      isOpen: false, // 每次打开都聚焦
      minRechargePrice: 0, // 最小充值金额
      overtake: false, // 是否超过了最大充值金额
      error: false, // 自定义金额是否有误
    };
  },
  computed: {
    ...mapGetters([
      'posInfo',
      'posBaseInfo',
    ]),
    // 添加快捷键
    PayWayEasyLifeRechargeModal() {
      return {
        PgDn: () => {
          this.recharge();
        },
      };
    },
    // 显示列表
    showList() {
      return this.pagination(this.currentPage, this.prePageSize, this.rulesLists);
    },
  },
  watch: {
    // 大部分主要是判断自定义金额下方的显示文字
    diyRecharge(newVal, oldVal) {
      if (!(+newVal)) return;
      if (newVal === oldVal) return;
      if (+newVal > 99999.99) {
        this.diyRechargeText = `${this.$t('Biz.Settlement.Tip43')}`;
        this.overtake = true;
        this.error = true;
        return;
      }
      // if (+newVal < this.minRechargePrice) {
      //   this.diyRechargeText = `最小充值金额为${this.minRechargePrice}`;
      //   this.overtake = true;
      //   this.error = true;
      //   return;
      // }
      this.overtake = false;
      this.error = false;
      const { rulesLists } = this;
      const min = rulesLists[0] || { price: 99999999 };
      const max = rulesLists[rulesLists.length - 1];
      if (+newVal < min.price) {
        this.diyRechargeText = '';
        return;
      }
      let tmp = null;
      for (let i = 0; i < rulesLists.length; i += 1) {
        if (+newVal < rulesLists[i].price) {
          if (rulesLists[i - 1]) {
            tmp = rulesLists[i - 1];
            break;
          }
        }
      }
      if (!tmp) {
        tmp = max;
      }
      const {
        gift, gift_percent, price, money,
      } = tmp;
      let str = '';
      if (gift && gift.length > 0) {
        let giftHtml = '';
        gift.map((item) => {
          giftHtml += `送${item.name}${item.number}张`;
          return item;
        });
        if (Object.is(+gift_percent, 0)) {
          str = `充${+newVal}送${money}${giftHtml}`;
          this.rewardMoney = money;
        } else {
          str = `充${+newVal}送实收金额的${gift_percent * 100}%(${price * gift_percent})${giftHtml}`;
          this.rewardMoney = price * gift_percent;
        }
      } else if (Object.is(+gift_percent, 0)) {
        str = `充${+newVal}送${money}`;
        this.rewardMoney = money;
      } else {
        str = `充${+newVal}送实收金额的${gift_percent * 100}%(${price * gift_percent})`;
        this.rewardMoney = price * gift_percent;
      }
      this.diyRechargeText = str;
    },
  },
  filters: {
    keepTwo(val) {
      return numberformat(val) || 0.00;
    },
    divide100(val) {
      if (+val > 0) {
        return val / 100;
      }
      return 0;
    },
  },
  methods: {
    // 输入框聚焦后
    clearChooseRechargeRule() {
      this.currentActiveRuleIndex = '';
      this.diyRecharge = 0;
      this.diyRechargeText = '';
      this.rewardMoney = 0;
    },
    // 限制输入数字保留2位小数
    InputNumber(key, fixed) {
      const str = this[key];
      this.$nextTick(() => {
        this[key] = this.onlyNumber(str, fixed);
      });
    },
    onlyNumber(val, fixed = 2) {
      let str = '';
      const tmp = new RegExp(`^(\\-)*(\\d+)\\.(\\d{0,${fixed}}).*$`, 'g');
      str += val;
      str = str.replace(/[^\d.]/g, '');
      str = str.replace(/\.{2,}/g, '.');
      str = str.replace('.', '$#$');
      str = str.replace(/\./g, '');
      str = str.replace('$#$', '.');
      str = str.replace(tmp, '$1$2.$3');
      if (str.indexOf('.') === 0 && str !== '') {
        str = '';
      }
      if (str.indexOf('.') < 0 && str !== '') {
        str = parseFloat(str);
      }
      return str;
    },
    async onOpen() {
      const rechargeType = await this.easyLifeRechargeTypeApi();
      const tmpArr = [];
      Object.keys(rechargeType).map((key) => {
        const obj = {
          type: key,
          text: rechargeType[key],
        };
        tmpArr.push(obj);
        return key;
      });
      this.isOpen = true;
      this.currentPage = 1;
      this.payTypeList = tmpArr;
      this.currentActiveRuleIndex = '';
      this.currentPayTypeIndex = 0;
      const { cardNum, balance } = this.resData;
      this.cardNumber = cardNum;
      this.cardBalance = balance;
      this.remark = '';
      // 每次进入, 默认选中输入内容
      // if (this.$refs.keyboard) {
      //   this.$refs.keyboard.reSelect();
      // }
      this.closeHandWriting = false;
      const rechargeRole = await this.easyLifeRechargeRoleApi();
      if (rechargeRole.content && rechargeRole.content.length > 0) {
        rechargeRole.content.sort((a, b) => a.price - b.price);
      }
      this.rulesLists = rechargeRole.content;
      // [this.minRechargePrice] = [this.rulesLists[0].price];
      if (this.posInfo.isEnableHandwritingBoard) {
        this.closeHandWriting = true;
        this.$devices.Handwriting.open();
      }
    },
    onClose() {
      this.resData = null;
      this.rewardMoney = ''; // 充值赠送的钱，给接口传参用
      this.currentActiveRuleIndex = ''; // 当前选中充值规则
      this.currentPayTypeIndex = 0; // 当前选中支付方式
      this.currentPage = 1; // 当前页数
      this.diyRecharge = 0; // 自定义充值金额
      this.diyRechargeText = ''; // 自定义充值奖励规则
      this.remark = ''; // 备注
      this.isOpen = false; // 每次打开都聚焦
      if (this.closeHandWriting) {
        this.$devices.Handwriting.close();
      }
    },
    // 选择充值奖励规则
    chooseRechargeRules(index) {
      this.currentActiveRuleIndex = index;
      this.diyRecharge = this.showList[index].price;
    },
    // 选择当前支付方式
    chooseRechargeType(index) {
      this.currentPayTypeIndex = index;
    },
    // 微生活充值规则接口
    easyLifeRechargeRoleApi() {
      return ajax('canyin.pos.settlement.pay.twitterlifepayway.gettwitterrechargerole', {
        contentType: 'URLEncoded',
        data: {},
      }).then(res => res);
    },
    // 微生活充值方式接口
    easyLifeRechargeTypeApi() {
      return ajax('canyin.pos.settlement.pay.twitterlifepayway.getdealpaytype', {
        contentType: 'URLEncoded',
        data: {},
      }).then(res => res);
    },
    // 微生活充值接口
    easyLifeRechargeApi(params) {
      return ajax('canyin.pos.settlement.pay.twitterlifepayway.previewsubmit', {
        contentType: 'URLEncoded',
        data: params,
      }).then(res => res);
    },
    // 预订挂账-预订单组件打开
    async recharge() {
      const {
        cardNumber, diyRecharge, remark, rewardMoney, overtake, minRechargePrice,
        currentPayTypeIndex, payTypeList, rulesLists,
      } = this;
      if (+diyRecharge === 0) {
        this.$message.error(`${this.$t('Biz.Settlement.Error82')}`);
        return;
      }
      if (overtake) return; // 超過了最大充值金額限制或低于最小充值金额
      // if (diyRecharge < minRechargePrice) {
      //   this.$message.error(`最小充值金额为${minRechargePrice}`);
      //   return;
      // }
      let isDiy = true;
      rulesLists.map((item) => {
        if (+item.price === +diyRecharge) {
          isDiy = false;
        }
        return item;
      });
      const params = {
        cno: cardNumber,
        money: diyRecharge,
        reward_money: rewardMoney,
        remark,
        is_diy: isDiy,
        charge_type: payTypeList[currentPayTypeIndex].type,
      };
      const result = await this.easyLifeRechargeApi(params);
      if (result) {
        this.$message.success(`${this.$t('Biz.Settlement.Success37')}`);
        this.$emit('search');
        this.close();
      } else {
        this.$message.error(`${this.$t('Biz.Settlement.Error83')}`);
      }
    },
    // 手写板
    handWriting() {
      this.closeHandWriting = !this.closeHandWriting;
      if (!this.closeHandWriting) {
        this.$devices.Handwriting.close();
      } else {
        this.$devices.Handwriting.open();
        this.$nextTick(() => {
          this.$refs.iBillRemark.focus();
        });
      }
    },
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .btn-default {
    background-color: #ffffff;
    color: #039eac;
    border-color: #039eac;
    &.active {
      color: #ffffff;
      background-color: #039eac;
    }
  }
  .easy-life{
    display: table;
    width: 100%;
    height: 570px;
    >* {
      display: table-cell;
      vertical-align: top;
    }
  }
  .list-area{
    position: relative;
    padding: 16px;
    width: 466px;
    background-color: @white;
    border-right: 1px solid #ddd;
  }
  .title{
    width: 78px;
    font-size: 14px;
  }
  .list{
    .table-body{
      margin-top: 6px;
      color: @gray-dark;
      height: 190px;
      ul {
        li {
          margin-bottom: 10px;
          padding: 0 15px;
          cursor: pointer;
          .rule-list-content {
            position: relative;
            display: flex;
            align-items: center;
            height: 50px;
            border-radius: 3px;
            border: 1px solid #bbbbbb;
            & > div:last-child {
              padding: 5px;
            }
            & > div:first-child{
              width: 100px;
              text-align: center;
              border-right: 1px dashed #bbbbbb;
              strong {
                font-size: 16px;
                font-weight: bold;
              }
            }
          }
          &.active {
            .rule-list-content {
              border: 2px solid lightseagreen;
              &:after {
                /*content: '';*/
                /*position: absolute;*/
                /*bottom: 0;*/
                /*right: 0;*/
                /*width: 0;*/
                /*height: 0;*/
                /*border-bottom: 20px solid lightseagreen;*/
                /*border-left: 20px solid transparent;*/
                content: '';
                width: 24px;
                height: 24px;
                position: absolute;
                right: -2px;
                bottom: -2px;
                background-image: url(~@/common/images/pos/bill/recharge-checked.png);
              }
            }
          }
        }
      }
    }
  }
  .other-rules {
    display: flex;
    justify-content: flex-end;
    padding: 0 15px;
  }
  .diy-recharge {
    padding: 10px 0;
    margin: 10px 0;
    border-top: 1px solid #bbbbbb;
    border-bottom: 1px solid #bbbbbb;
    & > div {
      display: flex;
      & > span {
        margin-top: 8px;
        min-width: 120px;
      }
      .item-content {
        flex: 1;
        .item-input {
          display: flex;
          position: relative;
          align-items: center;
          & > span:first-child {
            width: 120px;
            color: gray;
          }
          & > span:last-child {
            position: absolute;
            right: 15px;
            color: #bbbbbb;
          }
          input {
            flex: 1;
            padding: 0 50px 0 15px;
            height: 40px;
            line-height: 40px;
            border-radius: 4px;
            outline: none;
            border: 1px solid #dcdfe6;
            transition: border-color 0.3s cubic-bezier(0.645, 0.045, 0.355);
            &:hover {
              border-color: #bbb;
            }
            &[disabled] {
              cursor: not-allowed;
            }
          }
          .focus {
            border-color: #039eac;
          }
        }
        .rule-detail {
          margin-top: 5px;
        }
        .error {
          color: red;
        }
      }
    }
  }
  .pay-type {
    .btn-wrap {
      display: flex;
      justify-content: space-between;
      margin: 10px 0;
      padding-bottom: 10px;
      border-bottom: 1px solid #bbbbbb;
      & > button {
        flex: 1;
        margin-right: 10px;
      }
      & > button:last-child {
        margin-right: 0;
      }
    }
  }
  .remark-wrap {
    .remark-babel {
      > label {
        width: 45px;
      }
    }
    .remark-content {
      display: flex;
      align-items: center;
      position: relative;
      .form-control {
        flex: 1;
        margin-right: 15px;
        height: 40px;
      }
    }
  }
  // 箭头按钮
  .pos-takeout-pager {
    > button {
      display: inline-block;
      width: 44px;
      height: 30px;
      border: 1px solid #9a9a9a;
      line-height: 28px;
      border-radius: 14px;
      text-align: center;
      margin-left: 8px;
      background-color: white;

      > i {
        color : #9a9a9a;
      }

      &[disabled] {
        color: @btn-disabled-color;
        cursor: not-allowed;
      }
    }
  }

  .money-area{
    background-color: #f5f5f5;
    .to-be-pay{
      display: flex;
      flex-direction: column;
      padding: 12px;
      /*line-height: 52px;*/
      border-bottom: 1px dashed #b5b5b5;
      .content{
        text-align: right;
      }
      & > div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        & > span {
          width: 100px;
        }
      }
    }
    .info-area{
      padding: 12px;
      .detail-info {
        table {
          width: 100%;
          tr {
            td {
              padding-top: 3px;
            }
            td:nth-child(1) {
              text-align: left;
              color: gray;
            }
            td:nth-child(2) {
              text-align: right;
            }
          }
          tr:nth-child(2) > td {
            padding-top: 10px;
          }
        }
      }
    }
    .keybord-content{
      margin: 20px 0;
      text-align: center;
    }
  }
</style>
<style>
  .easy-life .el-input__inner {
    padding-right: 30px;
  }
</style>
