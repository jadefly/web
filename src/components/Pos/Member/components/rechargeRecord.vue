<template>
  <div class="rechargeRecord">
    <!-- 卡号 -->
    <div class="mb10 textCenter raedCard">
      <span class="inlineBlock textRight w80"><span class="sart">*</span><span>{{$t('Biz.Crm.CardTelNum1')}}</span></span>
      <input class="w300 inputStyle" v-model="accountNum" @input="checkcardNumFun"/>
      <el-button type="primary" @click="readCard">{{$t('Dict.CardReading')}}(Enter)</el-button>
    </div>
    <!-- 查询信息 每页20条 -->
    <template v-if="rechargeRecordData && rechargeRecordData.length">
      <div class="rechargeInfo">
        <table class="tableInfo" width="100%">
          <!-- style="table-layout:fixed" -->
          <thead>
            <tr>
              <th
                v-for="(item, index) in tableThead"
                :key="index"
                :style="{width: item.width+'px !important'}"
              >
                {{item.text}}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in rechargeRecordData"
              :key="index" @click="currentRowFun(item, index)"
              :class="item.revoke ? 'test123' : currentRow == index ? 'active':''"
            >
              <td>{{index + 1}}</td>
              <!-- + ((pagerState.current -1) * nowPageCount) -->
              <td>{{item.transactionNumber}}</td>
              <td>
                {{item.mobile ? item.mobile.substr(0, 3) + '****' + item.mobile.substr(7) : ''}}
              </td>
              <td>{{item.amount}}</td>
              <td>{{item.givenAmount}}</td>
              <td>{{item.createdOn}}</td>
              <td>{{item.isInvoice === '1' ? `${$t('Dict.TrueVal')}` : `${$t('Dict.FalseVal')}`}}</td>
              <td>{{item.storeName}}</td>
              <td>{{item.operator}}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pos-pager">
        <span>{{$t('Dict.Altogether')}}{{totalCount}}{{$t('Dict.Strip')}},</span>
        <span>{{ pagerState.current }}/{{ pagerState.total }}{{$t('Dict.Page')}}</span>
        <button type="button" class="pager-btn" @click="prev" :disabled="pagerState.current <= 1">
          <i class="icon icon-pager-up"></i>
        </button>
        <button
          type="button"
          class="pager-btn"
          @click="next"
          :disabled="pagerState.current >= pagerState.total"
        >
          <i class="icon icon-pager-down"></i>
        </button>
      </div>
      <div class="recordBtn">
        <el-button class="btn" @click="checkoperationauth">{{$t('Dict.CardReading')}}(Enter)</el-button>
        <el-button class="btn" type="primary" @click="printrecharge">{{$t('Dict.Revoke')}}</el-button>
      </div>
    </template>
    <div v-if="(!rechargeRecordData || !rechargeRecordData.length)&& verifyThrough" class="tip">
      <span>{{$t('Biz.Pos.Member.RechargeRecordSpan2')}}</span>
    </div>
    <SelectCardNum ref="selectCardNum"></SelectCardNum>
    <AuthCodeModel ref="authCodeModel"></AuthCodeModel>
  </div>
</template>

<script>
import ajax from '@/common/js/ajax';
import SelectCardNum from './selectCardNum';
import AuthCodeModel from './authCodeModel';

export default {
  components: { SelectCardNum, AuthCodeModel },
  data() {
    return {
      accountNum: '', // 卡号/手机号
      currentRow: 0, // 当前选中的数据行,默认选中第一行
      verifyThrough: false, // 验证通过
      nowPageCount: 10, // 当前页查找条数
      totalCount: 0, // 充值记录的总条数
      cardInfo: {}, // 当前卡号下的卡信息
      pagerState: {
        current: 1, // 当前页
        total: 2, // 总页数
      },
      pattern: new RegExp("[\\-\\+\"`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]"),
      rechargeRecordData: [], // 充值列表
      tableThead: [ // 表头
        {
          text: this.$t('Dict.SerialNumber'),
          width: '30',
        },
        {
          text: this.$t('Biz.Crm.TransNum'),
          width: '133',
        },
        // {
        //   text: '卡号',
        //   width: '100'
        // },
        {
          text: this.$t('Dict.PhoneNumber'),
          width: '85',
        },
        {
          text: this.$t('Biz.Pos.Member.RechargeRecordText4'),
          width: '80',
        },
        {
          text: this.$t('Dict.GiveAmountLable'),
          width: '65',
        },
        {
          text: this.$t('Biz.Pos.Member.RechargeRecordText6'),
          width: '70',
        },
        {
          text: this.$t('Biz.Pos.Member.RechargeRecordText7'),
          width: '70',
        },
        {
          text: this.$t('Biz.Pos.Member.RechargeRecordText8'),
          width: '120',
        },
        {
          text: this.$t('Dict.Operator'),
          width: '70',
        },
      ],
    };
  },
  mounted() {
    this.hotKey();
  },
  methods: {
    hotKey() {
      this.$hotKey.set('Pos.Member', {
        // 读卡
        Enter: () => {
          this.readCard();
        },
      });
    },
    prev() {
      this.pagerState.current -= 1;
      this.recordList();
    },
    next() {
      this.pagerState.current += 1;
      this.recordList();
    },
    currentRowFun(item, index) {
      if (item.revoke) { return; }
      this.currentRow = index;
    },
    readCard() {
      if (this.accountNum === '') {
        this.$emit('readRGJCardNo', (res) => {
          if (res) { // 读卡器成功读到卡
            this.cardmessage(res.CardNo);
          }
        });
      } else {
        this.cardmessage();
      }
    },
    cardmessage(cardNo) {
      const reg = /^[a-zA-Z0-9]+$/;
      if (!cardNo && (this.strIsEmpty(this.accountNum) || !reg.test(this.accountNum))) {
        this.$message.error(this.$t('Biz.Pos.Member.RechargeRecordMsg3'));
        return;
      }
      // 验证账号，获取卡信息
      this.$emit('userCardInfo', {});
      const code = cardNo || (this.accountNum ? this.accountNum.toUpperCase() : null);
      this.$parent.querycardmessage(code, (res) => {
        if (+res.id === 1) {
          this.hyUserInfoFun(res.data, cardNo);
        } else if (+res.id === 2) {
          this.$refs.selectCardNum.open({ cardList: res.data }, {
            submit: (data) => {
              this.hyUserInfoFun(data, cardNo);
            },
          });
        }
      });
    },
    hyUserInfoFun(res) {
      this.cardInfo = res;
      this.recordList(res);
      this.$emit('userCardInfo', this.cardInfo);
      this.accountNum = this.cardInfo.hardCardNumber;
    },
    recordList() {
      // 调取充值记录接口
      ajax('canyin.pos.settlement.pay.glorybutlerpayway.selectrecharge', {
        contentType: 'URLEncoded',
        data: {
          hardMemberCardNumber: this.cardInfo.hardCardNumber, // 外卡号
          pageNum: this.pagerState.current, // 查找页数
          pageSize: this.nowPageCount, // 当前页查找条数
        },
      }).then((resData) => {
        const res = JSON.parse(resData);
        if (+res.code === 0) {
          this.verifyThrough = true;
          this.rechargeRecordData = res.data.rechargeRecord;
          this.totalCount = res.data.totalCount;
          this.pagerState.total = Math.ceil(this.totalCount / this.nowPageCount);
        } else {
          this.$message.error(res.message);
        }
      });
    },
    checkoperationauth() { // 检查是否有权限
      ajax('canyin.pos.settlement.pay.glorybutlerpayway.checkoperationauth', {
        contentType: 'URLEncoded',
      }).then((resData) => {
        const res = JSON.parse(resData);
        if (+res.code === 0) {
          this.undosinglerecharge('');
        } else {
          this.$refs.authCodeModel.open({ msg: res.message }, {
            submit: (data) => {
              this.undosinglerecharge({ authCode: data });
            },
          });
        }
      });
    },
    undosinglerecharge(authData = {}) { // 撤销
      ajax('canyin.pos.settlement.pay.glorybutlerpayway.undosinglerecharge', {
        contentType: 'URLEncoded',
        data: {
          unrechargeJson: JSON.stringify(this.rechargeRecordData[this.currentRow]),
          ...authData,
        },
      }).then((resData) => {
        const res = JSON.parse(resData);
        if (+res.code === 0) {
          this.$message.success(res.message);
        } else if (+res.code === -2) {
          this.checkoperationauth();
        } else {
          this.$message.error(res.message);
        }
      });
    },
    printrecharge() { // 补打
      ajax('canyin.pos.settlement.pay.glorybutlerpayway.printrecharge', {
        contentType: 'URLEncoded',
        data: {
          printjson: JSON.stringify(this.rechargeRecordData[this.currentRow]),
        },
      }).then((resData) => {
        const res = JSON.parse(resData);
        if (+res.code === 0) {
          this.$message.success(res.message);
        } else {
          this.$message.error(res.message);
        }
      });
    },
    strIsEmpty(str) {
      return str == null || !str || typeof str === 'undefined' || str === '' || str.replace(/(^\s*)|(\s*$)/g, '').length === 0;
    },
    checkcardNumFun() {
      let rs = '';
      this.accountNum = this.accountNum.replace(/[\u4e00-\u9fa5]/g, '');
      for (let i = 0; i < this.accountNum.length; i += 1) {
        rs += this.accountNum.substr(i, 1).replace(this.pattern, '');
      }
      this.accountNum = rs;
      this.accountNum = this.accountNum.toUpperCase();
    },
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .rechargeRecord{
    padding: 15px 10px;
    position: relative;
    padding-top: 65px;
    height: 100%;
    padding-bottom: 45px;
    font-size: 12px;
    .raedCard{
      position: absolute;
      top: 15px;
      width: 100%;
    }
    .rechargeInfo{
      height: 100%;
      overflow: auto;
    }
    .tableInfo{
      border:solid #999;
      border-width:0px 1px 1px 0px;
      max-height: 365px;
      text-align: center;
      width: 100%;
      th, td{
        border:solid #999;
        border-width:1px 0px 0px 1px;
      }
      thead{
        th{
          text-align: center;
        }
      }
      tbody{
        tr{
          height: 25px !important;
        }
        tr.active{
          background: #039eac;
          color: #fff;
        }
        td{
          padding: 5px 0 !important;
          white-space: pre-wrap;
          white-space: normal;
          word-break: break-all;
        }
      }
    }
    .recordBtn{
      position: absolute;
      left: 10px;
      bottom: 10px;
    }
    .tip{
      font-size: 18px;
      text-align: center;
      font-weight: bold;
      padding-top: 20%;
    }
    .test123{
      background: #ddd;
      cursor: not-allowed;
    }
  }
  @pager-info-color: #273844;
  @pager-info-font-size: 12px;
  @pager-btn-width: 50px;
  @pager-btn-bg: @pos-dialog-pager-btn-bg;
  @pager-btn-font-size: 20px;
  @pager-btn-color: #273844;

  .pos-pager {
    margin-top: 0;
    margin-bottom: 0;
    text-align: center;
    padding-top: 5px;
    position: absolute;
    bottom: 8px;
    right: 10px;
    > span {
      color: @pager-info-color;
      font-size: @pager-info-font-size;
    }

    > button {
      .size(@pager-btn-width, @pos-pager-height);
      border-radius: @pos-pager-height / 2;
      background-color: @pager-btn-bg;
      border: 1px solid #b5b5b5;
      color: @pager-btn-color;

      > i {
        font-size: @pager-btn-font-size;
      }

      &[disabled] {
        color: @btn-disabled-color;
        cursor: not-allowed;
      }
    }
  }
</style>
