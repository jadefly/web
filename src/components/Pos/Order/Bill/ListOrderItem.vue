<template>
  <div class="a">
    <div class="b"><em>{{ index + 1 }}</em></div>
    <div class="c">
      <div class="itemMainMessage" :class="[{pkgItemClickClass: item.isPackage},{activePkg: activePkg == item}]" @click="changePkg(item)">
        <div class="d">
          <!-- 国际化：拼，临，赠，折，变，促，会，催，称，套 -->
          <h3>
            {{ item.exchangeId  ? `[${$t('Dict.Repurchase')}]` : '' }}
            {{ (item.mergeScId && item.busiType === 1) ? '['+$t('Biz.Order.SpellFoodText')+']' : '' }}
            {{
              item.fullGiftId
              ? `[${$t('Dict.Gift')}]`
              : ''
            }}
            {{ +item.itemType === 2 ? '['+$t('Dict.Temporary')+']' : '' }}
            {{ item.name }}
            {{ item.auxiliaryUnitId ? `(${item.auxiliaryUnitQty} ${item.auxiliaryUnitName})`: '' }}
          </h3>
          <div class="e">
            <em v-if="+item.discFlg === 1" class="give">{{$t('Dict.Gift')}}</em>
            <em v-if="item.scaleFlg" class="discount">{{$t('Dict.Discount')}}</em>
            <em v-if="+item.discFlg === 3" class="changed">{{$t('Dict.Change')}}</em>
            <em v-if="+item.discFlg === 4" class="promotion">{{$t('Dict.Promotion')}}</em>
            <em v-if="+item.discFlg === 5" class="vip">{{$t('Dict.Vip')}}</em>
            <em v-if="item.hastenTimes" class="hasten">{{$t('Dict.Hasten')}}</em>
            <!-- confirmWeighType 为称重未确认的标识 -->
            <em v-if="item.confirmWeighType == 1" class="give">{{$t('Dict.ConfirmWeigh')}}</em>
            <!-- confirmWeighType 为称重已确认的标识 -->
            <em v-if="item.confirmWeighType == 2" class="successConfirmWeigh">{{$t('Dict.ConfirmWeigh')}}</em>
            <em v-if="item.isPackage" class="package">{{$t('Dict.Package')}}</em>
          </div>
        </div>
        <div class="f">
          <div class="g">
            <!-- 国际化：单价： -->
            <span>{{$t('Dict.UnitPrice1')}}</span>
            <!-- 迫不得已才添加的 -->
            <span v-show="item.lastPrice != item.salePrice" style="font-size:12px;display:inline-block">{{ item.lastPrice }}</span>
            <!-- 最后改价不等于销售价 且 不是变价时显示（因为加单时变价不显示此原价(原销售价)） -->
            <del v-show="item.lastPrice != item.salePrice && item.discFlg != 3">{{ item.salePrice }}</del>
            <span v-show="item.lastPrice == item.salePrice">{{ item.lastPrice }}</span>
          </div>
          <div class="h">
            {{ item.lastQty }} {{ item.unitName }}
          </div>
          <!-- 国际化：小计： -->
          <div class="i">{{$t('Dict.Subtotal1') + item.lastSubtotal }}</div>
        </div>
      </div>
      <div class="j">
        <!-- 国际化：注： -->
        <span v-if="+item.serveWayId !== 0">{{$t('Dict.Notes01')+item.serveWayName}}</span>
        <span v-if="item.methodList && item.methodList.length">
          <template v-for="(method, i) in item.methodList">
            {{ (+i === 0 && +item.serveWayId === 0) ? $t('Dict.Notes01') : ' | ' }}
            {{ method.name }}{{ method.isNeedFee ? (method.qty && +method.qty !==1) ? '(+ '+ method.price +'X'+method.qty+')':'(+ '+ method.price +')' : '' }}
          </template>
        </span>
        <span v-if="!item.methodList && item.methodText">
          {{+item.serveWayId === 0 ? $t('Dict.Notes01') : ' | '}}{{item.methodText}}
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
            <span class="setmealitemnum">{{setitem.lastQty}}{{setitem.unitName}}</span>
            <!-- 加价的显示 -->
            <!-- raisePriceType 代表的是加价显示的类型 2 是会员加价,1 是普通加价-->
            <span
              class="raisePrice"
              v-show ="!setitem.raisePriceType || setitem.raisePriceType == 1" >
              {{ setitem.realRaisePrice > 0
              ? (!item.isNotFollowAmount ? '+ '+setitem.realRaisePrice*1000*item.lastQty/1000
              : '+ '+setitem.realRaisePrice) :'' }}
            </span>
            <span
              class="raisePrice memberPrice"
              v-show ="setitem.raisePriceType == 2" >
              {{ setitem.raiseMemberPrice
                ? (!item.isNotFollowAmount
                  ? '+ '+setitem.raiseMemberPrice*1000*item.lastQty/1000
                  : '+ '+setitem.raiseMemberPrice)
                : '+ 0' }}
            </span>
          </p>
          <p class="pkgItemServeContent bsIdPkgItemServeContent">
            <span v-if="setitem.serveWayId != '0'" class="pkg-warp">
              {{$t('Dict.Notes01')+setitem.serveWayName}}
            </span>
            <span
              v-if="setitem.methodList && setitem.methodList.length"
              class="pkg-warp">
              <template
                v-for="(method, i) in setitem.methodList">
                {{ (i == 0 && setitem.serveWayId == '0') ? $t('Dict.Notes01') : ' | ' }}
                {{ method.name }}
                {{ method.isNeedFee
                  ? (method.qty && method.qty !=1) ? '(+ '+ method.price +'X'+method.qty+')':'(+ '+ method.price +')'
                  : '' }}
              </template>
            </span>
            <span v-if="!setitem.methodList && setitem.methodText" class="pkg-warp">
              {{setitem.serveWayId == '0'? $t('Dict.Notes01') : ' | '}}{{setitem.methodText}}
            </span>
            <span class="methodPriceTotal">{{getPkgListMethodPriceTotla({setitem, item})}}</span>
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import {
  add, multi,
} from '@/common/js/math';

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
    activePkgData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      activePkg: this.activePkgData,
    };
  },
  methods: {
    // 客位账单修改套餐
    changePkg(item) {
      this.$emit('changePkg', item);
    },
    // 提交完的套餐每个明细的做法价格合计
    getPkgListMethodPriceTotla({ setitem, item }) {
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
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
@import "~@/components/Pos/Order/Bill/ListOrder.less";
</style>
