<template>
  <div class="pos-bill-items">
    <div class="name">
      <span>
        {{
          (item.exchangeId) ? '[换]' : ''
        }}
        {{
          (item.bindId || item.mergeScId) ? '[拼]' : ''
        }}{{
          item.fullGiftId
          ? `[${$t('Dict.Gift')}]`
          : ''
        }}{{
          item.tempItemName ? '[临]' : ''
        }}{{
          item.sizeName ? ('('+item.sizeName+')'+item.name) : item.name
        }}
        {{
          item.auxiliaryUnitId
          ? `(${(item.auxiliaryUnitQty || 1) + item.auxiliaryUnitName})`
          : ''
        }}
      </span>
      <span class="markText">
        <em v-if="item.discFlg == 1" class="give">赠</em>
        <em v-if="item.scaleFlg" class="discount">折</em>
        <em v-if="+item.discFlg === 3" class="changed">变</em>
        <em v-if="+item.discFlg === 4" class="promotion">促</em>
        <em v-if="+item.discFlg === 5" class="vip">会</em>
        <em v-if="item.hastenTimes" class="hasten">催</em>
        <!-- confirmWeighType 为称重未确认的标识 -->
        <em v-if="item.confirmWeighType == 1" class="give">称</em>
        <!-- confirmWeighType 为称重已确认的标识 -->
        <em v-if="item.confirmWeighType == 2" class="successConfirmWeigh">称</em>
        <em v-if="item.isPackage" class="package">套</em>
      </span>
    </div>
    <ul class="setMealPrice">
      <li class="price">
        <span>单价:{{item.lastPrice ? item.lastPrice : item.price}}</span>
        <del
          v-if="typeof(item.lastPrice) === 'number' && item.lastPrice != item.salePrice"
        >{{ item.salePrice }}</del>
        <del
          v-else-if="typeof(item.price) === 'number' && item.price != item.salePrice"
        >{{ item.salePrice }}</del>
      </li>
      <li class="count">{{item.lastQty}}{{item.unitName}}</li>
      <li class="priceTotal">小计:<span class="fw">{{item.lastSubtotal}}</span></li>
    </ul>
    <div class="Remarks">
      <span v-if="item.serveWayId && item.serveWayId != '0'">{{"注: "+item.serveWayName}}</span>
      <span v-if="item.methodList && item.methodList.length">
        <template v-for="(method, i) in item.methodList">
          {{
            (i == 0 && item.serveWayId == '0') ? '注: ' : ' | '
          }}{{
            method.name
          }}{{
            method.isNeedFee
              ? (method.qty && method.qty !=1)
                ? '(+ '+ method.price +'X'+method.qty+')'
                : '(+ '+ method.price +')'
              : ''
          }}
        </template>
      </span>
      <span v-if="!item.methodList && item.methodText">
        {{item.serveWayId == '0'? '注: ' : ' | '}}{{item.methodText}}
      </span>
    </div>
    <ul class="setMealDetailed" v-if="item.pkgList && item.pkgList.length">
      <li v-for="(setitem, index) in item.pkgList" :key="index">
        <div class="name">
          {{
            setitem.itemType === 2 ?
            '[临]' + setitem.name :
            setitem.name
          }}
          {{
            setitem.auxiliaryUnitId
            ? `(${(setitem.auxiliaryUnitQty || 1) + setitem.auxiliaryUnitName})`
            : ''
          }}
        </div>
        <div class="count">
          {{setitem.lastQty ? setitem.lastQty: setitem.num}}{{setitem.unitName}}
        </div>
        <div class="raisePrice">
          <span v-if="setitem.raisePriceType == 2" class="memberRaisePrice">
            {{
              item.isNotFollowAmount
              ? '+ ' + setitem.raiseMemberPrice
              : '+ ' + setitem.raiseMemberPrice * 1000 * item.lastQty / 1000
            }}
            <span>会</span>
          </span>
          <span v-else>
            {{
              setitem.realRaisePrice > 0
                ? (
                  item.isNotFollowAmount
                    ? '+ ' + setitem.realRaisePrice
                    : '+ ' + setitem.realRaisePrice * 1000 * item.lastQty / 1000
                  )
                : ''
            }}
          </span>
        </div>
        <!-- addOrdering 加单时候的显示样式否则是提交完的显示样式 -->
        <div class="Remarks bsIdRemarks" >
          <span v-if="setitem.serveWayId != '0'" >
            {{"注: "+setitem.serveWayName}}
          </span>
          <span v-if="setitem.methodList && setitem.methodList.length">
            <template v-for="(method, i) in setitem.methodList">
              {{
                (i == 0 && !setitem.serveWay ) ? '注: ' : ' | '
              }}{{
                method.name
              }}{{
                method.isNeedFee
                  ? '(+ '
                    + method.price
                    + (method.qty && method.qty!=1 ? 'x'+ method.qty : '')
                    + ')'
                  : ''
              }}
            </template>
          </span>
          <!-- 入库的套餐明细的所有做法 的合计-->
          <span class="methodPriceTotal" v-show="!addOrdering">
            {{getPkgListMethodPriceTotla(setitem, item)}}
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import {
  add,
  multi,
} from '@/common/js/math';

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
    addOrdering: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    // 提交完的套餐每个明细的做法价格合计
    getPkgListMethodPriceTotla(setitem, item) {
      let methodPriceTotal = 0;
      if (setitem && setitem.methodList && setitem.methodList.length) {
        setitem.methodList.forEach((method) => {
          if (method.price) {
            methodPriceTotal = add(methodPriceTotal,
              method.isRelaCount
                ? multi(setitem.lastQty, multi(method.price, method.qty))
                : !item.isNotFollowAmount
                  ? multi(multi(method.price, method.qty), item.lastQty)
                  : multi(method.price, method.qty));
          }
        });
      }
      return +methodPriceTotal === 0 ? '' : `+ ${methodPriceTotal}`;
    },
  },
};

</script>
<style lang="less" scoped>
@import "~@/components/ViceScreen/Pos/style/item.less";
</style>
