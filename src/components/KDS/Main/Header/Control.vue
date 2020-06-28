<template>
  <div class="kds-control flex">
    <ul class="control-wrap flex">
      <li class="control" @click="showRevoke">
        <i class="iconfont-kds icon-chexiao"/>
        <span>撤销</span>
      </li>
      <li class="control" @click="showMake">
        <i class="iconfont-kds icon-zhizuochaxun"/>
        <span>{{controlText}}查询</span>
      </li>
      <li v-if="config.selloutModule" class="control" @click="showSelloutDialog">
        <i class="iconfont-kds icon-guqing"/>
        <span>沽清</span>
      </li>
      <li v-if="config.limitModule" class="control" @click="showLimitDialog">
        <i class="iconfont-kds icon-xianliang"/>
        <span>限量</span>
      </li>
      <li
        class="control"
        v-if="config.quickDoing"
        @click="quick">
        <i class="iconfont-kds icon-peicai"/>
        <span>{{ confirmBtnText }}</span>
      </li>
      <li class="control line" @click.stop="showMoreMenu = !showMoreMenu">
        <i class="iconfont-kds icon-ic_gengduo"/>
        <span>更多</span>
      </li>
    </ul>
    <div v-if="showMoreMenu" class="more-area">
      <div class="more-option" @click="refresh"><i class="icon icon-refresh"></i>刷新</div>
      <p class="line"></p>
      <div class="more-option" @click="logout"><i class="icon icon-shutdown"></i>注销</div>
    </div>
    <!--限量-->
    <LimitQuantity ref="limitQuantity" :limitData="limitData"></LimitQuantity>
    <!--沽清-->
    <ItemsSellOut ref="itemsSellOut" :sellOutData="sellOutData"></ItemsSellOut>
    <!--撤销菜品-->
    <Revoke ref="revoke"></Revoke>
    <!--制作查询-->
    <MakeInquiriesDialog ref="makeInquiriesDialog"></MakeInquiriesDialog>
  </div>
</template>
<script>
import { keys, groupBy } from 'lodash';
import { mapGetters, mapState } from 'vuex';
import ajax from '@/common/js/ajax';

const Revoke = (resolve) => {
    import('@/components/KDS/Main/Dialog/Revoke').then((module) => {
      resolve(module);
    });
};

// 估清
const ItemsSellOut = (resolve) => {
  import('@/components/Pos/More/ItemsSellOut').then((module) => {
    resolve(module);
  });
};

// 限量
const LimitQuantity = (resolve) => {
  import('@/components/Pos/More/LimitQuantity').then((module) => {
    resolve(module);
  });
};

// 制作查询
const MakeInquiriesDialog = (resolve) => {
  import('@/components/KDS/Main/Dialog/MakeInquiriesDialog').then((module) => {
    resolve(module);
  });
};

export default {
  components: {
    Revoke,
    ItemsSellOut,
    LimitQuantity,
    MakeInquiriesDialog,
  },
  computed: {
    ...mapGetters('KDS', ['apiPath', 'config', 'dishes', 'mode']),
    confirmBtnText() {
      if (this.mode === '0') {
        return '一键配菜';
      }
      return '一键传菜';
    },
    controlText() {
      if (this.mode === '0') {
        return '制作';
      }
      return '传菜';
    },
  },
  data() {
    return {
      sellOutData: {}, // 估清
      limitData: {}, // 限量
      showMoreMenu: false, // 更多
    };
  },
  methods: {
    // 一键配菜或一键传菜
    quick() {
      const kscIds = Object.keys(this.dishes);
      const scIdList = keys(groupBy(this.dishes, 'scId'));
      this.$vemit('confirm', {
        kcKscIdList: kscIds,
        scIdList,
      });
    },
    // 撤销
    showRevoke() {
      let url = '';
      if (this.mode === '0') {
        url = 'canyin.kitchen.kitchenhis.getkitchenhiscookmode';
      } else if (this.mode === '1') {
        url = 'canyin.kitchen.kitchenhis.getkitchenhisservemode';
      }
      ajax(url).then((data) => {
        this.$refs.revoke.open(data);
      });
    },
    // 制作查询
    showMake() {
      this.$refs.makeInquiriesDialog.open();
    },
    // 打开限量窗口
    showLimitDialog() {
      ajax('canyin.pos.itemLimit.itemLimitView', {
        params: {
          loadmodule: 1, _t: new Date().getTime(),
        },
      }).then((data) => {
        this.limitData = data;
        this.$refs.limitQuantity.open();
      });
    },
    // 打开估清窗口
    showSelloutDialog() {
      ajax('canyin.pos.itemSellout.itemSelloutView', {
        params: {
          loadmodule: 1, _t: new Date().getTime(),
        },
      }).then((data) => {
        this.sellOutData = data;
        this.$refs.itemsSellOut.open();
      });
    },
    // 刷新
    refresh() {
      window.location.reload();
    },
    // 注销
    logout() {
      window.location = `${this.apiPath}/platform/login/login/logout`;
    },
  },
};
</script>
<style lang="less" scoped>
  .flex {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .column {
    flex-direction: column;
  }
  .kds-control {
    .control-wrap {
      > li {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        margin-right: 30px;
        cursor: pointer;
        color: #ffffff;
      }
      >li:last-child{
        margin-right: 0;
      }
      .line:before {
        content: '';
        position: absolute;
        left: -21px;
        display: inline-block;
        width: 1px;
        height: 100%;
        background-color: #565968;
      }
    }
    .more-area{
      position: absolute;
      top: 60px;
      right: 10px;
      background:rgba(49,51,65,1);
      opacity:0.9;
      border-radius:4px;
      z-index: 50;
      color: #FFFFFF;
      text-align: center;
      padding: 12px 14px;
      .line{
        height: 1px;
        background: #ffffff;
        margin: 12px 0;
        opacity:0.3;
      }
      .more-option{
        cursor: pointer;
        i{
          margin-right: 5px;
        }
      }
    }
  }
</style>
