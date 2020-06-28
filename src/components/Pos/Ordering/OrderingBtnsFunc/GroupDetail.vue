<template>
  <div class="content-warp">
    <div class="voucher-warp">
      <div class="money">
        <p class="type">{{`${ticketType}` === '1' ? $t('Biz.Coupon.MealCoupon') : $t('Biz.Coupon.CashCoupon')}}</p>
        <p class="cost">{{ticket.marketPrice | keepTwo}}</p>
      </div>
      <div class="name">
        <p class="number">{{voucherNo}}</p>
        <p class="title">{{ticket.title}}</p>
      </div>
    </div>
    <div class="package-list">
      <!-- 选择套餐明细 -->
      <p class="title">{{ $t('Biz.Order.SelectPackageDetails') }}</p>
      <div class="btns-warp" ref="btnScrollContent">
        <button
          type="button"
          v-for="(item, index) in pkgList"
          :key="index"
          class="btn btn-default"
          @click="changePackege(index)"
          :class="{ 'btn-primary': currentPackage === index }"
        >{{item.name}}</button>
        <div class="menu-cursor" :style="{'paddingLeft': cursorLeft+'px'}">
          <img src="@/common/images/sl-msg/cursor.png">
        </div>
      </div>
      <div class="btnsWarpContent">
        <i
          v-if="pkgList.length > 4"
          class="scroll-btn el-icon-arrow-right"
          @click="btnsWarpTurn(108)"
        ></i>
        <i
          v-if="pkgList.length > 4"
          class="scroll-btn el-icon-arrow-left"
          @click="btnsWarpTurn(-108)"
        ></i>
       </div>
    </div>
    <div class="menu-warp">
      <div class="menu-list">
        <p
          class="menu-item"
          v-for="(item,index) in showList"
          :key="index"
        >{{
          item.name
        }}<span class="count">({{
          item.num
        }}{{
          item.unitName || item.itemUnitName
        }})</span><span
          class="money"
          v-show="item.costPrice > 0"
        >{{
          item.costPrice | keepTwo
        }}</span></p>
      </div>
    </div>
    <div class="pos-pager">
      <!-- 修改套餐明细 -->
      <button type="button" class="btn btn-default change-detail" @click="modifyPackage">
        {{ $t('Biz.Order.ModifyPackageDetails') }}
      </button>
      <!-- 套餐总价 -->
      <div class="pkgTotalPrice">{{ $t('Biz.Order.TotalPackagePrice') }}:{{pkgTotalPrice}}</div>
      <div class="pos-takeout-pager">
        <span class="page-info">{{
          $t('Dict.PageStyle.Text1', {
            length: pkgDetailList.length,
            currentPage,
            totalPage: pageCount(pkgDetailList),
          })
        }}</span>
        <button
          href="javascript:;"
          class="prev"
          @click="upPage"
        ><i class="el-icon-arrow-up"></i></button>
        <button
          href="javasctipt:;"
          class="next"
          @click="downPage(pkgDetailList)"
        ><i class="el-icon-arrow-down"></i></button>
      </div>
    </div>
    <PackageNormalChange
      type ="gropDetaillPakge"
      ref="PackageNormalChange"
      submitId="gropDetaillPakgeSubmit"
    ></PackageNormalChange>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import ajax from '@/common/js/ajax';
import PageMixin from '@/common/util/PaginationMixin';
import numberformat from '@/common/js/numberformat';

// 常规套餐
const PackageNormalChange = (resolve) => {
  import('../Menu/Package/PackageNormal').then((module) => {
    resolve(module);
  });
};

export default {
  mixins: [PageMixin],
  components: {
    PackageNormalChange,
  },
  props: {
    // 券信息
    ticket: {
      default() {
        return {};
      },
    },
    // 券类型
    ticketType: {
      default: 1,
    },
    // 券号
    voucherNo: {
      default: '',
    },
  },
  created() {
    this.$von('initPkgListIndex', () => {
      this.currentPackage = 0;
    });
    if (this.pkgList.length) {
      this.getQuerypkgitem(this.pkgList[0].id);
    }
  },
  data() {
    return {
      currentPackage: 0,
      // pkgList: this.ticket.pkgList ? this.ticket.pkgList.map((item) => {
      //   item.pkgData = null;
      //   item.pkgDetail = null;
      //   return item;
      // }) : [],
      prePageSize: 8,
      pkgInfo: null,
      pkgBtnsScrollLeft: 0,
      pkgTotalPrice: '',
      allPkgItemList: [],
    };
  },
  filters: {
    keepTwo(val) {
      if (!val) val = 0;
      return numberformat(val);
    },
    // 券类型
    // ticketType(val) {
    //   // const thant = this;
    //   return `${val}` === '1' ? this. : this.$t('Biz.Coupon.CashCoupon');
    //   // val = `${val}`;
    //   // switch (val) {
    //   //   case '1':
    //   //     // return '团餐券';
    //   //     return thant.$t('Biz.Coupon.MealCoupon');
    //   //   case '2':
    //   //     // 代金券
    //   //     return this.$t('Biz.Coupon.CashCoupon');
    //   //   default:
    //   //     return '';
    //   // }
    // },
  },
  watch: {
    pkgList: {
      handler(val) {
        if (!val.length) {
          this.allPkgItemList = [];
          return;
        }
        if (val[this.currentPackage].pkgDetail) {
          this.allPkgItemList = val[this.currentPackage].pkgDetail.pkgList;
          this.$emit('input', this.getPkgInfo());
          return;
        }
        this.getQuerypkgitem(val[this.currentPackage].id);
      },
      deep: true,
    },
  },
  methods: {
    // 改变按钮包裹距离左边距离
    btnsWarpTurn(distance) {
      const { btnScrollContent } = this.$refs;
      this.pkgBtnsScrollLeft = this.pkgBtnsScrollLeft + distance;
      if (this.pkgBtnsScrollLeft > (btnScrollContent.scrollWidth - btnScrollContent.clientWidth)) {
        this.pkgBtnsScrollLeft = btnScrollContent.scrollWidth - btnScrollContent.clientWidth;
      }
      if (this.pkgBtnsScrollLeft < 0) {
        this.pkgBtnsScrollLeft = 0;
      }
      btnScrollContent.scrollLeft = this.pkgBtnsScrollLeft;
    },
    // 获得当前选中的套餐信息和套餐明细
    getPkgInfo() {
      let mealTotal = 0;
      if (this.pkgList && this.pkgList[this.currentPackage].pkgDetail) {
        this.pkgTotalPrice = (
          this.pkgList[this.currentPackage].pkgDetail.price * 1000
          + this.pkgList[this.currentPackage].pkgDetail.raisePrice * 1000
        ) / 1000;
        mealTotal = this.pkgTotalPrice;
      }
      return {
        mealTotal,
        pkgId: this.pkgList[this.currentPackage].id,
        pkg: {
          itemId: this.pkgList[this.currentPackage].id,
          qty: 1,
          serveWayId: 0,
          isPresentItem: false,
          itemType: 3,
          pkgList: this.pkgDetailList.map(item => ({
            itemId: item.itemId || item.id,
            qty: item.qty || item.num,
            serveWayId: 0,
          })),
        },
      };
    },
    // 得到套餐数据
    getPkgData() {
      if (this.pkgList[this.currentPackage].pkgData) {
        return Promise.resolve(this.pkgList[this.currentPackage].pkgData);
      }
      return ajax('canyin.pos.bill.itempkgnormal', {
        params: {
          pkgId: this.ticket.pkgList[this.currentPackage].id,
          scId: '',
          pointId: this.$store.getters.getVuexPointData.id,
          isBuffet: this.posOrderBill.isDinnerBuffet,
        },
      }).then((data) => {
        this.pkgList[this.currentPackage].pkgData = data;
        return Promise.resolve(data);
      });
    },
    // 修改套餐明细
    modifyPackage() {
      this.getPkgData().then((data) => {
        data.isOrderingModify = true; // 暂时解决常规套餐左侧列表不显示问题
        this.$refs.PackageNormalChange.open(data, {
          submit: (pkgDetail, pkgData) => {
            // 关闭弹框
            this.$refs.PackageNormalChange.close();
            this.$set(this.pkgList, this.currentPackage, {
              ...this.pkgList[this.currentPackage],
              pkgDetail,
              pkgData,
            });
          },
        });
      });
    },
    // 更改套餐
    changePackege(index) {
      this.currentPackage = index;
      this.currentPage = 1;
      if (this.pkgList.length && !this.pkgList[this.currentPackage].pkgDetail) {
        this.getQuerypkgitem(this.pkgList[this.currentPackage].id);
      } else if (this.pkgList.length && this.pkgList[this.currentPackage].pkgDetail) {
        this.allPkgItemList = this.pkgList[this.currentPackage].pkgDetail.pkgList;
        this.$emit('input', this.getPkgInfo());
      }
    },
    // 团餐的套餐的明细请求的接口
    getQuerypkgitem(pkgId) {
      ajax('canyin.pos.gbticketbill.querypkgitem', {
        params: {
          pkgId,
        },
      }).then((res) => {
        if (res.flag) {
          const pkgDetail = Object.assign({}, res.pkgBaseInfo, { pkgList: res.pkgItem });
          this.pkgList[this.currentPackage].pkgDetail = pkgDetail;
          this.allPkgItemList = [];
          this.allPkgItemList = res.pkgItem;
          this.$emit('input', this.getPkgInfo());
        }
      });
    },
  },
  computed: {
    ...mapGetters(['posOrderBill']),
    pkgList() {
      // console.log(this.ticket)
      // let pkgListData = this.ticket.pkgList ? this.ticket.pkgList.map((item) => {
      //   item.pkgData = null;
      //   item.pkgDetail = null;
      //   return item;
      // }) : []
      return this.ticket.pkgList ? this.ticket.pkgList : [];
    },
    // 游标距离左边距离
    cursorLeft() {
      return this.currentPackage * 108 + 50 - 8;
    },
    // 套餐详情里面的品项列表
    pkgDetailList() {
      return this.allPkgItemList;
    },
    // 显示的列表
    showList() {
      return this.pagination(this.currentPage, this.prePageSize, this.pkgDetailList);
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

button{
  padding-right: 0;
  padding-left: 0;
  height: 40px;
  width: 100px;
  margin-right: 8px;
}
// 箭头按钮
.pos-takeout-pager {
  position: absolute;
  right: 0;
  bottom: 4px;
  > button {
    display: inline-block;
    width: 44px;
    height: 30px;
    border: 1px solid #9a9a9a;
    line-height: 28px;
    border-radius: 14px;
    text-align: center;
    margin-left: 8px;
    background-color: white;

    > i {
      color : #9a9a9a;
    }

    &[disabled] {
      color: @btn-disabled-color;
      cursor: not-allowed;
    }
  }
}

.voucher-warp{
  > *{
    display: inline-block;
    vertical-align: middle;


  }
  .money{
    width: 86px;
    padding: 6px 0;
    text-align: center;
    background-color: #62bef9;
    color: #FFF;
    border-radius: 5px;
    .type{
      font-size: 16px;
      overflow: hidden;
      white-space: nowrap;
    }
    .cost{
      font-size: 18px;
      overflow: hidden;
      white-space: nowrap;
      font-weight: bold;
    }
  }
  .name{
    width: 206px;
    padding: 6px 0 6px 10px;
    border: 1px solid #dddddd;
    box-sizing: border-box;
    border-radius: 5px;
    position: absolute;
    .number{
      font-size: 16px;
      overflow: hidden;
      white-space: nowrap;
      color: #999999;
    }
    .title{
      font-size: 18px;
      overflow: hidden;
      color: #666666;
      white-space: nowrap;
      font-weight: bold;
    }
  }
}
.package-list{
  margin-top: 4px;
  position: relative;
  width: 100%;
  .btnsWarpContent {
    height: 48px;
    position: absolute;
    width: 110px;
    right: 0px;
    top: 18px;
    background: #fff;
  }
  .scroll-btn{
    float: right;
    cursor: pointer;
    border: 1px solid #9a9a9a;
    line-height: 29px;
    border-radius: 14px;
    margin-left: 4px;
    width: 48px;
    margin-top: 6px;
    text-align: center;
  }
  .btns-warp{
    overflow: hidden;
    white-space: nowrap;
    position: relative;
    height: 54px;
    width: 330px;
  }
  .menu-cursor{
    position: absolute;
    line-height: 0;
    right: 0;
    left: 0;
    bottom: 0;
    transition: padding-left .5s;
    img{
      height: 8px;
      vertical-align: bottom;
    }
  }
}

.menu-warp{
  .menu-list{
    margin-top: -1px;
    background-color: @white;
    border-radius: 4px;
    padding: 8px 20px;
    border: 1px solid #b5b5b5;
    height: 214px;
  }
  .menu-item{
    font-size: 14px;
    line-height: 1.78;
    .count{
      color: #999;
    }
    .money{
      float: right;
      font-weight: bold;
    }
  }
}
.pos-pager{
  position: relative;
  margin-top: 8px;
  button.change-detail{
    width: 112px;
  }
  .pkgTotalPrice {
    width: 128px;
    position: absolute;
    right: 198px;
    top: 11px;
  }
}
</style>
