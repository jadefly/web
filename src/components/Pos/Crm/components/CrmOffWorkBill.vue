<template>
  <div class="crmOffWorkBill-wrap">
    <div class="title">
      <p>
        <!-- 统计起始时间: -->
        {{ $t('Biz.Crm.StartTime') }}
        <i class="distance"></i>
        <el-date-picker
          v-model="startTime"
          type="datetime"
          value-format="yyyy-MM-dd HH:mm:ss"
          :editable="canInput"
          name="crmOffWorkBillDatePicker"
          :placeholder="$t('Biz.Crm.CrmTip09')"></el-date-picker>
      </p>
      <p>
        <!-- 统计截止时间: -->
        {{ $t('Biz.Crm.StopTime') }}
        <i class="distance"></i>
        <el-date-picker
          v-model="endTime"
          type="datetime"
          value-format="yyyy-MM-dd HH:mm:ss"
          :editable="canInput"
          name="crmOffWorkBillDatePicker"
          :placeholder="$t('Biz.Crm.CrmTip09')"
          default-time="12:00:00"></el-date-picker>
      </p>
      <p>
        <button class="btn btn-primary" @click="queryData">{{ $t('Dict.Search') }}</button>
        <button class="btn btn-default" @click="print">{{ $t('Dict.Printing') }}</button>
      </p>
    </div>
    <div class="content" v-if="posId" id="detailListId" >
      <div class="sheet-info">
        <p>
          <span class="sheet-info-specialLine">
            <!-- $t-终端号：-->
            {{ $t('Biz.Crm.TerminalNum') }}<i class="distance"></i><em>{{ posId }}</em>
          </span>
          <span class="sheet-info-specialLine">
            <!-- $t-操作者： -->
            {{ $t('Biz.BizComm.Operator03') }}<i class="distance"></i><em>{{ operator }}</em>
          </span>
        </p>
        <!-- $t-统计起始时间：, 统计截止时间： ,统计范围： -->
        <p>{{ $t('Biz.Crm.StartTime') }}<i class="distance"></i><em>{{ queryStart }}</em></p>
        <p>{{ $t('Biz.Crm.StopTime') }}<i class="distance"></i><em>{{ queryEnd }}</em></p>
        <p>{{ $t('Biz.Crm.RecordRange') }}<i class="distance"></i><em>{{ type }}</em></p>
      </div>
      <div class="sheet-list">
        <div class="sheet-list-block">
          <!-- $t-充值统计, 充值笔数,应收金额,应收金额-->
          <p>{{ $t('Biz.Crm.RechargeInfo01') }}</p>
          <ul v-for="(item, index) in rechargeList" :key="index">
            <li>
              <span class="line-title">{{ item.cardTypeName }}{{ $t('Biz.Crm.RechargeInfo02') }}</span>
              <em class="line-num">{{ item.rechargeCount }}</em>
            </li>
            <li>
              <span class="line-title">{{ item.cardTypeName }}{{ $t('Dict.AmountReceivable') }}</span>
              <em class="line-num">{{ item.originalTotal }}</em>
            </li>
            <li>
              <span class="line-title">{{ item.cardTypeName }}{{ $t('Dict.RealPaidAmount') }}</span>
              <em class="line-num">{{ item.actualTotal }}</em>
            </li>
          </ul>
        </div>
        <div class="sheet-list-block">
          <!-- $t支付方式统计 -->
          <p>{{ $t('Biz.Crm.RechargeInfo05') }}</p>
          <ul v-show="payMethodList">
            <li v-for="(item, index) in payMethodList" :key="index">
              <span class="line-title">{{ item.paywayName }}</span>
              <em class="line-num">{{ item.paywayTotal }}</em>
            </li>
          </ul>
        </div>
        <div class="sheet-list-block">
          <!-- $t-结班交付,退卡金额,退卡总金额:,上交金额:  -->
          <p>{{ $t('Biz.Crm.RechargeInfo06') }}</p>
          <ul>
            <li v-for="(item, index) in turnOverList.cancelCardDetail" :key="index">
              <span class="line-title">{{ item.cardTypeName }}{{ $t('Biz.Crm.RechargeInfo07') }}</span>
              <em class="line-num">{{ item.refundMoney }}</em>
            </li>
            <li>
              <span class="line-title">{{ $t('Biz.Crm.RechargeInfo08') }}</span>
              <em class="line-num">{{ turnOverList.cancelCardTotal }}</em>
            </li>
            <li>
              <span class="line-title">{{ $t('Biz.Crm.RechargeInfo09') }}</span>
              <em class="line-num">{{ turnOverList.giveTotal }}</em>
            </li>
          </ul>
        </div>
        <div class="sheet-list-block">
          <!-- $t-撤销统计,撤销次数,撤销金额 -->
          <p>{{ $t('Biz.Crm.RechargeInfo010') }}</p>
          <ul v-for="(item, index) in cancelList" :key="index">
            <li>
              <span class="line-title">{{ item.cardTypeName }}{{ $t('Biz.Crm.RechargeInfo11') }}</span>
              <em class="line-num">{{ item.cancelCount }}</em>
            </li>
            <li>
              <span class="line-title">{{ item.cardTypeName }}{{ $t('Biz.Crm.RechargeInfo12') }}</span>
              <em class="line-num">{{ item.cancelMoneyTotal }}</em>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="pager-box" v-if="posId">
      <Pager :pagerId="detailListId" itemTag="> div"
        scrollMode="simple" arrowDirection="up-down" ref="pager"></Pager>
    </div>
    <div class="noDataTip" v-show="!posId">
      <!-- 无会员结班单信息 -->
      {{ $t('Biz.Crm.CrmTip10') }}
    </div>
  </div>
</template>

<script>
import ajax from '@/common/js/ajax';
import Pager from '@/components/Pos/Common/Pager';
import $ from 'jquery';

export default {
  model: {
    prop: 'cardInfo',
    event: 'change',
  },
  components: { Pager },
  data() {
    return {
      startTime: '',
      endTime: '',
      canInput: false,
      posId: '',
      operator: '',
      queryStart: '',
      queryEnd: '',
      type: '',
      rechargeList: '',
      payMethodList: '',
      turnOverList: '',
      cancelList: '',
      detailListId: 'detailListId',
    };
  },
  mounted() {
    // 组件被v-if, 每次切换显示,均执行渲染: 初始化日期时间值
    this.startTime = this.dateFormatString(new Date(), false);
    this.endTime = this.dateFormatString(new Date(), true);
    // 执行数据查找(0点到现在)
    setTimeout(() => {
      this.queryData();
    }, 100);
  },
  methods: {
    setCurrentHotkey() {
      this.$hotKey.set('Pos.Crm', {
        // 'Enter': index => {
        //   this.query()
        // },
        // 'PgUp': index => {
        //   this.reset()
        // },
        // 'PgDn': index => {
        //   this.submit()
        // },
      });
    },
    // 时间格式(时间戳)转换为字符串'2000-01-01 00:00:00'(补0)
    dateFormatString(dateStr, timeBol) {
      let time;
      let HH;
      let mm;
      let ss;
      // 变量'日期'赋值
      const date = new Date(dateStr);
      // 变量'年'赋值
      const y = date.getFullYear();
      // 变量'月'赋值并补'0'
      const m = date.getMonth() + 1 < 10
        ? `0${date.getMonth() + 1}`
        : date.getMonth() + 1;
      // 变量日赋值并补'0'
      const d = date.getDate() < 10
        ? `0${date.getDate()}`
        : date.getDate();

      if (!timeBol) {
        time = '00:00:00';
      } else {
        HH = date.getHours() < 10
          ? `0${date.getHours()}`
          : date.getHours();
        mm = date.getMinutes() < 10
          ? `0${date.getMinutes()}`
          : date.getMinutes();
        ss = date.getSeconds() < 10
          ? `0${date.getSeconds()}`
          : date.getSeconds();
        time = `${HH}:${mm}:${ss}`;
      }
      return `${y}-${m}-${d} ${time}`;
    },
    // 查询表单数据
    queryData() {
      if (!this.startTime || !this.endTime) {
        // this.$message.error('查询时间有误，请选择时间后重试');
        this.$message.error(this.$t('Biz.Crm.CrmTip11'));
        return;
      }
      ajax('canyin.pos.crm.crmsalescounter.crm6offworklist', {
        contentType: 'paramsEncoded',
        data: {
          begin: this.startTime,
          end: this.endTime,
        },
      }).then((data) => {
        // 数据赋值
        this.posId = data.posId;
        this.operator = data.empName;
        this.queryStart = data.beginDate;
        this.queryEnd = data.endDate;
        this.type = data.scope;
        this.rechargeList = data.rechargeMap;
        this.payMethodList = data.payWay;
        this.turnOverList = data.cancelCardMap;
        this.cancelList = data.cancelMoneyMap;
        // 动态计算 分页部分容器高度
        $('.crmOffWorkBill-wrap').height(`${$('#crm').height() - 106}px`);
        // 延后执行分页刷新
        setTimeout(() => {
          this.$refs.pager.refresh();
        }, 100);
      });
    },
    // 打印
    print() {
      if (!this.startTime || !this.endTime) {
        // this.$message.error('查询时间有误，请选择时间后重试');
        this.$message.error(this.$t('Biz.Crm.CrmTip11'));
        return;
      }
      ajax('canyin.pos.print.getcrmjiebandan', {
        contentType: 'paramsEncoded',
        data: {
          startTime: this.startTime,
          endTime: this.endTime,
        },
      }).then((data) => {
        console.log(data);
      });
    },

  },
};
</script>

<style lang="less" scoped>
.crmOffWorkBill-wrap {
  height: 100%;
  position: relative;
  padding: 40px 0 0 0;
}
.title {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  margin: auto;
  > p {
    display: inline-block;
    margin-right: 30px;
    &:last-child {
      margin-right: 0;
    }
  }
}
.noDataTip {
  text-align: center;
  padding: 30px;
  color: #999;
  font-size: 18px;
}
.content {
  width: 73.6%;
  height: 100%;
  margin: 10px auto 0;
  border: 1px solid #ddd;
  overflow-y: auto;

  .sheet-info {
    text-align: left;
    padding: 10px 30px;
    background-color: #ddd;

    .sheet-info-specialLine {
     width: 48%;
     display: inline-block;
    }
    em {
      font-style: normal;
    }
  }
}
.sheet-list {
  .sheet-list-block {
    > p {
      padding: 6px 10px;
      text-align: left;
      background-color: #039eac;
    }
    > ul {
      padding: 2px 20px 2px 50px;

      .line-title {
        display: inline-block;
        width: 76%;
        text-align: left;
      }
      .line-num {
        display: inline-block;
        width: 23%;
        text-align: left;
        font-style: normal;
      }
    }
  }
}
.pager-box {
  position: absolute;
  bottom: -9px;
  right: 0;
}
.distance {
  display: inline-block;
  width: 6px;
}
</style>
