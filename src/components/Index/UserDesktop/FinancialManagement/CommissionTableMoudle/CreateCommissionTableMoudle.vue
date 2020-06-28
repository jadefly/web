<template>
  <div class="create-commission-wrapper">
    <SystemContent>
      <div class="system-content-head create-head" slot="head">
        <h3>{{ title }}</h3>
        <div class="head-btn">
            <button class="btn close-btn" @click="close">{{$t('Dict.Close')}}<span>(Esc)</span></button>
            <button class="btn btn-primary submit-btn" @click="submit" v-if="isCreate">{{$t('Dict.Sure')}}<span>(PgDn)</span>
            </button>
            <button class="btn btn-primary submit-btn" @click="reloadData" v-else>{{$t('Dict.Btn.Refresh')}}<span>(Q)</span>
            </button>
        </div>
      </div>
      <div class="condition-wrapper">
          <h6>{{$t('Biz.UserDesktop.UserDesktopMsg034')}}</h6>
        <div class="tip">
            <p><span>{{$t('Dict.ExplainLabel')}}</span>{{$t('Biz.UserDesktop.UserDesktopMsg035')}}</p>
            <p>{{$t('Biz.UserDesktop.UserDesktopMsg036')}}</p>
        </div>
        <el-form
          ref="commissionForm"
          :model="commissionForm"
          :rules="commissionRules"
          :inline="true"
          label-width="88px"
          class="commission-form">
            <el-form-item :label="$t('Biz.UserDesktop.RoyaltyScheme')" prop="planId">
                <el-select v-model="commissionForm.planId" :placeholder="$t('Dict.PleaseChoose')" @change="changePlan"
                           :disabled="!isCreate">
              <el-option
                v-for="item in planList"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
            <el-form-item :label="$t('Dict.Name')" prop="name">
            <el-input v-model="commissionForm.name" class="plan-name" :disabled="!isCreate"></el-input>
          </el-form-item>
          <div>
              <el-form-item :label="$t('Dict.StatementDate')" required>
              <el-form-item prop="beginDateStr">
                <el-date-picker
                        v-judge
                        class="begin-date"
                        v-model="commissionForm.beginDateStr"
                        type="date"
                        :placeholder="$t('Biz.UserDesktop.UserDesktopMsg037')"
                        format="yyyy-MM-dd"
                        value-format="yyyy-MM-dd"
                        :disabled="!isCreate"
                ></el-date-picker>
              </el-form-item>
              <el-form-item prop="beginTimeStr">
                <el-time-select
                        v-judge
                        class="begin-time"
                        v-model="commissionForm.beginTimeStr"
                        :picker-options="{
                    start: '00:00',
                    step: '00:15',
                    end: '23:45'
                  }"
                        :placeholder="$t('Biz.UserDesktop.UserDesktopMsg037')"
                        format="HH:mm"
                        value-format="HH:mm"
                        :disabled="!isCreate"
                ></el-time-select>
              </el-form-item>
                  <span class="begin-end-span">{{$t('Dict.To')}}</span>
              <el-form-item prop="endDateStr">
                <el-date-picker
                        v-judge
                        class="end-date"
                        v-model="commissionForm.endDateStr"
                        type="date"
                        :placeholder="$t('Biz.UserDesktop.UserDesktopMsg038')"
                        format="yyyy-MM-dd"
                        value-format="yyyy-MM-dd"
                        :disabled="!isCreate"
                ></el-date-picker>
              </el-form-item>
              <el-form-item prop="endTimeStr">
                <el-time-select
                        v-judge
                        class="end-time"
                        v-model="commissionForm.endTimeStr"
                        :picker-options="{
                    start: '00:00',
                    step: '00:15',
                    end: '23:45'
                  }"
                        :laceholder="$t('Biz.UserDesktop.UserDesktopMsg038')"
                        format="HH:mm"
                        value-format="HH:mm"
                        :disabled="!isCreate"
                ></el-time-select>
              </el-form-item>
            </el-form-item>
          </div>
        </el-form>
          <button v-if="isCreate" class="btn generate-btn" @click="generateTable">
              {{$t('Biz.UserDesktop.UserDesktopMsg039')}}
          </button>
      </div>
      <div class="data-wrapper">
          <h6>{{$t('Biz.UserDesktop.UserDesktopMsg040')}}</h6>
        <div class="system-table-body" ref="systemTableBody">
          <el-table
            :data="commissionTableData"
            highlight-current-row
            style="width: 100%">
              <el-table-column v-for="item of tableColumns()"
                :key="item.prop"
                :label="item.label"
                :width="item.width"
                :min-width="item.minwidth"
                :prop="item.prop"
                align="center"
                class-name="no-wrap"
              >
                <template slot-scope="scope">
                  <div v-if="item.prop === 'plEmpType'">
                    {{ switchPlEmpType(scope.row[item.prop]) }}
                  </div>
                  <div v-else-if="item.prop === 'allowanceType'">
                    {{ switchAllowanceType(scope.row[item.prop]) }}
                  </div>
                  <div v-else-if="item.prop === 'origSubtotal' || item.prop === 'incomeTotal' || item.prop === 'pushMoney'">
                    {{ scope.row[item.prop] === null ? '-' : `${scope.row[item.prop]}` }}
                  </div>
                  <div v-else>
                    {{ scope.row[item.prop] === null ? '-' : scope.row[item.prop] }}
                  </div>
                </template>
              </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="footer">
        <ul>
            <li class="name">{{$t('Dict.LastModifiedBy')}}{{ footData.modifierName }}</li>
            <li class="time">{{$t('Dict.LastModified')}}{{ formatDate(footData.modifyTime) }}</li>
            <li class="name">{{$t('Dict.FounderLabel')}}{{ footData.creatorName }}</li>
            <li class="time">{{$t('Dict.CreationTimeLabel')}}{{ formatDate(footData.createTime) }}</li>
        </ul>
      </div>
    </SystemContent>
  </div>
</template>

<script>
import SystemContent from '@/components/Index/UserDesktop/base/SystemContent';
import ajax from '@/common/js/ajax';
import dateFormat from '@/common/js/dateformat';
import tableColumns from './createCommissionDataColumns';

export default {
  components: {
    SystemContent,
  },
  data() {
    return {
      preRouteName: null,
      isCreate: true,
      queryId: null,
      commissionForm: {
        id: null,
        tableId: null,
        planId: null,
        name: null,
        beginDateStr: null,
        beginTimeStr: null,
        endDateStr: null,
        endTimeStr: null,
        modifyTime: null,
      },
      commissionRules: {
        planId: [
          { required: true, message: this.$t('Biz.UserDesktop.UserDesktopMsg041'), trigger: 'blur' },
        ],
        name: [
          { required: true, message: this.$t('Biz.UserDesktop.UserDesktopMsg042'), trigger: 'blur' },
        ],
        beginDateStr: [
          { required: true, message: this.$t('Dict.Validate.DataModuleMsg1'), trigger: 'blur' },
        ],
        beginTimeStr: [
          { required: true, message: this.$t('Dict.Validate.DataModuleMsg2'), trigger: 'blur' },
        ],
        endDateStr: [
          { required: true, message: this.$t('Dict.Validate.DataModuleMsg3'), trigger: 'blur' },
        ],
        endTimeStr: [
          { required: true, message: this.$t('Dict.Validate.DataModuleMsg4'), trigger: 'blur' },
        ],
      },
      planList: [{
        id: null,
        name: null,
      }],
      commissionTableData: [
        // {
        //   empName: null,
        //   plEmpType: null,
        //   itemName: null,
        //   sizeName: null,
        //   allowanceType: null,
        //   lastQty: null,
        //   origSubtotal: null,
        //   incomeTotal: null,
        //   condition: null,
        //   standard: null,
        //   pushMoney: null,
        // }
      ],
      tableColumns,
      footData: {
        modifierName: null,
        modifyTime: null,
        creatorName: null,
        createTime: null,
      },
    };
  },
  computed: {
    title() {
      const method = this.isCreate ? this.$t('Dict.NewlyBuild') : this.$t('Dict.See');
      return `${method}${this.$t('Biz.UserDesktop.Royaltylist')}`;
    },
  },
  beforeRouteEnter(to, from, next) {
    const { isCreate, id } = to.query;
    next((vm) => {
      // 记录路由
      vm.preRouteName = from.name;
      vm.isCreate = isCreate;
      vm.setHotkey();
      vm.getPlanList();
      if (isCreate) {
        vm.loadNewData();
      } else {
        vm.queryId = id;
        vm.reloadData();
      }
    });
  },
  methods: {
    setHotkey() {
      this.$hotKey.set('UserDesktop.CreateCommissionTableMoudle', {
        PgDn: () => {
          if (this.isCreate) {
            this.submit();
          }
        },
        Esc: () => {
          this.close();
        },
        Q: () => {
          if (!this.isCreate) {
            this.reloadData();
          }
        },
      });
    },
    getPlanList() {
      ajax('canyin.desktop.financialManagement.pushmoneytable.pushmoneyplanlist')
        .then((data) => {
          this.planList = data;
        });
    },
    loadNewData() {
      ajax('canyin.desktop.financialManagement.pushmoneytable.loadnew')
        .then((data) => {
          Object.keys(this.commissionForm).forEach((key) => {
            if (key === 'tableId') {
              this.commissionForm.tableId = data.id;
            } else {
              this.commissionForm[key] = data[key];
            }
          });
          Object.keys(this.footData).forEach((key) => {
            this.footData[key] = data[key];
          });
        });
    },
    reloadData() {
      ajax('canyin.desktop.financialManagement.pushmoneytable.load', {
        contentType: 'URLEncoded',
        data: { id: this.queryId },
      }).then((data) => {
        Object.keys(this.commissionForm).forEach((key) => {
          if (key === 'tableId') {
            this.commissionForm.tableId = data.id;
          } else {
            this.commissionForm[key] = data[key];
          }
        });
        Object.keys(this.footData).forEach((key) => {
          this.footData[key] = data[key];
        });
        this.generateTable();
      });
    },
    changePlan(id) {
      const planName = this.planList.find(item => item.id === id).name;
      const { beginDateStr } = this.commissionForm;
      this.commissionForm.name = `${planName}_${beginDateStr}`;
    },
    generateTable({ isSubmitCheck, callback } = {}) {
      this.$refs.commissionForm.validate((valid) => {
        if (valid) {
          ajax('canyin.desktop.financialManagement.pushmoneytable.generatedetail', {
            contentType: 'URLEncoded',
            data: Object.assign({}, this.commissionForm, {
              read: !this.isCreate,
            }),
          }).then((data) => {
            this.commissionTableData = data.map((item, index) => ({
              ...item,
              index: index + 1,
            }));
            if (isSubmitCheck) {
              if (this.commissionTableData.length === 0) {
                this.$confirm(this.$t('Biz.UserDesktop.UserDesktopMsg047'), this.$t('Dict.Tips'), {
                  confirmButtonText: this.$t('Dict.Sure'),
                  cancelButtonText: this.$t('Dict.Cancel'),
                  type: 'warning',
                }).then(() => {
                  callback();
                });
              } else {
                callback();
              }
            }
          });
        }
      });
    },
    goPrePage() {
      this.$router.push({ name: this.preRouteName });
    },
    switchPlEmpType(type) {
      switch (type) {
        case 1:
          return this.$t('Dict.Waiter');
          break;
        case 2:
          return this.$t('Dict.Salesman');
          break;
        case 3:
          return this.$t('Dict.OrderClerk');
          break;
        default:
          return '';
          break;
      }
    },
    switchAllowanceType(type) {
      switch (type) {
        case 1:
          return this.$t('Biz.UserDesktop.UserDesktopMsg048');
          break;
        case 2:
          return this.$t('Biz.UserDesktop.UserDesktopMsg049');
          break;
        case 3:
          return this.$t('Biz.UserDesktop.UserDesktopMsg050');
          break;
        default:
          return '';
          break;
      }
    },
    submit() {
      this.generateTable({
        isSubmitCheck: true,
        callback: () => {
          ajax('canyin.desktop.financialManagement.pushmoneytable.insert', {
            contentType: 'URLEncoded',
            data: this.commissionForm,
          }).then(() => {
            this.$message.success(this.$t('Biz.UserDesktop.UserDesktopMsg051'));
            this.$router.push({ name: 'commissionTableMoudle' });
          });
        },
      });
    },
    close() {
      this.goPrePage();
    },
    formatDate(time) {
      if (time) {
        return dateFormat('%Y-%M-%D %H:%I:%S', Date.parse(time));
      }
      return '';
    },
  },
};
</script>

<style lang="less" scoped>
  .create-commission-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    .create-head {
      .head-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        .btn span {
          font-size: 12px;
        }
        .close-btn {
          background-color: white;
          border: 1px solid #ccc;
        }
      }
    }
    .condition-wrapper {
      padding-bottom: 16px;
      border-bottom: 1px solid #d9d9d9;
      .tip {
        padding-top: 24px;
        padding-bottom: 12px;
        font-size: 12px;
        color: #666;
        > p:last-child {
          padding-left: 3em;
        }
      }
      .commission-form {
        .begin-end-span {
          margin-right: 10px;
        }
        .el-form-item {
          margin-bottom: 14px;
        }
        .plan-name {
          width: 200px;
        }
        .begin-date, .end-date {
          width: 160px;
        }
        .begin-time, .end-time {
          width: 146px;
        }
      }
      .generate-btn {
        color: #039eac;
        border-color: #039eac;
        background-color: white;
        margin-left: 88px;
        margin-top: -10px;
      }
    }
    .data-wrapper {
      > h6 {
        padding-top: 15px;
        padding-bottom: 8px;
      }
    }
    .footer {
      position: relative;
      > ul {
        height: 36px;
        color: #666;
        overflow: hidden;
        > li {
          float: left;
          line-height: 36px;
          padding-right: 12px;
          overflow: hidden;
          &.name {
            max-width: 28%;
          }
          &.time {
            max-width: 32%;
          }
        }
      }
    }
  }
</style>

<style lang="less">
  .create-commission-wrapper {
    .system-table-body {
      .el-table__body-wrapper {
        /*height: 200px;*/
        overflow: scroll;
      }
    }
  }
  .lang-enUS{
    .create-commission-wrapper {
      .system-table-body {
        .el-table__header, .el-table__body, .el-table__footer {
          font-size: 12px;
        }
      }
    }
  }
</style>
