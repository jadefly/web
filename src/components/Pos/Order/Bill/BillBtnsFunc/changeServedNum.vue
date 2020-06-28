<template>
  <!-- $t-上菜数量 -->
  <Dialog
    name="Package.ChangeNum"
    :title="$t('Dict.ServeNum')"
    ref="dialog"
    :showSubmit="false"
    width="400px"
    height="495px"
    @open="onOpen"
    @close="onClose"
    append-to-body
    :submitId="submitId">
    <div class="change-served-num">
      <div class="change-served-num-header">
        <!-- $t-品项名称： -->
        <span>{{ $t('Dict.ItemName')+'：'}} {{ item ? item.itemName : '' }}</span>
      </div>
      <div class="change-served-num-wrap">
        <div class="change-served-num-wrap-tabs">
          <span
            class="float-left"
            :class="currentTabs === 1 ? 'active' : ''"
            @click="toggleTabs(1)">{{ $t('Biz.Order.NotServed') }}</span>
            <!-- $t-未上菜 -->
          <span
            class="float-right"
            :class="currentTabs !== 1 ? 'active' : ''"
            @click="toggleTabs(2)">{{ $t('Biz.Order.BeenServed') }}</span>
            <!-- -$t-已上菜 -->
        </div>
        <div class="change-served-num-wrap-content">
          <div class="change-served-num-wrap-content-no-served" v-if="currentTabs === 1">
            <div class="all-served" v-if="!isAllServed">
              <div class="form-group">
                <!-- <label>上菜数量：</label> -->
                <label>{{ $t('Dict.ServeNum')+'：' }}</label>
                <div class="ordering-changenum-num">
                  <button
                    type="button"
                    class="subtract"
                    :disabled="cutDisabled"
                    @click="changeNumHandle('-')">
                    <i class="icon icon-subtract"></i>
                  </button>
                  <input
                    v-judge
                    :id="submitId + 'Input'"
                    type="text"
                    name="changeNum"
                    v-model="unServedNum"
                    v-keyboard:keyboard="{ mode: 'simple', autoSelect: true }"
                    ref="changeNum">
                  <button
                    type="button"
                    class="add"
                    :disabled="addDisabled"
                    @click="changeNumHandle('+')">
                    <i class="icon icon-add"></i>
                  </button>
                </div>
                <!-- $t-上菜 -->
                <button
                  class="served"
                  :disabled="limitClickServed"
                  @click="confirmNotQue(item,0)">{{ $t('Dict.Btn.Served') }}</button>
              </div>
              <div class="ordering-changenum-keyboard">
                <KeyBoard ref="keyboard"></KeyBoard>
              </div>
            </div>
            <div class="not-all-served" v-else>
              <img :src="imgages[0]" alt="">
              <!-- $t-该品项菜已上齐 -->
              <span>{{ $t('Biz.Order.OrderOptMsg03') }}</span>
            </div>
          </div>
          <div class="change-served-num-wrap-content-served"  v-else>
            <div class="change-served-num-wrap-content-served-header">
              <!-- $t-上菜时间,数量,操作 -->
              <div class="flex-1"></div>
              <div class="flex-3">{{ $t('Biz.Order.ServedTime') }}</div>
              <div class="flex-3 border-left">{{ $t('Dict.Amount') }}</div>
              <div class="flex-3 border-left">{{ $t('Dict.Operation') }}</div>
            </div>
            <div class="all-served" v-if="servedList.length">
              <div
                class="change-served-num-wrap-content-served-content"
                id="change-served-num-content"
                ref="changeServedNumContent"
              >
                <Paging
                  :data="servedList"
                  :itemWidth="370"
                  :itemHeight="64"
                  :autoActive="false"
                  class="order-served-menu-content-list"
                  ref="changeServedNumContentList"
                  id="changeServedNumContentList">
                  <div
                    class="change-served-num-wrap-content-served-content-list"
                    slot-scope="props"
                  >
                    <div class="flex-1">{{ props.item.currentIndex}}</div>
                    <div class="flex-3">{{ formatDate(props.item.servingTime) }}</div>
                    <div class="flex-3 border-left">{{ props.item.qty }}</div>
                    <div class="flex-3 border-left">
                      <button
                        class="cancel"
                        :disabled="limitClickUnServed"
                        @click="toggleServe(props.item,1)"
                      >
                        <!-- <span>撤销</span> -->
                        <span>{{ $t('Dict.Revoke') }}</span>
                        <img :src="imgages[1]" alt="">
                      </button>
                    </div>
                  </div>
                </Paging>
              </div>
              <div class="change-served-num-wrap-content-served-operation">
                <PagingBtn
                  ref="changeServedNumContentListPagingBtn"
                  arrowDirection="up-down"
                  :showInfo="true"
                  class="ordering-updish-wrap-menu-operation-pagingBtn">
                </PagingBtn>
              </div>
            </div>
            <div class="not-all-served" v-else>
              <img :src="imgages[0]" alt="">
              <!-- $t-暂无已上菜记录 -->
              <span>{{ $t('Biz.Order.OrderOptMsg04') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>
<script>
import btnBack from '@/common/images/pos/singleItemTransfer/btn_back.png';
import iconEmpty from '@/common/images/pos/singleItemTransfer/icon_empty.png';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import Paging from '@/components/Pos/Common/Paging';
import PagingBtn from '@/components/Pos/Common/PagingBtn';
import { Message } from 'element-ui';
import ajax from '@/common/js/ajax';

export default {
  components: {
    Dialog, KeyBoard, Paging, PagingBtn,
  },
  mixins: [DialogMixin],
  props: {
    submitId: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      imgages: [iconEmpty, btnBack],
      item: null, // 当前品项详情
      tableInfo: null, // 包房信息
      isAllServed: false,
      currentTabs: 1,
      servedList: [], // 所有已上菜数据
      unServedData: null, // 未上菜数据
      unServedNum: '', //  选择上菜数量
      limitClickServed: false, // 限制上菜按钮重复点击
      limitClickUnServed: false, // 限制撤菜按钮重复点击
      timer: null, // 防重复点击的定时器
    };
  },
  watch: {
    currentTabs(val) {
      if (val === 1 && !this.isAllServed) { // 显示未上菜数量的时候 才获取焦点
        this.getFocus();
      }
    },
  },
  computed: {
    addDisabled() { // 增加按钮
      if (this.unServedData) {
        return this.unServedNum >= this.unServedData.qty;
      }
      return true;
    },
    cutDisabled() { // 减少按钮
      return this.unServedNum <= 1;
    },
  },
  methods: {
    /**
       *  切换上菜，未上菜页面
       */
    toggleTabs(index = 1) {
      this.currentTabs = index;
      if (+index === 2 && this.servedList.length) {
        this.$nextTick(() => {
          this.$refs.changeServedNumContentListPagingBtn.bind(this.$refs.changeServedNumContentList); // 分页
        });
      }
    },
    /**
       *  打开弹窗
       */
    onOpen() {
      this.init();
      if (this.currentTabs === 2) {
        this.$nextTick(() => {
          this.$refs.changeServedNumContentListPagingBtn.bind(this.$refs.changeServedNumContentList); // 分页
        });
      }
    },
    /**
       *  初始化上菜列表和厨房传菜启用模式
       */
    init() {
      const { data, tableInfo, transferDish } = this.resData;
      this.item = { ...data, transferDish };
      this.tableInfo = { ...tableInfo };
      this.getServingItemInfo();
    },
    /**
       *  查询已上菜信息
       */
    getServingItemInfo() {
      ajax('canyin.pos.serving.selectServingItemInfo', {
        params: {
          scId: this.item.scId,
        },
      }).then((res) => {
        this.unServedData = res.splice(0, 1)[0];
        this.isAllServed = !this.unServedData.qty;
        const {
          transferDish, arrangeDish, serveFinishQty, prepareFinishQty,
        } = this.item;
        if (transferDish) { // 输入框数量显示，先判断传菜，再判断配菜，那个有就显示那个
          if (serveFinishQty) {
            this.unServedNum = serveFinishQty;
          } else {
            this.unServedNum = this.unServedData.qty;
          }
        } else if (arrangeDish) {
          if (prepareFinishQty) {
            this.unServedNum = prepareFinishQty;
          } else {
            this.unServedNum = this.unServedData.qty;
          }
        } else {
          this.unServedNum = this.unServedData.qty;
        }
        this.servedList = res.map((item, index) => {
          Object.assign(item, {
            currentIndex: index + 1,
          });
          return item;
        });
      });
    },
    /**
     *  判断上菜和已传菜数量是否一致 只在上菜时提示
     *  type0为上菜 1为撤菜操作
     */
    confirmNotQue(item, type) {
      if (this.item.serveFinishQty !== this.unServedNum) { // 判断上菜数量与传菜数量不一致时提示
        // this.$confirm('该菜品上菜数量与传菜数量不一致,是否确认上菜？', '提示', {
        this.$confirm(this.$t('Biz.Order.OrderOptMsg05'),
          this.$t('Dict.Tips'), // '提示',
          {
            confirmButtonText: this.$t('Dict.Sure'), // '确定',
            cancelButtonText: this.$t('Dict.Cancel'), // '取消',
            type: 'warning',
          }
        ).then(() => {
          this.toggleServe(item, type);
        }).catch(() => false);
      } else {
        this.toggleServe(item, type);
      }
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
        this.limitClickUnServed = false;
      }, 2000);
      let bool = true; // bool判断上菜数量是否合法
      if (type) { // 根据type类型  来限制对应按钮的重复点击
        if (this.limitClickServed) return;
        this.limitClickServed = true;
      } else {
        if (this.limitClickUnServed) return;
        this.limitClickUnServed = true;
        bool = this.checkServedNum();
      }
      if (!bool) return;
      ajax('canyin.pos.serving.serving', {
        contentType: 'json',
        data: {
          servings: [{
            scId: item.scId,
            itemId: this.item.itemId,
            itemSizeId: this.item.itemSizeId,
            qty: type ? item.qty : this.unServedNum,
            times: type ? item.times : null,
          }],
          pointId: this.tableInfo.pointId,
          servingType: type,
        },
      }).then((res) => {
        if (res.success) {
          if (type) { // 如果是撤菜 不关闭窗口 刷新数据
            this.init();
          } else { // 如果是上菜 关闭窗口 目的是为了上菜时少走一次init()方法
            setTimeout(() => {
              this.$refs.dialog.close();
            }, 500);
          }
          this.$emit('init');
          this.$message.success(res.data.msg);
        } else {
          this.$message.warn(res.data.msg);
        }
        if (type) { // 根据type类型  来解除对应按钮的点击限制
          this.limitClickServed = false;
        } else {
          this.limitClickUnServed = false;
        }
      });
    },
    onClose() {
      this.currentTabs = 1;
    },
    getFocus() {
      const slef = this;
      // 打开进行input 聚焦
      setTimeout(() => {
        slef.$refs.changeNum.focus();
        if (slef.$refs.keyboard) {
          slef.$refs.keyboard.reSelect();
        }
      }, 200);
    },
    checkServedNum() {
      // 判断当前的数值 情况 为零或者是空的时候提示
      if (this.unServedNum === '' || +this.unServedNum === 0 || !this.unServedNum) {
        // const messageString = this.unServedNum === '' ? '所改的菜品数量不能为空' : '所改的菜品数量不能为零';
        const messageString = this.unServedNum === ''
          ? this.$t('Dict.ItemsCannotBeEmpty')
          : this.$t('Dict.NumCannotBeEmpty');
        this.unServedNum = 0;
        this.isShowMessage(messageString);
        this.$refs.changeNum.focus();
        return false;
      }
      if (+this.unServedNum > this.unServedData.qty) {
        // this.isShowMessage(`上菜数量最大为${this.unServedData.qty}`);
        this.isShowMessage(`${this.$t('Biz.Settlement.MaxDishes')}${this.unServedData.qty}`);
        this.unServedNum = this.unServedData.qty;
        return false;
      }
      return true;
    },
    // 加加 减减 按钮事件
    changeNumHandle(btnName) {
      if (btnName === '-') {
        this.unServedNum = (this.unServedNum * 1000 - 1000) / 1000;
      } else {
        this.unServedNum = (this.unServedNum * 1000 + 1000) / 1000;
      }
    },
    isShowMessage(message, type, duration) {
      const options = {
        message: message || this.$t('Dict.PromptInfo'), // 提示的内容
        type: type || 'error', // 类型 success/warning/info/error
        duration: duration || 1500, // 显示的时间
        center: true, // 中间显示
      };
      Message(options); // 需要多的可以查看element-ui 的官网 Message组件
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
  .change-served-num {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    .change-served-num-header {
      padding: 10px;
      font-size: 16px;
    }
    .change-served-num-wrap {
      flex: 1;
      background-color: #ffffff;
      .change-served-num-wrap-tabs {
        padding: 0 80px;
        border-bottom: 1px solid #bbbbbb;
        height: 50px;
        line-height: 50px;
        > span {
          display: block;
          width: 80px;
          height: 100%;
          text-align: center;
          font-size: 16px;
          cursor: pointer;
        }
        .active {
          color: #4fbef3;
          border-bottom: 3px solid #4fbef3;
        }
      }
      .change-served-num-wrap-content {
        padding: 15px;
        overflow: hidden;
        & > div {
          min-height: 100%;
        }
        .change-served-num-wrap-content-no-served {
          .all-served {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            .form-group {
              display: flex;
              align-items: center;
              .ordering-changenum-num {
                margin: 0 30px;
                position: relative;
                padding: 0 40px;
                .size(130px, 36px);

                > button {
                  position: absolute;
                  top: 0;
                  .square(36px);
                  border: 1px solid #999;
                  background-color: transparent;
                  border-radius: 3px;

                  > i.icon {
                    color: #999;
                  }

                  &.subtract {
                    left: 0;
                  }

                  &.add {
                    right: 0;
                  }

                  &:disabled {
                    border-color: #ccc;
                    cursor: not-allowed;

                    > i.icon {
                      color: #ccc;
                    }
                  }
                }

                > input {
                  display: block;
                  .size(100%, 36px);
                  border: 1px solid #999;
                  border-radius: 3px;
                  text-align: center;
                }
              }
              .served {
                width: 90px;
                height: 34px;
                border-radius: 3px;
                outline: none;
                border: none;
                color: #ffffff;
                background-color: #027a85;
              }
            }
            .ordering-changenum-keyboard {
              float: left;
              width: 186px;
            }
          }
          .not-all-served {
            margin-top: 50px;
            text-align: center;
            > span {
              margin-left: 5px;
              color: #bbbbbb;
            }
            > img {
              width: 35px;
              height: 35px;
            }
          }
        }
        .change-served-num-wrap-content-served {
          display: flex;
          flex-direction: column;
          .change-served-num-wrap-content-served-header {
            display: flex;
            align-items: center;
            padding: 3px;
            width: 100%;
            height: 30px;
            color: #ffffff;
            background-color: #4fbef3;
            & > div {
              padding: 0 5px;
            }
          }
          .all-served {
            .change-served-num-wrap-content-served-content {
              width: 100%;
              height: 258px;
              overflow: hidden;
              .order-served-menu-content-list {
                height: 100%;
                overflow: hidden;
              }
              .change-served-num-wrap-content-served-content-list {
                display: flex;
                align-items: center;
                padding: 6px 3px;
                width: 100%;
                height: 64px;
                border-bottom: 1px solid #bbbbbb;
                & > div {
                  padding: 0 5px;
                  .cancel {
                    display: flex;
                    width: 80px;
                    height: 30px;
                    line-height: 30px;
                    border-radius: 3px;
                    color: #ffffff;
                    border: none;
                    outline: none;
                    background-color: #4fbef3;
                    > span {
                      margin-left: 8px;
                    }
                    > img {
                      width: 30px;
                      height: 30px;
                    }
                  }
                }
              }
            }
            .change-served-num-wrap-content-served-operation {
              padding: 5px 0;
              text-align: right;
            }
          }
          .not-all-served {
            margin-top: 50px;
            text-align: center;
            > span {
              margin-left: 5px;
              color: #bbbbbb;
            }
            > img {
              width: 35px;
              height: 35px;
            }
          }
        }
      }
    }
    .ordering-changenum-error {
      padding: 15px;
    }
    .float-right {
      float: right;
    }
    .float-left {
      float: left;
    }
    .flex-1 {
      flex: 1;
    }
    .flex-3 {
      flex: 3;
    }
    .border-left {
      border-left: 1px solid #ffffff;
    }
  }
</style>
