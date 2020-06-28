<template>
  <Dialog
    name="PosDialog.fullSubtraction"
    :title="fullMsg.name"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :hotkeys="fullSubtraction"
    :showSubmit="true"
    :append-to-body="true"
    width="640px"
    height="550px"
  >
    <div class="fullBox df">
      <div class="full-middle">
        <div class="full-middle-title">
          <div class="pull-left">{{ $t('Biz.Settlement.FullReductionItemS') }}{{ canItemPrice }}</div>
          <div
            class="pull-right"
            style="color: #ffbc66"
          >{{
            $t('Biz.Settlement.TotalDiscount')
            }}<!-- openType:当前使用满减的类型,(请求的接口和数据不同, 共计优惠金额不同) -->{{
              (openType === 'bill'
                ? totalFullOffMoney
                : discTotal) | keepTwo }}</div>
        </div>
        <div class="fullMiddleItemsBox">
          <ul class="full-middle-items" id="fullMiddleItems">
            <li
              v-for="(item, index) in canDiscountItemList"
              :key="index">
              <div class="textOverflow">{{ item.item_name }}</div>
              <div>{{ item.orig_subtotal | keepTwo }}</div>
            </li>
          </ul>
        </div>
        <div class="fullPager">
          <span>{{ $t('Dict.Altogether') }}{{ canDiscountItemList.length }}{{ $t('Dict.Strip') }}，</span>
          <Pager
            pagerId="fullMiddleItems"
            ref="fullpager"
            arrowDirection="up-down"
            :showInfo="true"
          ></Pager>
        </div>
      </div>
      <div class="full-middle full-border-right">
        <div class="full-middle-title">
          <div class="pull-left">{{ $t('Biz.Settlement.NoFullReductionItemS') }}{{ unCanItemPrice }}</div>
        </div>
        <div class="fullMiddleItemsBox">
          <ul class="full-middle-items full-li-border" id="fullRightItems">
            <li
              v-for="(item, index) in unCanDpItemsList"
              :key="index">
              <div class="textOverflow">{{ item.item_name }}</div>
              <div>{{ item.orig_subtotal | keepTwo }}</div>
            </li>
          </ul>
        </div>
        <div class="fullPager">
          <span>{{ $t('Dict.Altogether') }}{{ unCanDpItemsList.length }}{{ $t('Dict.Strip') }}，</span>
          <Pager pagerId="fullRightItems" ref="pager" arrowDirection="up-down" :showInfo="true"></Pager>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import ajax from '@/common/js/ajax';
import Pager from '@/components/Pos/Common/Pager';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import numberformat from "@/common/js/numberformat";

export default {
  components: { Dialog, Pager },
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
    currPayWayList: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      full: {
        name: '满减优惠',
        tip: '',
        startTime: '',
        endTime: '',
        itemMsg: '',
      },
      canDiscountItemList: [], // 可满减品项
      canItemPrice: 0, // 可满减品项总金额
      unCanDpItemsList: [], // 不可满减品项
      unCanItemPrice: 0, // 不可满减品项总金额
      discountPlan: {}, // 活动信息
      totalFullOffMoney: 0, // 满减优惠金额(账单)
      discTotal: 0, // 满减优惠金额(品项)
      baseBs: {}, // 流水数据
      isTeamSettlementFlg: 0, // 是否是团队结算
      isTeamBill: 0, // 是否是团队账单
      fullMsg: {}, // 满减信息
      openType: '' // 打开类型: 原满减(账单) || 新满减(品项)
    };
  },
  computed: {
    ...mapGetters(['posBaseInfo']),
    // 添加快捷键
    fullSubtraction() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  filters: {
    keepTwo(val) {
      if (isNaN(Number(val))) return val;
      return numberformat(val);
    }
  },
  methods: {
    onOpen() {
      // 解决不能翻页的问题
      this.$nextTick(() => {
        this.$refs.fullpager.refresh();
        this.$refs.pager.refresh();
      });
      const { data } = this.resData;
      this.openType = this.resData.openType;
      this.canDiscountItemList = data.canDiscountItemList;
      this.unCanDpItemsList = data.unCanDpItemsList;
      this.discountPlan = data.discountPlan;
      // 满减(账单)-优惠金额
      this.totalFullOffMoney = data.fullOffDisc.totalFullOffMoney;
      // 满减(品项)-优惠金额
      this.discTotal = data.fullOffDisc.discTotal;
      this.fullMsg = data.fullOffDisc;
      for (let i = 0, len = this.canDiscountItemList.length; i < len; i += 1) {
        this.canItemPrice += this.canDiscountItemList[i].orig_subtotal;
      }
      this.canItemPrice = Number(this.canItemPrice).toFixed(2);
      for (let j = 0, len2 = this.unCanDpItemsList.length; j < len2; j += 1) {
        this.unCanItemPrice += this.unCanDpItemsList[j].orig_subtotal;
      }
      this.unCanItemPrice = Number(this.unCanItemPrice).toFixed(2);
      this.baseBs = this.resData.baseBs;
      this.isTeamSettlementFlg = this.resData.isTeamSettlementFlg;
      this.isTeamBill = this.resData.isTeamBill;
      this.$vonce('authCode', (code) => {
        this.onSubmit(code);
      });
    },
    // 清空数据缓存
    zero() {
      this.canItemPrice = 0;
      this.unCanItemPrice = 0;
    },
    onClose() {
      this.close();
      this.zero();
    },
    onSubmit(authData = {}) {
      let url = '';
      const params = {
        bsId: this.bsId,
        pointId: this.pointId,
        disctype: this.resData.discTypeId,
        money: this.totalFullOffMoney,
        foId: this.resData.fullId,
        planid: this.resData.discountId,
        controlMode: this.posBaseInfo.controlMode,
        ...authData
      };
      const { isTeamSettlementFlg, isTeamBill } = this;
      // 如果是满减(品项)
      if (this.openType === 'item') {
        url = 'canyin.pos.settlement.scale';
        // 当前暂不支持团队满减, 团队时看不到满减(品项)的按钮
        if (+isTeamSettlementFlg === 1 && +isTeamBill === 1) {
          params.teamPointIds = this.baseBs.teamPointIds;
          params.teamBsIds = this.baseBs.teamBsIds;
          url = 'canyin.pos.settlement.teamscale';
        }
        // "先付后折"业务-查询参数
        // 存在结算方式 && 所有结算方式均为折现率类型 => 执行获取参数,进行"先付后折"预扣优惠计算
        // ## 执行"先付后折"后, 在执行的所有折扣,均传结算方式参数
        const uesdPayWay = this.currPayWayList.filter(item => item.type === 2);
        const uesdTicketPayWay = this.currPayWayList.filter(
          item => item.type === 2 && item.isUseTicketFirst,
        );
        if (uesdPayWay.length
          && (uesdPayWay.length === uesdTicketPayWay.length)
        ) {
          this.$emit('getPayThenDiscParams', (data) => {
            params.bizSettlementParams = data;
          });
        }
      }
      // 如果是满减(账单): 账单满减方案不存在""先付后折"场景
      if (this.openType === 'bill') {
        url = 'canyin.pos.settlement.fiexd';
        if (isTeamSettlementFlg === 1 && isTeamBill === 1) {
          params.teamPointIds = this.baseBs.teamPointIds;
          params.teamBsIds = this.baseBs.teamBsIds;
          url = 'canyin.pos.settlement.teamfiexd';
        }
      }
      ajax(url, {
        contentType: 'paramsEncoded',
        data: params,
      }).then((data) => {
          if (data.success) {
            // 上传优惠类型到VueX
            this.setDiscTypeCache(params);
            this.submit();
            this.$message.success(`${this.$t('Biz.Settlement.Success4')}`);
            this.close();
            this.zero();
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
    ...mapActions(['setSettleDiscType']),
  }
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.p15 {
  padding: 15px;
}
.mb15 {
  margin-bottom: 15px;
}
.df {
  display: flex;
}
.fc9 {
  color: #999;
}
.fullBox {
  width: 100%;
  height: 100%;
}
.full-left {
  width: 285px;
  height: 100%;
  .full-left-title {
    font-size: 16px;
    font-weight: bold;
  }
  .full-left-tip {
    color: #999;
    margin-bottom: 20px;
  }
}
.full-border-right {
  border-right: none !important;
}
.full-middle {
  width: 320px;
  background: #fff;
  border-right: 1px solid #999;
  position: relative;
  .full-middle-title {
    font-size: 15px;
    font-weight: bold;
    height: 40px;
    padding: 10px 15px;
    position: absolute;
    width: 100%;
  }
  .fullMiddleItemsBox {
    padding-top: 40px;
    padding-bottom: 50px;
    height: 100%;
    overflow: hidden;
  }
  .full-middle-items {
    padding: 0 15px;
    height: 385px !important;
    overflow: hidden;
    li {
      border: 1px solid rgb(255, 188, 102);
      border-radius: 5px;
      height: 45px;
      display: flex;
      justify-content: space-between;
      padding: 10px;
      margin-bottom: 10px;
    }
  }
  .full-li-border {
    li {
      border: 1px solid #999 !important;
    }
  }
}
.fullPager {
  height: 50px;
  position: absolute;
  bottom: 0;
  width: 100%;
  padding-right: 15px;
  text-align: right;
  span {
    color: #999;
    font-size: 12px;
  }
  .pos-pager {
    display: inline-block;
  }
}
.textOverflow {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lang-enUS {
  .full-middle .full-middle-title {
    font-size: 12px;
    line-height: 35px;
    padding: 5px 15px;
  }
  .full-middle .fullMiddleItemsBox {
    padding-top: 100px;
    padding-bottom: 85px;
  }
  .full-middle .full-middle-items {
    height: 330px !important;
  }
  .pull-right {
    float: left !important;
  }
}
</style>
