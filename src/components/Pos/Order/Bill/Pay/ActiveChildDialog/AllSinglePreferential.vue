<template>
  <Dialog
      name="PosDialog.allSinglePreferential"
      :title="$t('Biz.Settlement.FullOffer')"
      ref="dialog"
      @close="onClose"
      @submit="onSubmit"
      @open="onOpen"
      :hotkeys="allSinglePreferential"
      :showSubmit="true"
      :append-to-body="true"
      width="610px"
      height="390px"
    >
    <div class="allSingle">
      <div class="allSingle-left">
        <div class="tip">*{{ $t('Biz.Settlement.Tip01') }}</div>
        <div>
          <form action="" v-keyboard:keyboard="{ mode: 'simple', autoSelect: true }">
            <div class="title">{{ $t('Biz.Settlement.OfferTo') }}</div>
            <input
              type="text"
              ref="allSingleInput"
              v-model="allSingleInputCount"
              v-judge v-autotest>
            <div class="perCent">%</div>
          </form>
        </div>
        <div class="allSingMsg">
          <ul>
            <li
              v-for="(item,key) in sale"
              :key="key"
              @click="changePrice(item)">
              <div>{{item}}{{ $t('Dict.Discount') }}</div>
            </li>
          </ul>
        </div>
      </div>
      <div class="allSingle-right">
        <KeyBoard ref="keyboard"></KeyBoard>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { isNaN } from 'lodash';
import { mapGetters, mapActions } from 'vuex';
import ajax from '@/common/js/ajax';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

export default {
  components: { Dialog, KeyBoard },
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
      allSingleInputCount: 100,
      sale: ['98', '95', '9', '88', '85', '8', '75', '7', '5'],
      baseBs: {}, // 流水数据
      isTeamSettlementFlg: 0, // 是否是团队结算
      isTeamBill: 0, // 是否是团队账单
    };
  },
  computed: {
    // 添加快捷键
    allSinglePreferential() {
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
  methods: {
    onOpen() {
      // "4": "全单优惠"
      const { discList } = this.resData.data;
      let resArray = [];
      if (discList) {
        resArray = discList && discList.filter(list => list.discType === 4);
        const [res] = resArray;
        if (discList && res && this.resData.discTypeId === res.discType) {
          this.allSingleInputCount = res.discScale * 100;
        } else {
          this.allSingleInputCount = 100;
        }
      }
      this.baseBs = this.resData.baseBs;
      this.isTeamSettlementFlg = this.resData.isTeamSettlementFlg;
      this.isTeamBill = this.resData.isTeamBill;
      this.$vonce('authCode', (code) => {
        this.onSubmit(code);
      });
      if (this.$refs.keyboard) {
        this.$refs.keyboard.reSelect();
      }
    },
    changePrice(item) {
      const scale = Number(item);
      if (scale < 10) {
        this.allSingleInputCount = scale * 10;
      } else {
        this.allSingleInputCount = item;
      }
    },
    onSubmit(authData = {}) {
      if (this.allSingleInputCount === ''
        || this.allSingleInputCount < 0
        || this.allSingleInputCount > 100
      ) {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning8')}`);
        return;
      }
      if (this.allSingleInputCount.toString().indexOf('.') !== -1) {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning2')}`);
        return;
      }
      if (isNaN(Number(this.allSingleInputCount))) {
        this.$message.warning(`${this.$t('Biz.Settlement.Warning10')}`);
        return;
      }
      let url = 'canyin.pos.settlement.scale';
      const params = {
        bsId: this.bsId,
        pointId: this.pointId,
        disctype: this.resData.discTypeId,
        discscale: this.allSingleInputCount,
        controlMode: this.posBaseInfo.controlMode,
        ...authData,
      };
      const { isTeamSettlementFlg, isTeamBill } = this;
      if (isTeamSettlementFlg === 1 && isTeamBill === 1) {
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
        this.allSingleInputCount = 100;
        if (data.success) {
          // 上传优惠类型到VueX
          this.setDiscTypeCache(params);
          this.submit();
          this.$message({
            message: `${this.$t('Biz.Settlement.Success1')}`,
            type: 'success',
          });
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
  .allSingle{
    width: 100%;
    height: 100%;
  }
  .allSingle-left{
    width: 325px;
    height: 100%;
    float: left;
    background: #fff;
    padding: 20px;
    .tip{
      font-size: 13px;
      color: #999;
      margin-bottom: 20px;
    }
    form{
      display: flex;
      .title{
        margin-top: 5px;
      }
      input{
        width: 205px;
        height: 35px;
        border: 1px solid #999;
        border-radius: 5px;
        text-align: right;
        padding: 5px;
      }
      .perCent{
        margin-top: 5px;
        margin-left: 5px;
      }
    }
    .allSingMsg{
      margin-top: 20px;
      ul{
        display: flex;
        flex-wrap: wrap;
        li{
          width: 85px;
          height: 50px;
          border: 1px solid #999;
          border-radius: 5px;
          margin-right: 10px;
          margin-bottom: 10px;
          position: relative;
          text-align: center;
          cursor:pointer;
          >div{
            width: 100%;
            padding: 5px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%);
            font-size: 16px;
          }
        }
        li:nth-child(3n+3) {
            margin-right: 0;
          }
      }
    }
  }
  .allSingle-right{
    width: 280px;
    height: 100%;
    float: right;
    padding: 40px 10px 10px 40px;
  }
  .lang-enUS{
    .allSingle-left form input{
      width: 185px;
    }
  }
</style>
