<template>
<!-- 上菜方式 -->
  <Dialog
    name="Sereveway"
    :title="$t('Biz.Order.ServeWay')"
    ref="dialog"
    :showSubmit="true"
    width="490px"
    height="250px"
    @open="onOpen"
    @submit="submitServeWay"
    append-to-body
    :hotkeys="hotKeySet"
    :submitId="type + 'Submit'"
  >
    <div class="serveWayContent">
      <!-- 请选择上菜方式： -->
      <p class="markWord">{{ $t('Biz.Order.PleaseSelectServeWay') }}</p>
      <ul class="serveWayBtns" :id="type + 'List'">
        <li
          v-for="(serveWay,index) in getVuexItemServeWays" :key="index"
          :class="{active:serveWay ? serveWay.id == activeServeData.id : false}"
          @click="selectServeWay(serveWay)"
        >
          {{serveWay.name}}
        </li>
      </ul>
      <div :class="['orderingBillAllServeWay',{'t-right':isPkgModule}]" >
        <!-- 上菜方式对该类所有品项有效 -->
        <el-checkbox
          v-if="!isPkgModule"
          @change="handleBillTypeServeWay"
          v-model="isOrderingBillTypeServeWay"
        >{{ $t('Biz.Order.ServeWayOnThisClass') }}</el-checkbox>
        <el-checkbox
          @change="handleBillAllServeWay"
          v-model="isOrderingBillAllServeWay">
          {{allServerWayText}}
        </el-checkbox>
      </div>
    </div>
  </Dialog>
</template>
<script>
import { mapGetters } from 'vuex';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

export default {
  props: {
    type: {
      type: String,
      default: '',
    },
  },
  components: { Dialog },
  mixins: [DialogMixin],
  data() {
    return {
      isOrderingBillAllServeWay: false, // 上菜方式是否对本单所有的品项有效选择 默认为flase
      isOrderingBillTypeServeWay: false, // 上菜方式是否对本类所有的品项有效选择 默认为flase
      activeServeData: {},
      // 上菜方式对本单所有品项有效
      allServerWayText: this.$t('Biz.Order.ServeWayOnThisOrder'),
      isPkgModule: false,
    };
  },
  computed: {
    ...mapGetters(['getVuexItemServeWays']),
    hotKeySet() {
      return {
        PgDn: () => {
          this.submitServeWay();
        },
        // 左
        '←': () => {
          this.leftSelectServeWay();
        },
        // 右
        '→': () => {
          this.rightSelectServeWay();
        },
      };
    },

  },
  // 每次打开都会执行赋值this.activeServeData和选中按钮，而在渲染时执行，这是错误逻辑和消耗程序性能的，代码注释
  // mounted() {
  //   if (this.getVuexItemServeWays) {
  //     const [firstEle] = this.getVuexItemServeWays.filter(item => item.name === '即起' || item.id === '0');
  //     this.activeServeData = firstEle;
  //   }
  // },
  methods: {
    // 打开弹框回调
    onOpen() {
      // 初始化下 isOrderingBillAllServeWay
      this.isOrderingBillAllServeWay = false;
      this.isOrderingBillTypeServeWay = false;
      // isPkgModule 是判断是否是通过常规套餐过来的修改上菜方式
      if (this.resData && this.resData.isPkgModule) {
        this.isPkgModule = this.resData.isPkgModule;
        // 上菜方式对本分类有效
        this.allServerWayText = this.$t('Biz.Order.ServeWayOnThisGroup');
      } else {
        // 上菜方式对本单所有品项有效
        this.allServerWayText = this.$t('Biz.Order.ServeWayOnThisOrder');
      }
      if (this.resData && this.resData.itemData.serveWay) {
        this.activeServeData = this.resData.itemData.serveWay;
      } else {
        // 删除中文内容判断 默认第一个处理为选中项(这里数据id为后台写死,且无排序.'即起'始终为第一个)
        // const [first] = this.getVuexItemServeWays.filter(_ => _.name === '即起' || _.id === '0');
        const [first] = this.getVuexItemServeWays.filter(_ => _.id === '1');
        this.activeServeData = first;
      }
      this.$log.info(`打开上菜方式窗口。id:${this.resData.itemData.id},name:${this.resData.itemData.name},price:${this.resData.itemData.price},`);
    },

    handleBillTypeServeWay(data) {
      if (data) {
        this.isOrderingBillAllServeWay = false;
      }
    },
    handleBillAllServeWay(data) {
      if (data) {
        this.isOrderingBillTypeServeWay = false;
      }
    },
    // 选择事件
    selectServeWay(serveWay) {
      this.activeServeData = serveWay;
    },
    // 快捷键左移选中上菜方式
    leftSelectServeWay() {
      const serveWays = this.getVuexItemServeWays;
      let idIndex = serveWays.findIndex(value => this.activeServeData.id === value.id);
      idIndex -= 1;
      if (idIndex < 0) {
        idIndex = 3;
      }
      const [selectELe] = this.getVuexItemServeWays.filter((item, index) => index === idIndex);
      this.activeServeData = selectELe;
    },
    // 快捷键右移选中上菜方式
    rightSelectServeWay() {
      const serveWays = this.getVuexItemServeWays;
      let idIndex = serveWays.findIndex(value => this.activeServeData.id === value.id);
      idIndex += 1;
      if (idIndex > 3) {
        idIndex = 0;
      }
      const [selectELe] = this.getVuexItemServeWays.filter((item, index) => index === idIndex);
      this.activeServeData = selectELe;
    },
    // 确认事件
    submitServeWay() {
      let serveWayObj = {};
      if (this.isOrderingBillAllServeWay) {
        serveWayObj = {
          serveWay: this.activeServeData,
          isOrderingBillAllServeWay: this.isOrderingBillAllServeWay,
        };
      } else if (this.isOrderingBillTypeServeWay) {
        let { customGroupId } = this.resData.itemData;
        const { smallClassId } = this.resData.itemData;
        if (!customGroupId) {
          customGroupId = smallClassId;
        }
        serveWayObj = {
          serveWay: this.activeServeData,
          isOrderingBillTypeServeWay: this.isOrderingBillTypeServeWay,
          smallClassId: customGroupId,
        };
      } else {
        serveWayObj = {
          serveWay: this.activeServeData,
        };
      }
      this.submit(serveWayObj);
      this.$log.info('提交上菜方式窗口。');
    },
  },

};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.serveWayContent {
  height: 100%;
  background-color: #ffffff;
  >.markWord {
    padding: 15px 15px 7px 15px;
    color: #333333;
  }
  >.serveWayBtns {
    height: 100px;
    padding: 0px 8px;
    >li {
      float: left;
      width: 100px;
      height: 40px;
      border: 1px solid hsl(0, 0%, 71%);
      text-align: center;
      line-height: 40px;
      border-radius: 5px;
      cursor: pointer;
      margin: 8px;
      &.active {
        background-color: #0babb9;
        color: #fff;
      }
    }
  }
  >.orderingBillAllServeWay {
    text-align: left;
    padding: 0px 15px;
  }
  >.t-right{
     text-align: right !important;
  }
}
.lang-enUS {
  .el-checkbox + .el-checkbox {
    margin-left: 0px;
  }
}
</style>
