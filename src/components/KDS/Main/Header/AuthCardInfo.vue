<template>
  <div v-if="authInfo" class="authCardInfoWrapper">
    <div class="title">
      当前{{mode === '1' ? '传菜' : '配菜'}}员：<span class="code-name">{{authInfo.code}} {{authInfo.name}}</span>
    </div>
  </div>
</template>
<script>
import ajax from '@/common/js/ajax';
import { mapGetters } from 'vuex';

export default {
  name: 'authCardInfo',
  data() {
    return {
      authInfo: '',
    };
  },
  created() {
    this.$von('getAuthInfo', (code) => {
      this.readAuthCardInfo(code);
    });
  },
  computed: {
    ...mapGetters('KDS', ['mode']),
  },
  mounted() {
    const info = window.sessionStorage.getItem('authInfo');
    if (info) {
      this.authInfo = JSON.parse(info);
    }
  },
  methods: {
    // 读取员工卡信息
    readAuthCardInfo(authCard) {
      ajax('dbi.emp.selectbyauthcard', {
        params: { authCard },
      }).then((data) => {
        this.authInfo = data;
        window.sessionStorage.setItem('authInfo', JSON.stringify(data));
        let type = '厨师';
        if (this.mode === '1') {
          type = '传菜员';
        }
        this.$message({
          type: 'success',
          message: `<strong>请注意：</strong><span>${type}已更换为${data.name} ${data.code}</span>`,
          dangerouslyUseHTMLString: true,
        });
      });
    },
  },
};
</script>
<style lang="less" scoped>
  .authCardInfoWrapper{
    background: #3f526e;
    border-radius: 3px;
    padding: 6px;
    .title{
      color: #cccccc;
      font-size: 14px;
    }
    .code-name{
      color: #ffc64d;
      font-size: 16px;
    }
  }
</style>
