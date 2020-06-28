<template>
  <div class="reserve-list-content">
    <div class="table-head">
      <table>
        <tr>
          <th class="seat-col">{{ $t('Dict.Seat') }}</th>
          <th class="num-col">{{ $t('Dict.NumberOfPeople') }}</th>
          <th class="source-col">{{ $t('Dict.Source') }}</th>
          <th class="contact-col">{{ $t('Dict.ContactPhone') }}</th>
          <th class="time-col">{{ $t('Dict.OrderingTime') }}</th>
          <th class="payway-col">{{ $t('Dict.PaymentMethod') }}</th>
          <th class="remark-col">{{ $t('Dict.Remarks') }}</th>
          <th class="status-col drop" ref="drop" id="drop" @click.stop="showPanel">
            <div class="flex-style">
              <span class="status-style">{{ tableText }}</span>
              <em
                class="icon big-size"
                :class="showDropStatus ? 'icon-arr-up' : 'icon-arr-down'"
              ></em>
            </div>
            <div class="dialog">
              <ul class="dropdown-btn-itemBox firstDropItem" v-show="showDropStatus">
                <li class="dropdown-btn-item"
                    @click="operation(index)"
                    v-for="(item, index) in status" :key="item.id">
                  <span>
                    <em
                      class="checkSign icon"
                      :class="item.checked ? 'icon-duihao' : ''"></em>
                  </span>
                  {{ item.text }}
                </li>
                <li class="dropdown-btn-allOrNo">
                  <span @click="operation(0,1,true)">{{$t('Dict.SelectAll')}}</span>
                  /
                  <span @click="operation(0,1,false)">{{$t('Biz.Booking.SelectRe')}}</span>
                </li>
              </ul>
            </div>
          </th>
        </tr>
      </table>
    </div>
    <div class="table-body" ref="reserveList">
      <table>
        <tr
          @click="changeReserve(item)"
          v-for="item in list"
          :key="item.id"
          :class="{
            'active': currentReserve && currentReserve.id === item.id
          }"
        >
          <td class="seat-col">{{item.pointName || item.tablenumber}}
            <span v-if="item.errorMsg" class="danger-badge">{{item.errorMsg}}</span>
          </td>
          <td class="num-col">{{item.people}}</td>
          <td class="source-col">{{ item.orderfromName }}</td>
          <td class="contact-col">
            {{item.contact}}<br>
            {{item.mobile}}
          </td>
          <td class="time-col">
            {{item.diningtime | dateformat}}<br>
            {{item.diningtime | timeformat}}
          </td>
          <td class="payway-col">{{orderPayway(item.paytypeid)}}{{$t('Dict.Payment')}}</td>
          <td class="remark-col">{{item.note}}</td>
          <td class="status-col">
            <span
              class="status"
              :class="['status-'+item.isdownsuccess]"
            >{{orderstatus(item.isdownsuccess)}}</span>
          </td>
        </tr>
      </table>
      <div class="no-item" v-if="totalCount === 0">
        <p>{{$t('Biz.Reserve.ReserveMsg014')}}</p>
      </div>
    </div>
    <div class="pos-pager">
      <el-input
        class="keyword-input"
        v-model="keyword"
        v-judge
        v-switch-keyboard:top-right="keybordParams"
        prefix-icon="el-icon-search"
        :placeholder="$t('Biz.Reserve.ReserveMsg015')"
      ></el-input>
      <div class="pos-takeout-pager">
        <span class="page-info">{{
          $t('Dict.PageStyle.Text1', {
            length: totalCount,
            currentPage: PageSize + 1,
            totalPage: pageCount,
          })
        }}</span>
        <button
          href="javascript:;"
          class="prev"
          @click="upPage"
        >
          <i class="el-icon-arrow-up"></i>
        </button>
        <button
          href="javasctipt:;"
          class="next"
          @click="downPage"
        >
          <i class="el-icon-arrow-down"></i>
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import { cloneDeep, debounce } from 'lodash';
import { mapGetters } from 'vuex';
import ajax from '@/common/js/ajax';
import * as TimeFormatUtil from '@/common/util/TimeFormat';
import i18n from '@/locales/index';

export default {
  data() {
    return {
      keyword: '',
      // 每页个数
      PageNo: 8,
      // 每页页码
      PageSize: 0,
      totalCount: 0,
      list: [],
      currentReserve: null,
      tmpStatus: [], // this.status的缓存 用于判断status的新值和旧值是否相同
      status: [], // 状态栏下拉列表数据
      showDropStatus: false, // 是否显示状态栏下拉列表
      shouldRequest: true, // 状态栏弹出框隐藏的时候是否应该请求接口(防止筛选条件不变的情况下重复请求接口)
      tableText: this.$t('Dict.State'),
    };
  },
  props: {
    value: {},
  },
  computed: {
    ...mapGetters(['posBaseInfo']),
    // 键盘参数
    keybordParams() {
      if (!this.$store.state.pos || !this.$store.state.pos.posBaseInfo) {
        return {};
      }
      return {
        letterType: this.$store.state.pos.posBaseInfo.isEnableQWEKeyboard
          ? 'full'
          : 'nine',
      };
    },
    // 总页码数
    pageCount() {
      return Math.ceil(this.totalCount / this.PageNo);
    },
    // 预点通知数量
    reserveNotifyCount() {
      return this.$store.state.pos.headerNotifyCount.reserveCount;
    },
  },
  mounted() {
    this.initStatus();
    this.$nextTick(() => {
      this.getListData();
    });
    window.addEventListener('click', this.hidePanel);
  },
  destroyed() {
    window.removeEventListener('click', this.hidePanel);
  },
  filters: {
    dateformat(val) {
      return TimeFormatUtil.toNormalDateStr(val);
    },
    timeformat(val) {
      return TimeFormatUtil.toNormalTimeStr(val);
    },
    // 来源
    orderSource(val) {
      switch (Number(val)) {
        case 1:
          return this.$t('Dict.TaoBao');
        case 2:
          return this.$t('Dict.PhoneOrdering');
        case 3:
          return this.$t('Dict.WeChat');
        case 4:
          return this.$t('Dict.PublicComment');
        case 5:
          return this.$t('Dict.NetRun');
        case 6:
          return this.$t('Dict.Alipay');
        case 7:
          return this.$t('Dict.Baidu');
        case 8:
          return this.$t('Dict.TiancaiOfflinePOS');
        case 9:
          return this.$t('Dict.GoodHome');
        case 28:
          return this.$t('Dict.UnionPayCloudFlashPayment');
        default:
          return this.$t('Dict.Unknown');
      }
    },
  },
  methods: {
    // 初始化status,解决切换语言后文字未正常切换问题
    initStatus() {
      this.status = [{
        id: 2,
        text: i18n.t('Dict.NoOrder'),
        checked: true,
      }, {
        id: 3,
        text: i18n.t('Dict.HadPlaced'),
        // text: '已下单',
        checked: true,
      }, {
        id: 5,
        text: i18n.t('Dict.ClosedPlatform'),
        // text: '已关台',
        checked: true,
      }, {
        id: 4,
        text: i18n.t('Dict.Cancelled'),
        // text: '已取消',
        checked: true,
      }];
    },
    // 订单状态
    orderstatus(val) {
      switch (Number(val)) {
        case 2:
          return this.$t('Dict.NoOrder');
        case 3:
          return this.$t('Dict.HadPlaced');
        case 4:
          return this.$t('Dict.Cancelled');
        case 5:
          return this.$t('Dict.ClosedPlatform');
        default:
          return this.$t('Dict.Unknown');
      }
    },
    // 订单支付方式
    orderPayway(val) {
      switch (Number(val)) {
        case 6:
        case 106:
          return this.$t('Dict.WeChat');
        case 8:
        case 108:
          return this.$t('Dict.Alipay');
        case 18:
        case 118:
          return this.$t('Dict.UnionPayCloudFlashPayment');
        case 3:
        case 103:
        case 110:
        case 111:
          return this.$t('Dict.Member');
        case 0:
        case 105:
          return this.$t('Dict.PublicComment');
        case 4:
          return this.$t('Dict.UnderTheLine');
        case 109:
          return this.$t('Dict.OnlinePrepayment');
        default:
          return this.$t('Dict.UnderTheLine');
      }
    },
    clearCache() {
      this.initStatus();
      this.tmpStatus = [];
      this.tableText = this.$t('Dict.State');
    },
    hidePanel(event) {
      if (!this.$refs.drop.contains(event.target)) {
        this.showDropStatus = false;
      }
    },
    // 切换状态栏弹出层的显示隐藏
    showPanel() {
      this.showDropStatus = true;
    },
    // 修改状态列表选中状态
    // type = 0 || 1,  单个还是所有. bool = true || false, 全选还是反选
    operation(index = 0, type = 0, bool = true) {
      if (type === 0) {
        this.status[index].checked = !this.status[index].checked;
      } else {
        this.status.forEach((item, i) => {
          this.status[i].checked = bool;
        });
      }
      this.changeTableText();
    },
    // 改变列表头部的状态显示文字
    changeTableText() {
      let statusText = '';
      let num = 0;
      this.status.forEach((item) => {
        if (item.checked) {
          num += 1;
          statusText += `${item.text},`;
        }
      });
      if (num === this.status.length) {
        this.tableText = this.$t('Dict.State');
      } else {
        this.tableText = statusText || this.$t('Dict.State');
      }
    },
    // 改变预点
    changeReserve(reserve) {
      this.currentReserve = reserve;
    },
    // 获取远程列表数据
    getListData() {
      // 根据容器大小动态设置显示条数
      this.PageNo = Math.floor(this.$refs.reserveList.clientHeight / 60);
      const typeList = [];
      this.status.forEach((item) => {
        if (item.checked) {
          typeList.push(item.id);
        }
      });
      ajax('canyin.pos.reserveorderbill.reserveorderlist', {
        params: {
          PageNo: this.PageNo,
          PageSize: this.PageSize,
          searchText: this.keyword,
          downsuccessTypeList: JSON.stringify(typeList),
        },
      }).then((data) => {
        [this.currentReserve] = data.list;
        // 快餐时, 将所有list传给右侧功能菜单, 以执行全部下单
        if (`${this.posBaseInfo.controlMode}` === '3') {
          this.$parent.$refs.reserveInfo.allList = data.list;
        }
        this.totalCount = data.count;
        this.list = data.list;
      });
    },
    // 向上翻页
    upPage() {
      if (this.PageSize > 0) {
        this.PageSize -= 1;
        this.getListData();
      }
    },
    // 向下翻页
    downPage() {
      if (this.PageSize < this.pageCount - 1) {
        this.PageSize += 1;
        this.getListData();
      }
    },
    // 由于键盘输入频率非常快，所以增加延时触发操作
    debounceSearch: debounce(function () {
      this.getListData();
    }, 500),
    // 重新加载列表
    reloadReserveList() {
      this.PageSize = 0;
      this.getListData();
    },
  },
  watch: {
    $route() {
      this.clearCache();
    },
    keyword() {
      this.debounceSearch();
    },
    currentReserve(value) {
      this.$emit('input', value);
    },
    reserveNotifyCount() {
      if (this.$route.path === '/pos/reserve') {
        this.reloadReserveList();
      }
    },
    // 状态栏下拉框关闭时根据条件查询列表
    showDropStatus(val) {
      if (!val && this.shouldRequest) {
        this.reloadReserveList();
        this.tmpStatus = cloneDeep(this.status);
        this.shouldRequest = false;
      }
    },
    status: {
      deep: true,
      handler(val) {
        this.shouldRequest = false;
        const len = this.status.length;
        if (len !== this.tmpStatus.length) {
          this.shouldRequest = true;
          return;
        }
        for (let i = 0; i < len; i += 1) {
          if (val[i].checked !== this.tmpStatus[i].checked) {
            this.shouldRequest = true;
            break;
          }
        }
      },
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
@import "~@/components/Pos/Booking/BookingCommon/common.less";

table {
  width: 100%;
}
th,
td {
  padding-left: 6px;
  font-weight: normal;
  position: relative;
}
.table-head {
  padding: 8px 0;
  background-color: #c5e0e5;
  color: #273844;
  th {
    font-size: 14px;
    line-height: 1.7;
    display: table-cell;
  }
  th + th {
    border-left: 1px solid #b5b5b5;
  }
}
.table-body {
  margin-top: 8px;
  min-height: 400px;
  flex-grow: 1;
  table {
    table-layout: fixed;
  }
  td {
    font-size: 14px;
    line-height: 1.5;
    padding: 8px 0 8px 8px;
  }
  tr {
    background-color: @white;
    background-clip: padding-box;
    border-bottom: 2px solid transparent;
    counter-increment: itemindex;
    vertical-align: middle;
    color: #273844;
    &.active {
      color: @white;
      background-color: #1db1be;
    }
  }
}

.seat-col {
  width: 10.6%;
  .danger-badge {
    white-space: nowrap;
    transform: rotate(-10deg);
    position: absolute;
    padding: 2px 4px;
    color: rgba(255, 254, 254, 0.8);
    top: 50%;
    left: 50%;
    margin-top: -10px;
    margin-left: -20px;
    background-color: rgba(255, 0, 0, 0.3);
  }
}
.num-col {
  width: 4.9%;
}
.source-col {
  width: 10%;
}
.contact-col {
  width: 16.6%;
}
.time-col {
  width: 14.7%;
}
.payway-col {
  width: 13.1%;
}
.remark-col {
  // width: 15.1%;
  height: calc(2em + 20px);
  overflow: hidden;
  text-align: left;
  display: block;
}
.status-col {
  .status {
    border-radius: 12px;
    padding: 4px 6px;
  }
  .status-2,
  .status-6 {
    background-color: #f6c312;
  }
  .status-3 {
    background-color: #317ef3;
  }
  .status-4 {
    background-color: #f85050;
  }
  .status-5 {
    background-color: #a572d5;
  }
  &.drop {
    width: 15%;
  }
}
.dialog {
  position: relative;
  .dropdown-btn-itemBox {
    width: 200px;
    border-radius: 4px;
    position: absolute;
    top: 10px;
    left: 2px;
    padding: 15px;
    background-color: rgba(46, 74, 89, 0.95);
    cursor: default;
    z-index: 500;
    &.firstDropItem {
      left: -40px;
    }
    .dropdown-btn-item {
      float: left;
      margin: 0 12px 10px 0;
      color: #fff;
      cursor: pointer;
      > span {
        width: 18px;
        height: 18px;
        line-height: 14px;
        display: inline-block;
        margin-right: 6px;
        vertical-align: middle;
        border: 1px solid #9aa7af;
        border-radius: 3px;

        .checkSign {
          .setFont(12px, @activeColor);
        }
      }
    }

    .dropdown-btn-allOrNo {
      width: 100%;
      float: left;
      margin-top: 10px;
      text-align: left;
      color: @activeColor;

      > span {
        margin: 0 6px;
        cursor: pointer;
        &:active {
          border-bottom: 1px solid @activeColor;
        }
      }
    }
  }
}
.flex-style {
  display: flex;
  height: 48px;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  .big-size {
    font-size: 26px !important;
  }
  .status-style {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    flex: 1;
    width: 140px;
  }
}

.no-item {
  text-align: center;
  font-size: 14px;
  color: #666;
  padding-top: 20px;
}
.reserve-list-content {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.pos-pager {
  overflow: hidden;
}
.keyword-input {
  width: 272px;
}
// 箭头按钮
.pos-takeout-pager {
  margin-top: 4px;
  float: right;
  color: #273844;
  > button {
    display: inline-block;
    width: 44px;
    height: 30px;
    border: none;
    line-height: 28px;
    border-radius: 14px;
    text-align: center;
    margin-left: 8px;
    background-color: rgba(237, 254, 255, 0.5);

    > i {
      color: #273844;
    }

    &[disabled] {
      color: #999;
      cursor: not-allowed;
    }
  }
}
.lang-enUS{
  .keyword-input {
    width: 390px;
  }
}
</style>
<style lang="less">
.reserve-list-content {
  .keyword-input {
    .el-input__inner {
      background-color: rgba(237, 254, 255, 0.5);
      color: #273844;
      border-radius: 24px;
      &::-webkit-input-placeholder {
        color: #273844;
      }
    }

    .el-input__prefix {
      color: #273844;
    }
  }
}
</style>
