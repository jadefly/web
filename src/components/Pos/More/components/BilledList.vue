<template>
  <div class="billed-list">
    <div class="list-wapper">
    <el-row class="search-area" :gutter="20" v-if="isShowSearch">
      <el-col :span="10" >
        <el-select :placeholder="$t('Dict.PleaseChoose')" v-model="type" @change="handleChangeSelect">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="14">
        <el-input
          v-model="keyword"
          v-num-keyboard:bottom
          :placeholder="$t('Dict.EnterSomething')"
          v-judge
          v-autotest>
        </el-input>
      </el-col>
    </el-row>
    <el-row :class="['table-head',{'bill-table-head':!isShowSearch}]">
      <el-col class="table-head-item flow-title" :span="11">
        <span class="clearing-item">&#9635; {{$t('Dict.SettlementFlow')}}</span>
        <span class="business-item">&#9635; {{$t('Dict.OperationFlow')}}</span>
      </el-col>
      <el-col class="table-head-item" :span="7">{{ types }}</el-col>
      <el-col class="table-head-item" :span="6">{{$t('Dict.SettlingTime')}}</el-col>
    </el-row>
    <div :class="[
        'table-content',
        {'bill-table-content':!isShowSearch,'billed-table-content':isShowSearch}
      ]"
      :ref="'listwarp'+title"
      :id="'billedListId'+title" >
      <table  >
        <tr class="table-item"
          :class="{'active':value && item.tsId === value.tsId,'table-item-active':item.count == 1}"
          v-for="(item, index) in billedList" :key="item.id"
          @click="checkItem(item)" v-autotest>
          <td class="code-col">
            <span class="billedCount">{{index + 1}}</span>
            <div class="flow-numbers">
              <el-tooltip
                effect="dark"
                :content="item.tsCode"
                placement="top-start"
                :open-delay="delay">
                <span class="clearing-item">{{item.tsCode}}</span>
              </el-tooltip>
              <el-tooltip
                effect="dark"
                :content="item.bsCode"
                placement="top-start"
                :open-delay="delay">
                <span class="business-item">{{item.bsCode}}</span>
              </el-tooltip>
            </div>
          </td>
          <td class="seat-col">
              <span v-if="getVuexPosMode === '3'">{{ item.orderCode }}</span>
              <span v-else>{{ item.pointName }}</span>
          </td>
          <td class="time-col">{{item.settleTime}}</td>
        </tr>
      </table>
    </div>
    <div class="billedListId-page">
      <div class="pos-takeout-pager">
        <span class="page-info">
          {{$t('Dict.PageStyle.Text1', { length: total, currentPage: currentPage, totalPage: totalPagerNum ? totalPagerNum:1 })}}
        </span>
        <button
          href="javascript:;"
          class="prev"
          @click="upPage"
          :disabled="currentPage <= 1"
         >
        <i class="el-icon-arrow-up"></i></button>
        <button
          href="javasctipt:;"
          class="next"
          @click="downPage"
          :disabled="currentPage >= totalPagerNum"
          >
        <i class="el-icon-arrow-down"></i></button>
      </div>
    </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex';
import { debounce } from 'lodash';

export default {
  model: {
    event: 'change',
  },
  props: {
    isClearInput: Boolean,
    value: {},
    // 全部已结账单
    billedList: {
      type: Array,
      default() {
        return [];
      },
    },
    currentPager: {
      type: Number,
      default() {
        return 1;
      },
    },
    total: {
      type: Number,
      default() {
        return 0;
      },
    },
    isShowSearch: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: 'billQuery',
    },
  },
  data() {
    return {
      type: '',
      types: '',
      keyword: '',
      delay: 300, // tip延迟时间
      limit: 10,
      currentPage: this.currentPager,
    };
  },
  computed: {
    ...mapGetters([
      'getVuexPosMode',
    ]),
    ...mapState({
      posMode(state) {
        if (state.pos.posInfo) {
          return state.pos.posBaseInfo.controlMode;
        }
        return null;
      },
    }),
    // 判断分页总数
    totalPagerNum() {
      return Math.ceil(this.total / this.limit);
    },
    options() {
      const { getVuexPosMode: num } = this;
      return [
        {
          value: num === '3' ? 'orderCode' : 'pointName',
          label: num === '3' ? this.$t('Dict.OrderCode') : this.$t('Dict.Seat'),
        },
        {
          value: 'cardNo',
          label: this.$t('Dict.CardNumber'),
        },
        {
          value: 'tsCode',
          label: this.$t('Dict.SettlementFlow'),
        }, {
          value: 'bsCode',
          label: this.$t('Dict.OperationFlow'),
        }];
    },
  },
  created() {
    const { getVuexPosMode: num } = this;
    this.types = num === '3' ? this.$t('Dict.OrderCode') : this.$t('Dict.Seat');
    this.type = num === '3' ? 'orderCode' : 'pointName';
    this.handleChangeInput = debounce(this.handleChangeInput, 400);
  },
  methods: {
    handleChangeSelect(data) {
      this.$emit('handleChangeSelect', data);
    },
    // 初始化
    init(n = 1) {
      this.currentPage = n;
      // this.keyword = '';
    },
    downPage() {
      this.currentPage += 1;
      if (this.currentPage >= this.totalPagerNum) {
        this.currentPage = this.totalPagerNum;
      }
      this.$emit('handleChangePage', this.currentPage);
    },
    upPage() {
      this.currentPage -= 1;
      if (this.currentPage <= 0) {
        this.currentPage = 1;
      }
      this.$emit('handleChangePage', this.currentPage);
    },
    // 点击条目
    checkItem(bill) {
      this.$emit('change', bill);
    },
    handleChangeInput(data) {
      this.$emit('handleChangeInput', data);
    },
  },
  watch: {
    $route() {
      const { getVuexPosMode: num } = this;
      this.types = num === '3' ? this.$t('Dict.OrderCode') : this.$t('Dict.Seat');
      this.type = num === '3' ? 'orderCode' : 'pointName';
    },
    isClearInput(data) {
      const { getVuexPosMode: num } = this;
      this.keyword = '';
      this.types = num === '3' ? this.$t('Dict.OrderCode') : this.$t('Dict.Seat');
      this.type = num === '3' ? 'orderCode' : 'pointName';
    },
    keyword(data) {
      this.handleChangeInput(data);
    },
  },
};
</script>
<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.billed-list{
  height: 100%;
  background-color: @white;
}
.bill-table-content{
  height: 529px !important;
}
.billed-table-content{
  height: 481px !important;
}
.table-item-active{
  background: #f5f5f5 !important;
}
.bill-table-head{
  border-top: none !important;
  padding:11px 6px !important;
}
.list-wapper{
  height: 100%;
  // display: flex;
  background-color: @white;
  flex-direction: column;
  position: relative;
}
.search-area{
  padding: 8px 16px;
  height:56px;
  // border-bottom: 1px solid #b5b5b5;
}
.clearing-item{
  color: #ffa200;
}
.business-item{
  color: #0babb9;
}
.table-head{
  padding: 10px 6px;
  border-bottom: 1px solid #b5b5b5;
  border-top: 1px solid #b5b5b5;
  display: flex;
  align-items: center;
  .flow-title{
    text-align: center;
    font-size: 12px;
    color: #666;
    span+span{
      padding-left: 12px;
    }
  }
}
.table-head-item{
  padding-left: 8px;
  font-size: 14px;
  line-height: 1.4;
  &+&{
    border-left: 1px solid #ccc;
  }
}
.table-content{
  // flex-grow: 1;
  // height: calc(100vh - 197px);
  height:481px;
  overflow: hidden;
  // border-bottom:1px solid #c2c2c2;
  table{
    width: 100%;
    table-layout: fixed;

  }
}
.table-item{
  padding: 10px 0;
  border-bottom: 1px solid #b5b5b5;
  background: #fff;
  height: 48px;
  cursor: pointer;
  &.active{
    background-color: #ddf1f6 !important;
  }
  td{
    vertical-align: middle;
    padding: 8px 0 8px 8px;
    font-size: 12px;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
  }
  .code-col{
    width: 46%;
    padding-left: 16px;
    position: relative;
    .billedCount {
      position: absolute;
      left: 4px;
      top: 18px;
    }
    .flow-numbers{
      vertical-align: middle;
      display: inline-block;
      width: 100%;
      >span{
        line-height: 1.3;
        padding: 0 0 0 8px;
        display: block;
        width: 100%;
        overflow: hidden;
        text-overflow:ellipsis;
        white-space: nowrap;
      }
    }
  }
  .seat-col{
    width: 30%;
  }
}
.billedListId-page{
  overflow: hidden;
  padding-top: 5px;
  padding-right: 8px;
  position: absolute;
  right: 0;
  bottom: 9px;
}
// 箭头按钮
.pos-takeout-pager {
  float: right;
  > button {
    display: inline-block;
    width: 44px;
    height: 30px;
    border: 1px solid #9a9a9a;
    line-height: 28px;
    border-radius: 14px;
    text-align: center;
    margin-left: 8px;
    background-color: white;

    > i {
      color : #9a9a9a;
    }

    &[disabled] {
      color: @btn-disabled-color;
      cursor: not-allowed;
    }
  }
}

.lang-enUS{
  .table-head{
    padding: 5px 10px;
    .flow-title{
      span{
        display: block;
      }
    }
    .table-head-item{
      font-size: 12px;
    }
  }
}

</style>
