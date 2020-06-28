<template>
  <!-- $t-品项变价 -->
  <Dialog
    name="PosDialog.ChangePrice"
    :title="$t('Dict.Btn.ChangePrice')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :showSubmit="true"
    @submit="submitChangePrice"
    width="720px"
    :hotkeys="hotKeySet"
    submitId="orderChangePriceSubmit"
  >
  <div class="changeprice">
    <div class="changeprice-info">
      <strong>
        <!-- <i></i> -->
        <span>{{changePricetitle.pointCode}}</span>
      </strong>
      <!-- $t-开单时间,就餐人数 -->
      <span class="openbill-time">{{$t('Dict.OpeningTime')}}{{changePricetitle.openTime}}</span>
      <span class="number-guest">{{$t('Biz.Order.DinerPersonNumLabel')}}{{changePricetitle.peopleQty}}</span>
    </div>
    <div class="changeprice-content">
      <div class="changeprice-content-title">
        <!-- $t-序号,品项,现有数量,现单价,修改单价为,小计 -->
        <span class="head-item-order">{{ $t('Dict.SerialNumber') }}</span>
        <span class="head-item-name">{{ $t('Dict.Item') }}</span>
        <span class="head-item-number">{{ $t('Biz.Order.ExistingNumTabel') }}</span>
        <span class="head-item-addbill-time">{{ $t('Biz.Order.NowUnitPrice') }}</span>
        <span class="head-item-hasten-time">{{ $t('Biz.Order.ModifyPriceAs') }}</span>
        <span class="head-item-lasthasten-time">{{ $t('Dict.Subtotal') }}</span>
      </div>
      <ul class="list-content" id="changePriceListId">
        <li class="changeprice-content-body"
          v-for="(item , index) in changePriceItems"
          :key="index">
          <span class="item-order">{{ index + 1 }}</span>
          <span class="item-name">
            <!-- {{ item.mergeScId ? '[拼]' : '' }} -->
            {{ item.mergeScId ? $t('Biz.Order.SpellFoodTag') : '' }}
            <span v-show="item.itemSizeName">({{ item.itemSizeName }})</span>
            {{ item.name }}
          </span>
          <span class="item-number">{{ item.lastQty }}</span>
          <span class="item-addbill-time"> {{ item.lastPrice }}</span>
          <span class="item-hasten-time">
            <el-input-number
              :class="[item.changePriceRecord > item.lastPrice
                ? 'green'
                : (item.changePriceRecord < item.lastPrice ? 'red' : '')]"
              id="orderChangePriceInput"
              v-autotest class="change-price-gt"
              size="small"
              :min="0"
              :max="99999.99"
              :precision="2"
              :label="$t('Dict.DescriptiveText')"
              v-model="item.changePriceRecord"
              @change="handleChange(item)"
              v-num-keyboard:left
              v-judge
             >
            </el-input-number>
          </span>
          <span class="item-lasthasten-time">{{ item.lastTotal }}</span>
          <p v-if="item.methodText" class="methodText">{{ item.methodText }}</p>
        </li>
      </ul>
      <div class="changeprice-footer">
        <div class="pagerbtn">
          <Pager
          pagerId="changePriceListId"
          itemTag="li"
          scrollMode="simple"
          :showInfo = "true"
          arrowDirection="up-down"
          ref="pager"
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
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';
import { multi } from '@/common/js/math';

export default {
  components: { Dialog, Pager },
  mixins: [DialogMixin],
  data() {
    return {
      // 头部数据
      changePricetitle: {
        pointCode: '005',
        openTime: '12:45',
        peopleQty: 6,
      },
      changePriceItems: [{
        name: '鲜蔬菜沙拉',
        itemSizeId: '-1',
        unitName: '单位',
        lastQty: 0,
        lastPrice: '$999',
        lastTotal: '$999',
        bsId: '111',
        itemId: '111',
        code: '1000101',
        scId: '123',
        changePriceRecord: '999',
      }],
    };
  },
  computed: {
    ...mapGetters(['getVuexPointData']),
    hotKeySet() {
      return {
        PgDn: () => {
          // 提交按钮获得焦点后执行提交
          this.whenSubmitBtnFocus(() => {
            this.submitChangePrice();
          });
        },
      };
    },
  },
  methods: {
    onOpen() {
      // 品项数据
      this.changePricetitle = [];
      this.changePriceItems = [];
      const { changePriceData } = this.resData; // 操作客位账单的主要信息
      // 接口返回的是客位名称.客位编号
      this.changePricetitle.pointCode = changePriceData.pointName;
      this.changePricetitle.openTime = changePriceData.openTime;
      this.changePricetitle.peopleQty = changePriceData.peopleQty;
      changePriceData.serviceContents.forEach((item) => {
        this.$set(item, 'changePriceRecord', item.lastPrice);
        this.$set(item, 'lastTotal', multi(item.lastQty, item.lastPrice));
        this.$set(item, 'isChangePrice', false);
        this.changePriceItems.push(item);
      });
      if (this.$refs.pager) {
        this.$refs.pager.refresh();
      }
    },
    handleChange(item) {
      this.$nextTick(() => {
        const { lastPrice, changePriceRecord } = item;
        if (+lastPrice === +changePriceRecord) {
          this.$set(item, 'isChangePrice', false);
        } else if (lastPrice > changePriceRecord) {
          this.$set(item, 'isChangePrice', true);
          this.$set(item, 'isGtLastPrice', true);
        } else {
          this.$set(item, 'isChangePrice', true);
          this.$set(item, 'isGtLastPrice', false);
        }
        // 保留小数点后两位
        this.$set(item, 'changePriceRecord', multi(changePriceRecord, 100) / 100);
      });
    },
    submitChangePrice(authData = {}) {
      const itemsTempArray = [];
      let bsId = 0;
      this.changePriceItems.forEach((item, index) => {
        if (item.isChangePrice) {
          const map = {};
          map.itemId = item.itemId;
          map.scId = item.scId;
          map.price = item.lastPrice;
          map.changePrice = item.changePriceRecord;
          map.itemSizeId = item.itemSizeId;
          map.smallClassId = item.smallClassId;
          [bsId] = [item.bsId];
          itemsTempArray.push(map);
        }
      });
      if (itemsTempArray.length === 0) {
        this.$message({
          type: 'error',
          // message: '没有对品项进行变价,请确认.',
          message: this.$t('Biz.Order.OrderOptMsg01'),
          duration: 2000,
        });
        return;
      }
      this.$vonce('authCode', (code2) => {
        this.submitChangePrice(code2);
      });
      let items = '';
      itemsTempArray.forEach((item) => {
        const itemTemp = `itemId:${item.itemId},price:${item.price},changePrice:${item.changePrice},scId:${item.scId},itemSizeId:${item.itemSizeId},itemSmallClassId:${item.smallClassId}`;
        items = `${items}/${itemTemp}`;
      });
      const requestParams = {
        pointId: this.getVuexPointData.id,
        bsId,
        items,
      };
      ajax('canyin.pos.changePrice.changePrice', {
        contentType: 'paramsEncoded',
        data: {
          ...requestParams,
          ...authData,
        },
      }).then((data) => {
        if (data.success) {
          // this.$message.success('品项变价成功')
          this.$message.success(this.$t('Biz.Order.OrderOptMsg02'));
          this.close();
          this.submit();
        } else {
          this.$message.error(data.msg);
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.changeprice {
  padding-left: 12px;
  padding-right: 12px;
  padding-bottom: 12px;
  > .changeprice-info {
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

  > .changeprice-content {
    background-color: #fff;

    > .changeprice-content-title {
      border-bottom: 1px solid #ccc;
      font-size: 12px;
      height: 37px;
      color: #666;
      line-height: 37px;

      > span {
        text-align: center;
        display: inline-block;

      }
      > .head-item-order {
        width: 8%;
      }
      > .head-item-name {
        width: 25%;
      }
      > .head-item-number {
        width: 10%;
      }
      > .head-item-addbill-time {
        width: 15%;
      }
      > .head-item-hasten-time {
        width: 24%;
      }
      > .head-item-lasthasten-time {
        width: 15%;
      }
    }
    > .list-content {
      height: 392px !important;
      overflow-x: hidden;

      > .changeprice-content-body {
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
        > .item-addbill-time {
          width: 15%;
        }
        > .item-hasten-time {
          width: 24%;
          >.change-price-lt{
            color: aqua
          }
          >.change-price-gt{
            color:#f24f64
          }
        }
        > .item-lasthasten-time {
          width: 15%;
        }
      }
    }
    > .changeprice-footer::after {
      content: "";
      display: block;
      clear: both;
    }
    > .changeprice-footer {
      height: 53px;
      padding: 6px 12px;
      > .pagerbtn {
        text-align: right;
      }

    }
  }
}
.methodText {
  padding-left: 8%;
}
.lang-enUS {
  .changeprice > .changeprice-content > .changeprice-content-title > .head-item-order,
  .changeprice > .changeprice-content > .list-content > .changeprice-content-body > .item-order {
    width: 6%;
  }
  .changeprice > .changeprice-content > .changeprice-content-title > .head-item-number,
  .changeprice > .changeprice-content > .list-content > .changeprice-content-body > .item-number {
    width: 12%;
  }
}
</style>

<style lang="less">
.red {
  input.el-input__inner {
    color: #d9534f;
  }
}
.green {
  input.el-input__inner {
    color: #5fba79;
  }
}
</style>
