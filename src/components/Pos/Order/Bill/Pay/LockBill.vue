<template>
  <div class="LockBill-mark" :class="{'displayNone': displayNone}" >
		<div class="LockBill-mark-conent">
			<img src="./images/LockBill.png" alt="">
			<div class="step1" v-if="!showTip">
				<div class="LockBill-mark-tip">{{$t('Biz.Settlement.LockStatus')}}</div>
				<button type="button" class="LockBill-mark-btn" @click="nextStep">{{$t('Biz.Pos.Common.Unlock')}}</button>
				<button type="button" class="closePayPager" @click="closePayPager">{{$t('Dict.Close')}}</button>
			</div>
			<div class="step2" v-else>
				<div class="LockBill-mark-tip">{{$t('Biz.Settlement.Tip31')}}，<span style="color: red;">{{$t('Biz.Settlement.Tip32')}}</span>{{$t('Biz.Settlement.Tip33')}}</div>
				<button type="button" class="LockBill-mark-btn" @click="close">{{$t('Dict.Sure')}}</button>
				<button type="button" class="closePayPager" @click="closePayPager">{{$t('Dict.Close')}}</button>
			</div>
		</div>
	</div>
</template>

<script>
import ajax from '@/common/js/ajax';

export default {
  props: {
    baseBsdata: {
      type: Object,
    },
  },
  data() {
    return {
      displayNone: true,
      baseBs: {},
      showTip: false,
    };
  },
  methods: {
    nextStep() {
      this.showTip = true;
    },
    open() {
      this.showTip = false;
      this.displayNone = false;
    },
    close(authData = {}) {
      this.showTip = false;
      this.$vonce('authCode', (code) => {
        this.close(code);
      });
      ajax('canyin.wuu.unlockpoint', {
        params: { code: this.baseBsdata.code, ...authData },
      }).then((res) => {
        if (+res.result === -2) { // 没有成功的是 -2  就是弹验证授权框
          this.$vemit('posAuthCheck', {
            message: res.msg,
          });
        } else if (+res.result === 1) {
          if (res.success) {
            this.$message({
              type: 'success',
              message: `${this.$t('Biz.Settlement.Success29')}`,
              duration: 2000,
            });
            this.displayNone = true;
          } else {
            this.$message({
              type: 'error',
              message: res.msg,
              duration: 2000,
            });
          }
        } else {
          this.$message({
            type: 'error',
            message: res.msg,
            duration: 2000,
          });
        }
      });
    },
    closePayPager() {
      this.$emit('onClose');
      this.displayNone = true;
    },
  },
};
</script>


<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.displayNone {
  display: none;
}
.LockBill-mark {
  width: 100%;
  height: 100%;
  position: fixed;
  background: rgba(0, 0, 0, 0.5);
  z-index: 20000;
  top: 0;
  left: 0;
}
.LockBill-mark-conent {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 450px;
  height: 270px;
  color: #fff;
  .LockBill-mark-tip {
    margin: 30px 0;
    font-size: 20px;
    font-weight: bold;
  }
  .LockBill-mark-btn {
    background: #0babb9;
    border: none;
    width: 135px;
    height: 50px;
    border-radius: 5px;
    margin-right: 10px;
  }
  .closePayPager{
    background: #999;
    border: none;
    width: 135px;
    height: 50px;
    border-radius: 5px;
  }
}
</style>
