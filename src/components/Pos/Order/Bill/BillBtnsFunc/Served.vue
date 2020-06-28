<template>
<!-- "ServingDetails": "上菜详情" -->
  <Dialog
    name="PosDialog.Served"
    :title="$t('Biz.Order.ServingDetails')"
    ref="dialog"
    width="900px"
    height="670px"
    :showSubmit="false"
    top="2vh"
    @open="onOpen"
    @close="onClose">
    <div class="ordering-updish-wrap">
      <div class="ordering-updish-wrap-header">
        <!-- "RoomNumber": "包房号：" -->
        <span>{{ $t('Biz.Order.RoomNumber') }}{{ tableInfo.pointName }}</span>
        <span>{{ $t('Dict.OpeningTime') }}{{ formatDate(tableInfo.openTime) }}</span>
        <span>{{ $t('Dict.NumberOfPeople01') }}{{ tableInfo.peopleQty }}</span>
      </div>
      <div class="ordering-updish-wrap-menu">
        <div class="ordering-updish-wrap-menu-title table">
          <ul class="ordering-updish-wrap-menu-title-ul">
            <li class="ordering-updish-wrap-menu-title-ul-li white max-width-30 text-center no-border no-padding"></li>
            <li class="ordering-updish-wrap-menu-title-ul-li white flex-2 no-wrap">{{ $t('Dict.Item') }}</li>
            <li class="ordering-updish-wrap-menu-title-ul-li white max-width-50 text-center no-padding">{{ $t('Dict.Amount') }}</li>
            <!-- "MakeSchedule": "制作进度" -->
            <li class="ordering-updish-wrap-menu-title-ul-li white flex-8">{{ $t('Biz.Order.MakeSchedule') }}</li>
            <li class="ordering-updish-wrap-menu-title-ul-li white">{{ $t('Dict.ServeNum') }}</li>
            <li class="ordering-updish-wrap-menu-title-ul-li white">{{ $t('Dict.Btn.Served') }}</li>
          </ul>
        </div>
        <div class="ordering-updish-wrap-menu-content" id="orderServedMenu" ref="orderServedMenu">
          <Paging
            :data="dishList"
            :itemWidth="870"
            :itemHeight="64"
            :autoActive="false"
            class="order-served-menu-content-list"
            ref="orderServedMenuContentList"
            id="orderServedMenuContentList">
            <div class="ordering-updish-wrap-menu-content-wrap table" slot-scope="props">
              <ul class="ordering-updish-wrap-menu-content-wrap-ul">
                <li class="ordering-updish-wrap-menu-content-wrap-ul-li  max-width-30 text-center no-border no-padding">{{ props.item.currentIndex }}</li>
                <li class="ordering-updish-wrap-menu-content-wrap-ul-li flex-2 no-wrap">{{ props.item.itemName }}</li>
                <li class="ordering-updish-wrap-menu-content-wrap-ul-li max-width-50 text-center no-padding">{{ props.item.lastQty }}</li>
                <li class="ordering-updish-wrap-menu-content-wrap-ul-li flex-8 process">
                  <div class="step">
                    <!-- PlaceAnOrder  下单-->
                    <span class="all">{{ $t('Dict.PlaceAnOrder') }}</span>
                    <span class="time">{{ formatDate(props.item.createTime) }}</span>
                  </div>
                  <div class="step" v-if="(+props.item.callUpQty !== 0) || (+props.item.serveWayId === 1) ">         <!--callUpQty和servewayid都为0的时候 没有等叫和起菜  等叫 -->
                    <span class="all">{{ $t('Biz.Order.EqualCall') }}</span>
                  </div>
                  <div class="step"  v-if="(+props.item.callUpQty !== 0) || (+props.item.serveWayId === 1)">
                    <!-- Serving 起菜 -->
                    <span v-if="+props.item.callUpQty === 0" class="waiting">{{ $t('Dict.Btn.Serving') }}</span>
                    <span v-else-if="+props.item.callUpQty < +props.item.lastQty" class="half">{{ $t('Dict.Btn.Serving') }}({{ props.item.callUpQty }})</span>
                    <span v-else class="all">{{ $t('Dict.Btn.Serving') }}({{ props.item.callUpQty }})</span>
                    <span class="time" v-if="props.item.callUpTime">{{ formatDate(props.item.callUpTime) }}</span>
                  </div>
                  <div class="step" v-if="arrangeDish">
                    <!-- Garnish 配菜 -->
                    <span v-if="!props.item.prepareFinishQty" class="waiting">{{ $t('Dict.Garnish') }}</span>
                    <span v-else-if="+props.item.prepareFinishQty < +props.item.lastQty" class="half">{{ $t('Dict.Garnish') }}({{ props.item.prepareFinishQty }})</span>
                    <span v-else class="all">{{ $t('Dict.Garnish') }}({{ props.item.prepareFinishQty }})</span>
                    <span class="time" v-if="props.item.prepareFinishTime">{{ formatDate(props.item.prepareFinishTime) }}</span>
                  </div>
                  <div class="step" v-if="transferDish">
                    <!-- "PassDish": "传菜" -->
                    <span v-if="!props.item.serveFinishQty" class="waiting">{{ $t('Dict.PassDish') }}</span>
                    <span v-else-if="+props.item.serveFinishQty < +props.item.lastQty" class="half">{{ $t('Dict.PassDish') }}({{ props.item.serveFinishQty }})</span>
                    <span v-else class="all">{{ $t('Dict.PassDish') }}({{ props.item.serveFinishQty }})</span>
                    <span class="time" v-if="props.item.serveFinishTime">{{ formatDate(props.item.serveFinishTime) }}</span>
                  </div>
                  <div class="step">
                    <!-- 上菜 -->
                    <span v-if="+props.item.servingPty === 0" class="waiting">{{ $t('Dict.Btn.Served') }}</span>
                    <span v-else-if="+props.item.servingPty < +props.item.lastQty" class="half">{{ $t('Dict.Btn.Served') }}({{ props.item.servingPty }})</span>
                    <span v-else class="all">{{ $t('Dict.Btn.Served') }}({{ props.item.servingPty }})</span>
                    <span class="time" v-if="props.item.servingTime">{{ formatDate(props.item.servingTime) }}</span>
                  </div>
                </li>
                <li class="ordering-updish-wrap-menu-content-wrap-ul-li text-center pointer">
                  <!--数量大于1且是整数的才有数量调整-->
                  <img v-if="props.item.lastQty > 1 && props.item.lastQty.toString().indexOf('.') === -1" :src="imgages[0]" :alt="$t('Dict.ServeNum')" @click="servedNum(props.item)">
                </li>
                <li class="ordering-updish-wrap-menu-content-wrap-ul-li pointer">
                  <img v-if="+props.item.servingPty < +props.item.lastQty" :src="imgages[2]" @click="confirmNotQue(props.item,0)" :alt="$t('Dict.Btn.Served')">
                  <img v-else :src="imgages[1]" @click="confirmNotQue(props.item,1)" :alt="$t('Dict.Btn.Served')">
                </li>
              </ul>
            </div>
          </Paging>
        </div>
        <div class="ordering-updish-wrap-menu-operation">
          <PagingBtn
            ref="orderServedMenuContentListPagingBtn"
            arrowDirection="up-down"
            :showInfo="true"
            class="ordering-updish-wrap-menu-operation-pagingBtn"
          ></PagingBtn>
        </div>
      </div>
    </div>
    <changeServedNum ref="changeServedNum" submitId="998" @init="init"></changeServedNum>
  </Dialog>
</template>


<script>
import btnEdit from '@/common/images/pos/singleItemTransfer/btn_edit.png';
import btnDishupN from '@/common/images/pos/singleItemTransfer/btn_dishup_n.png';
import btnDishupS from '@/common/images/pos/singleItemTransfer/btn_dishup_s.png';
import { mapGetters } from 'vuex';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Paging from '@/components/Pos/Common/Paging';
import PagingBtn from '@/components/Pos/Common/PagingBtn';
import changeServedNum from './changeServedNum';
import ajax from '@/common/js/ajax';

export default {
  components: {
    Dialog,
    Paging,
    PagingBtn,
    changeServedNum,
  },
  mixins: [DialogMixin],
  props: {
    siteInfo: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      imgages: [btnEdit, btnDishupN, btnDishupS],
      tableInfo: {},
      kitchenMode: 0, // 0没有配菜和传菜步骤，1都有，2只有传菜，3只有配菜
      arrangeDish: false, // 是否显示配菜
      transferDish: false, // 是否显示传菜
      scList: [], // 上菜的品项列表
      limitClickServed: false, // 限制上菜按钮重复点击
      timer: null, // limitClickServed的定时器
    };
  },
  computed: {
    ...mapGetters(['posOrderBill']),
    dishList() {
      return this.scList;
    },
  },
  watch: {
    kitchenMode(val) {
      switch (val) {
        case 0:
          this.arrangeDish = false;
          this.transferDish = false;
          break;
        case 1:
          this.arrangeDish = true;
          this.transferDish = true;
          break;
        case 2:
          this.arrangeDish = false;
          this.transferDish = true;
          break;
        case 3:
          this.arrangeDish = true;
          this.transferDish = false;
          break;
        default:
          this.arrangeDish = false;
          this.transferDish = false;
          break;
      }
    },
  },
  methods: {
    /**
       *  打开弹窗
       */
    onOpen() {
      this.init();
      this.$nextTick(() => {
        this.$refs.orderServedMenuContentListPagingBtn.bind(this.$refs.orderServedMenuContentList); // 分页按钮获取目标节点
        this.$refs.orderServedMenuContentList.refresh();
      });
    },
    /**
       *  初始化上菜列表和厨房传菜启用模式
       */
    async init() {
      const { kitchenMode, scList, bsData } = await this.getServedData();
      scList.map((item, index) => {
        Object.assign(item, {
          currentIndex: index + 1, // 添加列表的index 如果能拿到当前页数 可以不用这个 暂时先这样
        });
        return item;
      });
      [this.kitchenMode, this.scList, this.tableInfo] = [kitchenMode, scList, bsData];
    },
    /**
       *  返回上菜接口数据
       */
    getServedData() {
      return ajax('canyin.pos.serving.servingview', { params: { pointId: this.posOrderBill.bsData.pointId } })
        .then(res => res)
        .catch(() => {
          console.warn('接收上菜接口数据错误');
          return false;
        });
    },
    /**
       *  点击全部上菜前验证进度和数量
       *  flag.num = 0 为不提示 1 存在未完成进度 2上菜与传菜数量不一致
       */
    confirmNotQue(item, type) {
      const flag = this.judgeStep(item);
      if (Object.is(flag.num, 0) || type === 1) {
        this.toggleServe(item, type);
      } else {
        let str = '';
        if (Object.is(flag.num, 1)) {
          // 该菜品存在未完成的进度,是否直接上菜？
          str = this.$t('Biz.Order.ServingWrMsg');
        } else if (Object.is(flag.num, 2)) {
          // str = `该菜品上菜数量与${flag.text}数量不一致,是否确认上菜？`;
          str = this.$t('Biz.Order.LongMsg041', [flag.text]);
        }
        this.$confirm(str, this.$t('Dict.Tips'), {
          confirmButtonText: this.$t('Dict.Sure'),
          cancelButtonText: this.$t('Dict.Cancel'),
          type: 'warning',
        }).then(() => {
          this.toggleServe(item, type);
        }).catch(() => false);
      }
    },
    /**
     *  点击全部上菜前验证进度和数量
     *  1，先判断是否有该步骤，例( 下单 -> 等叫 -> 起菜 -> 上菜 )，没有配菜和传菜步骤
     *  2，灰色优先，步骤中存在灰色，就按未完成进度提示
     *  3，橙色其次，步骤中存在橙色，就按数量不一致提示
     */
    judgeStep(item) {
      const { transferDish, arrangeDish } = this;
      const flag = {
        num: 0,
        text: '',
      };
      if ((+item.callUpQty !== 0) || (+item.serveWayId === 1)) { // 起菜步骤
        if (+item.callUpQty === 0) { // 灰色
          Object.assign(flag, {
            num: 1,
          });
          return flag; // 灰色优先 所以判断时只要发现满足灰色的 优先返回
        }
        if (+item.callUpQty < item.lastQty) { // 橙色
          Object.assign(flag, {
            num: 2,
            text: this.$t('Dict.Btn.Serving'),
          });
        }
      }
      if (arrangeDish) { // 配菜步骤
        if (!item.prepareFinishQty) { // 灰色
          Object.assign(flag, {
            num: 1,
          });
          return flag;
        }
        if (item.prepareFinishQty < item.lastQty) { // 橙色
          Object.assign(flag, {
            num: 2,
            text: this.$t('Dict.Garnish'),
          });
        }
      }

      if (transferDish) { // 传菜步骤
        if (!item.serveFinishQty) { // 灰色
          Object.assign(flag, {
            num: 1,
          });
          return flag;
        }
        if (+item.serveFinishQty < +item.lastQty) { // 橙色
          Object.assign(flag, {
            num: 2,
            text: this.$t('Dict.PassDish'),
          });
        }
      }
      return flag;
    },
    /**
       *  上菜或撤菜
       *  type0为上菜 1为撤菜操作
       */
    toggleServe(item, type) {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => { // 防止接口报错后 点击状态卡死
        this.limitClickServed = false;
      }, 2000);
      if (this.limitClickServed) return; // 如果限制中返回
      this.limitClickServed = true;
      ajax('canyin.pos.serving.serving', {
        contentType: 'json',
        data: {
          servings: [{
            scId: item.scId,
            itemId: item.itemId,
            itemSizeId: item.itemSizeId,
            qty: type ? item.lastQty : item.lastQty - item.servingPty, // 上菜上全部或者余下部分，撤菜撤全部
            times: type ? -1 : null,
          }],
          pointId: this.tableInfo.pointId,
          servingType: type,
        },
      }).then((res) => {
        if (res.success) {
          this.$message.success(res.data.msg);
          this.init();
        } else {
          this.$message.warn(res.data.msg);
        }
        this.limitClickServed = false;
      });
    },
    /**
       * 打开上菜数量弹框
       */
    servedNum(data) {
      const { arrangeDish, transferDish } = this;
      this.$refs.changeServedNum.open({
        transferDish, arrangeDish, tableInfo: this.tableInfo, data,
      });
    },
    /**
       * 关闭事件
       */
    onClose() {
      this.scList = [];
      this.$refs.orderServedMenuContentList.refresh();
    },
    /**
       * 格式化时间
       */
    formatDate(time) {
      if (!time) return '';
      const arr1 = time.split('T');
      const arr2 = arr1[1].split('.');
      return arr2[0];
    },
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";

  .ordering-updish-wrap {
    display: flex;
    flex-direction: column;
    position: relative;
    height: 100%;
    overflow: hidden;
    .ordering-updish-wrap-header {
      padding: 15px;
      & > span {
        margin-right: 15px;
        font-size: 16px;
      }
    }
    .ordering-updish-wrap-menu {
      flex: 1;
      padding: 15px;
      background-color: #ffffff;
      .ordering-updish-wrap-menu-title {
        background-color: #4fbef3;
      }
      .ordering-updish-wrap-menu-content-pager {
        position: absolute;
        right: 15px;
        bottom: 20px;
      }
    }
    .ordering-updish-wrap-menu-content {
      height: 448px;
      overflow: hidden;
      .ordering-updish-wrap-menu-content-wrap{
        /*padding: 5px 0;*/
        height: 64px;
        color: black;
      }
      .order-served-menu-content-list {
        height: 100%;
        overflow: hidden;
      }
    }
    .ordering-updish-wrap-menu-operation {
      position: relative;
      .ordering-updish-wrap-menu-operation-pagingBtn{
        position: absolute;
        right: 0;
        top: 18px;
      }
    }
  }
  /*公共样式*/
  .table {
    margin: 0;
    border-bottom: 1px solid gray;
    > ul {
      display: flex;
      align-items: center;
      padding: 3px;
      > li {
        flex: 1;
        padding-left: 5px;
        & > img {
          width: 25px;
          height: 25px;
        }
      }
      .process {
        display: flex;
        align-items: center;
        height: 60px;
        > div:first-child > span:first-child {
          margin-left: 0;
          &:before {
            display: none;
            content: '';
          }
        }
        > div:last-child > span:first-child {
          margin-right: 0;
          &:after {
            display: none;
            content: '';
          }
        }
        > div {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          margin: 0 10px;
          width: 60px;
          height: 25px;
          line-height: 25px;
          > span {
            position: absolute;
            transition: all .3s;
          }
          > span:first-child {
            top: -13px;
            display: inline-block;
            width: 100%;
            height: 100%;
            text-align: center;
            border-radius: 10px;
            color: white;
            &:before {
              position: absolute;
              top: 12.5px;
              left: -10px;
              content: '';
              width: 10px;
              height: 4px;
            }
            &:after {
              position: absolute;
              top: 12.5px;
              right: -10px;
              content: '';
              width: 10px;
              height: 4px;
            }
          }
          > span:last-child {
            bottom: -13px;
          }
          .all {
            box-shadow: 0 0 3px yellowgreen;
            background-color: yellowgreen;
            &:before {
              box-shadow: 0 0 3px yellowgreen;
              background-color: yellowgreen;
            }
            &:after {
              box-shadow: 0 0 3px yellowgreen;
              background-color: yellowgreen;
            }
          }
          .half {
            box-shadow: 0 0 3px orange;
            background-color: orange;
            &:before {
              box-shadow: 0 0 3px orange;
              background-color: orange;
            }
            &:after {
              box-shadow: 0 0 3px orange;
              background-color: orange;
            }
          }
          .waiting {
            background-color: #bbbbbb;
            &:before {
              background-color: #bbbbbb;
            }
            &:after {
              background-color: #bbbbbb;
            }
          }
        }
      }
      .white {
        border-left: 1px solid #ffffff;
        color: #ffffff;
      }
      .text-center {
        text-align: center;
      }
      .no-border {
        border: none;
      }
      .no-padding {
        padding: 0;
      }
      .flex-2 {
        flex: 2;
      }
      .no-wrap {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .flex-8 {
        flex: 8
      }
      .max-width-50 {
        max-width: 50px;
      }
      .max-width-30 {
        max-width: 30px;
      }
      .pointer {
        cursor: pointer;
      }
    }
  }
  .lang-enUS {
    .ordering-updish-wrap .ordering-updish-wrap-menu-content {
      height: 390px;
    }
  }
</style>
