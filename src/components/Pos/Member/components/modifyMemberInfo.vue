<template>
  <iframe
    id="show-iframe"
    frameborder="0"
    name="showHere"
    scrolling="auto"
    style="width: 100%; height: 100%;"
    :src="this.url+'?mobile='+this.phone"
  ></iframe>
</template>
<script>
import ajax from '@/common/js/ajax';
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      url: '',
    };
  },
  created() {
    this.open();
  },
  computed: {
    ...mapGetters([
      'posBaseInfo',
    ]),
    phone() {
      return this.posBaseInfo ? this.posBaseInfo.user.cellphone : '';
    },
  },
  methods: {
    open() {
      ajax('canyin.pos.settlement.pay.glorybutlerpayway.altermember', {
        contentType: 'paramsEncoded',
      }).then((res) => {
        if (res.code === 0) {
          const resData = res.data;
          this.url = resData.url;
        } else {
          this.$message.error(res.message);
        }
      });
    },
  },
};
</script>
