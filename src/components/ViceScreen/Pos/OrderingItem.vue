<template>
  <div class="pos-bill-items">
    <div class="name">
      <span>
        {{
          (item.exchangeId) ? `[${$t('Dict.Repurchase')}]` : ''
        }}
        {{
          ((item.bindId || item.mergeScId) && !item.exchangeId) ? `[${Biz.Order.SpellFoodText}]` : ''
        }}{{
            item.fullGiftId
            ? `[${$t('Dict.Gift')}]`
            : ''
        }}{{
          item.tempItemName ? `[${$t('Dict.Temporary')}]` : ''
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
        <em v-if="item.discFlg == 1" class="give">{{ $t('Dict.Gift') }}</em>
        <em v-if="item.discFlg == 2" class="discount">{{ $t('Dict.Discount') }}</em>
        <em v-if="item.priceType == 4" class="changed">{{ $t('Dict.Change') }}</em>
        <em v-if="item.priceType == 3" class="promotion">{{ $t('Dict.Promotion') }}</em>
        <em v-if="item.priceType == 2" class="vip">{{ $t('Dict.Vip') }}</em>
        <em v-if="item.hastenTimes" class="hasten">{{ $t('Dict.Hasten') }}</em>
        <em v-if="item.isConfirmWeigh" class="give">{{ $t('Dict.ConfirmWeigh') }}</em>
        <em v-if="item.isPackage" class="package">{{ $t('Dict.Package') }}</em>
        <em v-if="item.TagID" class="easy-icon"></em>
      </span>
    </div>
    <ul class="setMealPrice">
      <li class="price">
        <span>{{$t('Dict.UnitPrice1')}}{{item.lastPrice ? item.lastPrice : item.price}}</span>
        <del v-if="item.discFlg === 4">{{ item.salePrice }}</del>
        <!-- <del
          v-if="item.lastPrice && item.lastPrice != item.salePrice"
        >{{ item.salePrice }}</del>
        <del
          v-else-if="item.price && item.price != item.salePrice"
        >{{ item.salePrice }}</del> -->
      </li>
      <li class="count">{{item.lastQty}}{{item.unitName}}</li>
      <li class="priceTotal">{{$t('Dict.Subtotal')}}:<span class="fw">{{item.lastSubtotal}}</span></li>
    </ul>
    <div class="Remarks">
      <span v-show="item.serveWay">
        {{item.serveWay ? $t('Dict.Notes')+ item.serveWay.name : ''}}
      </span>
      <span v-if="item.methodList && item.methodList.length">
        <template v-for="(method, i) in item.methodList">
          {{
            (i == 0 && !item.serveWay ) ? $t('Dict.Notes') : ' | '
          }}{{
            method.name
          }}{{
            method.isNeedFee
              ? '(+ '
                + method.price
                + (
                  method.qty && method.qty!=1
                    ? 'x'+ method.qty
                    : ''
                )
                + ')'
              : ''
          }}</template>
      </span>
    </div>
    <ul class="setMealDetailed" v-if="item.pkgList && item.pkgList.length">
      <li v-for="(setitem, index) in item.pkgList" :key="index">
        <div class="name">
          {{
            setitem.itemType === 2 ?
          `[${$t('Dict.Temporary')}]` + setitem.name :
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
          <span
            v-if="
              item.raisePriceType == 2
              && (setitem.raiseMemberPrice || setitem.raiseMemberPrice == 0)
            "
            class="memberRaisePrice"
          >
            {{
              setitem.isRaiseByQty
                ? (
                  item.bsId
                    ? '+ ' + setitem.raiseMemberPrice
                    : '+ '
                      + setitem.raiseMemberPrice
                      + (
                        setitem.lastQty
                          ? setitem.lastQty !== 1
                            ? 'x' + setitem.lastQty
                            : ''
                          : setitem.num !== 1
                            ? 'x' + setitem.num
                            : ''
                        )
                    )
                : item.bsId
                  ? '+ ' + setitem.raiseMemberPrice
                  : '+ '+setitem.raiseMemberPrice
              }}
            <span>{{$t('Dict.Vip')}}</span>
          </span>
          <span v-else>
            {{
              setitem.raisePrice > 0
                ? (
                  setitem.isRaiseByQty
                    ? (
                      item.bsId
                        ? '+ ' + setitem.realRaisePrice
                        : '+ ' + setitem.raisePrice + (
                          setitem.lastQty
                            ? setitem.lastQty !== 1
                              ? 'x' + setitem.lastQty
                              : ''
                            : setitem.num !== 1
                              ? 'x' + setitem.num
                              : ''
                          )
                        )
                    : item.bsId
                      ? '+ ' + setitem.realRaisePrice
                      : '+ ' + setitem.raisePrice
                  )
                : ''
            }}
          </span>
        </div>
        <!-- addOrdering 加单时候的显示样式否则是提交完的显示样式 -->
        <div class="Remarks bsIdRemarks" >
          <span v-if="setitem.serveWay">
            {{$t('Dict.Notes')+setitem.serveWay.name}}
          </span>
          <span v-if="setitem.methodList && setitem.methodList.length">
            <template v-for="(method, i) in setitem.methodList">
              {{
                (i == 0 && !setitem.serveWay ) ? $t('Dict.Notes') : ' | '
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
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/components/ViceScreen/Pos/style/item.less";
</style>
