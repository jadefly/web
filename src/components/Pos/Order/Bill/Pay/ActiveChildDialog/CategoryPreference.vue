<template>
  <Dialog
      name="PosDialog.CategoryPreference"
      :title="$t('Biz.Settlement.CategoryOffer')"
      ref="dialog"
      @open="onOpen"
      @close="onClose"
      @submit="onSubmit"
      :hotkeys="CategoryPreference"
      :showSubmit="true"
      :append-to-body="true"
      width="630px"
      height="575px"
    >
    <div class="category">
      <div class="category-left">
        <div class="tip">*{{ $t('Biz.Settlement.Tip2') }}</div>
        <div class="categoryitems">
          <ul class="title">
            <li class="title-name">{{ $t('Dict.SmallClass') }}</li>|
            <li class="title-discount">{{ $t('Biz.Settlement.ProportionalDiscount') }}</li>
          </ul>
          <form action=""
            v-if="isOpen"
            v-keyboard:keyboard="{ mode: 'simple', /*mode: 'normal',*/ autoSelect: true }" >
            <div class="itemsMassage">
              <ul id="itemsMassageList">
                <li
                  v-for="(item, index) in testSmallClasses"
                  :key="index"
                >
                  <div class="smallClassesName textOverflow">
                    {{item.small_class_code}}{{item.small_class_name}}
                  </div>
                  <div class="discount">
                    <input
                      type="text"
                      v-judge
                      :id="'category'+index"
                      v-model="item.small_class_scale"
                      v-on:input="changeCategory"
                    />
                    <span>%</span>
                  </div>
                </li>
              </ul>
            </div>
          </form>
          <div class="categoryPager">
            <span>{{ $t('Dict.Altogether')}}{{testSmallClasses.length}}{{ $t('Dict.Strip')}}，</span>
            <Pager
              pagerId="itemsMassageList"
              ref="pager"
              arrowDirection="up-down"
              :showInfo="true">
            </Pager>
          </div>
        </div>
      </div>
      <div class="category-right">
        <KeyBoard class="keybord" ref="keyboard"></KeyBoard>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { find, isNaN, cloneDeep } from 'lodash';
import { mapGetters, mapActions } from 'vuex';
import ajax from '@/common/js/ajax';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';

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
    currPayWayList: {
      type: Array,
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
      itemsList: {}, // 小类
      testSmallClasses: [],
      baseBs: {}, // 流水数据
      isTeamSettlementFlg: 0, // 是否是团队结算
      isTeamBill: 0, // 是否是团队账单
      isOpen: false, // 解决关闭打开后input不动聚焦
    };
  },
  computed: {
    // 添加快捷键
    CategoryPreference() {
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
      this.$nextTick(() => {
        this.isOpen = true;
      });
      // 5: '类别优惠'
      this.testSmallClasses = cloneDeep(this.resData.data.smallType);
      for (let i = 0, len = this.testSmallClasses.length; i < len; i += 1) {
        this.testSmallClasses[i].small_class_scale = this.testSmallClasses[i].small_class_scale
          ? this.testSmallClasses[i].small_class_scale * 100
          : this.testSmallClasses[i].small_class_scale = 100;
      }
      this.baseBs = this.resData.baseBs;
      this.isTeamSettlementFlg = this.resData.isTeamSettlementFlg;
      this.isTeamBill = this.resData.isTeamBill;
      setTimeout(() => {
        this.$refs.pager.refresh();
      }, 0);
    },
    onClose() {
      this.isOpen = false;
    },
    changeCategory(e) {
      this.testSmallClasses.small_class_scale = e.target.value;
    },
    onSubmit(authData = {}) {
      const types = [];
      const list = this.testSmallClasses;
      for (let i = 0, len = this.testSmallClasses.length; i < len; i += 1) {
        if (list[i].small_class_scale === ''
          || list[i].small_class_scale < 0
          || list[i].small_class_scale > 100
        ) {
          this.$message.warning(`${this.$t('Biz.Settlement.Warning8')}`);
          return;
        }
        if (isNaN(Number(list[i].small_class_scale))) {
          this.$message.warning(`${this.$t('Biz.Settlement.Warning10')}`);
          return;
        }
        if (list[i].small_class_scale.toString().indexOf('.') !== -1) {
          this.$message.warning(`${this.$t('Biz.Settlement.Warning2')}`);
          return;
        }
        types.push({ stId: list[i].small_class_id, scale: list[i].small_class_scale });
      }
      this.$vonce('authCode', (code) => {
        this.onSubmit(code);
      });
      let url = 'canyin.pos.settlement.scale';
      const params = {
        bsId: this.bsId,
        pointId: this.pointId,
        disctype: this.resData.discTypeId,
        types,
        controlMode: this.posBaseInfo.controlMode,
        ...authData,
      };
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
          this.$message.success(`${this.$t('Biz.Settlement.Success2')}`);
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
  .category{
    width: 100%;
    height: 100%;
  }
  .category-left{
    width: 374px;
    height: 100%;
    float: left;
    background: #fff;
    padding: 15px 20px;
    .tip{
      font-size: 13px;
      color: #999;
      margin-bottom: 10px;
    }
    .categoryitems{
      .title{
        display: flex;
        background: #7bcad6;
        color: #fff;
        padding-left: 10px;
        li{
          margin-left: 5px;
        }
        .title-name{
          width: 170px;
        }
        .title-discount{
          width: 110px;
        }
      }
      .itemsMassage{
        height: 371px;
        overflow: hidden;
        ul{
          height: 371px !important;
          overflow: hidden;
          li{
            display: flex;
            height: 53px;
            padding:10px 15px;
            padding-right: 0;
            border-bottom: 1px solid #999;
            font-weight: bold;
            input{
              width: 85px;
              height: 34px;
              border-radius: 5px;
              border: 1px solid #999;
              text-align: right;
              padding: 5px;
            }
            .smallClassesName{
              width: 170px;
              height: 34px;
              line-height: 34px;
            }
            .discount{
              padding-left: 10px;
              width: 120px;
            }
          }
        }
      }
    }
  }
  .category-right{
    width: 246px;
    height: 100%;
    float: right;
    padding: 100px 0px;
    .keybord {
      margin: auto;
    }
  }
  .categoryPager{
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
  .lang-enUS {
    .category-left .categoryitems .title .title-discount {
      width: 180px;
    }
    .category-left .categoryitems .itemsMassage ul li .smallClassesName {
      width: 155px;
    }
  }
</style>
