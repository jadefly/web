<template>
  <Dialog
      name="PosDialog.discount"
      :title="discountPlan.name"
      ref="dialog"
      @close="onClose"
      @open="onOpen"
      @submit="onSubmit"
      :hotkeys="discountHotKey"
      :showSubmit="true"
      :append-to-body="true"
      width="660px"
      height="550px"
      :submitId="'discountPlan' + discountPlan.id"
    >
    <div class="discountBox df">
      <div class="discount-middle">
        <div class="discount-middle-title">
          <div class="pull-left">{{ $t('Biz.Settlement.AllowDiscount') }}{{ canItemsPrice }}</div>
          <div
            class="pull-right"
            style="color: #ffbc66"
            v-if="currDiscState">
            <!-- 当账单设置"折上折"&&修改状态时,不显示 -->
            {{ $t('Biz.Settlement.TotalDiscount') }}{{ discountAmount }}</div>
        </div>
        <div class="middleItemsBox">
          <ul class="discount-middle-items" id="discountMiddleItems">
            <li
              v-for="(item, index) in canDiscountItemList"
              :key="index">
              <div class="textOverflow" style="width: 125px">
                {{item.item_name}}
              </div>
              <div>
                <!-- 当账单设置"折上折"&&修改状态时,显示后台"折后价",否则显示计算后的折后价 -->
                <template>
                  <span
                    v-if="!currDiscState">
                    ￥{{ item.last_subtotal }}</span>
                  <span
                    v-else>
                    ￥{{ item.lastDiscountPrice }}</span>
                </template>
                <!-- 当账单设置"折上折"&&修改状态时,不显示 -->
                <span
                  style="text-decoration:line-through; color: #999; font-size: 12px;"
                  v-if="currDiscState">
                  ￥{{item.PreDiscountPrice}}
                </span>
              </div>
            </li>
          </ul>
        </div>
        <div class="discountPager">
          <span>{{$t('Dict.Altogether')}}{{canDiscountItemList.length}}{{$t('Dict.Strip')}}，</span>
          <Pager
            pagerId="discountMiddleItems"
            ref="dispager"
            arrowDirection="up-down"
            :showInfo="true">
          </Pager>
        </div>
      </div>
      <div class="discount-middle discount-border-right">
        <div class="discount-middle-title">
          <div class="pull-left">{{ $t('Biz.Settlement.NotDiscountItems') }}{{unCanItemsPrice}}</div>
        </div>
        <div class="middleItemsBox">
          <ul class="discount-middle-items discount-li-border" id="discountRightItems">
            <li v-for="(item, index) in unCanDpItemsList" :key="index">
              <div class="textOverflow">{{item.item_name}}</div>
              <div>{{item.last_subtotal}}</div>
            </li>
          </ul>
        </div>
        <div class="discountPager">
          <span>{{$t('Dict.Altogether')}}{{unCanDpItemsList.length}}{{$t('Dict.Strip')}}，</span>
          <Pager
            pagerId="discountRightItems"
            ref="pager"
            arrowDirection="up-down"
            :showInfo="true">
          </Pager>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import ajax from '@/common/js/ajax';
import Pager from '@/components/Pos/Common/Pager';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import { multi, add } from '@/common/js/math';
// import { find } from 'lodash';

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
    currDiscRule: {
      type: Number,
      default: 1,
    },
    currPayWayList: {
      type: Array,
      // default: [],
      default() {
        return [];
      },
    },
    payThenDiscountFlg: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      discount: {
        name: '端午节全场8折',
        tip: '每年农历五月初五为端午节，又称端阳节、五月节、五日节，是中国传统节日。在春秋之前端午节是祛病防疫的节日。',
        startTime: '2018.05.05',
        endTime: '2018.06.05',
        itemMsg: '禁止打折的品相对打折方案无效',
      },
      canDiscountItemList: [], // 能打折品项
      unCanDpItemsList: [], // 不能打折品项
      discountPlan: {}, // 活动信息
      canItemsPrice: 0, // 被打折品项总金额
      unCanItemsPrice: 0, // 未打折品项总金额
      discountAmount: 0, // 优惠总金额
      baseBs: {}, // 流水数据
      isTeamSettlementFlg: 0, // 是否是团队结算
      isTeamBill: 0, // 是否是团队账单
      // 当前打开打折方案页面是新建(0)还是修改(1)
      useType: 0,
      // 当前品项的应收金额,取字段'last_subtotal'或是'origSubTotal'
      currentSubToalStr: 'last_subtotal',
      // 当前账单"折上折"&&修改状态时,页面显示功能开关
      currDiscState: true,
    };
  },
  computed: {
    ...mapGetters([
      // 'posInfo',
      'posBaseInfo',
      // 'posOrderBill',
      // 'getFastFoodBillData',
    ]),
    discountHotKey() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  methods: {
    onOpen() {
      this.$nextTick(() => {
        this.$refs.dispager.refresh();
        this.$refs.pager.refresh();
      });
      this.zero();
      const { data } = this.resData;
      // 记录打开状态(新建||修改)
      this.useType = data.useType;
      // console.log(this.currDiscRule, this.useType);
      // 当账单设置"折上折"&&修改状态时,不显示
      if (this.currDiscRule === 2 && this.useType === 1) {
        this.currDiscState = false;
      }
      // 该账单属性"先到先得",使用应收(原价)-origSubTotal显示或计算逻辑
      // ## 否则 "折上折",使用折后价-last_subTotal显示或计算逻辑
      if (this.currDiscRule == 1) {
        this.currentSubToalStr = 'origSubTotal';
      }
      // 被打折品项
      const discountList = data.canDiscountItemList;
      // 未被打折品项
      this.unCanDpItemsList = data.unCanDpItemsList;
      // 打折信息
      this.discountPlan = data.discountPlan;
      //  被打折品项
      discountList.forEach((item) => {
        // this.canItemsPrice += item.last_subtotal;
        this.canItemsPrice += item[this.currentSubToalStr];
        let lastDiscountPrice;
        // 比例类打折
        if (item.dis_type === 1) {
          // 比例优惠是划横线的显示小计
          // item.PreDiscountPrice = item.last_subtotal;
          // eslint-disable-next-line no-param-reassign
          item.PreDiscountPrice = item[this.currentSubToalStr];
          // 折后价格
          lastDiscountPrice = multi(
            // item.last_subtotal,
            item[this.currentSubToalStr],
            item.dis_scale,
          );
        } else {
        // 定额类打折
          // 定额优惠是划横线的显示菜品单价乘以数量
          // eslint-disable-next-line no-param-reassign
          item.PreDiscountPrice = add(
            multi(item.sale_price, item.last_qty),
            0,
          );
          lastDiscountPrice = multi(
            item.dis_price,
            item.last_qty,
          );
        }
        // 累加最后的金额
        this.discountAmount += (item.PreDiscountPrice - lastDiscountPrice);
        // eslint-disable-next-line no-param-reassign
        item.lastDiscountPrice = Number(lastDiscountPrice).toFixed(2);
      });

      // 处理显示数值的精度
      this.canItemsPrice = Number(this.canItemsPrice).toFixed(2);
      this.discountAmount = Number(this.discountAmount).toFixed(2);
      this.canDiscountItemList = discountList;

      // 未被打折品项
      this.unCanDpItemsList.forEach((item) => {
        this.unCanItemsPrice += item.last_subtotal;
      });

      this.unCanItemsPrice = Number(this.unCanItemsPrice).toFixed(2);
      this.baseBs = this.resData.baseBs;
      this.isTeamSettlementFlg = this.resData.isTeamSettlementFlg;
      this.isTeamBill = this.resData.isTeamBill;

      this.$vonce('authCode', (code) => {
        this.onSubmit(code);
      });
      this.$nextTick(() => {
        this.$refs.dispager.refresh();
        this.$refs.pager.refresh();
      });
    },
    zero() { // 清空数据缓存
      this.canItemsPrice = 0;
      this.unCanItemsPrice = 0;
      this.discountAmount = 0;
      this.canDiscountItemList = [];
      this.unCanDpItemsList = [];
      this.discountPlan = {};
      this.currDiscState = true;
    },
    onClose() {
      this.close();
      this.zero();
    },
    onSubmit(authData = {}) {
      const params = {
        bsId: this.bsId,
        pointId: this.pointId,
        disctype: this.resData.discTypeId,
        planid: this.resData.discountId,
        controlMode: this.posBaseInfo.controlMode,
        ...authData,
      };
      let url = 'canyin.pos.settlement.scale';
      const { isTeamSettlementFlg, isTeamBill } = this;
      if (+isTeamSettlementFlg === 1 && +isTeamBill === 1) {
        params.teamPointIds = this.baseBs.teamPointIds;
        params.teamBsIds = this.baseBs.teamBsIds;
        url = 'canyin.pos.settlement.teamscale';
      }
      // "先付后折"业务-查询参数
      // 存在结算方式 && 所有结算方式均为折现率类型 => 执行获取参数,进行"先付后折"预扣优惠计算
      // ## 执行"先付后折"后, 在执行的所有折扣,均传结算方式参数
      // ## 预扣状态 - this.payThenDiscountFlg
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
      ajax(url, {
        contentType: 'paramsEncoded',
        data: params,
      }).then((data) => {
        if (data.success) {
          // 上传优惠类型到VueX
          this.setDiscTypeCache(params);
          this.submit();
          this.$message.success(`${this.$t('Biz.Settlement.Success3')}`);
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
        // 判断类型为失效,才执行更新折扣方案数据和关闭当前页面
        if (msgCode === '2') {
          this.close();
          this.$vemit('reGetDiscPlanAndPayWayBUS');
        }
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
  .p15{
    padding:15px;
  }
  .mb15{
    margin-bottom: 15px;
  }
  .df{
    display: flex;
  }
  .fc9{
    color: #999;
  }
  .discountBox{
    width: 100%;
    height: 100%;
  }
  .discount-left{
    width: 285px;
    height: 100%;
    .discount-left-title{
      font-size: 16px;
      font-weight: bold;
    }
    .discount-left-tip{
      color: #999;
      margin-bottom: 20px;
    }
  }
  .discount-border-right{
    border-right: none !important;
  }
  .discount-middle{
    width: 330px;
    background: #fff;
    border-right: 1px solid #999;
    position: relative;
    .discount-middle-title{
      font-size: 15px;
      font-weight: bold;
      height: 40px;
      line-height: 40px;
      padding: 0 15px;
      position: absolute;
      width: 100%;
      .pull-right-discount{
        float: right;
      }
    }
    .middleItemsBox{
      padding-top: 42px;
      padding-bottom: 50px;
      height: 100%;
      overflow: hidden;
    }
    .discount-middle-items{
      padding: 0 15px;
      height: 385px !important;
      overflow: hidden;
      li{
        border: 1px solid rgb(255, 188, 102);
        border-radius: 5px;
        height: 45px;
        display: flex;
        justify-content: space-between;
        padding: 10px;
        margin-bottom: 10px;
      }
    }
    .discount-li-border{
      li{
        border: 1px solid #999 !important;
      }
    }
  }
  .discountPager{
    height: 50px;
    position: absolute;
    bottom: 0;
    width: 100%;
    padding-right: 15px;
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
  .lang-enUS{
    .discount-middle .discount-middle-title .pull-right-discount{
      float: left;
    }
    .middleItemsBox{
      padding-top:80px;
      padding-bottom: 85px;
    }
    .discount-middle .discount-middle-items{
      height: 330px !important
    }
    .discount-middle .discount-middle-title[data-v-9daa7076] {
      line-height: 30px;
      padding: 10px 15px;
    }
  }
</style>
