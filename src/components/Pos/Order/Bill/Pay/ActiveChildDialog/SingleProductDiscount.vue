<template>
  <Dialog
      name="PosDialog.SingleProductDiscount"
      :title="$t('Biz.Settlement.SingleProductDiscount')"
      ref="dialog"
      @close="onClose"
      @open="onOpen"
      @submit="onSubmit"
      :hotkeys="SingleProductDiscount"
      :showSubmit="true"
      :append-to-body="true"
      width="940px"
      height="570px"
    >
    <div class="singleProduct">
      <div class="singleProduct-left">
        <div class="tip">*{{$t('Biz.Settlement.Tip2')}}</div>
        <div class="singleProductitems">
          <ul class="title">
            <li class="title-name">{{$t('Dict.Item')}}</li>|
            <li class="title-price">{{$t('Dict.UnitPrice')}}</li>|
            <li class="title-count">{{$t('Dict.Amount')}}</li>|
            <li class="title-practice">{{$t('Biz.Order.PkgListRaisePrice')}}</li>|
            <li class="title-practice">{{$t('Biz.Order.MethodPrice')}}</li>|
            <li class="title-subtotal">{{$t('Dict.Subtotal')}}</li>|
            <li class="title-discount">{{$t('Biz.Settlement.DiscRatio')}}</li>|
            <li class="title-afterFolding">{{$t('Biz.Settlement.DiscSubtotal')}}</li>
          </ul>
          <form action=""
            v-if="isOpen"
            v-keyboard:keyboard="{ mode: 'simple', autoSelect: true }">
            <div class="itemsMassage">
              <ul id="singleProductPagerId">
                <li v-for="(item, index) in items" :key="index">
                  <div class="itemsMassage-name">
                    <div>{{item.item_code}}</div>
                    <div class="textOverflow">{{item.item_name}}</div>
                  </div>
                  <div class="equation">
                    <span>(</span>
                    <span style="width: 45px;">{{item.last_price}}</span>
                    <span>x</span>
                    <span style="width: 30px; text-align: center;">{{item.last_qty}}</span>
                    <span>)</span>
                    <span style="width: 12px; text-align: center;">+</span>
                    <!-- 联动套餐的明细加价之和:pkgRaisePriceTotal, 品项/不联动套餐的明细加价之和,则显示为:pkgRaisePrice -->
                    <span style="width: 54px;">￥{{ item.hasOwnProperty('pkgRaisePriceTotal')
                      ? item.pkgRaisePriceTotal
                      : item.pkgRaisePrice }}</span>
                    <span style="width: 12px; text-align: center;">+</span>
                    <span style="width: 54px;">￥{{item.last_make_fee}}</span>
                    <span style="width: 11px;">=</span>
                    <span style="width: 50px;">￥{{item.temp_last_subtotal}}</span>
                    <span style="width: 11px; text-align: center;">x</span>
                    <input
                      v-judge
                      type="text"
                      v-on:input="discount"
                      :class="'test'+index"
                      v-model="item.disc_scale"
                      maxlength="5">
                    <span>%</span>
                    <span>=</span>
                    <input
                      type="text"
                      :class="'lastPrice'+index"
                      v-on:input="lastPrice"
                      v-model.lazy="item.last_subtotal"
                      maxlength="5"
                      v-judge
                      v-autotest>
                  </div>
                </li>
              </ul>
            </div>
          </form>
          <div class="singleProductPager">
            <span>{{ $t('Dict.Altogether') }}{{items.length}}{{ $t('Dict.Strip') }}，</span>
            <Pager
              pagerId="singleProductPagerId"
              ref="pager"
              arrowDirection="up-down"
              :showInfo="true">
            </Pager>
          </div>
        </div>
      </div>
      <div class="singleProduct-right">
        <KeyBoard class="keyboard" ref="keyboard"></KeyBoard>
      </div>
    </div>
  </Dialog>
</template>

<script>
import ajax from '@/common/js/ajax';
import Pager from '@/components/Pos/Common/Pager';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import { mapGetters, mapActions } from 'vuex';
import { multi } from '@/common/js/math';
import { isNaN } from 'lodash';

export default {
  components: { Dialog, KeyBoard, Pager },
  mixins: [DialogMixin],
  props: {
    bsId: {
      type: String,
      default: '',
    },
    pointId: {
      type: String,
      default: '',
    },
  },
  computed: {
    // 添加快捷键
    SingleProductDiscount() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
    ...mapGetters([
      'posBaseInfo',
    ]),
  },
  data() {
    return {
      items: [],
      baseBs: {}, // 流水数据
      isTeamSettlementFlg: 0, // 是否是团队结算
      isTeamBill: 0, // 是否是团队账单
      isOpen: false, // 解决关闭打开后input不动聚焦
    };
  },
  methods: {
    onOpen() {
      this.$nextTick(() => {
        this.isOpen = true;
        this.$refs.pager.refresh();
      });
      const itemsTemp = this.resData.data.bsItems;
      const itemsResult = [];
      const itemsTemparray = Object.values(itemsTemp);
      itemsTemparray.forEach((item) => {
        // 过滤掉不可以打折的品项
        if (item.is_can_discount !== undefined
          && (item.is_can_discount === true || item.is_can_discount === 'true')
        ) {
          // eslint-disable-next-line no-param-reassign
          item.disc_scale = multi(item.disc_scale, 100);
          itemsResult.push(item);
        }
      });
      // for (const i in itemsTemp) {
      //   // 过滤掉不可以打折的品项
      //   if (itemsTemp[i].is_can_discount != undefined
      //     && (itemsTemp[i].is_can_discount == true || itemsTemp[i].is_can_discount == 'true')) {
      //     itemsTemp[i].disc_scale *= 100;
      //     itemsResult.push(itemsTemp[i]);
      //   }
      // }
      this.items = itemsResult;
      this.baseBs = this.resData.baseBs;
      this.isTeamSettlementFlg = this.resData.isTeamSettlementFlg;
      this.isTeamBill = this.resData.isTeamBill;
      this.$vonce('authCode', (data) => {
        this.onSubmit(data);
      });
    },
    onClose() {
      this.isOpen = false;
    },
    discount(e) {
      const discScale = e.target.value; // 折
      const index = e.target.className.slice(4); // 下标
      const tempPrice = discScale / 100 * this.items[index].temp_last_subtotal;
      this.items[index].last_subtotal = tempPrice.toFixed(2);
      this.items[index].disc_scale = discScale;
    },
    lastPrice(e) {
      const lastSubtotal = e.target.value; // 最后价格
      const index = e.target.className.slice(9); // 下标
      const tempScale = lastSubtotal / this.items[index].temp_last_subtotal * 100;
      this.items[index].disc_scale = tempScale.toFixed(2).toString();
      this.items[index].last_subtotal = lastSubtotal;
    },
    onSubmit(authData = {}) {
      const lastItem = [];
      for (let i = 0, len = this.items.length; i < len; i += 1) {
        if (this.items[i].disc_scale === ''
          || this.items[i].disc_scale < 0
          || this.items[i].disc_scale > 100
        ) {
          this.$message.warning(`${this.$t('Biz.Settlement.Warning8')}`);
          return;
        }
        if (isNaN(Number(this.items[i].disc_scale))) {
          this.$message.warning(`${this.$t('Biz.Settlement.Warning10')}`);
          return;
        }
        // if (this.items[i].disc_scale.toString().indexOf('.') !== -1) {
        //   this.$message.warning('折扣比例不可为小数');
        //   return;
        // }
        lastItem.push({
          scId: this.items[i].id,
          scale: this.items[i].disc_scale,
          lastSubtotal: this.items[i].last_subtotal,
        });
      }
      let url = 'canyin.pos.settlement.scale';
      const params = {
        bsId: this.bsId,
        pointId: this.pointId,
        disctype: this.resData.discTypeId,
        items: lastItem,
        controlMode: this.posBaseInfo.controlMode,
        ...authData,
      };
      const { isTeamSettlementFlg, isTeamBill } = this;
      if (isTeamSettlementFlg === 1 && isTeamBill === 1) {
        params.teamPointIds = this.baseBs.teamPointIds;
        params.teamBsIds = this.baseBs.teamBsIds;
        url = 'canyin.pos.settlement.teamscale';
      }
      ajax(url, {
        contentType: 'paramsEncoded',
        data: params,
      }).then((data) => {
        if (data.success) {
          // 上传优惠类型到VueX
          this.setDiscTypeCache(params);
          this.submit();
          this.$message.success(`${this.$t('Biz.Settlement.Success5')}`);
          this.close();
        } else {
          this.$message({
            message: data.msg,
            type: 'warning',
          });
        }
      }).catch((msgCode, msg) => {
        this.$message({
          message: msg,
          type: 'warning',
        });
      });
    },
    // 上传优惠类型到Vuex
    setDiscTypeCache(data) {
      this.setSettleDiscType({ list: data });
    },
    ...mapActions([
      'setSettleDiscType',
    ]),
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .singleProduct{
    width: 100%;
    height: 100%;
  }
  .singleProduct-left{
    width: 690px;
    height: 100%;
    float: left;
    background: #fff;
    padding: 15px 20px;
    .tip{
      font-size: 13px;
      color: #999;
      margin-bottom: 10px;
    }
    .singleProductitems{
      .title{
        display: flex;
        background: #7bcad6;
        color: #fff;
        padding-left: 10px;
        li{
          margin-left: 5px;
        }
        .title-name{
          width: 110px;
        }
        .title-price{
          width: 50px;
        }
        .title-count{
          width: 50px;
        }
        .title-practice{
          width: 65px;
        }
        .title-subtotal{
          width: 60px;
        }
        .title-discount{
          width: 80px;
        }
        .title-afterFolding{
          width: 65px;
        }
      }
      .itemsMassage{
        height: 380px;
        overflow: hidden;
        ul{
          height: 371px !important;
          overflow: hidden;
          li{
            display: flex;
            height: 53px;
            padding:10px 15px;
            border-bottom: 1px solid #999;
            input{
              width: 54px;
              height: 30px;
              border: 1px solid #999;
              border-radius: 5px;
              text-align: center;
            }
            .itemsMassage-name{
              width: 105px;
              line-height: 15px;
            }
          }
        }
      }
    }
  }
  .equation{
    span{
      display: inline-block;
    }
  }
  .singleProduct-right{
    width: 244px;
    height: 100%;
    float: right;
    padding: 100px 0;
    .keyboard {
      margin: auto;
    }
  }
  .singleProductPager{
    height: 50px;
    width: 100%;
    padding-top: 8px;
    text-align: right;
    span{
      color: #999;
      font-size: 12px;
    }
    .pos-pager{
      display: inline-block;
    }
  }
  .textOverflow{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
