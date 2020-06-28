<template>
  <Dialog
    name="PosDialog.Hasten"
    :title="$t('Biz.Order.SelectDishes')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :showSubmit="true"
    @submit="submitHastent"
    width="720px"
    :hotkeys="hotKeySet"
  >
    <div class="reminder">
      <div class="reminder-info">
        <strong>
          <span class="table-number title-list"><i></i>{{hastentitle.pointCode}}</span>
        </strong>
        <span class="openbill-time">{{ $t('Dict.OpeningTime') }}{{hastentitle.openTime}}</span>
        <span class="number-guest">{{ $t('Dict.EatPersonNum') }}:{{hastentitle.peopleQty}}</span>
      </div>
      <div class="reminder-content">
          <div class="reminder-content-title">
            <span class="head-item-checkedbox"></span>
            <span class="head-item-order">{{ $t('Dict.SerialNumber') }}</span>
            <span class="head-item-name">{{ $t('Dict.Item') }}</span>
            <span class="head-item-number">{{ $t('Dict.Amount') }}</span>
            <span class="head-item-number">{{ $t('Dict.AuxiliaryUnitQty') }}</span>
            <span class="head-item-addbill-time">{{ $t('Dict.Practice') }}</span>
          </div>
          <ul class="list-content" id="hastenListId">
            <li
              class="reminder-content-body"
              @click="selectRecord(item)"
              v-for="(item , index) in hastenItems"
              :key="index"
            >
              <span class="item-checkedbox">
                <i class="icon icon-duihao isChecked" v-show="item.isChecked == true"></i>
                <i class="isNoChecked" v-show="item.isChecked == false"></i>
              </span>
              <span class="item-order">{{ index + 1 }}</span>
              <span class="item-name">{{
                item.mergeScId
                  ? $t('Biz.Order.SpellFoodTag')
                  : ''
                }}{{ item.name
              }}</span>
              <span class="item-number">{{ item.num }}{{item.unitName}}</span>
              <span class="item-number1">{{ item.auxiliaryUnitId ? item.auxiliaryUnitQty+item.auxiliaryUnitName : '' }}</span>
              <span class="item-addbill-time">{{ item.methodText }}</span>
            </li>
          </ul>
          <div class="reminder-footer">
            <div class="select-all">
              <el-checkbox
                v-model="selectAll"
                @change="handleCheckAllChange"
              >{{ $t('Dict.SelectAll') }}</el-checkbox>
            </div>
            <div class="pagerbtn">
              <Pager
                pagerId = "hastenListId"
                itemTag="li"
                :showInfo = "true"
                arrowDirection="up-down"
                ref="hastenListPager"
              >
              </Pager>
            </div>
          </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
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
  },
  methods: {
    initData() {
      // 品项数据
      this.hastentitle = {};
      this.hastenItems = [];
      const hastenData = this.resData; // 操作客位账单的主要信息
      // 接口返回的是客位名称.客位编号

      this.hastentitle.pointCode = hastenData.pointName;
      this.hastentitle.openTime = hastenData.openTime;
      this.hastentitle.peopleQty = hastenData.peopleQty;
      this.hastenItems = hastenData.scList.map(item => ({
        isChecked: false,
        num: item.lastQty,
        sizeId: item.itemSizeId,
        ...item,
      }));
      this.selectAll = false;
    },
    onOpen() {
      this.initData();
      setTimeout(() => {
        if (this.$refs.hastenListPager) {
          this.$refs.hastenListPager.refresh();
        }
      });
      this.$log.info('打开选择菜品窗口。');
    },
    handleCheckAllChange(value) {
      this.hastenItems.forEach((item) => {
        this.$set(item, 'isChecked', value);
      });
    },
    submitHastent() {
      this.$emit('selected', this.hastenItems.filter(item => item.isChecked === true));
      this.close();
      this.$log.info('提交选择菜品窗口。');
    },
    selectRecord(item) {
      const { isChecked } = item;
      if (isChecked) {
        this.$set(item, 'isChecked', false); // 给退单的数量重新赋值
      } else {
        this.$set(item, 'isChecked', true); // 给退单的数量重新赋值
      }
      const findIdNoChecked = this.hastenItems.filter(_ => _.isChecked == false);
      this.selectAll = findIdNoChecked.length === 0;
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
      font-weight: 400px;
      color: #666;
      line-height: 37px;

      > span {
        text-align: center;
        display: inline-block;
      }
      > .head-item-checkedbox {
        width: 8%;
      }
      > .head-item-order {
        width: 8%;
      }
      > .head-item-name {
        width: 25%;
      }
      > .head-item-number {
        width: 11%;
      }
      > .head-item-addbill-time {
        width: 20%;
      }
      > .head-item-hasten-time {
        width: 15%;
      }
      > .head-item-lasthasten-time {
        width: 15%;
      }
    }
    > .list-content {
      height: 392px !important;
      overflow: hidden;

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
          width: 8%;
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
          width: 10%;
        }
        >.item-number1 {
          width: 12%;
        }
        > .item-addbill-time {
          width: 45%;
          padding-left: 4%;
          text-align: left;
        }
        > .item-hasten-time {
          width: 15%;
        }
        > .item-lasthasten-time {
          width: 15%;
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
</style>
