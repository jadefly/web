<template>
  <Dialog
    name="PosDialog.SummaryOfBookedItems"
    :title="$t('Biz.Booking.PrintPreview')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :append-to-body="true"
    :showSubmit="false"
    width="330px"
    height="480px"
    :hotkeys="hotkeys">
    <template slot="other-button">
      <button
        type="button"
        id="SumOfBookedItemsDOMId"
        class="btn btn-primary top-button topButton"
        @click="print"
        v-autotest>{{ $t('Dict.Printing') }}(PgDn)</button>
    </template>
    <div class="warp">
      <div class="sheet-box" :id="listId">
        <div class="shopName">{{ shopName }}</div>
        <!-- 预订品项汇总单 -->
        <div class="sheetName">{{ $t('Biz.Booking.SummaryBookedItem') }}</div>
        <!-- $t-日期 -->
        <div class="date">{{ $t('Biz.Booking.Date01') }}{{ dateFormatString(date) }}</div>
        <!-- $t-市别 -->
        <div class="date">{{ $t('Biz.Booking.Shift01') }}{{ shiftName }}</div>
        <div class="content">
          <p class="title list-row">
            <!-- $t-品项 -->
            <span class="list-row-item">{{ $t('Dict.Item') }}</span>
            <!-- $t-数量 -->
            <span class="list-row-item">{{ $t('Dict.Amount') }}</span>
            <!-- $t-单位 -->
            <span class="list-row-item">{{ $t('Dict.UnitName') }}</span>
          </p>
          <div
            class="list-block"
            v-for="(item, index) in list"
            :key="index"
            v-show="list.length !== 0">
            <p class="list-row">
              <span class="list-row-item txt-bold">[{{ item.smallClassName }}]</span>
              <!-- 后台添加了小类合计的数据, 不在执行前台计算 -->
              <!-- <span class="list-row-item">{{ clacQty(index) }}</span> -->
              <span class="list-row-item">{{ item.count }}</span>
            </p>
            <p class="list-row"
              v-for="(el, i) in item.value"
              :key="i">
              <span class="list-row-item">{{ el.itemname }}</span>
              <span class="list-row-item">{{ el.qty }}</span>
              <span class="list-row-item">{{ el.name }}</span>
            </p>
          </div>
        </div>
      </div>
      <div class="pager-box" >
        <Pager :pagerId="listId" itemTag="> div"
          scrollMode="simple" arrowDirection="up-down" ref="pager"></Pager>
      </div>
    </div>
  </Dialog>
</template>

<script>

import { isEmpty } from 'lodash';
import ajax from '@/common/js/ajax';
import Pager from '@/components/Pos/Common/Pager';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

export default {
  components: {
    Dialog,
    Pager,
  },
  mixins: [
    DialogMixin,
  ],
  data() {
    return {
      date: '',
      shiftName: '',
      shopName: null,
      list: [],
      listId: 'listId',
    };
  },
  computed: {
    // 添加快捷键
    hotkeys() {
      return {
        PgDn: () => {
          this.print();
        },
      };
    },
  },
  methods: {
    onOpen() {
      // console.log(this.resData);
      // 传入的基础数据 this.resData
      this.date = this.resData.bookTimeStr;
      this.shiftName = this.resData.orderShiftList[this.resData.orderShiftActive].name;
      // 查询 汇总品项数据
      ajax('canyin.pos.booking.previewprintordercollect', {
        params: {
          startDate: this.date,
          shiftId: this.resData.orderShiftList[this.resData.orderShiftActive].id,
        },
      }).then((res) => {
        if (!isEmpty(res.data.ds1)) {
          this.shopName = res.data.ds1.shopName;
          this.list = res.data.ds2;
          // 延迟执行 分页刷新
          setTimeout(() => {
            this.$refs.pager.refresh();
          }, 60);
        }
      });
    },
    // 时间格式(时间戳)转换为字符串'2000-01-01'(补0)
    dateFormatString(date) {
      // 变量'日期'赋值
      const now = new Date(date);
      // 变量'年'赋值
      const y = now.getFullYear();
      // 变量'月'赋值并补'0'
      const m = now.getMonth() + 1 < 10
        ? `0${now.getMonth() + 1}`
        : now.getMonth() + 1;
      // 变量日赋值并补'0'
      const d = now.getDate() < 10
        ? `0${now.getDate()}`
        : now.getDate();
      return `${y}-${m}-${d}`;
    },

    // 计算小类: 后台添加了小类合计的数据, 不在执行前台计算
    // clacQty(index) {
    //   return this.list[index].value.reduce((x, y) => x + y.qty, 0);
    // },

    // 点击 执行打印
    print() {
      ajax('canyin.pos.booking.printordercollect', {
        params: {
          startDate: this.date,
          shiftId: this.resData.orderShiftList[this.resData.orderShiftActive].id,
        },
      }).then((res) => {
        if (!isEmpty(res.data)) {
          // this.$message.success('打印成功');
          this.$message.success(this.$t('Dict.PrintSuccess'));
          setTimeout(() => {
            this.close();
          }, 300);
        }
      });
    },
  },
};

</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
//主要信息的字体颜色
@main-font-color: #0babb9;

.container {
  min-width: auto;
}

.warp {
  width: 100%;
  height: 100%;
  padding: 14px 16px 54px;
  background-color: #fff;

  .sheet-box {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    border-bottom: 1px solid #ddd;
  }

  .shopName {
    text-align: center;
    font-size: 20px;
    font-weight: bold;
  }

  .sheetName {
    margin: 12px 0;
    text-align: center;
    font-size: 17px;
  }

  .date {
    font-size: 14px;
  }
}
.content{
  width: 100%;
  margin: 0 0 10px;


  .title {
    border: 1px dashed #000;
    border-left: none;
    border-right: none;
    margin: 8px 0;
    padding: 4px 0;
  }

  .txt-bold {
    font-weight: bold;
  }

  .list-block {
    margin-bottom: 10px;
  }

  .list-row {
    width: 100%;
    font-size: 0;
    .list-row-item {
      display: inline-block;
      white-space: nowrap;
      overflow: hidden;
      font-size: 14px;

      &:nth-child(1) {
        width: 59%;
      }

      &:nth-child(2),
      &:nth-child(3) {
        width: 20%;
        text-align: center;
      }
    }
  }

}

.pager-box {
  position: absolute;
  bottom: 10px;
  right: 18px;
}

</style>
