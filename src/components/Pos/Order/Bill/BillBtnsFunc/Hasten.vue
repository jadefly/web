<template>
  <!-- $t-催单 -->
  <Dialog
    name="PosDialog.Hasten"
    :title="$t('Dict.Btn.Hasten')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :showSubmit="true"
    @submit="submitHastent"
    :width="dialogWidth"
    :hotkeys="hotKeySet"
  >
  <div class="reminder">
    <div class="reminder-info">
      <strong>
        <span class="table-number title-list"><i></i>{{hastentitle.pointCode}}</span>
      </strong>
      <!-- $t-开单时间：, 就餐人数： -->
      <span class="openbill-time">{{$t('Dict.OpeningTime')}}{{hastentitle.openTime}}</span>
      <span class="number-guest">{{$t('Biz.Order.DinerPersonNumLabel')}}{{hastentitle.peopleQty}}</span>
    </div>
    <div class="reminder-content">
      <div class="reminder-content-title">
        <!-- $t-序号,品项,数量,加单时长,已催单次数,最后催单时长 -->
        <span class="head-item-checkedbox"></span>
        <span class="head-item-order">{{ $t('Dict.SerialNumber') }}</span>
        <span class="head-item-name">{{ $t('Dict.Item') }}</span>
        <span class="head-item-number">{{ $t('Dict.Amount') }}</span>
        <span class="head-item-addbill-time">{{ $t('Biz.Order.HastenTime') }}</span>
        <span class="head-item-hasten-time">{{ $t('Biz.Order.HastenNum') }}</span>
        <span class="head-item-lasthasten-time">{{ $t('Biz.Order.LastHastenTime') }}</span>
      </div>
      <ul class="list-content" id="hastenListId">
        <li
          class="reminder-content-body"
          @click="selectRecord(item)"
          v-for="(item , index) in hastenItems"
          :key="index">
          <span class="item-checkedbox">
            <i class="icon icon-duihao isChecked" v-show="item.isChecked == true"></i>
            <i class="isNoChecked" v-show="item.isChecked == false"></i>
          </span>
          <span class="item-order">{{ index + 1 }}</span>
          <span class="item-name">
            {{ item.mergeScId ? '['+$t('Dict.Mixing')+']' : '' }}
            <span v-show="item.itemSizeName">({{ item.itemSizeName }})</span>
            {{ item.name }}
          </span>
          <span class="item-number">{{ item.num }}</span>
          <span class="item-addbill-time">{{ item.addbilltime }}</span>
          <span class="item-hasten-time">{{ item.hastentime }}</span>
          <span class="item-lasthasten-time">{{ item.lasthastentime }}</span>
          <p v-if="item.methodText" class="methodText">{{$t('Dict.Notes01')}}{{ item.methodText }}</p>
        </li>
      </ul>
      <div class="reminder-footer">
        <div class="select-all">
          <el-checkbox
            v-model="selectAll"
            @change="handleCheckAllChange"
            v-autotest>{{ $t('Dict.SelectAll') }}</el-checkbox>
        </div>
        <div class="pagerbtn">
          <Pager
            pagerId="hastenListId"
            scrollMode='simple'
            itemTag="li"
            :showInfo = "true"
            arrowDirection="up-down"
            ref="hastenListPager"></Pager>
        </div>
      </div>
    </div>
  </div>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import Vue from 'vue';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import ajax from '@/common/js/ajax';
import Pager from '@/components/Pos/Common/Pager';

export default {
  components: { Dialog, Pager },
  mixins: [DialogMixin],
  data() {
    return {
      selectAll: false,
      // 头部数据
      hastentitle: {
        pointCode: '005',
        openTime: '12:45',
        peopleQty: 6,
      },
      hastenItems: [],
    };
  },
  computed: {
    ...mapGetters(['getVuexPointData']),
    hotKeySet() {
      return {
        PgDn: () => {
          this.submitHastent();
        },
      };
    },
    dialogWidth() {
      if (Vue.config.lang === 'enUS') {
        return '900px';
      }
      return '720px';
    },
  },
  methods: {
    onClose() {
      // 品项数据
      this.hastentitle = [];
      this.hastenItems = [];
      this.selectAll = false;
      this.hastentitle = {};
    },
    initData() {
      const { hastenData } = this.resData; // 操作客位账单的主要信息
      // 接口返回的是客位名称.客位编号
      this.hastentitle.pointCode = hastenData.pointName;
      this.hastentitle.openTime = hastenData.openTime;
      this.hastentitle.peopleQty = hastenData.peopleQty;
      hastenData.hastens.forEach((item) => {
        const result = {};
        result.name = item.itemName;
        result.itemSizeName = item.itemSizeName;
        result.num = item.lastQty;
        result.addbilltime = `${item.fromAddTime}${this.$t('Dict.Minute01')}`;
        if (item.methodText) {
          result.methodText = item.methodText;
        }
        const { fromModifyTime } = item;
        if (fromModifyTime) {
          result.lasthastentime = `${fromModifyTime}${this.$t('Dict.Minute01')}`;
          // 催单次数
          const { hastenTimes } = item;
          if (hastenTimes) {
            result.hastentime = hastenTimes;
          } else {
            result.hastentime = null;
          }
        } else {
          result.hastentime = null;
        }
        result.isChecked = false;
        result.itemId = item.itemId;
        result.itemSizeId = item.itemSizeId;
        result.scId = item.scId;
        result.mergeScId = item.mergeScId;
        result.bsId = item.bsId;
        this.hastenItems.push(result);
      });
      this.selectAll = false;
    },
    onOpen() {
      this.initData();
      setTimeout(() => {
        if (this.$refs.hastenListPager) {
          this.$refs.hastenListPager.refresh();
        }
      });
    },
    handleCheckAllChange(value) {
      this.hastenItems.forEach((item) => {
        this.$set(item, 'isChecked', value);
      });
    },
    submitHastent() {
      const hastens = [];
      this.hastenItems.forEach((item) => {
        if (item.isChecked) {
          const map = {};
          map.itemId = item.itemId;
          map.scId = item.scId;
          map.lastQty = item.num;
          map.itemSizeId = item.itemSizeId;
          map.bsId = item.bsId;
          hastens.push(map);
        }
      });
      if (hastens.length === 0) {
        this.$message({
          type: 'error',
          // message: '请选择需要催单的品项',
          message: this.$t('Biz.Order.OrderOptMsg11'),
          duration: 2000,
        });
        return;
      }
      const requestParams = { pointId: this.getVuexPointData.id, hastens };
      ajax('canyin.pos.hasten.hasten', {
        contentType: 'paramsEncoded',
        data: requestParams,
      }).then((res) => {
        if (res.data && res.data.success) {
          this.$message.success(res.data.data.msg);
          this.close();
          this.submit();
        } else {
          this.$message.success(res.data.msg);
        }
      });
    },
    selectRecord(item) {
      const { isChecked } = item;
      if (isChecked) {
        this.$set(item, 'isChecked', false); // 给退单的数量重新赋值
      } else {
        this.$set(item, 'isChecked', true); // 给退单的数量重新赋值
      }
      const findIdNoChecked = this.hastenItems.filter(_ => !_.isChecked);
      if (findIdNoChecked.length === 0) {
        this.selectAll = true;
      } else {
        this.selectAll = false;
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.reminder {
  padding-left: 12px;
  padding-right: 12px;
  padding-bottom: 12px;
  > .reminder-info {
    line-height: 48px;
    height: 48px;

    > strong {
      font-size: 14px;
      color: #f24f64;
      > i {
        width: 20px;
        height: 20px;
        background-image: url("~@/common/images/pos/exitBill/table-number.png");
        background-repeat: no-repeat;
        background-size: 100%;
        display: inline-block;
        vertical-align: text-top;
      }
    }
    > .number-guest {
      margin-left: 23px;
      font-size: 14px;
      font-weight: 400;
    }
    > .openbill-time {
      margin-left: 27px;
      font-size: 14px;
      font-weight: 400;
    }
  }

  > .reminder-content {
    background-color: #fff;

    > .reminder-content-title {
      border-bottom: 1px solid #ccc;
      font-size: 12px;
      height: 37px;
      color: #666;
      line-height: 37px;

      > span {
        text-align: center;
        display: inline-block;
      }
      > .head-item-checkedbox {
        width: 4%;
      }
      > .head-item-order {
        width: 8%;
      }
      > .head-item-name {
        width: 25%;
      }
      > .head-item-number {
        width: 8%;
      }
      > .head-item-addbill-time {
        width: 18%;
      }
      > .head-item-hasten-time {
        width: 15%;
      }
      > .head-item-lasthasten-time {
        width: 18%;
      }
    }
    > .list-content {
      height: 392px !important;
      overflow: auto;

      > .reminder-content-body {
        border-bottom: 1px solid #ccc;

        > span {
          max-height: 48px;
          text-align: center;
          vertical-align: middle;
          font-size: 14px;
          font-weight: 600;
          display: inline-block;
          overflow: hidden;
        }
        > .item-checkedbox {
          width: 4%;
          cursor: pointer;
          > .isChecked {
            font-size: 12px;
            background-color: #0096a4;
            color: #fff;
            padding: 1px;
            font-weight: 100;
            border-radius: 2px;
          }
          > .isNoChecked {
            border: 1px solid #dcdfe6;
            width: 14px;
            height: 15px;
            margin-top: 6px;
            display: inline-block;
            border-radius: 2px;
            &:hover {
              border: 1px solid #0096a4;
            }
          }
        }
        > .item-order {
          width: 8%;
          height: 48px;
          line-height: 48px;
        }
        > .item-name {
          width: 25%;
          > .methodText {
            font-weight: 100;
          }
        }
        > .item-number {
          width: 8%;
        }
        > .item-addbill-time {
          width: 18%;
        }
        > .item-hasten-time {
          width: 15%;
        }
        > .item-lasthasten-time {
          width: 18%;
        }
      }
    }

    > .reminder-footer::after {
      content: "";
      display: block;
      clear: both;
    }
    > .reminder-footer {
      height: 53px;
      padding: 6px 12px;
      > .pagerbtn {
        margin-left: 75px;
        text-align: right;
      }
      > .select-all {
        float: left;
        width: 65px;
        height: 30px;
        margin-top: 6px;
        border: 1px solid #ddd;
        text-align: center;
        line-height: 30px;
        background-color: #f1f6f8;
      }
    }
  }
}
.methodText {
  padding-left: 20%;
}
.lang-enUS{
  .reminder > .reminder-content > .reminder-content-title > .head-item-order,
  .reminder > .reminder-content > .list-content > .reminder-content-body > .item-order {
    width: 6%;
  }
  .reminder > .reminder-content > .reminder-content-title > .head-item-number,
  .reminder > .reminder-content > .list-content > .reminder-content-body > .item-number {
    width: 6%;
  }
  .reminder > .reminder-content > .reminder-content-title > .head-item-addbill-time,
  .reminder > .reminder-content > .list-content > .reminder-content-body > .item-addbill-time {
    width: 17%;
  }
  .reminder > .reminder-content > .reminder-content-title > .head-item-lasthasten-time,
  .reminder > .reminder-content > .list-content > .reminder-content-body > .item-lasthasten-time {
    width: 19%;
  }
}
</style>
