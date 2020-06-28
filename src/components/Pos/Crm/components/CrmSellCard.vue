<template>
  <el-form
    class="form-warp"
    :model="sellCardForm"
    :rules="sellCardRules"
    ref="sellCardForm"
    label-width="96px">
    <el-form-item
      :label="$t('Dict.CardNumber')+'：'"
      prop="cardnumber"
      class="card-input-warp">
      <el-input
        class="card-input"
        ref="sellCardNumber"
        v-model.trim="sellCardForm.cardnumber"
        v-judge
      >
      </el-input><button class="btn btn-primary" @click="readCard" type="button">
        {{ $t('Dict.CardReading') }}<span class="quick-tip">(Enter)</span>
      </button>
    </el-form-item>
    <template v-if="cardInfo">
      <!-- $t姓名,性别,男,女,手机号,设置密码 -->
      <el-form-item :label="$t('Dict.FullName')+'：'" prop="name" class="name-input-warp">
        <el-input class="name-input" v-model.trim="sellCardForm.name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('Dict.Gender')+'：'" prop="gender" class="gender-input-warp">
        <el-radio-group class="gender-input" v-model.trim="sellCardForm.gender">
          <el-radio :label="male">{{ $t('Dict.Male') }}</el-radio>
          <el-radio :label="female">{{ $t('Dict.Female') }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="$t('Dict.PhoneNumber')" prop="mobile" class="mobile-input-warp">
        <el-input class="mobile-input" v-model.trim="sellCardForm.mobile" v-judge></el-input>
      </el-form-item>
      <el-form-item :label="$t('Biz.Crm.SetPwd')" prop="password" class="password-input-warp">
        <el-switch v-model.trim="sellCardForm.hasPassword">
        </el-switch>
          <el-input
            v-judge
            type="password"
            :disabled='!sellCardForm.hasPassword'
            class="password-input"
            v-model.trim="sellCardForm.password"
          >
          </el-input>
      </el-form-item>
      <el-form-item :label="$t('Biz.Booking.Birthday')" prop="birthday" class="birthday-input-warp">
        <el-select
          v-model.trim="sellCardForm.calendarType"
          :placeholder="$t('Dict.PleaseChoose')"
          class="calender-select"
        >
          <el-option
            v-for="item in calendarTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select><el-date-picker
          v-judge
          class="birthday-input"
          v-model.trim="sellCardForm.birthday"
          type="date"
          :placeholder="$t('Biz.Crm.SetBirthday')">
        </el-date-picker>
      </el-form-item>
      <el-form-item class="btn-warp" label-width="0">
        <button class="btn btn-default" type="button" @click="reset">
          {{ $t('Biz.Crm.Reset') }}<span class="quick-tip">(PgUp)</span>
        </button>
        <button class="btn btn-primary" type="button" @click="submit">
          {{ $t('Dict.Sure') }}<span class="quick-tip">(PgDn)</span>
        </button>
      </el-form-item>
    </template>
  </el-form>
</template>
<script>
import { isEmpty } from 'lodash';
import ajax from '@/common/js/ajax';

// 数字不足两位，在前面补0
function addZero(num) {
  const str = `${num}`;
  if (str.length === 1) return `0${str}`;
  return str;
}

// 转为正常时间字符串
function toNormalDateStr(date) {
  const year = date.getFullYear();
  const month = addZero(date.getMonth() + 1);
  const day = addZero(date.getDate());
  return `${year}-${month}-${day}`;
}

export default {
  model: {
    prop: 'cardInfo',
    event: 'change',
  },
  props: {
    cardInfo: {
      required: true,
    },
  },
  data() {
    return {
      sellCardForm: {
        cardnumber: '',
        name: '',
        gender: 'male',
        mobile: '',
        hasPassword: false,
        password: '',
        calendarType: 'SOLAR',
        birthday: new Date(),
      },
      sellCardRules: {
        cardnumber: [
          // { required: true, message: '请输入卡号', trigger: 'change' },
          { required: true, message: this.$t('Biz.Crm.CrmTip14'), trigger: 'change' },
        ],
        name: [
          // { required: true, message: '请输入姓名', trigger: 'change' },
          { required: true, message: this.$t('Biz.Crm.CrmTip15'), trigger: 'change' },
        ],
        mobile: [
          // { required: true, message: '请输入手机号码', trigger: 'change' },
          // { pattern: /^1\d{10}$/, message: '请输入正确11位手机号码', trigger: 'change' },
          { required: true, message: this.$t('Biz.Crm.CrmTip16'), trigger: 'change' },
          { pattern: /^1\d{10}$/, message: this.$t('Biz.Crm.CrmTip17'), trigger: 'change' },
        ],
        gender: [
          // { required: true, message: '请输入性别', trigger: 'change' },
          { required: true, message: this.$t('Biz.Crm.CrmTip18'), trigger: 'change' },
        ],
        birthday: [
          // { type: 'date', message: '请选择日期', trigger: 'change' },
          { type: 'date', message: this.$t('Biz.Crm.CrmTip19'), trigger: 'change' },
        ],
        password: [
          // { len: 6, message: '密码只能为6个字符', trigger: 'blur' },
          { len: 6, message: this.$t('Biz.Crm.CrmTip20'), trigger: 'blur' },
        ],
      },
      // 日历类型
      calendarTypes: [{
        value: 'SOLAR',
        // label: '阳历',
        label: this.$t('Dict.SolarCalendar'),
      }, {
        value: 'LUNAR',
        // label: '阴历',
        label: this.$t('Biz.Crm.Lunar'),
      }],
    };
  },
  watch: {
    // 监听是否需要密码，并修改验证规则
    'sellCardForm.hasPassword': function (hasPassword) {
      if (!hasPassword) {
        this.sellCardForm.password = '';
      }
    },
    'cardInfo.cardNo': function (cardNo) {
      this.sellCardForm.cardnumber = cardNo;
    },
  },
  methods: {
    // 设置当前热键 售卡分页, 作为默认首显示, 作为顶级快捷键对象
    setCurrentHotkey() {
      this.$hotKey.set('Pos.Crm', {
        Enter: () => {
          this.readCard();
        },
        PgUp: () => {
          this.reset();
        },
        PgDn: () => {
          this.submit();
        },
      });
    },
    // 读卡
    readCard() {
      /** 读卡逻辑
       * 1.当输入框不空时,直接执行'读卡'接口,进行卡验证和获取卡数据;
       * 2.当输入框为空时,使用读卡器读取卡号, 赋值数据框绑定变量,再执行'读卡'接口,获取卡数据;
       * 3.当重置后,输入框清空(undefined), 重复步骤2逻辑.
      */
      // 当卡号为空时, 执行设备管理器读卡
      if (isEmpty(this.sellCardForm.cardnumber)) {
        this.$devices.Cardop.read((card) => {
          if (+card.returnCode === 0) {
            this.sellCardForm.cardnumber = card.CardNo;
            this.loadCard();
          } else {
            // this.$message.error('读卡失败');
            this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg082'));
          }
        });
      } else {
        this.loadCard();
      }
    },
    loadCard() {
      ajax('canyin.pos.crm.crmsalescounter.readcard', {
        contentType: 'URLEncoded',
        data: {
          cardNo: this.sellCardForm.cardnumber,
        },
      }).then((data) => {
        if (data.success) {
          this.$message.success(data.msg);
          this.$emit('change', data.data);
        } else {
          this.$message.warning(data.msg);
        }
      });
    },
    // 重置表单
    reset() {
      this.$refs.sellCardForm.resetFields();
      this.$emit('change', null);
      this.$refs.sellCardNumber.focus();
    },
    // 提交
    submit() {
      this.$refs.sellCardForm.validate((valid) => {
        if (valid) {
          ajax('canyin.pos.crm.crmsalescounter.salecard', {
            contentType: 'paramsEncoded',
            data: {
              cardNo: this.sellCardForm.cardnumber,
              mobile: this.sellCardForm.mobile,
              name: this.sellCardForm.name,
              sex: this.sellCardForm.gender,
              birthday: toNormalDateStr(this.sellCardForm.birthday),
              isNeedPwd: this.sellCardForm.hasPassword ? '1' : '0',
              pwd: this.sellCardForm.hasPassword ? this.sellCardForm.password : '',
              birthdaytype: this.sellCardForm.calendarType,
            },
          }).then((data) => {
            if (data.success) {
              this.$message.success(data.msg);
              this.showChargeConfirm();
            } else {
              this.$message.warning(data.msg);
            }
          });
        } else {
          // this.$message.warning('请完善表单信息');
          this.$message.warning(this.$t('Biz.Crm.CrmTip07'));
          return false;
        }
        return undefined;
      });
    },
    // 显示跳转充值对话框
    showChargeConfirm() {
      // this.$confirm('是否立即充值?', '提示', {
      this.$confirm(this.$t('Biz.Crm.CrmTip21'), this.$t('Dict.Tips'), {
        confirmButtonText: this.$t('Dict.Sure'),
        cancelButtonText: this.$t('Dict.Cancel'),
        type: 'warning',
      }).then(() => {
        this.$emit('charge');
      }).catch(() => {
        this.$refs.sellCardForm.resetFields();
        this.$emit('change', null);
      });
    },
  },
};
</script>
<style lang="less" scoped>
  button{
    font-size: 16px;
    .quick-tip{
      font-size: 14px;
    }
  }
  .form-warp{
    width: 523px;
    text-align: left;
  }
  .card-input-warp{
    .card-input{
      width: 310px;
    }
    button{
      height: 38px;
      margin-left: 16px;
      width: 100px;
    }
  }
  .name-input-warp{
    .name-input{
      width: 236px;
    }
  }
  .mobile-input-warp{
    .mobile-input{
      width: 236px;
    }
  }
  .gender-input-warp{
    .gender-input{
      vertical-align: baseline;
    }
  }
  .password-input-warp{
    .password-input{
      width: 348px;
      margin-left: 36px;
    }
  }
  .birthday-input-warp{
    .calender-select{
      width: 200px;
    }
    .birthday-input{
      margin-left: 12px;
      width: 212px;
    }
  }
  .btn-warp{
    text-align: center;
    button{
      width: 200px;
      height: 42px;
    }
    button+button{
      margin-left: 16px;
    }
  }
</style>
