<template>
  <Dialog
    name="PosDialog.DesignatesList"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    width="970px"
    height="670px"
    top="6vh"
    :hotkeys="submitHotKey"
  >
    <div slot="title" class="pos-dialog-header">
      <!-- 提示 挂单列表 -->
      <h3 class="pos-dialog-title">{{ $t('Biz.Order.DesignatesList') }}</h3>
      <div class="pos-dialog-control">
        <button type="button" class="btn btn-default" @click="close">{{ $t('Dict.Close') }}<span>(Esc)</span></button>
        <!-- 提示 - 取消挂单 -->
        <button type="button" id="designatesListCancel" class="btn btn-default" @click="cancel()" v-autotest>{{ $t('Biz.Order.CancelTheList') }}<span>(F1)</span></button>
        <!-- 全部取消 -->
        <button type="button" id="designatesListCancelAll" class="btn btn-default" @click="cancel('all')" v-autotest>{{ $t('Biz.Order.CancelAll') }}<span>(F2)</span></button>
        <!-- 提示--读取挂单 -->
        <button type="button" id="designatesListSubmit" class="btn btn-primary"
          @click="submit({designatesBsId, designatesPonitId})" v-autotest>
          {{ $t('Dict.Btn.ReadDesignatesList') }}<span>(PgDn)</span>
        </button>
      </div>
    </div>
    <div class="pos-dialog-content pos-designates-list-wrapper">
      <!-- 左侧列表 -->
      <div class="left-info-wrapper">
        <!-- 头部 -->
        <div class="designates-header">
          <!-- 营业流水 -->
          <div class="business-water">{{ $t('Dict.OperationFlow') }}</div>
          <!-- 挂单时间 -->
          <div class="designates-time">{{ $t('Biz.Order.ListTime') }}</div>
          <!--  服务员 -->
          <div class="designates-Waiter">{{ $t('Dict.Waiter') }}</div>
        </div>
        <!-- 列表 -->
        <div class="designates-content">
          <ul id="designatesListId" v-if="designatesListData">
            <li v-for="(item, index) in designatesListData" :key="index"
              @click="selectDesignates(item, index)"
              :class="{'active': activeBsCode === item.bsCode}"
              v-show="item.show">
              <div class="index">{{ index + 1 }}</div>
              <div class="business-water">{{ item.bsCode }}</div>
              <div class="designates-time">{{ item.modifyTime }}</div>
              <div class="designates-Waiter">{{item.designateEmp ? item.designateEmp : ''}}</div>
            </li>
          </ul>
        </div>
        <!-- 底部 -->
        <div class="designates-footer">
          <div class="designates-search" v-switch-keyboard:top-right="keybordParams">
            <i class="icon icon-search"></i>
            <!-- 营业流水编号 -->
            <input type="text" :placeholder="$t('Biz.Order.BusinessFlowNumber')" v-model.trim="businessWaterSearch" v-judge>
          </div>
          <Pager :showInfo="true" arrowDirection="up-down" pagerId="designatesListId" ref="designatesListPager"></Pager>
        </div>
      </div>
      <!-- 右侧内容 -->
      <div class="right-detail-wrapper">
        <!-- 头部 -->
        <div class="item-detail-header">
          <!-- 代码 -->
          <span class="code noline">{{ $t('Dict.Code') }}</span>
          <!-- 品项 -->
          <span class="name">{{ $t('Dict.Item') }}</span>
          <!-- 数量 -->
          <span class="quantity">{{ $t('Dict.Amount') }}</span>
          <!-- 单价 -->
          <span class="price">{{ $t('Dict.UnitPrice') }}</span>
          <!-- 折扣 -->
          <span class="discount">{{ $t('Dict.DiscountRate') }}</span>
          <!-- 备注 -->
          <span class="remark">{{ $t('Dict.Remarks') }}</span>
          <!-- 小计 -->
          <span class="total">{{ $t('Dict.Subtotal') }}</span>
        </div>
        <!-- 内容 -->
        <div class="item-detail-content">
          <ul id="designatesContentId" v-if="detaiContentList">
            <li v-for="(item, index) in detaiContentList" :key="index">
              <span class="index">{{ index + 1 }}</span>
              <span class="code">{{ item.code }}</span>
              <!-- 换 -->
              <span class="name">{{ item.exchangeId ? `[${$t('Dict.Repurchase')}]` : '' }}{{ item.name }}</span>
              <span class="quantity">{{ item.lastQty }}{{ item.unitName }}</span>
              <span class="price">{{ item.price }}</span>
              <span class="discount">{{ Number(item.discScale) * 100 }}%</span>
              <span class="remark">
                  <a v-if="item.discFlg === 1" class="tip-mark">{{ $t('Dict.Gift') }}</a>
                  <a v-else-if="item.discFlg === 3" class="tip-mark">{{ $t('Dict.Change') }}</a>
                  <a v-else-if="item.discFlg === 4" class="tip-mark">{{ $t('Dict.Promotion') }}</a>
                  <a v-else-if="item.discFlg === 5" class="tip-mark">{{ $t('Dict.Vip') }}</a>
                  <a v-if="item.scaleFlg" class="tip-mark">{{ $t('Dict.Discount') }}</a>
              </span>
              <span class="total">{{ item.lastSubtotal }}</span>
              <p v-if="item.methodText" class="method">{{ $t('Dict.Notes01') }}{{ item.methodText }}</p>
              <!-- 套餐 -->
              <ul v-if="item.pkgList" class="packeage-list">
                <li v-for="(subitem, index) in item.pkgList" :key="index">
                  <!-- <span class="code">{{ subitem.code }}</span> -->
                  <span class="pkg-name">{{ subitem.name }}</span>
                  <span class="pkg-quantity">{{ subitem.lastQty }}{{ subitem.unitName }}</span>
                  <span class="pkg-rasise-price" v-show="subitem.realRaisePrice > 0 && (!subitem.raisePriceType || subitem.raisePriceType ==1)">+{{ subitem.realRaisePrice }}</span>
                  <span class="pkg-rasise-price" v-show="(subitem.raiseMemberPrice || subitem.raiseMemberPrice == 0 ) && subitem.raisePriceType == 2">
                    +{{ subitem.raiseMemberPrice }}
                  </span>
                  <p v-if="subitem.methodText" class="method">{{ $t('Dict.Notes01') }}{{ subitem.methodText }}</p>
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <!-- 底部 -->
        <div class="item-detail-footer">
          <Pager :showInfo="true" arrowDirection="up-down" pagerId="designatesContentId" ref="designatesContentPager" scrollMode="simple"></Pager>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';
import ajax from '@/common/js/ajax';

export default {
  components: { Dialog, Pager },
  mixins: [DialogMixin],
  data() {
    return {
      activeBsCode: 0, // 选取左侧单个流水信息
      designatesList: null, // 左侧挂单列表
      detaiContentList: null, // 右侧内容列表
      businessWaterSearch: '', // 营业流水筛选
      designatesBsId: null, // 读取挂单参数: 流水ID
      designatesPonitId: null, // 读取挂单参数：客位ID
      isAll: '',
    };
  },
  computed: {
    // 快捷键
    submitHotKey() {
      return {
        PgDn: () => {
          this.submit({ designatesBsId: this.designatesBsId, designatesPonitId: this.designatesPonitId });
        },
        F1: () => {
          this.cancel();
        },
        F2: () => {
          this.cancel('all');
        },
      };
    },
    // 键盘参数
    keybordParams() {
      if (!this.$store.state.pos || !this.$store.state.pos.posBaseInfo) {
        return {};
      }
      return {
        letterType: this.$store.state.pos.posBaseInfo.isEnableQWEKeyboard ? 'full' : 'nine',
      };
    },
    // 扩展挂单营业数据
    designatesListData() {
      return this.designatesList && this.designatesList.map(item => Object.assign(item, { show: true }));
    },
  },
  methods: {
    onOpen() {
      // 挂单列表数据赋值
      const {
        tsList, scList, firstBsId, firstPointId,
      } = this.resData;
      this.designatesList = tsList;
      this.detaiContentList = scList;
      this.designatesBsId = firstBsId;
      this.designatesPonitId = firstPointId;
      // 初始化数据
      this.initData();
      // 刷新分页
      this.$refs.designatesListPager && this.$refs.designatesListPager.refresh();
      this.$vonce('authCode', (code) => {
        this.cancel(this.isAll, code);
      });
    },
    // 点击左侧单据获取信息
    selectDesignates(item) {
      // 赋值点击信息
      this.activeBsCode = item.bsCode;
      this.designatesBsId = item.bsId;
      this.designatesPonitId = item.pointId;
      // 获取右侧详细账单信息
      ajax('canyin.pos.designates.shiftscinfo', {
        params: { bsId: item.bsId },
      }).then((data) => {
        this.detaiContentList = data.scList;
      }).catch((errCode, msg) => {
        msg && this.$message.error(msg);
      });
    },
    // 打开弹窗初始化部分数据
    initData() {
      this.activeBsCode = this.designatesListData && this.designatesListData[0].bsCode;
      this.businessWaterSearch = '';
    },
    // 取消挂单 isAll为1时为全部取消
    cancel(isAll, authData) {
      if (!this.designatesBsId) {
        this.$message.error(`${this.$t('Biz.Order.LackTradeId')}`);
        return;
      }
      let params = {};
      // 判断全部取消标志位 获取取消挂单参数
      if (!isAll) {
        params = { bsId: this.designatesBsId };
      } else {
        this.isAll = isAll;
        const bsIds = [];
        this.designatesList.forEach((item) => {
          bsIds.push(item.bsId);
        });
        params = { bsIds: JSON.stringify(bsIds) };
      }
      params = {
        ...params,
        ...authData,
      };
      // 请求取消挂单 增加业务权限

      ajax('canyin.pos.designates.canceldesignates', {
        params,
      }).then((data) => {
        this.$message.success(`${this.$t('Biz.Order.CancelListSuccess')}`);
        this.close();
      }).catch((errCode, msg) => {
        msg && this.$message.error(msg);
      });
    },
  },
  watch: {
    businessWaterSearch(value) {
      if (!this.designatesListData) { return; }
      // 营业编号的筛选
      this.designatesListData.forEach((item) => {
        if (item.bsCode.indexOf(value) !== -1) {
          item.show = true;
        } else {
          item.show = false;
        }
      });
      // 默认选中第一笔单据
      const filterList = this.designatesListData.filter(item => item.show);
      filterList.length && this.selectDesignates(filterList[0])
      this.$refs.designatesListPager.refresh();
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.pos-designates-list-wrapper {
  position: relative;
  .size(100%, 100%);
  overflow: hidden;
  .clearfix();
  background-color: white;

  .left-info-wrapper {
    position: relative;
    float: left;
    .size(46%, 100%);
    padding: 0 12px 52px 12px;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, .2);
  }

  .right-detail-wrapper {
    position: relative;
    float: right;
    .size(54%, 100%);
    padding: 34px 16px 52px 16px;
    .code {
      width: 14%;
      padding-left: 18px;
    }
    .name {
      width: 22%;
    }
    .pkg-name {
      width: 37%;
    }
    .quantity {
      width: 12%;
    }
    .pkg-quantity {
      width: 12%;
    }
    .pkg-rasise-price {
      width: 20%;
    }
    .price {
      width: 11%;
    }
    .discount {
      width: 12%;
    }
    .remark {
      width: 11%;
      .tip-mark {
        background-color: #f34f64;
        color: #ffffff;
        padding: 0 2px;
      }
    }
    .total {
      width: 12%;
    }
    .method {
      color: #0babb9;
      padding-left: 16px;
    }
  }

  .designates-header {
    padding: 10px 16px;
    border-bottom: 1px solid #ccc;
    overflow: hidden;
    > div {
      float: left;
      display: flex;
      align-items: center;
      min-height: 30px;
    }
    .business-water {
      width: 58%;
      color: rgb(11, 171, 185);
      &::before {
        content: "";
        .square(10px);
        display: inline-block;
        background-color: rgb(11, 171, 185);
        border-radius: 2px;
        margin-left: 20px;
        margin-right: 4px;
      }
    }

    .designates-time {
      width: 25%;
      border-left: 1px solid #ccc;
      padding-left: 5px;
      line-height: 1.2;
    }
    .designates-Waiter {
      width: 15%;
      border-left: 1px solid #ccc;
      padding-left: 5px;
    }

  }

  .designates-content {
    clear: both;
    height: 505px;
    overflow-y: auto;
    font-size: 14px;

    > ul {
      > li {
        position: relative;
        padding: 14px 0;
        clear: both;
        cursor: pointer;
        border-bottom: 1px solid #ccc;
        display: flex;
        align-items: center;
        &.active {
          background-color: #eee;
        }

        > div {
          vertical-align: middle;
          float: left;
          &.index {
            position: absolute;
            font-size: 16px;
            padding: 0 6px 0 3px;
          }
          &.business-water {
            width: 58%;
            padding-left: 24px;
            color: rgb(11, 171, 185);
           .text-overflow();
          }
          &.designates-time {
            width: 25%;
            padding-left: 2px;
          }
          &.designates-Waiter {
            padding-left: 5px;
            width: 15%;
          }
        }
      }
    }
  }

  .designates-footer {
    position: absolute;
    left: 0;
    bottom: 0;
    .size(100%, 52px);
    border-top: 1px solid #ccc;
    padding: 8px 16px;
    text-align: right;

    .designates-search {
      position: absolute;
      top: 8px;
      left: 16px;
      .size(50%, 36px);

      > i {
        position: absolute;
        top: 6px;
        left: 14px;
        font-size: 18px;
      }

      > input {
        width: 100%;
        height: 100%;
        border-radius: 18px;
        padding-left: 40px;
        border: 1px solid #b5b5b5;
      }
    }
  }

  .item-detail-header {
    position: absolute;
    top: 10px;
    left: 16px;
    right: 16px;
    height: 24px;
    background-color: #7bcad6;
    color: white;
    font-size: 12px;
    > span {
      display: inline-block;
      vertical-align: -webkit-baseline-middle;
      padding-left: 6px;
      border-left: 1px solid white;
      &.noline {
        border-left: none;
      }
    }
  }

  .item-detail-content {
    height: 100% ;
    > ul {
      height: 100%;
      font-size: 12px;
      overflow: hidden;
      > li {
        position: relative;
        min-height: 38px;
        line-height: 38px;
        border-top: 1px solid #ccc;
        &:first-child {
          border-top: none;
        }
        span {
          display: inline-block;
          vertical-align: top;
          max-height: 26px;
          padding-left: 6px;
          overflow: hidden;
          &.index {
            position: absolute;
            top: 0;
            left: -4px;
            font-weight: bold;
          }
        }
        .packeage-list {
          background-color: rgb(245, 245, 245);
          font-size: 10px;
          color: rgb(11, 171, 185);
          line-height: 2;
          padding-top: 10px;
          padding-bottom: 10px;

        }
      }
    }
  }

  .item-detail-footer {
    position: absolute;
    left: 0;
    bottom: 0;
    .size(100%, 52px);
    text-align: right;
    border-top: 1px solid #ccc;
    padding: 8px 16px;
  }
}

.lang-enUS{
  .designates-header {
      font-size: 12px;
  }
}

</style>
