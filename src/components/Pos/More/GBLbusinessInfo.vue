<template>
  <Dialog
    name="PosDialog.posIpLoginInfo"
    :title="$t('Biz.Pos.MoreModuleButton1')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :closeByClickModel="false"
    width="500px"
    height="600px"
    top="10vh"
  >
    <div class="body">
      <div class="items">
        <div class="title">{{$t('Biz.Pos.More.GBLBInfoDiv1')}}</div>
        <div class="table">
          <table>
            <thead>
              <tr>
                <th>{{$t('Dict.Turnover')}}</th>
                <th>{{$t('Dict.NumOfUnits')}}</th>
                <th>{{$t('Dict.PassengerFlow')}}</th>
                <th>{{$t('Dict.OpeningRate')}}</th>
                <th>{{$t('Dict.PlacingRate')}}</th>
              </tr>
            </thead>
            <tbody v-if="resData && resData.todayBusinessSituations.length > 0">
              <tr>
                <td>{{ formatValue(resData.todayBusinessSituations[0], 'yye') }}</td>
                <td>{{ formatValue(resData.todayBusinessSituations[0], 'count') }}</td>
                <td>{{ formatValue(resData.todayBusinessSituations[0], 'peopleQty') }}</td>
                <td>{{ formatValue(resData.todayBusinessSituations[0], 'openRate') }}%</td>
                <td>{{ formatValue(resData.todayBusinessSituations[0], 'peopleRate') }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="items">
        <div class="title">{{$t('Biz.Pos.More.GBLBInfoDiv2')}}</div>
        <div class="table">
          <table>
            <thead>
            <tr>
              <th>{{$t('Dict.Turnover')}}</th>
              <th>{{$t('Dict.NumOfUnits')}}</th>
              <th>{{$t('Dict.PassengerFlow')}}</th>
              <th>{{$t('Dict.OpeningRate')}}</th>
              <th>{{$t('Dict.PlacingRate')}}</th>
            </tr>
            </thead>
            <tbody v-if="resData && resData.lastWeekBusinessSituations.length > 0">
            <tr>
              <td>{{ formatValue(resData.lastWeekBusinessSituations[0], 'yye') }}</td>
              <td>{{ formatValue(resData.lastWeekBusinessSituations[0], 'count') }}</td>
              <td>{{ formatValue(resData.lastWeekBusinessSituations[0], 'peopleQty') }}</td>
              <td>{{ formatValue(resData.lastWeekBusinessSituations[0], 'openRate') }}%</td>
              <td>{{ formatValue(resData.lastWeekBusinessSituations[0], 'peopleRate') }}%</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="items">
        <div class="title">{{$t('Dict.ConsumptionArea')}}</div>
        <div class="table-body">
          <ul class="ul-title">
            <li>
              <span>{{$t('Dict.ConsumptionArea')}}</span>
              <span>{{$t('Dict.NumOfBills')}}</span>
              <span>{{$t('Dict.EatPersonNum')}}</span>
              <span>{{$t('Biz.Booking.ConsumeMoney')}}</span>
            </li>
          </ul>
          <ul id="ipList" v-if="resData && resData.knotAreaSituations">
            <li v-for="(item, index) in resData.knotAreaSituations" :key="index">
              <span>{{ item.areaName }}</span>
              <span>{{ item.count }}</span>
              <span>{{ item.peopleQty }}</span>
              <span>{{ item.yye }}</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="pos-pager">
        <Pager
          pagerId="ipList"
          :showInfo = "true"
          arrowDirection="up-down"
          v-if="resData && resData.knotAreaSituations.length > 0"
          ref="pager">
        </Pager>
      </div>
    </div>
  </Dialog>
</template>
<script>
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';

export default {
  name: 'posIpLoginInfo',
  components: { Dialog, Pager },
  mixins: [DialogMixin],
  data() {
    return {
      demo: [
        {
          a: '这是一个特别特别特别特特别特长的一楼',
          b: '1',
          c: '4',
          d: '0',
        },
        {
          a: '二楼',
          b: '1',
          c: '2',
          d: '0',
        },
        {
          a: '三楼',
          b: '2',
          c: '8',
          d: '566',
        },
        {
          a: '四楼',
          b: '1',
          c: '4',
          d: '0',
        },
        {
          a: '五楼',
          b: '1',
          c: '2',
          d: '0',
        },
        {
          a: '六楼',
          b: '2',
          c: '8',
          d: '566',
        },
      ],
      resData: null,
    };
  },
  methods: {
    formatValue(obj, key) {
      if (!obj) return 0;
      return obj[key];
    },
    onOpen() {
      this.requestData();
    },
    onClose() {
      this.resData = null;
    },
    requestData() {
      ajax('canyin.pos.businesssituation.businesssituation').then((data) => {
        const {
          areas, knotAreaSituations,
        } = data;
        if (areas && areas.length > 0) {
          areas.map((item1) => {
            knotAreaSituations.map((item2) => {
              if (item1.id === item2.areaId) {
                item2.areaName = item1.name;
              }
              return item2;
            });
            return item1;
          });
        }
        this.resData = data;
      });
    },
  },
};
</script>
<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.body {
  width: 100%;
  height: 100%;
  background-color: #fff;
  overflow: hidden;
  .items {
    font-size: 14px;
    .title {
      padding: 5px;
      color: #ffffff;
      background-color: #0babb9;
    }
    .table {
      margin: 0;
      padding: 10px 5px;
      width: 100%;
      table {
        width: 100%;
        td,th {
          padding: 5px 0;
          color: #666666;
          text-align: center;
        }
        thead {
          tr {
            border-bottom: 1px solid #eeeeee;
          }
        }
      }
    }
    .table-body {
      .ul-title {
        padding: 0 5px;
        height: auto;
        li {
          text-align: left;
          border-bottom: 1px solid #eeeeee;
          > span {
            &:first-child{
              padding-left: 28px;
            }
          }
        }
      }
      ul {
        width: 100%;
        height: 180px;
        overflow: scroll;
        li {
          display: flex;
          width: 100%;
          overflow: hidden;
          > span {
            flex: 1;
            padding: 8px 0;
            text-align: center;
            &:first-child{
              flex: 1.8;
              padding-left: 32px;
              text-align: left;
              overflow:hidden;
              text-overflow:ellipsis;
              white-space:nowrap;
            }
          }
        }
      }
    }
  }
  > .pos-pager {
    width: 100%;
    border-top: 1px solid #eeeeee;
    padding: 1rem;
    overflow: hidden;
    position: absolute;
    bottom: 0;
    background-color: #fff;
    > .pos-pager {
      float: right;
      margin-right: 2rem;
    }
  }
}
</style>
