<template>
  <div class="ViceScreen-pos">
    <div
      class="default"
      :class="{
          'defaultBackground1': imgVideoMode == 1,
          'defaultBackground2': imgVideoMode == 2 || imgVideoMode == 3
        }"
    >
      <template v-if=" !VerticalScreen ">
        <div class="defaultPicture" v-if=" imgVideoMode == 1"> <!-- 默认 -->
          <div>
            <img src="~@/common/images/viceScreenPos/defaultPicture.png">
          </div>
        </div>
        <!-- 只有视频 -->
        <div
            v-if="imgVideoMode == 2 && vsVideoList.length && !vsImgCollection.length"
            class="userFlash user"
          >
            <div>
              <div class="video-player" id="video1"></div>
            </div>
          </div>
        <!-- 视频 he 图 -->
        <div
            v-if="imgVideoMode == 2 && vsVideoList.length && vsImgCollection.length"
            class="userPic user"
          >
            <div class="videoModel">
              <div class="video-player" id="video2"></div>
            </div>
            <div class="userImg" ref="userImg">
              <div class="active-item-img" v-if="activeItemImg">
                <img :src="activeItemImg">
              </div>
              <el-carousel
                indicator-position="none"
                :height="elCarouselHeight"
                :interval="imgCarouselInterval"
                v-else
              >
                <el-carousel-item v-for="(item, index) in vsImgCollection" :key="index">
                  <img :src="item.filename" >
                </el-carousel-item>
              </el-carousel>
            </div>
          </div>
        <!-- 只有图 -->
        <div
          class="ViceScreen-pos-onlyPic user"
          v-if="imgVideoMode == 2 && !vsVideoList.length && vsImgCollection.length"
        >
          <div class="onlyImg">
            <div class="active-item-img" v-if="activeItemImg">
              <img :src="activeItemImg">
            </div>
            <el-carousel
              indicator-position="none"
              :height="elCarouselHeight"
              :interval="imgCarouselInterval"
              v-else
            >
              <el-carousel-item v-for="(item, index) in vsImgCollection" :key="index">
                <img :src="item.filename">
              </el-carousel-item>
            </el-carousel>
          </div>
        </div>
        <!-- 只显示图片 -->
        <div
          class="ViceScreen-pos-onlyOpenPic user"
          v-if="`${imgVideoMode}` === '3' && vsImgCollection.length"
        >
          <div class="openOnlyImg">
            <img class="resize-img" :src="activeItemImg">
            <div class="active-item-img-box" :class="{ 'show-img': !!activeItemImg }">
            </div>
            <el-carousel
              indicator-position="none"
              height="100%"
              :interval="imgCarouselInterval"
            >
              <el-carousel-item v-for="(item, index) in vsImgCollection" :key="index">
                <img class="resize-img" :src="item.filename">
              </el-carousel-item>
            </el-carousel>
          </div>
        </div>
        <!-- 开启加单显示，不存在轮播图片和视频 -->
        <div
          class="ViceScreen-pos-onlyPic user"
          v-if="((imgVideoMode == 2 && !vsVideoList.length) || imgVideoMode === 3 ) && !vsImgCollection.length"
        >
          <div class="onlyImg">
            <div class="active-item-img" v-if="activeItemImg">
              <img :src="activeItemImg">
            </div>
          </div>
        </div>
      </template>
      <div
        class="ViceScreen-pos-bill"
        :class="VerticalScreen ? 'RightBillVertical' : 'RightBill'"
      >
        <div>
          <div class="pos-bill-title">
            <img :src="logo" alt="">
            <div v-html="title"></div>
          </div>
          <div class="pos-bill-msg">
            <ul class="itemsList" ref='itemsList'>
              <li v-for="(item, index) in orderedItems" :key="`ordered_${index}`">
                <div class="number">{{index+1}}</div>
                <template>
                  <!-- 参照之前逻辑，addOrdering属性为入库的套餐明细的所有做法的合计，根据需求，回显的客单需显示该合计，所以为了实现该需求此处为false 182-1191 by L.R -->
                  <OrderItem :item="item" :addOrdering="false"></OrderItem>
                </template>
              </li>
              <!-- 如果存在已提交的菜品，新增加的菜的序号需要加上以前的 orderedItems.length + index + 1-->
              <li v-for="(item, index) in items" :key="index">
                <div v-show="item.isPack" class="pack-icon"></div>
                <div class="number">{{ orderedItems.length + index + 1 }}</div>
                <template v-if="!addOrdering">
                  <OrderItem :item="item" :addOrdering="addOrdering"></OrderItem>
                </template>
                <template v-else>
                  <OrderingItem :item="item"></OrderingItem>
                </template>
              </li>
            </ul>
          </div>
          <div class="pos-bill-paymentInformation">
            <div>
              <div class="QRCode">
                <img :src="QRcodeImg" alt="">
              </div>
              <div class="paymentInformation">
                <ul>
                  <li>{{$t('Dict.Receivable')}}:<span class="fw"> {{addOrdering ? priceMsg.itemOrigMoney : priceMsg.origTotal}}</span></li>
                  <li>{{$t('Dict.Offer')}}:<span class="fw"> {{priceMsg.discTotal}}</span></li>
                  <li>{{$t('Dict.NetReceipts01')}}<span class="fw"> {{billLastTotal}}</span></li>
                  <!-- <li>赠送： <span class="fw">{{priceMsg.present_money}}</span></li> -->
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery';
import { map, extend } from 'lodash';
import ajax from '@/common/js/ajax';
import {
  add,
  sub,
  multi,
} from '@/common/js/math';
import logo from '@/common/images/viceScreenPos/logo.png';
import OrderItem from '@/components/ViceScreen/Pos/OrderItem';
import OrderingItem from '@/components/ViceScreen/Pos/OrderingItem';

export default {
  components: {
    OrderItem, OrderingItem,
  },
  data() {
    return {
      VerticalScreen: false, // 是否为竖屏，默认false：不是竖屏
      elCarouselHeight: '340px', // 轮播高度
      addOrdering: false, // 加单
      oldItemsLists: [], // 临时存储
      priceMsg: { // 最下方金额部分
        itemOrigMoney: 0,
        lastTotal: 0,
        discTotal: 0,
        last_total2: 0,
      },
      billLastTotal: 0, // 合计
      tempLastTotal: 0, // 临时合计
      tempInitData: {}, // 临时金额存储
      ScreenInit: {}, // 副屏初始化数据
      imgVideoMode: 1, // 系统设置:选择副屏左侧显示类型(1系统默认、2显示视频和图片)
      HTTP_CONTEXTPATH: '', // 项目地址
      vsImgList: [], // 取得服务器副屏图片
      vsOnlyImgList: [], // 当副屏显示图片模式设置为3的时候（imgVideoMode）
      vsVideoList: [], // 取得服务器副屏视频
      imgCarouselInterval: 5000, // 副屏图片轮播间隔
      title: this.$t('Dict.TCSL'), // 自定义标题 （默认）
      doesShowItemImg: false, // 加单显示品项图片。 0不显示，1显示
      items: [], // 菜品信息
      orderedItems: [], // 已点菜品信息，用来进行已点菜品回显 182-1191 by L.R
      activeItemId: null, // 选中的菜品
      QRcodeImg: '', // 二维码地址
      wipeMoney: 0, // 快餐模式下的抹零金额
      logo,
      // rationInputCountMoney: 0 //手工定额优惠的值
    };
  },
  watch: {
    items: {
      immediate: true,
      handler(newValue) {
        this.$nextTick(() => {
          const div = this.$refs.itemsList;
          div.scrollTop = div.scrollHeight;
        });
      },
      deep: true,
    },
  },
  mounted() {
    // 判断横竖屏
    if (window.screen.height > window.screen.width) {
      this.VerticalScreen = true;
    }
    const sendSubMonitorIsReady = () => {
      this.$devices.SubMonitor.sendToMain({
        moduleName: 'SubMonitor',
        method: 'SubMonitorIsReady',
      });
    };
      // 接收前台营业数
    this.$devices.init({
      onOpen: () => {
        sendSubMonitorIsReady();
        this.$devices.SubMonitor.hello((data) => {
          switch (data.method) {
            case 'init': { // 获取初始化页面数据
              this.getCustomLogo();
              const title = data.result.title.split('-')[0];
              this.ScreenInit = data.result;
              this.items = data.initBillDish;
              this.priceMsg = data.initData;
              this.priceMsg.last_total2 = data.initData.lastTotal; // 合计
              this.billLastTotal = data.initData.lastTotal;
              this.imgVideoMode = data.result.imgVideoMode;
              this.HTTP_CONTEXTPATH = data.result.HTTP_CONTEXTPATH;
              this.vsImgList = data.result.vsImgList;
              this.vsOnlyImgList = data.result.vsOnlyImgList;
              this.vsVideoList = data.result.vsVideoList;
              this.imgCarouselInterval = parseInt(data.result.imgCarouselInterval, 0);
              this.title = title;
              this.doesShowItemImg = data.result.doesShowItemImg === '1';
              if (this.vsImgList.length) { // 整理初始化轮播图片的路径
                if (this.vsVideoList.length) {
                  setTimeout(() => {
                    this.elCarouselHeight = `${$('.userImg').height()}px`;
                  }, 500);
                } else {
                  setTimeout(() => {
                    this.elCarouselHeight = `${$('.onlyImg').height() * 0.5}px`;
                  }, 500);
                }
              }
              setTimeout(() => {
                this.setImgStyle();
                this.initPlayer();
              }, 5000);
              break;
            }
            case 'updataItem': // 点击客位，显示已点菜品 , 以及金额信息
              this.addOrdering = data.ordering; // 始终是false
              this.items = data.result;
              this.priceMsg = data.initData;
              this.priceMsg.last_total2 = data.initData.lastTotal; // 合计
              this.billLastTotal = data.initData.lastTotal;
              // 临时存储
              this.oldItemsLists = data.result;
              this.tempLastTotal = data.initData.lastTotal;
              this.tempInitData = data.initData;
              this.tempInitData.last_total2 = this.tempInitData.lastTotal; // 合计
              break;
            case 'updateOrderedItem':
              this.orderedItems = data.result;
              this.priceMsg = data.initData;
              if (data.isOrdering) {
                this.priceMsg.last_total2 = data.initData.itemIncomeTotal; // 合计
                this.billLastTotal = data.initData.itemIncomeTotal;
              } else {
                this.priceMsg.last_total2 = data.initData.lastTotal; // 合计
                this.billLastTotal = data.initData.lastTotal;
              }
              break;
            case 'clearOrderedItem':
              this.orderedItems = [];
              break;
            case 'activeItem': // 选中
              if (this.doesShowItemImg) {
                this.activeItemId = data.result;
              }
              break;
            case 'addDataItem': // 加单
              this.addOrdering = true;
              if (data.posMode === 3) { // 快餐
                data.result.forEach((item) => {
                  this.$set(item, 'priceType', item.defaultPriceType);
                });
              } else {
                data.result.forEach((item) => {
                  //  中餐赠菜之后在显示的时候把priceType置为1
                  if (item.discFlg === 1) {
                    this.$set(item, 'priceType', 1);
                  }
                });
              }
              this.items = data.result;
              if (!data.result.length) {
                this.activeItemId = null;
              }
              // if (this.doesShowItemImg === 1 && data.result.length) {
              //   this.vsImgList = [];
              //   for(var i in this.temp_vsImgList){
              //     this.vsImgList.push(this.temp_vsImgList[i]);
              //   }
              //   for(var i = 0, len = data.result.length; i<len; i++){
              //     this.vsImgList.push({
              //       filename: this.HTTP_CONTEXTPATH
              //         + '/canyin/pos/vicescreen/img?itemId='
              //         + data.result[i].id
              //         + '&idx=1&i='
              //         + (new Date()).getTime()
              //     })
              //   }
              // }
              break;
            case 'reloadDataItem': // 刷新
              this.orderedItems = [];
              this.items = [];
              this.priceZero();
              this.billLastTotal = 0;
              break;
            case 'MainMonitorIsReady': // 主屏已加载完毕
              sendSubMonitorIsReady();
              break;
            case 'ordering': // 返回或加单
              if (data.result === 'back') {
                this.items = this.oldItemsLists;
                this.priceMsg = this.tempInitData;
                this.billLastTotal = this.tempLastTotal;
                this.activeItemId = null;
              }
              if (data.result === 'order') {
                this.priceZero();
                this.billLastTotal = 0;
              }
              break;
            case 'upDataPriceOrdering': // 加单金额
              this.billLastTotal = data.result.lastTotal;
              this.priceMsg.itemOrigMoney = data.result.originalTotal;
              this.priceMsg.discTotal = sub(data.result.originalTotal, this.billLastTotal);
              break;
            case 'upDataOriginalOrdering':
              this.priceMsg.itemOrigMoney = data.result;
              this.priceMsg.lastTotal = this.billLastTotal;
              this.priceMsg.discTotal = sub(data.result, this.billLastTotal);
              break;
            case 'resetPrice':
              this.billLastTotal = 0;
              this.priceZero();
              break;
            case 'getqrcode': // 获取二维码
              this.getQRcode(data.result);
              break;
            case 'closeQRCode': // 关闭二维码
              // this.getQRcode(data.result);
              this.QRcodeImg = '';
              break;
            case 'fastFoodAddOrder':
              // 手工定额优惠,只有在更多结算界面才有的
              // this.rationInputCountMoney = data.result.rationInputCountMoney
              //   ? Number(data.result.rationInputCountMoney)
              //   : 0;
              // this.priceMsg.lastTotal = sub(
              //   data.result.orderingItemLastTotalPrice,
              //   this.rationInputCountMoney,
              // );
              // this.billLastTotal = this.priceMsg.lastTotal;
              // 抹零
              this.wipeMoney = data.result.wipeMoney ? data.result.wipeMoney : 0;
              // 应收
              this.priceMsg.itemOrigMoney = data.result.orderingItemTotalPrice;
              // 合计 实收
              // 这是走入完库后的 刷账单没做任何加单的合计
              if (data.result.lastTotal) {
                this.billLastTotal = data.result.lastTotal;
                this.priceMsg.lastTotal = data.result.lastTotal;
              } else {
                // 这个是走前端加单后的合计
                this.priceMsg.lastTotal = sub(
                  data.result.orderingItemLastTotalPrice,
                  this.wipeMoney,
                );
                this.billLastTotal = this.priceMsg.lastTotal;
              }
              // 应收
              this.priceMsg.itemOrigMoney = data.result.orderingItemTotalPrice;
              // 优惠
              if (data.result.discTotal) {
                this.priceMsg.discTotal = data.result.discTotal;
              } else {
                this.priceMsg.discTotal = sub(this.priceMsg.itemOrigMoney, this.billLastTotal);
              }
              break;
            default:
              break;
          }
        });
      },
    });
  },
  computed: {
    vsImgCollection() {
      if (`${this.imgVideoMode}` === '3') {
        return map(this.vsOnlyImgList, item => extend({}, item, {
          filename: `${this.HTTP_CONTEXTPATH}/../custom/viceScreenImg3/${item.filename}`,
        }));
      }
      return map(this.vsImgList, item => extend({}, item, {
        filename: `${this.HTTP_CONTEXTPATH}/../custom/viceScreenImg/${item.filename}`,
      }));
    },
    activeItemImg() {
      let type = 1;
      if (+this.imgVideoMode === 3 && this.vsImgCollection.length) {
        type = 2;
      }
      return this.activeItemId
        ? `${this.HTTP_CONTEXTPATH}/canyin/pos/vicescreen/img?itemId=${this.activeItemId}&idx=${type}&i=${(new Date()).getTime()}`
        : null;
    },
  },
  methods: {
    // 提交完的套餐每个明细的做法价格合计
    // getPkgListMethodPriceTotla(setitem) {
    //   let methodPriceTotal = 0;
    //   if (setitem && setitem.methodList && setitem.methodList.length) {
    //     setitem.methodList.forEach((method) => {
    //       if (method.price) {
    //         methodPriceTotal = add(
    //           methodPriceTotal,
    //           multi(
    //             setitem.lastQty,
    //             multi(method.price, method.qty),
    //           ),
    //         );
    //       }
    //     });
    //   }
    //   return methodPriceTotal === 0 ? '' : `+ ${methodPriceTotal}`;
    // },
    setImgStyle() {
      const imgs = document.querySelectorAll('.resize-img');
      const winHeight = document.body.clientHeight || document.documentElement.clientHeight;
      imgs.forEach((item) => {
        const height = Math.floor(item.offsetWidth * 3 / 4);
        const sum = Math.min(winHeight, height);
        item.style.height = `${sum}px`;
      });
    },
    initPlayer() {
      let videoDom = null;
      if (!this.vsImgCollection.length) {
        videoDom = document.getElementById('video1');
      } else {
        videoDom = document.getElementById('video2');
      }
      const {
        offsetLeft, offsetTop, offsetWidth, offsetHeight,
      } = videoDom;
      console.info(`TCSLCMD=PlayADParam,Left=${offsetLeft},Top=${offsetTop},Width=${offsetWidth},Heigh=${offsetHeight},URL=/custom/viceScreenVideo/${this.vsVideoList[0].filename}`);
    },
    priceZero() {
      Object.keys(this.priceMsg).forEach((item) => {
        this.priceMsg[item] = 0;
      });
    },
    getCustomLogo() {
      ajax('canyin.sys.logo.getLogoImgMode').then((data) => {
        if (+data.logoImgMode === 0) {
          this.logo = `${location.origin}/custom/logo/logo.png`;
        }
      });
    },
    getQRcode(pointId) {
      ajax('canyin.pos.viceScreen.getQRcode', {
        contentType: 'URLEncoded',
        data: { pointId },
      }).then((res) => {
        const { qrcodeImg } = res;
        this.QRcodeImg = `data:image/jpeg;base64,${qrcodeImg}`;
      });
    },
  },
};
</script>

<style lang="less" scoped>
  @pos-flag-give-color: #f24f64;
  @pos-flag-discount-color: #5bbd66;
  @pos-flag-changed-color: #ce4ff4;
  @pos-flag-promotion-color: #f7b135;
  @pos-flag-vip-color: #e0ba4d;
  @pos-flag-hasten-color: #4fbef3;
  @pos-flag-package-color: #3186bf;
  .fw{
    font-weight: bold;
  }
  .ViceScreen-pos{
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    font-family:'Microsoft YaHei',SimSun;
  }
  .defaultBackground1{
    background: url('~@/common/images/viceScreenPos/defaultBackground1.jpg') no-repeat;
  }
  .defaultBackground2{
    background: url('~@/common/images/viceScreenPos/defaultBackground2.png') no-repeat;
  }
  .default{
    position: relative;
    display: flex;
    background-size: 100% 100%;
    width: 100%;
    height: 100%;
    justify-content: space-between;
    .defaultPicture{
      width: 100%;
      margin-right: 400px;
      position: relative;
      > div{
        img{
          width: 407px;
          height: 232px;
          position: absolute;
          top:50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
    }
    .user{
      width: 100%;
      height: 100%;
      padding-right: 380px;
      position: relative;
    }
    .userFlash{
      > div{
        display: flex;
        justify-content: center;
        align-items: center;

        width: 100%;
        height: 100%;
        position: relative;
        .video-player{
          position: absolute;
          top: 50%;
          left: 50%;
          //transform: translate(-50%,-50%);
          margin-top: -25%;
          margin-left: -40%;
          width: 80%;
          height: 50%;
        }
        .vjs-control-bar{
          display: none;
        }
      }
    }
    .userPic{
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      > div.videoModel{
        width: 100%;
        height: 49%;
        position: relative;
        .video-player{
          position: absolute;
          /* top: 50%; */
          left: 50%;
          /* margin-top: -50%; */
          margin-left: -50%;
          width: 100%;
          height: 100%;
          padding: 35px 15px 0 35px;
        }
        .vjs-control-bar{
          display: none;
        }
      }
      .userImg{
        width: 100%;
        height: 49%;
        padding: 0px 15px 35px 35px;
        position: relative;
        overflow: hidden;
        .el-carousel{
          height: 100%;
          .el-carousel__container{
            height: 100% !important;
          }
        }

        .active-item-img {
          height: 100%;
          display: flex;
          justify-content: center;
        }
        img{
          display: block;
          margin: 0 auto;
          width: auto;
          height: 100%;
        }
      }
    }
    .ViceScreen-pos-onlyPic{
      > div{
        width: 100%;
        height: 100%;
        position: relative;
        .el-carousel{
          position: absolute;
          top: 50%;
          left: 50%;
          //transform: translate(-50%,-50%);
          margin-top: -25%;
          margin-left: -50%;
          width: 100%;
          height: 50%;
          padding: 0 15px 0 35px;
          .el-carousel__container{
            height: 100% !important;
          }
        }

        .active-item-img {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 50%;
          padding: 0 15px 0 35px;
          transform: translate(-50%,-50%);

          img {
            display: block;
            margin: 0 auto;
            width: auto;
            height: 100%;
          }
        }
      }
      img{
        display: block;
        margin: 0 auto;
        width: auto;
        height: 100%;
      }
    }
    .ViceScreen-pos-onlyOpenPic {
      .openOnlyImg {
        height: 100%;
        position: relative;
        .active-item-img-box {
          width: 100%;
          height: 100%;
          position: absolute;
          z-index: 10;
          background-color: #76736c;
          opacity: 0.8;
          display: none;
          &.show-img {
            display: block;
          }
        }
        .el-carousel {
          // position: absolute;
          // top: 50%;
          // left: 50%;
          // //transform: translate(-50%,-50%);
          // margin-top: -25%;
          // margin-left: -50%;
          // width: 100%;
          // height: 50%;
          // padding: 0 15px 0 35px;
          height: 100%;
          width: 100%;
        }
        img {
          width: 100%;
          position: absolute;
          z-index: 999;
           height: 100%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);

        }
      }
    }
  }
  .ViceScreen-pos-bill{
    > div{
      position: relative;
      height: 100%;
      padding: 15px;
      background: rgba(0, 0, 0, 0.4);
      border-radius: 10px;
    }
    .pos-bill-title{
      width: 100%;
      display: flex;
      justify-content: center;
      color: #fff;
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 15px;
      position: absolute;
      left: 0px;
      padding: 0 15px;
      > img{
        width:50px;
        height:50px;
      }
      > div{
        margin-left: 10px;
        margin-top: 14px;
        height: 25px;
        overflow: hidden;
      }
    }
    .pos-bill-msg{
      height: 100%;
      padding-top: 65px;
      padding-bottom: 116px;
      overflow: auto;
      > ul.itemsList{
        height: 100%;
        overflow: auto;
        > li{
          background: #fff;
          border-radius: 5px;
          padding: 10px;
          display: flex;
          padding-bottom: 5px;
          margin-bottom: 5px;
          position: relative;
          > .pack-icon{
            width: 27px;
            height: 27px;
            background: url('../../../common/images/pos/bill/pack-icon.png') no-repeat;
            background-size: 100% 100%;
            position: absolute;
            left: 0px;
            bottom: 0px;
          }
        }
        .number{
          width: 24px;
          height: 18px;
          border-radius: 50%;
          background: #999;
          text-align: center;
          margin-right: 5px;
          margin-top: 5px;
          color: #fff;
          font-size: 12px;
        }
        // .pos-bill-items{
        //   width: 297px;
        //   > .name{
        //     font-size: 16px;
        //     font-weight: bold;
        //     padding-right: 75px;
        //     position: relative;
        //     overflow: hidden;
        //     >.markText {
        //       position: absolute;
        //       right: 0px;
        //       width: 75px;
        //       text-align: right;
        //       color: #ffffff;
        //       font-weight: 300;
        //       >em {
        //         font-style: normal;
        //         padding: 1px;
        //         &.give {
        //           background-color: @pos-flag-give-color;
        //         }
        //         &.successConfirmWeigh {
        //           background-color: #5cb95c;
        //         }
        //         &.discount {
        //           background-color: @pos-flag-discount-color;
        //         }

        //         &.changed {
        //           background-color: @pos-flag-changed-color;
        //         }

        //         &.promotion {
        //           background-color: @pos-flag-promotion-color;
        //         }

        //         &.vip {
        //           background-color: @pos-flag-vip-color;
        //         }

        //         &.hasten {
        //           background-color: @pos-flag-hasten-color;
        //         }

        //         &.package {
        //           background-color: @pos-flag-package-color;
        //         }
        //         // &.easy-icon{
        //         //   width:16px;
        //         //   height:16px;
        //         //   display: inline-block;
        //         //   background:url('../../../common/images/pos/bill/easyicon.png');
        //         // }
        //       }
        //     }
        //   }
        //   .setMealPrice{
        //     display: flex;
        //     margin-bottom: 5px;
        //     .price{
        //       width:125px;
        //     }
        //     .count{
        //       width: 65px;
        //     }
        //     .priceTotal{
        //       width: 84px;
        //       text-align: right;
        //     }
        //   }
        //   .setMealDetailed{
        //     border-top: 1px solid #b5b5b5;
        //     padding: 5px 0;
        //     color: #666666;
        //     li{
        //       clear: both;
        //       >div {
        //         float: left;
        //       }
        //       .name{
        //         width: 125px;
        //       }
        //       .count{
        //         width: 65px;
        //       }
        //       .raisePrice {
        //         width: 84px;
        //         float: left;
        //         text-align: right;
        //         >.memberRaisePrice {
        //           width: 84px;
        //           display: block;
        //           position: relative;
        //           >span {
        //             position: absolute;
        //             left: -10px;
        //             padding: 1px;
        //             top: -1px;
        //             background-color: @pos-flag-vip-color;
        //             color: #ffffff;
        //           }
        //         }
        //       }
        //       .Remarks {
        //         width: 100%;
        //         &.bsIdRemarks {
        //           padding-right: 54px;
        //           position: relative;
        //           >.methodPriceTotal {
        //             width: 54px;
        //             position: absolute;
        //             right: 0;
        //             text-align: right;
        //             margin-right: 3px;
        //           }
        //         }
        //       }
        //     }
        //   }
        //   .Remarks{
        //     line-height: 18px;
        //     font-size: 12px;
        //   }
        // }
      }
    }
    .pos-bill-paymentInformation{
      width: 100%;
      color: #fff;
      // display: flex;
      // border-top: 1px solid #fff;
      padding: 15px;
      padding-top: 0;
      position: absolute;
      left: 0;
      bottom: 0;
      > div{
        display: flex;
        border-top: 1px solid #fff;
        padding-top: 15px;
      }
      .QRCode{
        height: 100px;
        width: 100px;
        margin-right: 15px;
        border: 1px solid #bbb;
        img{
          width: 100%;
          height: 100%;
        }
      }
      .paymentInformation{
        width: 222px;
        padding-top: 10px;
      }
      .noQRcode{
        width: 100%;
      }
      ul{
        > li:nth-of-type(1) {
          > span {
            font-size: 18px;
          }
        }
        > li:nth-of-type(2) {
          margin: 8px 0px;
          > span {
            font-size: 18px;
            color: #e97421;
          }
        }
        > li:nth-of-type(3) {
          font-size: 22px;
          > span {
            color: #1bd3e3;
          }
        }
      }
    }
  }
  .RightBill{
    width: 380px;
    height: 100%;
    padding: 35px 35px 35px 0;
    position: absolute;
    right: 0;
    top: 0;
  }
  .RightBillVertical{
    width: 85%;
    height: 100%;
    padding: 35px 0;
    margin: auto;
  }
</style>
