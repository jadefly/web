<template>
  <Dialog
      name="PosDialog.PayWayRGJcrmYZModel"
      :title="$t('Dict.Password')"
      ref="dialog"
      @close="onClose"
      @open="onOpen"
      @submit="onSubmit"
      :hotkeys="ration"
      :append-to-body="true"
      :showSubmit="true"
      width="480px"
      height="260px"
      top="10vh"
    >
    <div class="payWayRGJcrmYZModel">
      <div class="yzInfo">
        <div class="selectYzType">
          <el-radio-group v-model="yzType" @change="yzTypeChange">
             <el-radio label="P">{{$t('Dict.Password')}}</el-radio>
            <el-radio v-if="memberCardTypeId != '100'" label="M">{{$t('Dict.VerificationCode')}}</el-radio>
          </el-radio-group>
        </div>
        <div v-if="yzType == 'P'">
          <el-input
           type="password"
            class="w300"
            ref="pwdInput"
            v-model="yzInfo"
            :placeholder="$t('Biz.Settlement.EnterPw')">
          </el-input>
        </div>
        <div v-else-if="yzType == 'M'">
          <el-input
            class="w220"
            v-model="yzInfo"
            :placeholder="$t('Biz.Settlement.EnterVerificationCode')">></el-input>
          <el-button
            type="primary"
            :disabled="!isSendMsg"
             @click="sendvalidatesms">
             {{mBtnTip}}
          </el-button>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import { mapGetters } from 'vuex';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  props: {

  },
  data() {
    return {
      yzInfo: '', // 验证信息
      yzType: '',
      mBtnTip: '',
      interSend: '',
      isSendMsg: true, // 是否可以发送短信验证码
      memberCardTypeId: 65, // 卡类型id默认65，实名卡
    };
  },
  computed: {
    ...mapGetters(['posBaseInfo']),
    // 添加快捷键
    ration() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  methods: {
    onOpen() {
      this.yzInfo = '';
      this.isSendMsg = true;
      this.yzType = this.resData.type;
      this.mBtnTip = `${this.$t('Biz.Settlement.SendVerificationCode')}`;
      this.memberCardTypeId = this.resData.userInfo.memberCardTypeId;
      this.$nextTick(() => {
        if (this.yzType === 'P') {
          this.$refs.pwdInput.focus();
        }
      });
    },
    yzTypeChange(res) {
      this.yzInfo = '';
      if (this.resData.type === 'M' && res === 'P') {
        this.yzType = this.resData.type;
        this.$message.error(`${this.$t('Biz.Settlement.Error27')}`);
      }
    },
    onSubmit() {
      if (this.strIsEmpty(this.yzInfo)) {
        this.$message.error(`${this.$t('Biz.Settlement.Error28')}`);
        return;
      }
      this.submit({
        validatePasswordType: this.yzType,
        verifyPassword: this.yzInfo,
      });
    },
    strIsEmpty(str) {
      return str == null || !str || typeof str === 'undefined' || str === '' || str.replace(/(^\s*)|(\s*$)/g, '').length === 0;
    },
    sendvalidatesms() {
      this.isSendMsg = false;
      this.sendTimer();
      ajax('canyin.pos.settlement.pay.glorybutlerpayway.sendvalidatesms', {
        contentType: 'URLEncoded',
        data: {
          mobile: this.resData.userInfo.mobile,
          validateCode: 'verifyChangeValue',
        },
      }).then((resData) => {
        const res = JSON.parse(resData);
        if (+res.code === 0) {
          // 暂不做任何处理
        } else {
          this.$message.error(res.message);
        }
      });
    },
    sendTimer() {
      let time = 60;
      this.interSend = setInterval(() => {
        if (time === 0) {
          clearInterval(this.interSend);
          this.isSendMsg = true;
          this.mBtnTip = `${this.$t('Biz.Settlement.SendVerificationCode')}`;
        } else {
          this.mBtnTip = `(${time})${this.$t('Dict.Second')}`;
        }
        time -= 1;
      }, 1000);
    },
    onClose() {
      if (this.yzType === 'M') {
        clearInterval(this.interSend);
      }
    },
  },
};
</script>

<style lang="less" scoped>
  .payWayRGJcrmYZModel{
    background: #fff;
    height: 100%;
    .yzInfo{
      padding: 30px;
    }
    .selectYzType{
      margin-bottom: 35px;
    }
    .w300{
      width: 300px;
    }
    .w220{
      width: 220px;
    }
  }
</style>
