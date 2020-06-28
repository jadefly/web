<template>
  <div class="openCard">
    <div class="inlineBlock textLeft">
      <!-- 卡型 -->
      <div class="mb9">
        <span class="inlineBlock textRight w100"><span class="sart">*</span><span>{{$t('Dict.CardType1')}}</span></span>
        <el-select v-model="selectCarType" placeholder="请选择卡型" @change="cardTypeChangeFun">
          <el-option
            v-for="(item, index) in carTypeList"
            :key="index"
            :label="item.name"
            :value="index+1" :disabled="item.disabled">
          </el-option>
        </el-select>
      </div>
      <!-- 卡号 -->
      <div class="mb9">
        <span class="inlineBlock textRight w100"><span class="sart">*</span><span>{{$t('Dict.CardNumberLabel')}}</span></span>
        <input class="w300 inputStyle" v-model="cardNum" :maxlength="50" @input="checkcardNumFun"/>
      </div>
      <!-- 有效期 -->
      <div class="mb9">
        <span class="inlineBlock textRight w100">
          <span class="sart">*</span>
          <span>{{$t('Biz.Pos.Member.OpenCardSpan3')}}</span>
        </span>
        <el-date-picker
          id="startDateCard"
          name="startDate"
          v-model="startDate"
          type="date"
          :placeholder="$t('Dict.StartDate')"
          value-format="yyyy-MM-dd"
          size="mini"
          @change="endDateChange"
        >
       </el-date-picker>
        <span>{{$t('Dict.To')}}</span>
        <el-date-picker
          id="endDateCard"
          name="endDate"
          v-model="endDate"
          type="date"
          :placeholder="$t('Dict.EndDate')"
          value-format="yyyy-MM-dd"
          size="mini"
          @change="endDateChange"
          >
        </el-date-picker>
      </div>
      <!-- 必须选择卡型 && 所选卡型必须为记名卡 -->
      <template >
        <!-- 手机号 -->
        <div class="mb9" v-show="registeredCard">
          <span class="inlineBlock textRight w100">
            <span class="sart">*</span>
            <span>{{$t('Dict.PhoneNumberLabel')}}</span>
          </span>
          <input class="w300 inputStyle" v-model="phone" @input="checkPhone" :maxlength="11"/>
          <el-button type="primary" @click="yzPhone">{{$t('Biz.Pos.Member.OpenCardBtn1')}}</el-button>
        </div>
      </template>
      <!-- 卡型为记名，并且手机号验证通过 -->
      <template v-if="registeredCard && isYzPhone">
        <!-- 姓名 -->
        <div class="mb9">
          <span class="inlineBlock textRight w100">
            <span class="sart">*</span>
            <span>{{$t('Dict.FullNameLabel')}}</span>
          </span>
          <el-input
            :disabled="!isNewMember"
            class="w300"
            v-model="userName"
            :maxlength="10">
          </el-input>
          </div>
        <!-- 性别 -->
        <div class="mb9">
          <span class="inlineBlock textRight w100">{{$t('Dict.GenderLabel')}}</span>
          <el-radio v-model="userSex" label="M" :disabled="!isNewMember">{{$t('Dict.Male')}}</el-radio>
          <el-radio v-model="userSex" label="F" :disabled="!isNewMember">{{$t('Dict.Female')}}</el-radio>
        </div>
        <!-- 称呼 -->
        <div class="mb9">
          <span class="inlineBlock textRight w100">{{$t('Biz.Pos.Member.OpenCardSpan7')}}</span>
          <el-input
            class="w300"
            v-model="nickname"
            :disabled="!isNewMember"
            :maxlength="100"
          >
          </el-input>
        </div>
        <!-- 验证方式 -->
        <div class="mb9">
          <span class="inlineBlock textRight w100">{{$t('Biz.Pos.Member.OpenCardSpan8')}}</span>
          <el-radio-group v-model="verificationType" @change="selectSexFun">
            <el-radio label="M">{{$t('Biz.Pos.Member.OpenCardRedio3')}}</el-radio>
            <el-radio label="P">{{$t('Biz.Pos.Member.OpenCardRedio4')}}</el-radio>
            <el-radio label="U">{{$t('Biz.Pos.Member.OpenCardRedio5')}}</el-radio>
          </el-radio-group>
        </div>
        <div class="userPwd mb9">
          <el-input
            type="password"
            class="w165"
            v-model="userPwd1"
            :disabled="verificationType != 'P'"
            :placeholder="$t('Biz.Pos.Member.OpenCardPh3')"
            size="mini"
          >
          </el-input>
          <el-input
            type="password"
            class="w165"
            v-model="userPwd2"
            :disabled="verificationType != 'P'"
            :placeholder="$t('Biz.Pos.Member.OpenCardPh4')"
            size="mini"
          >
          </el-input>
        </div>
      </template>
      <!-- 显示条件：必须选中卡型 -->
      <template v-if="selectCarType && (!registeredCard || (registeredCard && isYzPhone))">
        <!-- 备注 -->
        <div class="mb9">
          <span class="inlineBlock textRight w100">{{$t('Biz.Pos.Member.OpenCardSpan9')}}</span>
          <el-input
            type="textarea"
            class="w450 verticalAlignTop"
            :autosize="{ minRows:3, maxRows: 3}"
            resize="none"
            :placeholder="$t('Dict.EnterSomething')"
            v-model="remarks"
            :maxlength="50"
          >
          </el-input>
        </div>
        <!-- 充值规则： -->
        <div class="mb9">
          <span class="inlineBlock textRight w100">{{$t('Biz.Pos.Member.OpenCardSpan10')}}</span>
          <div class="w450 rechargeRuleStyle inlineBlock verticalAlignTop lineFeed">
            {{rechargeRule ? rechargeRule : `${$t('Biz.Pos.Member.OpenCardMsg1')}`}}
          </div>
        </div>
        <!-- 按钮 -->
        <div class="textCenter">
          <el-button class="openCardBtn" @click="resetFun">{{$t('Biz.Crm.Reset')}}</el-button>
          <el-button type="primary" class="openCardBtn" @click="openCardFun">{{$t('Biz.Pos.Member.OpenCardBtn3')}}</el-button>
          <el-button class="openCardBtn" @click="openCardAndRecharge">{{$t('Biz.Pos.Member.OpenCardBtn4')}}</el-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { MessageBox } from 'element-ui';
import ajax from '@/common/js/ajax';

export default {
  props: {
    activeIndex: {
      type: Boolean,
      default() {
        return false;
      },
    },
    rgjCrmInfo: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      registeredCard: false, // 用户选择的是否是记名卡
      endDate: '', // 卡的有效期：开始-结束
      startDate: '',
      selectCarType: '', // 当前用户选择的卡值, 默认无值，卡型商户手动选择
      // 用户信息
      cardNum: '', // 卡号
      phone: '', // 手机号
      userName: '', // 姓名
      userSex: 'M', // 性别
      nickname: '', // 称呼
      verificationType: 'M', // 验证方式 P卡密,M 邮件: U 无密码（默认U）
      userPwd1: '',
      userPwd2: '',
      remarks: '', // 备注
      rechargeRule: '', // 充值规则
      isNewMember: true, // 是否为新会员
      isYzPhone: false, // 是否验证手机号是否通过
      carTypeList: [], // 卡类型数据
      userInfo: {}, // 是会员，调取接口获得的会员信息
      selectCardTypeInfo: {},
      pattern: new RegExp("[\\-\\+\"`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]"),
    };
  },
  created() {
    this.formatTime(); // 获取当前时间及100年后时间（用于卡有效期默认值）
    this.open();
  },
  mounted() {
    this.hotKey();
  },
  methods: {
    hotKey() {
      this.$hotKey.set('Pos.Member', {
        // 读卡
        Enter: () => {
          if (this.registeredCard) {
            this.yzPhone();
          }
        },
      });
    },
    checkPhone() {
      let rs = '';
      this.phone = this.phone.replace(/[\u4e00-\u9fa5|a-z|A-Z]/g, '');
      for (let i = 0; i < this.phone.length; i += 1) {
        rs += this.phone.substr(i, 1).replace(this.pattern, '');
      }
      this.phone = rs;
    },
    open() {
      this.selectCarType = '';
      this.reset();
      // 先调取充值规则的接口
      ajax('canyin.pos.settlement.pay.glorybutlerpayway.getrechargerule', {
        contentType: 'paramsEncoded',
      }).then((res) => {
        const resData = JSON.parse(res);
        if (+resData.code === 0) {
          this.rechargeRule = resData.data ? resData.data.replace(/\\n/g, ' \r\n ') : '';
        } else {
          this.$message.error(resData.message);
        }
      });
      // 获取卡型列表
      ajax('canyin.pos.settlement.pay.glorybutlerpayway.getcardtype', {
        contentType: 'paramsEncoded',
      }).then((res) => {
        const resData = JSON.parse(res);
        if (+resData.code === 0) {
          this.carTypeList = resData.data;
        } else {
          this.$message.error(resData.message);
        }
      });
    },
    cardTypeChangeFun(res) { // 判断卡型，实名，非实名
      this.reset();
      this.selectCardTypeInfo = this.carTypeList[res - 1];
      if (this.carTypeList[res - 1].code.toString() === '100') {
        this.verificationType = 'U';
        this.registeredCard = false;
      } else {
        this.verificationType = 'M';
        this.registeredCard = true;
      }
    },
    yzPhone() { // 验证手机号
      const phoneReg = /^[1]\d{10}$/;
      if (!phoneReg.test(this.phone)) {
        this.$message.error(this.$t('Biz.Pos.Member.OpenCardMsg2'));
        return;
      }
      // 验证手机号是否为会员
      ajax('canyin.pos.settlement.pay.glorybutlerpayway.queryismember', {
        contentType: 'URIEncoded',
        data: {
          mobile: this.phone,
        },
      }).then((resData) => {
        const res = JSON.parse(resData);
        if (+res.code === 0) { // 是会员，调取查询会员信息接口
          this.isNewMember = false;
          this.checkHuiYuanInfo();
        } else if (+res.code === -2) { // 不是会员
          this.isYzPhone = true;
          this.isNewMember = true;
          this.userName = '';
          this.userSex = 'M';
          this.nickname = '';
          this.remarks = '';
        } else {
          this.$message.error(res.message);
        }
      });
    },
    checkHuiYuanInfo() { // 查询会员信息
      ajax('canyin.pos.settlement.pay.glorybutlerpayway.querymember', {
        contentType: 'URIEncoded',
        data: {
          keyword: this.phone,
        },
      }).then((resData) => {
        const res = JSON.parse(resData);
        if (+res.code === 0) {
          if (res.data) {
            if (res.data.blackPhone) {
              this.$message.error(this.$t('Biz.Pos.Member.OpenCardMsg3'));
            } else {
              this.userName = res.data.name;
              this.isYzPhone = true;
              this.userInfo = res.data;
              this.nickname = res.data.nickName;
              this.userSex = res.data.gender;
              this.remarks = '';
            }
          }
        } else {
          this.$message.error(res.message);
        }
      });
    },
    selectSexFun() {
      this.userPwd1 = '';
      this.userPwd2 = '';
    },
    formatTime() { // 获取卡有效期的默认值
      const date = new Date();
      const year = date.getFullYear();
      const month = (date.getMonth() + 1) < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
      const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
      const year2 = year + 100;
      this.startDate = [year, month, day].join('-');
      this.endDate = [year2, month, day].join('-');
    },
    checkBeforeSubmit() { // 提交前检测
      const reg = /^[a-zA-Z0-9]+$/;
      if (this.strIsEmpty(this.cardNum) || !reg.test(this.cardNum)) {
        this.$message.error(this.$t('Biz.Pos.Member.OpenCardMsg4'));
        return false;
      }
      if (this.strIsEmpty(this.startDate) || this.strIsEmpty(this.endDate)) {
        this.$message.error(this.$t('Biz.Pos.Member.OpenCardMsg5'));
        return false;
      }
      if (!this.endDateChange()) { return false; }
      if (this.registeredCard) {
        const phoneReg = /^[1]\d{10}$/;
        if (this.strIsEmpty(this.phone) || !phoneReg.test(this.phone)) {
          this.$message.error(this.$t('Biz.Pos.Member.OpenCardMsg2'));
          return false;
        }
        if (this.strIsEmpty(this.userName)) {
          this.$message.error(this.$t('Biz.Pos.Member.OpenCardMsg6'));
          return false;
        }
        if (this.verificationType === 'P') {
          // this.userPwd1
          const regPsd = /^[0-9]{6,12}$/;
          if (!regPsd.test(this.userPwd1)) {
            this.$message.error(this.$t('Biz.Pos.Member.OpenCardMsg6'));
            return false;
          }
          if (this.userPwd1 !== this.userPwd2) {
            this.$message.error(this.$t('Biz.Pos.Member.OpenCardMsg7'));
            return false;
          }
        }
      }
      if (this.remarks && this.remarks.length > 200) {
        this.$message.error(this.$t('Biz.Pos.Member.OpenCardMsg8'));
        return false;
      }
      return true;
    },
    openCardFun(callback) {
      let url = '';
      // 开卡调取接口，要区分，匿名卡，或，记名卡，还有会员，非会员
      if (!this.checkBeforeSubmit()) { return; } // 判断必填项是否正确填写
      let lastParams;
      const params = { // 通用的请求参数字段
        hardCardNumber: this.cardNum ? this.cardNum.toUpperCase() : null, // 外卡号
        memberCardTypeId: this.selectCardTypeInfo.code, // 会员卡类型
        beginDate: this.startDate, // 有效开始时间
        endDate: this.endDate, // 有效截止时间
        remark: this.remarks, // 备注
        password: this.userPwd1 ? this.userPwd1 : null, // 卡交易密码
        passwordType: this.verificationType, // 卡验证方式
        memberCardTypeName: this.selectCardTypeInfo.name, // 会员卡类型名称
        mobile: this.phone ? this.phone : null, // 手机号
        name: this.userName ? this.userName : null, // 用户姓名
      };
      if (!this.registeredCard || !this.isNewMember) { // 匿名卡 或 是会员，只开卡
        url = 'canyin.pos.settlement.pay.glorybutlerpayway.opencard';
        params.memberId = this.registeredCard ? this.userInfo.id : null;
        params.price = '';
        lastParams = { openCardParams: JSON.stringify(params) };
      } else if (this.registeredCard && this.isNewMember) { // 记名卡 并且 非会员 ，开卡并注册
        url = 'canyin.pos.settlement.pay.glorybutlerpayway.registandopencard';
        params.gender = this.userSex ? this.userSex : null;
        params.nickName = this.nickname;
        lastParams = { registAndOpenCardParams: JSON.stringify(params) };
      }
      ajax(url, {
        contentType: 'URLEncoded',
        data: lastParams,
      }).then((resData) => {
        const res = JSON.parse(resData);
        if (+res.code === 0) { // 开卡成功后，如果有callback，执行callback (callback 开卡并充值触发的)
          this.$message.success(res.message);
          const bool = Object.prototype.toString.call(callback) === '[object Function]';
          const cardno = {
            uid: res.data,
            psw: 'FFFFFF',
            comport: this.rgjCrmInfo.comport,
            comrate: this.rgjCrmInfo.comrate,
          };
          // 调取写卡接口
          this.$devices.Cardop.writeNewCardRGJ((card) => {
            // if (card.returnCode == 0) {
            //   this.$message.success(card.MsgText)
            // } else {
            MessageBox.alert(card.MsgText, '提示');
            // }
          }, cardno);
          if (bool) {
            callback();
          } else {
            this.selectCarType = '';
            this.reset();
          }
        } else {
          this.$message.error(res.message);
        }
      });
    },
    strIsEmpty(str) {
      return str == null || !str || typeof str === 'undefined' || str === '' || str.replace(/(^\s*)|(\s*$)/g, '').length === 0;
    },
    openCardAndRecharge() { // 开卡并充值
      this.openCardFun(() => {
        this.$emit('changeActiveFunBar', {
          activeIndex: 1,
          cardNum: this.cardNum,
          rechargeRule: this.rechargeRule,
        });
      });
    },
    reset() {
      this.registeredCard = false;
      this.formatTime();
      this.cardNum = '';
      this.phone = '';
      this.userName = '';
      this.userSex = '';
      this.nickname = '';
      this.verificationType = 'M';
      this.userPwd1 = '';
      this.userPwd2 = '';
      this.remarks = '';
      this.isNewMember = true;
      this.isYzPhone = false;
      this.userInfo = {};
    },
    endDateChange() {
      const end = this.endDate ? Date.parse(new Date(this.endDate.replace(/-/g, '/'))) : '';
      const begin = this.startDate ? Date.parse(new Date(this.startDate.replace(/-/g, '/'))) : '';
      const date = new Date();
      const year = date.getFullYear();
      const month = (date.getMonth() + 1) < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
      const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
      const server = [year, month, day].join('-');
      const serverDate = Date.parse(new Date(server.replace(/-/g, '/')));
      if (begin < serverDate) {
        this.$message.error(this.$t('Biz.Pos.Member.OpenCardMsg10'));
        return false;
      }
      if (end < begin) {
        this.$message.error(this.$t('Biz.Pos.Member.OpenCardMsg11'));
        return false;
      }
      return true;
    },
    resetFun() {
      this.selectCarType = '';
      this.reset();
    },
    checkcardNumFun() {
      let rs = '';
      this.cardNum = this.cardNum.replace(/[\u4e00-\u9fa5]/g, '');
      for (let i = 0; i < this.cardNum.length; i += 1) {
        rs += this.cardNum.substr(i, 1).replace(this.pattern, '');
      }
      this.cardNum = rs;
      this.cardNum = this.cardNum.toUpperCase();
    },
  },
};

</script>


<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .openCard{
    padding-top: 15px;
    text-align: center;
    .lineFeed {
      white-space: pre-wrap;
    }
    .openCardBtn{
      width: 112px;
    }
    .userPwd{
      display: inline-block;
      vertical-align: top;
      padding-left: 110px;
    }
  }
  .w165{
    width: 165px;
  }
  .mb9{
    margin-bottom: 12px;
  }
  .rechargeRuleStyle{
    height: 60px;
    overflow: auto;
  }
</style>
