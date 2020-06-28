<template>
  <Dialog
    name="PosDialog.SelectRider"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :appendToBody="true"
    width="578px"
    @submit="submit"
    :showSubmit="true"
    :title="oprateTitle"
    :hotkeys="hotKeySet"
  >
    <div class="pos-dialog-content" v-if="riderList.length !== 0">
      <ul class="riders-wrapper" id="riderList">
        <li v-for="(item, index) in riderList"
        :key="item.mid"
        :class="{active: tabIndex === index}"
         @click="selectRider(index, item)">
          <button class="btn btn-default">{{ item.name }}</button>
          <span v-if="tabIndex === index">{{ item.distriTimes + 1 }}</span>
          <span v-else>{{ item.distriTimes }}</span>
        </li>
      </ul>
      <ul class="rider-pager-wrapper">
        <li>{{$t('Biz.Takeout.Msg1', [distributionRuleName])}}</li>
        <li id="takeoutRiderPager">
          <Pager pagerId="riderList" ref="pager" arrowDirection="up-down" :showInfo="true"></Pager>
        </li>
      </ul>
    </div>
    <div  class="no-rider-wrapper" v-else>
      <strong>{{$t('Biz.Pos.Takeout.TakeoutMsg063')}}</strong>
    </div>
  </Dialog>
</template>

<script>
import ajax from '@/common/js/ajax';
import { ERR_OK } from '@/common/api/takeoutConfig';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';

export default {
  props: {
    oprateTitle: {
      type: String,
      default() {
        return this.$t('Dict.ChooseRiders');
      },
    },
  },
  components: { Dialog, Pager },
  mixins: [DialogMixin],
  data() {
    return {
      tabIndex: -1,
      distributionTimesRule: 0,
      riderList: [],
      riderId: '',
      rider: {},
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.submit();
        },
      };
    },
    distributionRuleName() {
      return this.distributionTimesRule === 1 ? this.$t('Dict.ChooseRiders') : this.$t('Dict.Shifts');
    },
  },
  created() {
    this.getRiderList();
  },
  methods: {
    // 骑手框打开时获取数据
    onOpen() {
      this.getRiderList();
    },
    // 选择骑手API
    getRiderList() {
      ajax('canyin.takeout.takeoutdistriset.selectridelist')
        .then((res) => {
          if (res.data.code === ERR_OK) {
            const { data } = res.data;
            this.distributionTimesRule = data.distributionTimesRule;
            this.riderList = data.riderList;
            this.echoSelectedRider();
          } else {
            this.$message.error(res.data.msg);
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
    // 回显骑手
    echoSelectedRider() {
      if (this.resData && this.resData.selectedDistributorId) {
        this.riderList.forEach((item, index) => {
          if (item.mid === this.resData.selectedDistributorId) {
            this.selectRider(index, item);
            // 非电话外卖回显逻辑 20ms解决代码执行顺序问题
            if (!this.resData.takeoutPhone) {
              setTimeout(() => {
                item.distriTimes -= 1;
              }, 20);
            }
          }
        });
      }
    },
    // TAB选择
    selectRider(index, item) {
      this.tabIndex = index;
      this.riderId = item.mid;
      this.rider = item;
    },
    // 提交逻辑处理
    submit() {
      if (this.riderId === '') {
        this.close();
        this.$message.error(this.$t('Biz.Pos.Takeout.TakeoutMsg065'));
        return;
      }
      this.$emit('handleRider', this.riderId, this.rider);
      this.close();
    },
    // 骑手框关闭时 清空选择
    onClose() {
      this.tabIndex = -1;
      this.riderId = '';
    },
  },
  watch: {
    riderList() {
      if (this.$refs.pager) {
        this.$refs.pager.refresh();
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-dialog-header {
  font-size: 16px;
  color: rgb(102, 102, 102);
  font-weight: bold;
  line-height: 1.2;
}

.pos-dialog-control {
  .btn-close,
  .btn-submit {
    height: 36px;
    padding: 8px 16px;
    margin-top: 4px;
  }
  .btn-close {
    margin-right: 10px;
    width: 98px;
  }
  span {
    color: #aaa;
  }
}

.riders-wrapper {
  padding-left: 16px;
  background-color: white;
  width: 100%;
  height: 174px !important;
  overflow: hidden;
  .clearfix();

  > li {
    position: relative;
    float: left;
    margin-top: 14px;
    margin-right: 12px;
    border: none;

    > button {
      .size(100px, 44px);
      .text-overflow();
    }

    > span {
      position: absolute;
      top: 0;
      right: 5px;
      font-size: 12px;
      color: rgb(153, 153, 153);
    }

    &.active {
      border: none;

      > button {
        .button-variant(white, #0babb9, #0babb9);
      }

      > span {
        color: white;
      }
    }
  }
}

.rider-pager-wrapper {
  padding: 16px;
  background-color: white;
  .clearfix();

  > li:first-child {
    float: left;
    font-size: 12px;
    color: rgb(101, 101, 101);
  }

  > li:last-child {
    float: right;
  }
}

.no-rider-wrapper {
  width: 100%;
  background-color: white;
  text-align: center;
  padding-top: 100px;
  padding-bottom: 100px;

  > strong {
    color: #ccc;
    font-size: 48px;
    font-weight: normal;
  }
}
</style>

<style lang="less">
#takeoutRiderPager {
  text-align: right;
  .pos-pager {
    > button {
      display: inline-block;
      width: 44px;
      height: 30px;
      border: 1px solid #c8c8c8;
      line-height: 28px;
      border-radius: 14px;
      text-align: center;
      margin-left: 8px;
      color: #333;
      > i {
        font-size: 16px;
      }
    }
  }
}
</style>
