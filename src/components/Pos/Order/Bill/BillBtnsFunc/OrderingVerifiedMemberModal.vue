<template>
<!-- "VerifiedMember": "验证会员", -->
  <Dialog
    name="PosDialog.OrderingVerifiedMemberModal"
    :title="$t('Dict.VerifiedMember')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :showSubmit="false"
    :width="pageWidth"
    :hotkeys="hotKeySet"
  >
  <div class="content-warp">
    <div class="memberform-warp">
      <el-form ref="memberform" :label-width="memberLabelWidth" label-position='left'>
        <el-form-item :label="$t('Dict.Member1')" class="memberno-input-warp">
          <el-input
            class="memberno-input"
            v-model="memberno"
            v-judge
            @keydown.native.enter="queryMember"
            v-keyboard:keyboard="{ autoSelect: true }"
            v-autotest>
          </el-input>
          <!-- "CardReading": "读卡" -->
          <button
            class="btn btn-primary"
            @click="queryMember"
            type="button"
            v-autotest>{{ $t('Dict.CardReading') }}<span class="quick-tip">(Enter)</span>
          </button>
        </el-form-item>
      </el-form>
      <div class="keybord-warp">
        <KeyBoard class="keybord" ref="keyboard"></KeyBoard>
      </div>
      <!-- 电子券列表 -->
      <transition name="el-zoom-in-top">
        <div v-show="crmTicketListState" class="transition-box crmTicketList-warp">
          <div class="crmTicketList-header">
            <!-- "ETicketList": "电子券列表" -->
            <h3>{{ $t('Biz.Order.ETicketList') }}</h3>
            <button
              type="button"
              class="control btn btn-default"
              @click="crmTicketListState = !crmTicketListState">{{ $t('Dict.Close') }}</button>
          </div>
          <div class="crmTicketList-content">
            <Paging
              :data="crmTicketList"
              :itemWidth="230"
              :itemHeight="118"
              class="crmTicketList-list"
              ref="ticketList"
              id="fastFoodCrmTicketList">
              <div class="list-item"
                slot-scope="props"
                :style="{ 'background-color': props.item.type ?
                colorList[props.item.type] :
                colorList[props.index] }" >
                <div class="item-title">{{ props.item.title }}</div>
                <div class="circle-line-style">
                    <div class="coupon-left-circle"></div>
                    <hr class="coupon-middle-line">
                    <div class="coupon-right-circle"></div>
                </div>
                <div class="item-content">
                  <p class="item-content-title">
                    <span class="coupont-type" v-if="+props.item.type !== 2">
                      {{ (props.item.value) }}
                    </span>
                    <span class="coupont-type" v-else>
                      {{ (props.item.value + $t('Dict.Discount')) }}
                    </span>
                    <span v-if="props.item.threshold">{{ $t('Biz.Order.FullRelease', [props.item.threshold]) }}</span>
                    <span v-else>{{ $t('Biz.Order.NoMiniCharge') }}</span>
                  </p>
                  <p>{{ props.item.validStart + " "+ $t('Dict.To') + " " + props.item.validEnd }}</p>
                </div>
                <div class="item-count">{{ props.item.count }}</div>
              </div>
            </Paging>
          </div>
          <div class="crmTicketList-footer">
            <PagingBtn
              ref="ticketListBtn"
              :showInfo="true"
              class="pos-order-tables-pager"></PagingBtn>
          </div>
        </div>
      </transition>
      <!-- 验证会员卡 登记/取消, 执行折扣优惠方案 -->
      <div class="operation-warp" v-show="memberInfo">
         <button
          type="button"
          class="itemBtn btn btn-default"
          @click="cancelBindMember">{{ $t('Dict.Cancel') }}<span class="quick-tip">(PgUp)</span></button>
         <button
          type="button"
          class="itemBtn btn btn-primary"
          @click="onSubmit"
          v-autotest>{{ $t('Dict.Sure') }}<span class="quick-tip">(PgDn)</span></button>
      </div>
    </div>
    <div class="memberinfo-warp">
      <div class="card-warp" v-if="cardList.length > 0">
        <!-- "PlsSelectMemCard": "请选择会员卡" -->
        <h3 class="card-title">{{ $t('Biz.Order.PlsSelectMemCard') }}</h3>
        <div class="crmCardList-box">
          <Paging
            :data="cardList"
            :itemWidth="280"
            :itemHeight="48"
            ref="crmCardList"
            id="fastFoodCrmCardList">
            <button
              slot-scope="props"
              class="btn btn-default cardlist-item"
              @click="selectCard(props.item.cardNo)">
              {{props.item.cardNo}}
            </button>
          </Paging>
        </div>
        <div class="cardList-footer">
          <PagingBtn
            ref="crmCardListBtn"
            :showInfo="true"
            class="pos-order-tables-pager"></PagingBtn>
        </div>
      </div>
      <template v-if="memberInfo">
        <div class="base-info-area">
          <p class="mobile-info">
            <!-- 会员手机号 -->
            {{memberInfo.mobile}}
            <img v-if="memberInfo.sex == 1" src="@/common/images/sl-msg/icon_male.png">
            <img v-else src="@/common/images/sl-msg/icon_female.png">
            <!--
             会员类型, 参数 accountTypeId:
             4-线上(lineshop),
             1-微信(weixin),
             2-大众点评(dazhong),
             3-支付宝(alipay)
             -->
            <span v-show="memberInfo.accountTypeId == 1" class="weixin icon icon-weixin"></span>
            <span v-show="memberInfo.accountTypeId == 2" class="dazhong icon icon-dazhong"></span>
            <span v-show="memberInfo.accountTypeId == 3" class="alipay icon icon-alipay"></span>
            <span v-show="memberInfo.accountTypeId == 4" class="lineshop icon icon-lineshop"></span>
          </p>
          <p class="other-info">
            <!-- 会员姓名 生日  "Anonymous": "匿名"-->
            {{ memberInfo.memberName ? memberInfo.memberName : $t('Biz.Order.Anonymous')}}
            {{ memberInfo.birthday ? ' |' + memberInfo.birthday : ''}}
          </p>
        </div>
        <!-- 邀请码 -->
        <div
          class="detail-info-area detail-info-inviteCode"
          v-if="memberInfo.myInviteCode"
        >
          <p class="info-item">
            <!-- "InvitationCode:": "邀请码：" -->
            <span class="info-title">{{ $t('Biz.Order.InvitationCode') }}</span>
            <span class="info-content">
              <input
                class="hide-inviteCode"
                type="text"
                readonly="readonly"
                ref="copyObjDom"
                v-model="memberInfo.myInviteCode" />
            </span>
            <span class="info-btn">
              <button
                class="btn btn-default"
                @click="copyInviteCode"
                >{{ $t('Biz.Order.Copy') }}</button>
            </span>
          </p>
        </div>
        <div class="detail-info-area">
          <p class="info-item">
            <span class="info-title">{{ $t('Dict.CardType1') }}</span>
            <span class="info-content">{{memberInfo.cardType}}</span>
          </p>
          <p class="info-item">
            <span class="info-title">{{ $t('Dict.State1') }}</span>
            <span class="info-content">{{memberInfo.cardStatus}}</span>
          </p>
          <p class="info-item">
            <span class="info-title">{{ $t('Dict.CarBalance') }}</span>
            <span class="info-content">{{memberInfo.cardBalance}}</span>
          </p>
          <p class="info-item">
            <!-- "Integral1": "积分：" -->
            <span class="info-title">{{ $t('Dict.IntegralLabel') }}</span>
            <span class="info-content">{{memberInfo.cardScore}}</span>
          </p>
          <p class="info-item couponCount"  @click="openCrmTicketModal">
            <span class="info-title">{{ $t('Dict.MyElectronicTicket') }}</span>
            <span class="info-content">{{memberInfo.couponCount}}</span>
          </p>
          <p class="info-item">
            <span class="info-title">{{ $t('Dict.CumulativeRecharge') }}</span>
            <span class="info-content">{{memberInfo.cumulativeAmount}}</span>
          </p>
          <p class="info-item">
            <span class="info-title">{{ $t('Dict.CumulativeConsumption') }}</span>
            <span class="info-content">{{memberInfo.consumeAmount}}</span>
          </p>
          <p class="info-item">
            <span class="info-title">{{$t('Dict.AccumulatedPoints')}}</span>
            <span class="info-content">{{memberInfo.scoreAmount}}</span>
          </p>
          <p class="info-item">
            <span class="info-title">{{ $t('Biz.Order.CardValidity') }}</span>
            <span class="info-content">{{ validateStr }}</span>
          </p>
          <p class="info-item" v-if="memberInfo.lastConsumeTime">
            <!-- 上次消费时间 -->
            <span class="info-title">{{ $t('Dict.LastConsumptionTime') }}</span>
            <span class="info-content">{{memberInfo.lastConsumeTime}}</span>
          </p>
          <p class="info-item" v-if="memberInfo.lastConsumeShop">
            <!-- 上次消费地点 -->
            <span class="info-title">{{ $t('Dict.LastPlaceOfConsumption') }}</span>
            <span class="info-content">{{memberInfo.lastConsumeShop}}</span>
          </p>
          <p class="info-item" v-if="memberInfo.alreadyInvoiceMoney || memberInfo.alreadyInvoiceMoney == 0">
            <!-- 已开票金额 -->
            <span class="info-title">{{ $t('Dict.AlreadyInvoiceMoney') }}</span>
            <span class="info-content">{{memberInfo.alreadyInvoiceMoney}}</span>
          </p>
          <p class="info-item" v-if="memberInfo.allowInvoiceMoney || memberInfo.allowInvoiceMoney == 0">
            <!-- 剩余可开票金额 -->
            <span class="info-title">{{ $t('Dict.AllowInvoiceMoney') }}</span>
            <span class="info-content">{{memberInfo.allowInvoiceMoney}}</span>
          </p>
          <p class="info-item specialLine" v-if="memberInfo.note">
            <!-- 备注 -->
            <span class="info-title">{{ $t('Dict.VerifiedMemberNote') }}</span>
            <span class="info-content info-remark">{{memberInfo.note}}</span>
          </p>
        </div>
        <div class="select-area" v-if="isEnableMemberPrice || memberInfo.isHaveNcupMemPlan">
          <!-- "DoNotUseOffers": "不使用优惠" -->
          <button type="button"
            class="btn btn-default"
            :class="{ 'btn-primary': memberDiscountId == 0 }"
            @click="setMemberParams(0, false)"
          >{{ $t('Biz.Order.DoNotUseOffers') }}</button>
          <button type="button"
            class="btn btn-default"
            :class="{ 'btn-primary': memberDiscountId == 2 }"
            v-if="isEnableMemberPrice"
            @click="setMemberParams(2, true)"
          >{{ $t('Dict.MemberPrice') }}</button>
        </div>
      </template>
    </div>
  </div>
  </Dialog>
</template>

<script>
import Vue from 'vue';
import { isEmpty } from 'lodash';
import { mapGetters } from 'vuex';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import Paging from '@/components/Pos/Common/Paging';
import PagingBtn from '@/components/Pos/Common/PagingBtn';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

// 数字不足两位，在前面补0
function addZero(num) {
  const str = `${num}`;
  if (str.length === 1) return `0${str}`;
  return str;
}
// 转为正常时间字符串
function toNormalTimeStr(timeStamp) {
  const date = new Date(timeStamp);
  const year = date.getFullYear();
  const month = addZero(date.getMonth() + 1);
  const day = addZero(date.getDate());
  const hour = addZero(date.getHours());
  const min = addZero(date.getMinutes());
  const second = addZero(date.getSeconds());
  return `${year}-${month}-${day} ${hour}:${min}:${second}`;
}
export default {
  components: {
    Dialog, Paging, PagingBtn, KeyBoard,
  },
  mixins: [DialogMixin],
  data() {
    return {
      memberno: '',
      memberInfo: null,
      cardList: [],
      memberDiscountId: 0,
      isExecMemberPlan: true,
      oldMemberDiscountId: null,
      // 是否支持手机号/卡号输入验证(1-是, 0-否 只能走读卡器)
      inputBySelf: 1,
      // 电子券列表开关
      crmTicketListState: false,
      // 电子券 列表
      crmTicketList: [],
      // 电子券 列表项 固定显示个数
      crmTicketListItemFixNumber: 2,
      // 电子券 颜色列表
      colorList: ['#00aa7a', '#95c058', '#85c8be', '#60b8f0', '#4d8dca', '#ca9fd6', '#ec8d89', '#f3ad49'],
      pageWidth: '800px',
      memberLabelWidth: Vue.config.lang === 'enUS' ? '70px' : '54px',
    };
  },
  computed: {
    ...mapGetters(['posFastFood', 'posSettings']),
    hotKeySet() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
        PgUp: () => {
          this.cancelBindMember();
        },
      };
    },
    // 卡有效期
    validateStr() {
      if (this.memberInfo.validateEndTime === '' || this.memberInfo.validateEndTime === undefined) return this.$t('Dict.PermanentValidity');
      return this.memberInfo.validateEndTime.split(' ')[0];
    },
    isEnableMemberPrice() {
      return this.posSettings.isForceMemberQuery && this.posSettings.isHaveMemberPriceItem;
    },
  },
  methods: {
    /*
     * 业务逻辑: 执行和取消
     * 验证会员, 并 执行会员价: isExecMemberPlan-1, memberDiscountId-2
     * 验证会员, 不 执行会员价: isExecMemberPlan-0, memberDiscountId-0
     * 取消验证会员:           isExecMemberPlan-1
     * isExecMemberPlan-会员方案标识: 1-后端执行会员价业务逻辑（只对非快餐模式有效） , 0-不执行会员方案（只对非快餐模式有效）
     * memberdiscountId-告诉我执行了哪个优惠: 0 为不使用优惠、 1为执行第N杯打折(中餐不用)、2为执行会员价
     */
    onOpen() {
      /*
       * 业务逻辑: 执行和取消
       * isExecMemberPlan为 1 的时候代表告诉后端要执行会员价（只对非快餐模式有效）
       * 中餐模式下, 所以isExecMemberPlan写死为 0
       * memberdiscountId-告诉我执行了哪个优惠: 0 为不使用优惠、 1为执行第N杯打折(中餐不用)、2为执行会员价
       */
      ajax('canyin.pos.settlement.pay.crmPayWay.getcrmmemberinfo', {
        contentType: 'URLEncoded',
        data: {
          pointId: this.$store.getters.posOrderBill.bsData.pointId,
        },
      }).then((data) => {
        this.inputBySelf = data.inputBySelf;
        if (!isEmpty(data.data)) {
          this.memberInfo = data.data;
          this.oldMemberDiscountId = data.data.memberDiscountId; // 记录下老的验证过在此进来的打折id
          this.memberDiscountId = data.data.memberDiscountId;
          this.memberno = data.data.number;
          this.pageWidth = (this.memberInfo.note && this.memberInfo.note.length) > 90
            ? '900px'
            : '800px';
        }
        if (this.$refs.keyboard) {
          this.$refs.keyboard.reSelect();
        }
      });
    },
    // 关闭时执行(自动 和 Esc触发)
    onClose() {
      this.memberno = '';
      this.memberInfo = null;
      this.cardList = [];
      this.oldMemberDiscountId = null;
      this.crmTicketListState = false;
      this.close();
    },
    // 复制会员邀请码
    copyInviteCode() {
      this.$refs.copyObjDom.select();
      setTimeout(() => {
        // 执行 copy 操作
        // const successful = document.execCommand('copy');
        document.execCommand('copy');
        // "CardCopySusMsg": "邀请码复制成功"
        this.$message.success(this.$t('Biz.Order.CardCopySusMsg'));
        // console.log(successful);
      }, 0);
    },
    // 选择方案, 改写方案id值
    setMemberParams(memberDiscountId, isExecMemberPlan) {
      this.memberDiscountId = memberDiscountId;
      this.isExecMemberPlan = isExecMemberPlan;
    },
    // 选择会员卡
    selectCard(cardno) {
      this.memberno = cardno;
      this.queryMemberData();
    },
    // 读卡
    queryMember() {
      if (this.memberno === '') {
        this.$devices.Cardop.read((card) => {
          if (card.returnCode !== 0) {
            // ReadCardErrorMsg '请检查会员卡是否放置正常，读卡设备是否连通，若均正常请联系服务商'
            this.$message.error(this.$t('Biz.Order.ReadCardErrorMsg'));
          } else {
            this.memberno = card.CardNo;
            this.queryMemberData();
          }
        });
      }
      // 输入会员卡号或手机号有值时, 且支持手机号或卡号输入查询
      if (this.memberno) {
        if (this.inputBySelf) {
          this.queryMemberData();
        }
      }
    },
    // 查询会员卡
    queryMemberData() {
      // 关闭电子券 弹窗
      this.crmTicketListState = false;
      ajax('canyin.pos.settlement.pay.querymember', {
        contentType: 'URLEncoded',
        data: {
          cardNo: this.memberno,
          pointId: this.$store.getters.posOrderBill.bsData.pointId,
        },
      }).then((data) => {
        // 当返回crmVersion === -1时, crm环境或版本出现问题, 提示错误
        if (data.data && data.data.crmVersion === -1) {
          // "ReadCardErrorMsg01": "'抱歉，没有开通CRM，不能使用CRM验证会员'"
          this.$message.error(this.$t('Biz.Order.ReadCardErrorMsg01'));
        } else if (data.success && data.data.code !== -1) {
          this.$message.success(data.data.msg);
          // CRM6 读手机号,返回cardList时, 执行选择卡后, 在显示卡信息
          if (data.data.cardList) {
            this.memberInfo = '';
            this.cardList = data.data.cardList;
            // 刷新分页
            setTimeout(() => {
            // 分页组件初始化后, 传入数据, 重新刷新分页计算
              this.$refs.crmCardList.refresh();
              // 重新绑定 分页按钮和分页数据
              this.$refs.crmCardListBtn.bind(this.$refs.crmCardList);
            }, 100);
          } else {
            // CRM6 无卡列表(直接读卡或无卡列表) 和 CRM7时, 直接显示卡信息
            this.cardList = [];
            this.memberInfo = data.data;
            /* 判断CRM6 CRM7, 参数: crmVersion - 0(CRM6) / 1(CRM7)
            * CRM6-电子券列表, 会跟随本接口返回ticketList(电子券列表)数据, 不在请求'电子券'列表接口
            * CRM7-需要再次查询'电子券'接口, 进行数据查询
            */
            if (+data.data.crmVersion === 0) {
              this.crmTicketList = data.data.ticketList;
            }
            // 根据会员卡查询, 执行默认选中项
            if (
              +data.data.memberDiscountId !== 0
              && !data.data.memberDiscountId
              && +data.data.isHaveNcupMemPlan === 0
            ) {
              this.memberDiscountId = 2;
            } else {
              this.memberDiscountId = 0;
            }
          }
          this.pageWidth = (this.memberInfo.note && this.memberInfo.note.length) > 90
            ? '900px'
            : '800px';
        } else {
          this.$message.warning(data.data.msg);
        }
      });
    },
    // 取消绑定会员
    cancelBindMember() {
      ajax('canyin.pos.settlement.pay.crmPayWay.cancelmember', {
        contentType: 'URLEncoded',
        data: {
          pointId: this.$store.getters.posOrderBill.bsData.pointId,
          isExecMemberPlan: '1', // 中餐 写死
        },
      }).then((data) => {
        this.$message.success(data.msg);
        // console.log('OrderingVerifiedMemberModal1');
        this.$vemit('loadBill', this.$store.getters.posOrderBill.bsData.pointId);
        this.close();
      });
    },
    // 点击提交验证会员
    onSubmit() {
      // 阻拦 空数据
      if (this.memberno.trim() === '') {
        // "PlsInputMemCode": "请输入会员卡号",
        this.$message.warning(this.$t('Biz.Order.PlsInputMemCode'));
        return;
      }
      // 阻拦 会员信息 不存在 && 非法
      if (!this.memberInfo) {
        // ReadCardErrorMsg02  请查询会员成功后，再验证会员
        this.$message.warning(this.$t('Biz.Order.ReadCardErrorMsg02'));
        return;
      }
      // 阻拦 会员信息有效, 但卡状态不可用
      if (this.memberInfo.cardCanUse != null && +this.memberInfo.cardCanUse !== 1) {
        // "ReadCardErrorMsg03": "当前卡不可用, 请确认后重试",
        this.$message.warning(this.$t('Biz.Order.ReadCardErrorMsg03'));
        return;
      }
      // 通过验证, 执行绑定
      ajax('canyin.pos.settlement.pay.crmPayWay.registermember', {
        contentType: 'URLEncoded',
        data: {
          pointId: this.$store.getters.posOrderBill.bsData.pointId,
          isExecMemberPlan: +this.memberDiscountId === 2 ? '1' : '0', // 中餐下: 登记会员并执行会员价 2, 不执行(获取会员价)为 1
          memberDiscountId: parseInt(this.memberDiscountId, 10),
        },
      })
        .then((data) => {
          this.$message.success(data.msg);
          // console.log('OrderingVerifiedMemberModal2');
          this.$vemit('loadBill', this.$store.getters.posOrderBill.bsData.pointId);
          // this.$vemit('updatePoint');
          this.close();
        });
    },
    // 打开电子券列表
    openCrmTicketModal() {
      // 打开电子券列表
      this.crmTicketListState = !this.crmTicketListState;
      // 判断: CRM6-使用已存列表数据,刷新分页; CRM7-从接口拉去新数据后渲染显示
      if (+this.memberInfo.crmVersion === 0) {
        // 刷新分页
        this.$nextTick(() => {
          // 分页组件初始化后, 传入数据, 重新刷新分页计算
          this.$refs.ticketList.refresh();
          // 重新绑定 分页按钮和分页数据
          this.$refs.ticketListBtn.bind(this.$refs.ticketList);
        });
        return false;
      }
      // 读取接口(限CRM7使用)
      if (this.crmTicketListState) {
        ajax('canyin.pos.settlement.pay.crmPayWay.getcrmticketlistbymemberid', {
          params: {
            pointId: this.$store.getters.posOrderBill.bsData.pointId,
          },
        })
          .then((data) => {
            if (+data.code === 200) {
              // 传递 接口数据
              this.crmTicketList = data.ticketList;
              // 分页组件初始化后, 传入数据, 重新刷新分页计算
              this.$refs.ticketList.refresh();
              // 重新绑定 分页按钮和分页数据
              this.$refs.ticketListBtn.bind(this.$refs.ticketList);
            } else {
              this.$message.success(data.msg);
            }
          });
      }
      return false;
    },

  },

  filters: {
    dateStr(val) {
      return toNormalTimeStr(val);
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.content-warp{
  display: table;
  width: 100%;
  background-color: #f5f5f5;
  > * {
    vertical-align: top;
    display: table-cell;
    position: relative;
  }
}
.memberform-warp{
  background: @white;
  width: 420px;
  border-right: 1px solid #ddd;
  padding: 18px 16px;
}
.memberno-input-warp{
  .memberno-input{
    width: 218px;
    vertical-align: middle;
  }
  button{
    vertical-align: middle;
    height: 38px;
    margin-left: 10px;
    width: 100px;
  }
}
.keybord-warp{
  margin-top: 50px;
  text-align: center;
  .keybord{
    margin: 0 auto;
  }
}
.operation-warp {
  margin: 94px auto 0;
  text-align: center;
  > .itemBtn:first-child {
    margin-right: 20px;
  }
}

.card-warp{
  padding: 0 20px;
  .card-title{
    color: #999;
    line-height: 3.6;
  }
  .crmCardList-box {
    width: 280px;
    height: 265px;
    text-align: center;
    ul {
      height: 100%;
    }
  }
  .cardlist-item {
    width: 210px;
    height: 38px;
    margin-bottom: 10px;
  }
  .cardList-footer {
    width: 80%;
    position: absolute;
    bottom: 10px;
    text-align: right;
  }
  button{
    width: 100%;
    height: 38px;
  }
  button + button{
    margin-top: 12px;
  }
}


.base-info-area{
  padding: 12px 16px 4px;
  border-bottom: 1px dashed #b5b5b5;
  .mobile-info{
    font-size: 16px;
    line-height: 1.75;
    font-weight: bold;
    color: #333;
    vertical-align: middle;
    img{
      vertical-align: -3px;
    }
    > span {
      display: inline-block;
      width: 16px;
      height: 16px;
      line-height: 17px;
      vertical-align: 0;
      font-size: 17px;
      background-color: #fff;
    }
    .weixin {
      color: #0dca1b;
    }
    .dazhong {
      color: #ff8401;
    }
    .alipay {
      color: #01a0e9;
    }
    .lineshop {
      color: #f04549;
    }
  }
  .other-info{
    color: #666;
    line-height: 1.85;
  }
}

.detail-info-area.detail-info-inviteCode {
  padding: 4px 16px;
  border-bottom: 1px dashed #b5b5b5;
  .info-item {
    .info-content {
      float: left;
    }

    .info-btn {
      float: right;

      .btn-default {
        padding: 3px 12px;
      }
    }
  }

  .hide-inviteCode {
    background-color: #f5f5f5;
    outline: none;
    border: none;
    color: #000;
    &::selection {
      color: #000;
      background-color: #f5f5f5;
    }
  }
}

.detail-info-area{
  padding: 10px 16px;
  .info-item{
    overflow: hidden;
    line-height: 2;
    &.specialLine {
      line-height: 1.34;
    }
    .info-title{
      color: #666;
      float: left;
    }
    .info-content{
      color: #333;
      font-weight: bold;
      float: right;
      text-align: right;
    }
    .info-remark {
      float: unset;
      text-align: left;
      font-weight: normal;
    }
  }

  .info-item.couponCount {
    &:hover {
      cursor: pointer;
      .info-title,
      .info-content{
        text-decoration: underline;
      }
    }
    .info-title,
    .info-content {
       color: #428bca;
    }
  }
}

.select-area {
  padding: 10px;
  text-align: center;
  > button:nth-child(2) {
    width: 96px;
    margin-left: 20px;
  }
}


.crmTicketList-warp {
  width: 332px;
  height: 366px;
  position: absolute;
  top: 68px;
  left: 53px;
  right: 0;
  margin: auto;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: #fff;

  .crmTicketList-header {
    position: relative;
    height: 44px;
    background-color: #eee;
    border-radius: 4px 4px 0 0;
    border-bottom: 1px solid #c2c2c2;
    > h3 {
      border-left: 4px solid #0babb9;
      float: left;
      padding-left: 10px;
      margin-top: 12px;
      margin-left: 10px;
      font-size: 16px;
      font-weight: bold;
    }

    .control {
      position: absolute;
      right: 12px;
      top: 5px;
    }
  }
  .crmTicketList-content {
    width: 100%;
    height: 278px;
  }
  .crmTicketList-footer {
    width: 100%;
    height: 44px;
    bottom: 0;
    position: absolute;
    padding: 4px 10px;
    text-align: right;
    border-top: 1px solid #ddd;
  }
}

.crmTicketList-list {
  width: 100%;
  height: 100%;
  padding: 13px 0;

  .list-item {
    width: 230px;
    height: 118px;
    position: relative;
    margin: 0 13px 13px 13px;

    .item-title {
      height: 46px;
      line-height: 46px;
      padding-left: 15px;
      color: #fff;
    }

    .circle-line-style {
      width: 100%;
      .coupon-left-circle {
        float: left;
        margin-left: -6px;
        margin-top: -5px;
        width: 12px;
        height: 12px;
        background-color: #fff;
        border-radius: 50%;
      }
      .coupon-middle-line {
        border: 1px dashed #fff;
        margin: 0;
      }
      .coupon-right-circle {
        float: right;
        margin-right: -6px;
        margin-top: -5px;
        width: 12px;
        height: 12px;
        background-color: #fff;
        border-radius: 50%;
      }

    }

    .item-content {
      padding-left: 15px;
      color: #fff;
      .item-content-title {
        color: #333;

        .coupont-type {
          display: inline-block;
          width: 96px;
          color: #fff;
          padding-top: 6px;
          margin-bottom: 8px;
          font-size: 20px;
        }
      }
    }

    .item-count {
      position: absolute;
      top: 60px;
      right: -60px;
    }
  }
}
.lang-enUS {
  .memberno-input-warp button {
    width: 130px;
  }
  .memberno-input-warp .memberno-input {
    width: 170px;
  }
  .select-area > button:nth-child(2) {
    width: 112px;
  }
}
</style>
