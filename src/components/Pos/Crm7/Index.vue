<template>
  <div id="crm" class="content-warp">
    <div class="content">
      <iframe
        id="show-iframe"
        frameborder="0"
        name="showHere"
        scrolling="auto"
        style="width: 100%; height: 100%;"
        :src="src"
      ></iframe>
    </div>
    <CrmBindDialog ref="crmBindDialog" :crmBindStatus="false"></CrmBindDialog>
  </div>
</template>

<script>
import ajax from '@/common/js/ajax';
import { mapGetters } from 'vuex';
import CrmBindDialog from '@/components/Index/UserDesktop/ParameterSetting/FastLoginModule/CrmBindDialog';

export default {
  data() {
    return {
      // 卡信息
      src: '',
    };
  },
  components: {
    CrmBindDialog,
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.getUrl();
    });
  },
  computed: {
    ...mapGetters([
      'setting',
    ]),
  },
  mounted() {
    window.addEventListener('message', this.messagePost);
  },
  destroyed() {
    window.removeEventListener('message', this.messagePost);
  },
  methods: {
    messagePost(res) {
      if (res.data) {
        document.cookie = `CRMSESSIONID=${res.data};`;
      }
    },
    getUrl() {
      ajax('platform.cas.cas.querybindingrelation', {
        contentType: 'URLEncoded',
        data: {
          productId: '004',
          isNeedPos: '1',
        },
      }).then((res) => {
        if (res.data.loginUrl) {
          this.src = res.data.loginUrl;
        } else {
          this.$refs.crmBindDialog.open({ isCrm7: true }, {
            submit: (src) => {
              this.src = src;
              this.$refs.crmBindDialog.close();
            },
          })
        }
      });
    },
  },
};
</script>
<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.content-warp{
  padding: 12px;
  height: 100%;
}
.content{
  height: 100%;
  width: 100%;
  table-layout: fixed;
  display: table;
  >div{
    display: table-cell;
    vertical-align: top;
  }
}
.menu-list{
  @item-width: 78px;
  @item-height: 78px;
  width: @item-width;
  background-color: rgba(0, 0, 0, .4);
  text-align: center;
  position: relative;
  .menu-item{
    cursor: pointer;
    height: @item-height;
    padding-top: 16px;
    color: @white;
    position: relative;
    &.active{
      h5,.img-icon{
        filter: opacity(1);
        transition: filter .5s;
      }
    }
  }
  h5{
    padding-top: 4px;
    font-size: 12px;
  }
  h5,.img-icon{
    filter: opacity(40%);
  }
  .cursor{
    position: absolute;
    width: @item-width;
    height: @item-height;
    background-color: #0babb9;
    transition: top .5s;
    .cursor-img{
      position: absolute;
      width: 8px;
      height: auto;
      right: -8px;
      top:0; bottom:0;
      margin:auto;
    }
  }
}
.member-form-warp{
  padding-right: 10px;
  .member-form-content{
    padding: 28px 36px;
    text-align: center;
    height: 100%;
    background-color: #f7f7f7;
    >* {
      margin: 0 auto;
    }
  }
}
.member-info-warp{
  width: 288px;
  text-align: center;
  background-color: #f7f7f7;
  .user-info-warp{
    min-height: 274px;
    background-color: #99c4d7;
    padding: 32px 0 110px;
    border-radius: 0 0 25% 25%;
    color: @white;
    .name{
      margin-top: 4px;
      font-size: 18px;
      line-height: 1.5;
    }
    .phone{
      font-size: 16px;
      line-height: 1.375;
    }
  }
  .user-card-warp{
    margin: -70px auto 38px;
    width: 230px;
    height: 130px;
    background-image: url(~@/common/images/sl-msg/member-card.png);
    padding: 12px;
    text-align: left;
    position: relative;
    .title{
      font-size: 12px;
      color: #666;
    }
    .no-item{
      color: #666;
      text-align: center;
      padding-top: 12px;
    }
    .card-type{
      .info{
        font-size: 14px;
        line-height: 2;
        font-weight: bold;
        color: #824e0d;
      }
    }
    .card-number{
      font-size: 18px;
      color: #333;
      font-weight: bold;
      line-height: 2;
    }
    .card-money{
      position: absolute;
      bottom: 12px;
      right: 12px;
      width: 100%;
      text-align: right;
      .info{
        font-size: 16px;
        color: #666;
        font-weight: bold;
      }
    }
  }
  .keybord{
    margin: 0 auto;
  }
}
</style>
