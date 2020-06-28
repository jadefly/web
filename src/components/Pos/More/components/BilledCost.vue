<template>
  <div class="cost-table">
    <div class="table-head">
      <table>
        <tr>
          <th class="item-col">
            <div class="package-item">{{$t('Dict.Item')}}</div>
          </th>
          <th class="count-col">{{$t('Dict.Amount')}}</th>
          <th class="auxiliar-count-col">{{$t('Dict.AuxiliaryAmAount')}}</th>
          <th class="price-col">{{$t('Dict.Btn.ChangeItemPrice')}}</th>
          <th class="discount-col">{{$t('Dict.DiscountRate')}}</th>
          <th class="remark-col">{{$t('Dict.Remarks')}}</th>
          <th class="totle-col">{{$t('Dict.Subtotal')}}</th>
        </tr>
      </table>
    </div>
    <div class="table-body" ref="scrollContent">
      <table>
        <tr
          :class="{'normal-item':!item.ispkgitem,'package-detail':item.ispkgitem}"
          v-for="item in costList"
          :key="item.key"
        >
          <template v-if="!item.ispkgitem">
            <td class="item-col">
              <div class="package-item package-item-col">
                {{ item.exchangeId ? `[${$t('Dict.Repurchase')}]` : '' }}{{ !item.exchangeId && item.mergeScId ? `[${$t('Biz.Order.SpellFoodText')}]` : '' }}{{item.name}}
                <p
                  v-if="item.serveWayId != 0 && !item.methodText && getVuexPosMode !== '3'"
                >{{$t('Dict.Notes01')}}{{item.serveWayName}}</p>
                <p v-if="item.methodText">
                  {{$t('Dict.Notes01')}}{{`${item.serveWayName && getVuexPosMode !== '3' ?
                  item.serveWayId != 0 ? item.serveWayName + ' | ' : '' : ''}
                  ${item.methodText}`}}
                </p>
              </div>
            </td>
            <td class="count-col">{{item.lastQty}}{{item.unitName}}</td>
            <td class="auxiliar-count-col">{{ item.auxiliaryUnitId
              ? `${item.auxiliaryUnitQty}${item.auxiliaryUnitName}`
              : ''
            }}</td>
            <td class="price-col">{{item.lastPrice | keepTwo}}</td>
            <td class="discount-col">{{item.discScale}}%</td>
            <td class="remark-col">
              <span v-if="item.discFlg === 1" class="tip-mark">{{$t('Dict.Gift')}}</span>
              <span v-else-if="item.discFlg === 3" class="tip-mark">{{$t('Dict.Change')}}</span>
              <span v-else-if="item.discFlg === 4" class="tip-mark">{{$t('Dict.Promotion')}}</span>
              <span v-else-if="item.discFlg === 5" class="tip-mark">{{$t('Dict.Vip')}}</span>
              <span v-if="item.scaleFlg" class="tip-mark">{{$t('Dict.Discount')}}</span>
            </td>
            <td class="totle-col">{{item.lastSubtotal | keepTwo}}</td>
          </template>
          <template v-else>
            <td colspan="7">
              <tr v-for="pkgItem in item.pkgList" :key="pkgItem.key" class="package-tr">
                <td class="package-col">
                  <div class="package-item ml25">
                    {{pkgItem.name}}
                    <p v-if="!pkgItem.methodText
                      && pkgItem.serveWayId != 0
                      && getVuexPosMode !== '3'">{{$t('Dict.Notes01')}}{{pkgItem.serveWayName}}</p>
                    <p v-if="pkgItem.methodText">
                      {{$t('Dict.Notes01')}}{{
                      `${pkgItem.serveWayName && getVuexPosMode !== '3'
                        ? pkgItem.serveWayId != 0
                          ? pkgItem.serveWayName + ' | '
                          : ''
                        : ''}${pkgItem.methodText}`
                      }}
                    </p>
                  </div>
                </td>
                <td class="count-col pl0">{{pkgListLastQty(item,pkgItem)}}{{pkgItem.unitName}}</td>
                <td class="auxiliar-count-col pl0">{{ pkgItem.auxiliaryUnitId
                  ? `${pkgItem.auxiliaryUnitQty}${pkgItem.auxiliaryUnitName}`
                  : ''
                }}</td>
                <td class="price-col pl3">{{pkgListTotalPrice(item, pkgItem).raiseTotalPrice != 0
                  ? numberformat(pkgListTotalPrice(item, pkgItem).raiseTotalPrice)
                  : ''}}</td>
                <td class="discount-col"></td>
                <td class="remark-col"></td>
                <td  class="totle-col">{{pkgListTotalPrice(item, pkgItem).total != 0
                  ? numberformat(pkgListTotalPrice(item, pkgItem).total)
                  : ''}}</td>
              </tr>
            </td>
          </template>
        </tr>
      </table>
      <div class="no-item" v-if="costList.length <= 0">
        <p>{{$t('Biz.UserDesktop.SearchPrint.BilledCostP2')}}</p>
      </div>
    </div>
    <div class="pos-pager pos-takeout-pager">
      <button href="javascript:;" class="prev" @click="upPage">
        <i class="el-icon-arrow-up"></i>
      </button>
      <button href="javasctipt:;" class="next" @click="downPage">
        <i class="el-icon-arrow-down"></i>
      </button>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import numberformat from '@/common/js/numberformat';
import { add, multi, div } from '@/common/js/math';

export default {
  props: {
    scList: {
      default() {
        return [];
      },
    },
    tsId: {
    },
  },
  filters: {
    keepTwo(val) {
      if (!val) return '0.00';
      return numberformat(val);
    },
  },
  watch: {
    tsId() {
      if (this.$refs.scrollContent) {
        this.$refs.scrollContent.scrollTop = 0;
      }
    },
  },
  computed: {
    ...mapGetters([
      'getVuexPosMode',
    ]),
    // 列表数据
    costList() {
      return this.scList.reduce((total, item) => {
        total.push({
          name: item.name,
          unitName: item.unitName,
          lastQty: item.lastQty,
          lastPrice: item.lastPrice,
          discScale: multi(item.discScale, 100),
          lastSubtotal: item.lastSubtotal,
          serveWayName: item.serveWayName,
          serveWayId: item.serveWayId,
          discFlg: item.discFlg,
          key: total.length,
          methodText: item.methodText,
          scaleFlg: item.scaleFlg,
          mergeScId: item.mergeScId ? item.mergeScId : null,
          exchangeId: item.exchangeId,
          auxiliaryUnitId: item.auxiliaryUnitId, // 辅助单位id
          auxiliaryUnitQty: item.auxiliaryUnitQty, // 辅助单位数量
          auxiliaryUnitName: item.auxiliaryUnitName, // 辅助单位名称
        });
        if (item.pkgList) {
          total.push({
            key: total.length,
            isNotFollowAmount: item.isNotFollowAmount,
            ispkgitem: true,
            lastQty: item.lastQty,
            pkgType: item.pkgType,
            pkgList: item.pkgList.map((pkgItem, index) => ({
              name: pkgItem.name,
              unitName: pkgItem.unitName,
              lastQty: pkgItem.lastQty,
              methodText: pkgItem.methodText,
              raisePrice: pkgItem.raisePrice,
              realRaisePrice: pkgItem.realRaisePrice,
              methodList: pkgItem.methodList,
              serveWayName: pkgItem.serveWayName,
              serveWayId: pkgItem.serveWayId,
              key: index,
              raisePriceType: pkgItem.raisePriceType,
              raiseMemberPrice: pkgItem.raiseMemberPrice,
              auxiliaryUnitId: pkgItem.auxiliaryUnitId, // 辅助单位id
              auxiliaryUnitQty: pkgItem.auxiliaryUnitQty, // 辅助单位数量
              auxiliaryUnitName: pkgItem.auxiliaryUnitName, // 辅助单位名称
            })),
          });
        }
        return total;
      }, []);
    },
  },
  methods: {
    numberformat(value) {
      return numberformat(value);
    },
    // 计算下明细的数量,联动和不联动
    pkgListLastQty(item, pkgItem) {
      let lastQty = 1;
      lastQty = this.getVuexPosMode == 3 && !item.isNotFollowAmount
        ? multi(pkgItem.lastQty, item.lastQty)
        : pkgItem.lastQty;
      return lastQty;
    },
    // 计算下套餐明细的做法(如果有明细加价就加上) isNotFollowAmount 为true是不联动,否则为联动
    pkgListTotalPrice(pkg, list) {
      let raiseTotalPrice = 0; // raiseTotalPrice明细加价的合计
      let methodTotalPrice = 0; // methodTotalPrice 做法加价的合计
      // 加价的
      const raisePrice = list.raisePriceType == 2
        ? list.raiseMemberPrice
        : list.realRaisePrice;
      if (pkg.pkgType == 0) {
        if (raisePrice) {
          raiseTotalPrice = pkg.isNotFollowAmount ? raisePrice : multi(raisePrice, pkg.lastQty);
        }
      }
      if (list.methodList && list.methodList.length) {
        list.methodList.forEach((method) => {
          let itemLastQty = list.lastQty;
          const itemMethodPrice = method.price ? multi(method.price, method.qty) : 0;
          // 快餐模式下的明细数量显示是没有乘以主套餐的数量的
          if (this.getVuexPosMode == '3' && !pkg.isNotFollowAmount) {
            itemLastQty = multi(list.lastQty, pkg.lastQty);
          }
          if (method.isRelaCount) {
            methodTotalPrice = add(multi(itemMethodPrice, itemLastQty), methodTotalPrice);
          } else if (!pkg.isNotFollowAmount) {
            methodTotalPrice = add(multi(itemMethodPrice, pkg.lastQty), methodTotalPrice);
          } else {
            methodTotalPrice = add(itemMethodPrice, methodTotalPrice);
          }
        });
      }
      return {
        total: add(raiseTotalPrice, methodTotalPrice),
        raiseTotalPrice,
      };
    },
    upPage() {
      console.log(this.costList);
      if (this.scrollTop < this.offset) return;
      this.scrollTop -= this.offset;
      this.$refs.scrollContent.scrollTop = this.scrollTop;
    },
    downPage() {
      if (
        (this.scrollTop + this.$refs.scrollContent.clientHeight) > this.$refs.scrollContent.scrollHeight
      ) {
        return;
      }
      this.scrollTop += this.offset;
      this.$refs.scrollContent.scrollTop = this.scrollTop;
    },
  },
  data() {
    return {
      scrollTop: 0,
      offset: 100,
    };
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.cost-table {
  height: 100%;
  position: relative;
  table {
    width: 100%;
  }
  th,
  td {
    padding-left: 6px;
    font-weight: normal;
  }
  .table-head {
    padding: 4px 0;
    background-color: #7bcad6;
    color: @white;
    th {
      font-size: 12px;
      line-height: 1.1;
    }
    th + th {
      border-left: 1px solid @white;
    }
  }
  .table-body {
    position: absolute;
    overflow: auto;
    top: 20px;
    bottom: 40px;
    left: 0;
    right: 0;
    margin-top: 6px;
    color: @gray-dark;
    border-bottom: 1px solid #c2c2c2;
    td {
      font-size: 12px;
      line-height: 3;
    }
    tr {
      border-bottom: 1px solid #7bcad6;
    }
    tr.normal-item {
      counter-increment: itemindex;
    }
    .item-col {
      .package-item-col::before {
        content: counter(itemindex);
        font-weight: bold;
        padding-right: 12px;
      }
      p {
        padding-left: 20px;
      }
    }
  }
  .item-col {
    width: 25%;
  }
  .count-col {
    width: 13%;
  }
  .auxiliar-count-col {
    width: 10%;
  }
  .price-col {
    width: 12%;
  }
  .discount-col {
    width: 9%;
  }
  .remark-col {
    width: 17%;
    .tip-mark {
      background-color: #f34f64;
      color: #ffffff;
      padding: 0 2px;
    }
  }
  .package-detail {
    background-color: #f5f5f5;
    color: #0babb9;
    // .count-col {
    //   width: 15%;
    // }
    // .auxiliar-count-col {
    //   width: 13%;
    // }
    // .price-col {
    //   width: 14%;
    // }
  }
}
.package-item {
  line-height: 1.8;
  // width: 269px;
}
.no-item {
  text-align: center;
  font-size: 14px;
  color: #999999;
  padding-top: 20px;
  color: #0babb9;
}

// 箭头按钮
.pos-takeout-pager {
  position: absolute;
  right: 12px;
  // bottom: 12px;
  bottom: 5px;
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
      color: #9a9a9a;
    }

    &[disabled] {
      color: @btn-disabled-color;
      cursor: not-allowed;
    }
  }
}
.package-tr {
  width: 100%;
  display: flex;
  align-items: center;
  > .totle-col {
    padding-left: 3px;
  }
}
.package-col {
  width: 25%;
}
.pl0 {
  padding-left: 0 !important;
}
.ml25 {
  margin-left: 25px !important;
}
.pl3 {
  padding-left: 3px !important;
}
</style>
