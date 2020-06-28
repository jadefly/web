<template>
  <SystemContent :padding="false">
    <ProxyOffWorkHead
      slot="head"
      :checkList="checkList"
      @handleChangeHistoryOffWork="handleChangeHistoryOffWork"
    ></ProxyOffWorkHead>
    <div class="system-table-body" ref="systemTableBody" style="height: 100%">
      <!-- 左侧 -->
      <div class="offwork-list-content">
        <!-- 搜索 -->
        <div class="offwork-list-search">
          <el-input
                  class="offwork-search"
                  v-model="keyWords"
                  :placeholder="$t('Dict.PleaseEnterOperator')"
                  v-judge
                  v-autotest>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
        </div>
        <!-- 列表 -->
        <div class="offwork-list">
          <el-row class="offwork-list-head">
            <el-col class="offwork-list-head-item" :span="13" style="padding-left: 20px;">
              <p class="clearing-item">{{$t('Dict.FlowingWater')}}</p>
              <p class="sign-in-time">{{$t('Dict.CheckInTime')}}</p>
            </el-col>
            <el-col class="offwork-list-head-item" :span="8">
              <p class="clearing-item">{{$t('Dict.Operator')}}</p>
              <p class="sign-out-time">{{$t('Dict.SigningTime')}}</p>
            </el-col>
            <el-col class="offwork-list-head-item" :span="3">{{$t('Dict.State')}}</el-col>
          </el-row>
          <div v-show="isBatchOperation" id="offworkListId" class="offwork-list-group">
            <ProxyOffWorkList
              :isShowBorder="true"
              v-for="(item, index) of originListData"
              :item="item"
              :key="item.psId"
              :psId="activeItem.psId"
              :index="index"
              :isBatchOperation="isBatchOperation"
              @click.native="handleChangeProxyDetails(item)"
            >
            </ProxyOffWorkList>
          </div>
          <el-checkbox-group
            v-model="checkList"
            class="offwork-list-group"
            id="offworkGroupListId"
            v-show="!isBatchOperation"
            @change="handleCheckedAll"
          >
            <el-checkbox
              class="ml0 check-item"
              :label="item"
              v-for="item of originListData"
              :key="item.psId"
              :disabled="item.isClosed"
            >
              <ProxyOffWorkList
                :item="item"
                :isBatchOperation="isBatchOperation"
              ></ProxyOffWorkList>
            </el-checkbox>
          </el-checkbox-group>
        </div>
        <!-- 底部 -->
        <footer class="offwork-list-footer">
          <div class="footer-top">
            <el-checkbox
              :disabled="isBatchOperation"
              class="check-all"
              v-model="checkAll"
              border
              @change="handleChangeCheckAll"
            >{{$t('Dict.SelectAll')}}
            </el-checkbox>
            <Pager
              class="pager"
              itemTag="div"
              :pagerId="offworkListId"
              arrowDirection="up-down"
              scrollMode="simple"
              ref="offworkList"
            >
            </Pager>
          </div>
          <div class="footer-bottom">
            <button
              :class="{
                'btn-active': !isBatchOperation
              }"
              @click="handleBatchOperation"
            >{{$t('Dict.BatchOperation')}}
            </button>
            <button :disabled="!isBatchOperation || hidePrintButton" class="print-btn" @click="handlePrintFn">
              {{$t('Dict.PrintShiftStatement')}}
            </button>
            <button
            :disabled="(!activeItem) || (!isBatchOperation && !checkList.length) || (isBatchOperation && activeItem && activeItem.isClosed)"
            class="offwork-btn"
            @click="handleOffWork"
            >
              {{$t('Dict.Btn.PosSerial')}}
            </button>
          </div>
        </footer>
      </div>
      <div class="offwork-area">
        <OffWorkComponent
          :posMode="Number(posMode)"
          :data="data"
          :isShowPrevWork="isShowPrevWork"
          v-if="data"
          @handleGetCheckData="handleGetCheckData"
          width="100%"
          ref="offworkcomponent">
        </OffWorkComponent>
      </div>
    </div>
  </SystemContent>
</template>

<script>
import { debounce } from 'lodash';
import dateFormat from '@/common/js/dateformat';
import OffWorkComponent from '@/components/Pos/Business_commons/OffWorkComponent';
import ajax from '@/common/js/ajax';
import Pager from '@/components/Pos/Common/Pager';
import SystemContent from '../../base/SystemContent';
import ProxyOffWorkHead from './ProxyOffWorkHead';
import ProxyOffWorkList from './ProxyOffWorkList';

export default {
  name: 'ProxyOffWork',
  data() {
    return {
      keyWords: '',
      checkList: [],
      checkAll: false,
      listData: [],
      isBatchOperation: true,
      data: null,
      activeItem: null,
      showHistory: null,
      offworkListId: '',
      posMode: 1,
      printDetail: '',
      isShowPrevWork: null,
      hidePrintButton: false,
    };
  },
  components: {
    SystemContent,
    ProxyOffWorkHead,
    ProxyOffWorkList,
    OffWorkComponent,
    Pager,
  },
  mounted() {
    this.handleGetList();
    this.offworkListId = 'offworkListId';
    this.handleChangeInput = debounce(this.handleChangeInput, 300);
  },
  computed: {
    originListData() {
      return this.listData.filter(item => item.operatorName.includes(this.keyWords));
    },
  },
  watch: {
    keyWords() {
      this.handleChangeInput();
    },
  },
  methods: {
    handleCheckedAll(val) {
      const checkedCount = val.length;
      this.checkAll = checkedCount === this.originListData.filter(item => !item.isClosed).length;
    },
    handleChangeInput() {
      if (this.originListData.length) {
        this.handleChangeProxyDetails(this.originListData[0]);
      } else {
        this.data = null;
      }
    },
    handleChangeProxyDetails(item) {
      this.hidePrintButton = !item.isClosed;
      this.activeItem = item;
      ajax('canyin.pos.posserialproxy.getpsdetail', {
        contentType: 'paramsEncoded',
        data: {
          psId: item.psId,
          operatorId: item.operatorId,
          posId: item.posId,
          version: item.version,
        },
      }).then((res) => {
        this.posMode = res.controlMode;
        this.isShowPrevWork = !res.version;
        this.data = res;
        setTimeout(() => {
          if (this.$refs.offworkcomponent) {
            this.$refs.offworkcomponent.init();
          }
        }, 200);
      });
    },
    handleGetList() {
      ajax('canyin.pos.posserialproxy.getpslist', {
        params: {
          showHistory: this.showHistory,
        },
      }).then((res) => {
        if (res) {
          this.listData = res.map((item) => {
            if (item) {
              item.openTime = item.openTime ? dateFormat('%Y-%M-%D %H:%I:%S', Date.parse(item.openTime)) : '';
              item.endTime = item.closeTime ? dateFormat('%Y-%M-%D %H:%I:%S', Date.parse(item.closeTime)) : '';
            }
            return item;
          });
          if (this.listData.length) {
            this.handleChangeProxyDetails(this.originListData[0]);
          }
        }
        setTimeout(() => {
          this.$refs.offworkList.refresh();
        }, 200);
      });
    },
    handleBatchOperation() {
      this.isBatchOperation = !this.isBatchOperation;
      if (this.isBatchOperation) {
        this.offworkListId = 'offworkListId';
      } else {
        this.offworkListId = 'offworkGroupListId';
      }
      this.$refs.offworkList.refresh();
      this.checkList = [];
      this.checkAll = false;
    },
    handleChangeHistoryOffWork(data) {
      this.showHistory = data ? true : null;
      this.handleGetList();
    },
    handleChangeCheckAll(val) {
      if (val) {
        this.checkList = this.originListData.filter(item => !item.isClosed).map(item => item);
      } else {
        this.checkList = [];
      }
    },
    handleRequestFn(data) {
      return new Promise((resolve, reject) => {
        ajax('canyin.pos.posserialproxy.proxydops', {
          contentType: 'paramsEncoded',
          data,
        }).then((res) => {
          resolve(res);
        });
      });
    },
    handleGetCheckData(data) {
      this.printDetail = data;
    },
    // 打印
    async handlePrintFn() {
      if (!this.isBatchOperation) {
        return;
      }
      const params = Object.assign({}, this.activeItem, { printDetail: this.printDetail });
      const res = await ajax('canyin.pos.posserialproxy.proxyprintps', {
        contentType: 'paramsEncoded',
        data: params,
      });
      if (res.errCode === '0') {
        this.$message.error(`${res.msg}`);
      } else {
        this.$message.success(this.$t('Dict.PrintSuccess'));
      }
    },
    // 多个结班
    async handleMoreOffWorkFn() {
      for (let index = 0; index < this.checkList.length; index += 1) {
        await this.handleOneOffWorkFn(this.checkList[index]);
      }
    },
    // 单次结班
    async handleOneOffWorkFn(params) {
      const data = Object.assign({}, params, {
        prePrint: false,
        fromProxyPs: true,
      });
      try {
        const res = await this.handleRequestFn(data);
        if (res.success) {
          this.$message.success(this.$t('Dict.SucceedInClass'));
          this.handleGetList();
        } else if (res.msg) {
          this.$message.error(`${res.msg}`);
        } else {
          this.$message.error(this.$t('Dict.ClassFailure'));
        }
      } catch (error) {
        console.log(error);
      }
    },
    // 结班
    handleOffWork() {
      if (this.checkList.length) {
        this.handleMoreOffWorkFn();
      } else if (this.activeItem) {
        this.handleOneOffWorkFn(this.activeItem);
      }
    },
  },
};
</script>
<style lang="less" scope>
  .ml0{
    margin: 0 !important;
  }
  .system-table-body{
    display: flex;
    .offwork-list-content{
      width: 414px;
      box-shadow: 6px 0px 8px #777;
      height: 100%;
      .offwork-list-search{
        padding: 10px 15px;
        .offwork-search{
          width: 210px;
          .el-input__inner{
            border-radius: 18px;
            background: #fff;
          }
        }
      }
      .offwork-list{
        padding: 0 15px;
        height: calc(100% - 180px);
        .offwork-list-head{
          display: flex;
          align-items: center;
          border-top: 1px solid #d7d7d7;
          border-bottom: 1px solid #d7d7d7;
          padding: 8px 0;
        }
        .offwork-list-group{
          height: calc(100% - 57px);
          overflow-y: auto;
          .check-item{
            height: 57px;
            padding: 12px 0;
          }
        }
        .offwork-list-body{
          .offwork-list-item{
            display: flex;
            align-items: center;
          }
        }
      }
      .offwork-list-footer{
        position: relative;
        padding: 0 15px;
        .footer-top{
          border-top: 1px solid #d7d7d7;
          border-bottom: 1px solid #d7d7d7;
          padding: 9px 0;
          position: relative;
        }
        .footer-bottom {
          padding: 10px 0;
          button{
            display: inline-block;
            line-height: 1;
            white-space: nowrap;
            cursor: pointer;
            background: #fff;
            border: 1px solid #dcdfe6;
            border-color: #dcdfe6;
            color: #606266;
            -webkit-appearance: none;
            text-align: center;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
            outline: none;
            margin: 0;
            font-weight: 500;
            -moz-user-select: none;
            -webkit-user-select: none;
            -ms-user-select: none;
            padding: 12px 20px;
            font-size: 14px;
            border-radius: 4px;
            margin-right: 10px;
            &:disabled{
              color: #777;
              cursor: not-allowed;
            }
          }
          .btn-active {
            background: #0babb9;
            color: #fff;
          }
          .offwork-btn{
            background: #0babb9;
            color: #fff;
            width: 134px;
            &:disabled{
              color: #fff;
              cursor: not-allowed;
            }
          }
        }
        .pager{
          position: absolute;
          top: 9px;
          right: 15px;
        }
        .check-all{
          margin: 3px 0 0 0;
          height: auto;
          padding: 5px 14px 7px 10px;
        }
      }
    }
    .offwork-area{
      flex: 1;
    }
  }
  .sign-in-time {
    font-size: 12px;
    color: #0babb9;
  }
  .sign-out-time {
    font-size: 12px;
    color: #ffa200;
  }
  .lang-enUS{
    .system-table-body {
      .offwork-list-content{
        .offwork-list-footer{
          .footer-bottom {
            button {
              font-size: 12px;
              margin-right: 4px;
            }
            .offwork-btn{
              width: auto;
            }
          }
        }
      }
    }
  }
</style>
<style lang="less">
  .system-table-body {
    .offwork-list-content{
      .offwork-list{
        .el-checkbox{
          display: flex;
          align-items: center;
          border-bottom: 1px solid #d7d7d7;
        }
        .el-checkbox__label{
          width: 100%;
          padding-left: 5px;
        }
      }
    }
  }
</style>
