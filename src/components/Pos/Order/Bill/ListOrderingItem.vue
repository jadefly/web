<template>
  <div class="a" :class="{isShowOrdedItems, active}">
    <div class="b"><em>{{ index + 1 }}</em></div>
    <div class="c">
      <div class="itemMainMessage" :class="{pkgItemClickClass: item.isPackage}">
        <div class="d">
          <!-- 国际化：拼，临，赠，折，变，促，会，催，称，套 -->
          <h3>
            {{ item.exchangeId ? `[${$t('Dict.Repurchase')}]` : '' }}
            {{ (!item.exchangeId && item.bindId) ? '['+$t('Biz.Order.SpellFoodText')+']' : '' }}
            {{
              item.fullGiftId
              ? `[${$t('Dict.Gift')}]`
              : ''
            }}
            {{ item.itemType === 2 ? '['+$t('Dict.Temporary')+']' : ''}}
            {{ item.sizeName ? ('('+item.sizeName+')'+item.name) : item.name }}
            {{ item.auxiliaryUnitId ? `(${item.auxiliaryUnitQty || 1} ${item.auxiliaryUnitName})`: '' }}
          </h3>
          <div class="e">
            <em v-if="item.discFlg == 1" class="give">{{$t('Dict.Gift')}}</em>
            <em v-if="item.discFlg == 2" class="discount">{{$t('Dict.Discount')}}</em>
            <em v-if="item.discFlg == 3" class="changed">{{$t('Dict.Change')}}</em>
            <em v-if="item.discFlg == 4" class="promotion">{{$t('Dict.Promotion')}}</em>
            <em v-if="item.discFlg == 5" class="vip">{{$t('Dict.Vip')}}</em>
            <em v-if="item.hastenTimes" class="hasten">{{$t('Dict.Hasten')}}</em>
            <em v-if="item.isConfirmWeigh" class="give">{{$t('Dict.ConfirmWeigh')}}</em>
            <em v-if="item.isPackage" class="package">{{$t('Dict.Package')}}</em>
            <em v-if="item.methodCount > 0 && item.TagID" class="easy-icon"></em>
          </div>
        </div>
        <div class="f">
          <!-- 国际化：单价： -->
          <div class="g">{{$t('Dict.UnitPrice1')}}
            <span>{{ item.price }} </span>
            <del v-if="item.discFlg === 4">{{ item.salePrice }}</del>
          </div>
          <div class="h">
            {{ item.lastQty }} {{ item.unitName }}
          </div>
          <!-- 国际化：小计： -->
          <div class="i">{{$t('Dict.Subtotal1') + item.lastSubtotal }}</div>
        </div>
      </div>
      <div class="redemption-box" v-show="item.isExchange && !item.exchangeId && !isTeam">
        <span @click.stop="goRedemption(item, realityIndex)" v-show="true">{{ $t('Biz.Order.GoOptional') }}<i class="icon icon-pager-next"></i></span>
      </div>
      <div class="j">
        <span v-show="item.serveWay">
          <!-- 国际化：注： -->
          {{item.serveWay ? $t('Dict.Notes01')+item.serveWay.name : ''}}
        </span>
        <span v-if="item.methodList && item.methodList.length">
          <template v-for="(method, i) in item.methodList">
            {{ (i === 0 && !item.serveWay ) ? $t('Dict.Notes01') : ' | ' }}
            {{ method.name }}
            {{ method.isNeedFee ?
              '(+ '+ method.price + (method.qty && +method.qty !== 1 ?
                'x'+ method.qty :
                '') + ')' :
              '' }}
          </template>
        </span>
      </div>
      <ul class="k" v-if="item.pkgList">
        <li v-for="(setitem , index) in item.pkgList" :key="index">
          <p class="pkgItemMainContent">
            <i class="icon icon-dian1"></i>
            <span class="setmealitem">
              {{
                setitem.itemType === 2 ?
                '['+$t('Dict.Temporary')+']' + setitem.name :
                setitem.name
              }}
              {{
                setitem.auxiliaryUnitId
                ? `(${(setitem.auxiliaryUnitQty || 1) + setitem.auxiliaryUnitName})`
                : ''
              }}
            </span>
            <span class="setmealitemnum">{{setitem.num}}{{setitem.unitName}}</span>
            <!-- 加价的显示 分普通和会员加价-->
            <span
              class="raisePrice"
              v-show="!isShowRaiseMemberPrice(item, setitem)">
              {{
                setitem.raisePrice > 0
                  ? (setitem.isRaiseByQty
                  && +setitem.num !== 1
                    ? '+ '+setitem.raisePrice+'x'+setitem.num
                    : '+ '+setitem.raisePrice) :''
              }}
            </span>
            <span
              class="raisePrice memberPrice"
              v-show="isShowRaiseMemberPrice(item, setitem)">
              {{ setitem.raiseMemberPrice
                ? (setitem.isRaiseByQty && +setitem.num !== 1
                  ? '+ '+setitem.raiseMemberPrice+'x'+setitem.num
                  : '+ '+setitem.raiseMemberPrice)
                : '+ 0' }}
            </span>
          </p>
          <p class="pkgItemServeContent">
              <span v-if="setitem.serveWay" class="pkg-warp">
                {{setitem.serveWay ? $t('Dict.Notes01')+ setitem.serveWay.name : ''}}
              </span>
              <span
                v-if="setitem.methodList && setitem.methodList.length"
                class="pkg-warp">
                <template
                  v-for="(method, i) in setitem.methodList">
                  {{ (i === 0 && !setitem.serveWay ) ? $t('Dict.Notes01') : ' | ' }}
                  {{ method.name }}
                  {{ method.isNeedFee ?
                    '(+ '+ method.price + (method.qty && +method.qty !== 1 ? 'x'+ method.qty :
                    '') + ')' : ''
                  }}
                </template>
            </span>
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    realityIndex: {
      type: Number,
      required: true,
    },
    isShowOrdedItems: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      required: true,
      default: false,
    },
    isTeam: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    // 判断是否显示会员加价
    isShowRaiseMemberPrice(pkgData, pkgListData) {
      /**
       * pkgListData.raiseMemberPrice 可能为 null, 所以esLint改写时, 不能直接 +item === 0
       * ## +null === 0 // true
       * ## null == 0 // false
       */
      // pkgMainData 会员加价
      if (pkgData.raisePriceType == 2
        && (pkgListData.raiseMemberPrice || pkgListData.raiseMemberPrice == 0)
      ) {
        return true;
        // 这是普通加价
      }
      if (pkgData.raisePriceType != 2 && pkgListData.raisePric) {
        return false;
      }
    },
    goRedemption(item, index) {
      this.$emit('goRedemption', { ...item, index });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
@import "~@/components/Pos/Order/Bill/ListOrder.less";

.isShowOrdedItems {
  background-color: #F0F0F0;
}

.isShowOrdedItems.active {
  background-color: #CAE2E4;
  color: #0097a4;

  .b {
    em {
      background-color: #0097a4;
      color: #FFFFFF;
    }
  }
}
</style>
