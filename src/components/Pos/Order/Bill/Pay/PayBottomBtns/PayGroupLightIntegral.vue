<template>
  <Dialog
    name="PosDialog.FastCardGiftAndVoucher"
    :title="$t('Dict.Btn.GroupLightIntegral')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :append-to-body="true"
    :showSubmit="false"
    top="10vh"
    width="750px"
  >
    <button
      slot="other-button"
      :disabled="isCanDisabled"
      class="verification"
      @click="onSubmit"
      type="button"
    >{{$t('Dict.Confirm')}}(PgDn)</button>
    <div class="content-warp">
      <div class="form-warp">
        <div class="form-area" v-keyboard:keyboard>
          <div class="form-item">
            <p class="form-title">{{$t('Biz.Settlement.EnterPhoneOrCardNumber')}}</p>
            <div class="valid-area">
              <div class="valid">
                <el-input
                  v-model="cardOrPhoneNo"
                  ref="voucher"
                  @keyup.enter.native="voucherEnter"
                  :placeholder="$t('Biz.Settlement.EnterPhoneOrCardNumber')"
                  v-judge
                ></el-input>
              </div>
              <div class="valid-btn">
                <button
                  type="button"
                  class="btn btn-primary"
                  @click="voucherEnter"
                  @keyup.enter="voucherEnter"
                >
                  {{$t('Dict.Search2')}}/{{$t('Dict.CardReading')}}
                  <span class="btn-tip">(Enter)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="keyboard-area">
          <KeyBoard class="keyboard" ref="keyboard"></KeyBoard>
        </div>
        <PayGroupLightIntegralChooseCard ref="payGroupLightIntegralChooseCard"></PayGroupLightIntegralChooseCard>
      </div>
      <div class="info-warp">
        <div class="overview-item">
          <p class="list-title">{{$t('Biz.Settlement.CardInfo')}}</p>
          <div class="card-message" v-if="showCardInfo">
            <h3>NO.{{ cardStoreCentList && cardStoreCentList.cardNo ? cardStoreCentList.cardNo: '' }}</h3>
            <p class="cardInfo">
              <span class="cardInfo-left">{{$t('Dict.PhoneNumber')}}:</span>
              {{ cardStoreCentList && cardStoreCentList.mobile ?
              cardStoreCentList.mobile.substr(0, 3) + '****' + cardStoreCentList.mobile.substr(7) :
              ''
              }}
            </p>
            <p class="cardInfo">
              <span class="cardInfo-left">{{$t('Dict.CardType3')}}:</span>
              <span class="cardInfo-right">{{ cardStoreCentList && cardStoreCentList.typeName ? cardStoreCentList.typeName : '' }}</span>
            </p>
            <p class="cardInfo">
              <span class="cardInfo-left">{{$t('Dict.FullName')}}:</span>
              <span class="cardInfo-right">{{ cardStoreCentList && cardStoreCentList.name ? cardStoreCentList.name : '' }}</span>
            </p>
            <!-- <p class="cardInfo">
              <span class="cardInfo-left">积分:</span>
              <span class="cardInfo-right">{{ cardStoreCentList }}</span>
            </p>-->
            <div class="removeBtn" @click="removeVoucher">
              <i class="el-icon-remove iconRemove"></i>
              <span>{{$t('Dict.Delete')}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>
<script>
import { mapGetters } from 'vuex';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import PayGroupLightIntegralChooseCard from './PayGroupLightIntegralChooseCard';

export default {
  components: { Dialog, KeyBoard, PayGroupLightIntegralChooseCard },
  mixins: [DialogMixin],
  data() {
    return {
      cardOrPhoneNo: '',
      bsId: '', // 营业流水Id
      pointId: '', // 客位Id
      isCanDisabled: true, // 积分确认按钮是否可点 默认不可点击
      showCardInfo: false, // 券信息是否显示
      cardStoreCentList: null, // 积分信息
    };
  },
  computed: {
    ...mapGetters([
      'posDevice',
    ]),
    // 添加快捷键
    PayWayCoucouModal() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  methods: {
    onOpen() {
      // 客位Id
      this.pointId = this.resData.pointId;
      // 营业流水
      this.bsId = this.resData.bsId;
      // 打开页面输入框默认获得焦点
      this.$nextTick(() => {
        this.$refs.voucher.focus();
      });
      // 打开页面请求打开页面接口
      ajax('canyin.pos.settlement.pay.grouplight.openscore', {
        contentType: 'URLEncoded',
        data: {
          bsId: this.bsId,
          pointId: this.pointId,
        },
      }).then((res) => {
        if (res.result === 1) {
          if (res.data !== null) {
            // 有上次选择的积分卡信息
            // 核销按钮可点击
            this.isCanDisabled = false;
            // 显示卡积分信息
            this.showCardInfo = true;
            // 如果有上次积分卡信息填充查询输入框
            this.cardOrPhoneNo = res.data.card_no;
            // 重新获取卡积分数据
            this.cardStoreCentList = res.data;
          }
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    // 查询读卡
    voucherEnter() {
      // 如果有上次选择的积分卡信息
      if (this.showCardInfo) {
        this.$confirm(`${this.$t('Biz.Settlement.Tip36')}`, `${this.$t('Dict.Tips')}`, {
          confirmButtonText: `${this.$t('Dict.ConfirmButtonText')}`,
          cancelButtonText: this.$t('Dict.Cancel'),
          type: 'warning',
        })
          .then(() => {
            // 删除上一张券
            this.showCardInfo = false;
            this.cardStoreCentList = null;
            this.shouldReadCard();
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: this.$t('Dict.OperationCancelled'),
            });
          });
      } else {
        this.shouldReadCard();
      }
    },
    shouldReadCard() {
      // 获取会员卡读卡需要用到的参数
      const { groupLightReadCardOpt } = this.posDevice;
      if (groupLightReadCardOpt) {
        if (this.cardOrPhoneNo) {
          this.cardEnterTask();
        } else {
          this.$devices.Cardop.readRGJ((card) => {
            if (+card.returnCode === 0) {
              this.cardEnterTask(card.CardNo);
            } else {
              this.$message.error(`${this.$t('Biz.Settlement.Error5')}`);
            }
          }, {
            ...groupLightReadCardOpt, // 群光读卡所需数据
          });
        }
      } else {
        this.cardEnterTask();
      }
    },
    // 点击查询按钮获取卡信息逻辑
    cardEnterTask(CardNo = '') {
      if (CardNo !== '') {
        this.cardOrPhoneNo = CardNo;
      }
      if (this.cardOrPhoneNo === '') {
        this.$message.error(`${this.$t('Biz.Settlement.EnterCardNumber')}`);
        return;
      }
      const reg = /^[0-9]*$/;
      if (!reg.test(this.cardOrPhoneNo)) {
        this.$message.error(`${this.$t('Biz.Settlement.Error7')}`);
        return;
      }
      const cardOrPhoneNo = this.inputValueTrim(this.cardOrPhoneNo);
      const params = {
        bsId: this.bsId,
        pointId: this.pointId,
        cardNo: this.cardOrPhoneNo,
        isGetCouponList: 0, // 是否查询会员卡列表 1 查 0 不查
      };
      ajax('canyin.pos.settlement.pay.grouplight.querymember', {
        data: params,
        contentType: 'URLEncoded',
      }).then((res) => {
        if (res.result === 1) {
          // 如果只有一个卡号
          if (res.data.length === 1) {
            const [firstEle] = res.data;
            this.showCardInfo = true;
            // 获取卡积分数据
            this.cardStoreCentList = {
              cardNo: firstEle.cardNo, // 卡号
              typeName: firstEle.typeName, // 卡类型
              name: firstEle.name, // 会员名称
              mobile: firstEle.mobile, // 手机号
            };
            // 输入框填充卡号
            this.cardOrPhoneNo = firstEle.cardNo;
            // 核销按钮可点击
            this.isCanDisabled = false;
          } else if (res.data.length > 1) {
            // 有多个卡号
            const cardList = res.data;
            this.$refs.payGroupLightIntegralChooseCard.open(cardList, {
              submit: (currentCardData) => {
                // 可以点击确认按钮
                this.isCanDisabled = false;
                this.showCardInfo = true;
                const [firstEle] = currentCardData;
                // 获取卡积分数据
                this.cardStoreCentList = {
                  cardNo: firstEle.cardNo, // 卡号
                  typeName: firstEle.typeName, // 卡类型
                  name: firstEle.name, // 会员名称
                  mobile: firstEle.mobile, // 手机号
                };
                this.cardOrPhoneNo = firstEle.cardNo;
              },
            });
          }
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    // 删除积分卡信息
    removeVoucher(e) {
      ajax('canyin.pos.settlement.pay.grouplight.scoredeletemember', {
        data: {
          bsId: this.bsId,
          pointId: this.pointId,
        },
        contentType: 'URLEncoded',
      }).then((res) => {
        if (res.result === 1) {
          this.showCardInfo = false;
          // 清除积分信息
          this.cardStoreCentList = null;
          // 清除输入框券号
          this.cardOrPhoneNo = '';
          // 核销按钮不可点击
          this.isCanDisabled = true;
          // 删除积分成功
          this.$message.success(res.msg);
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    onSubmit() {
      ajax('canyin.pos.settlement.pay.grouplight.scoresavemember', {
        contentType: 'URLEncoded',
        data: {
          bsId: this.bsId,
          pointId: this.pointId,
          cardNo: this.cardOrPhoneNo,
        },
      }).then((res) => {
        if (res.result === 1) {
          this.close();
          // 确认积分成功
          this.$message.success(res.msg);
        } else {
          this.$message.error(res.msg);
        }
      });
    },

    onClose() {
      // 关闭清除所选券信息
      this.showCardInfo = false;
      this.cardStoreCentList = null;
      // 初始化核销按钮不可点击
      this.isCanDisabled = true;
      // 清空输入框信息
      this.cardOrPhoneNo = '';
    },
    // 去除输入框值空格
    inputValueTrim(val) {
      let str = val;
      str = str.replace(/\s/g, '');
      return str;
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

button .btn-tip {
  font-size: 12px;
  color: #eee;
}
.verification {
  background-color: #039eac;
  border-color: #047d88;
  color: #fff;
  display: inline-block;
  padding: 10px 12px;
  margin-bottom: 0;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.42857143;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  border: 1px solid transparent;
  border-radius: 4px;
}

.content-warp {
  display: table;
  width: 100%;
  font-size: 14px;
  > * {
    display: table-cell;
    vertical-align: top;
  }
}
.form-warp {
  width: 465px;
  background-color: @white;
  padding: 0 16px;
  border-right: 1px solid #ddd;
}

.form-area {
  height: 90px;
  .form-item {
    font-size: 14px;
    font-weight: bold;
  }
  .form-title {
    margin-top: 15px;
    line-height: 2.4;
    font-size: 14px;
    color: #666;
    position: relative;
  }
}
.valid-area {
  display: table;
  width: 100%;
  > * {
    display: table-cell;
  }
  .valid {
    width: 320px;
  }
  .valid-btn {
    padding-left: 8px;
    vertical-align: middle;
    button {
      width: 100%;
      height: 40px;
    }
  }
}
.input-warning {
  font-size: 12px;
  color: #f00;
  font-weight: bold;
}
.keyboard-area {
  text-align: center;
  padding: 16px;
}
.keyboard {
  margin: 0 auto;
}
.info-warp {
  background-color: #f5f5f5;
  > .overview-item {
    padding: 12px;

    > .card-message {
      border-radius: 10px;
      background-color: #fff;
      padding: 12px 0px;
      box-shadow: 0 0 20px #ccc;

      h3 {
        font-size: 14px;
        font-weight: bolder;
        color: #dca31f;
        margin: 0 12px;
        margin-bottom: 20px;
      }

      > .cardInfo {
        display: flex;
        font-size: 14px;
        font-weight: 600;
        height: 30px;
        line-height: 1;
        margin: 0 12px;
        > .cardInfo-left {
          flex: 1;
        }

        > .cardInfo-right {
        }
      }

      > .removeBtn {
        border-top: 1px dashed #ccc;
        height: 50px;
        text-align: center;
        line-height: 50px;
        font-size: 17px;
        font-weight: bold;
        cursor: pointer;
        color: #666;
        > .iconRemove {
          vertical-align: text-top;
          font-size: 25px;
          color: #ccc;
          margin-right: 10px;
        }
      }
    }
  }
  .overview-item + .overview-item {
    border-top: 1px dashed #ddd;
  }
}
.list-title {
  font-size: 15px;
  color: #999;
  margin-bottom: 20px;
  margin-top: 10px;
  font-weight: 400;
}
.card-list {
  height: 300px;
  overflow: hidden;
}
</style>

<style lang="less">
.warnInfo {
  > .el-input {
    > input {
      border: 1px solid red;
    }
  }
}
</style>
