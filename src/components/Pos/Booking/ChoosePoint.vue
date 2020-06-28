<template>
<div>
  <!-- $t-选择客位 -->
  <Dialog
    name="PosDialog.ChoosePoint"
    :title="$t('Dict.ChooseSeat')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="submit"
    :showSubmit="true"
    width="720px">
    <div class="transfer">
      <!-- 默认客位信息 -->
      <div class="transfer-title">
        {{ $t('Biz.Booking.DefaultSeat') + defaultPoint.name }}
      </div>
      <div class="transfer-content">
        <!-- 客位筛选:类型 -->
        <div class="transfer-type">
          <ul>
            <li v-for="(type , index) in pointTypes" :key="index">
              <a href="javascript:void(0)"
                :class="{'area-type-active':selectTypeActiveData.name == type.name}"
                @click="selectType(type)">{{ type.name }}</a>
            </li>
          </ul>
        </div>
        <!-- 客位筛选:区域 -->
        <div class="transfer-area">
          <ul>
            <li
              class="aLineTxt"
              v-for="(area , index) in pointAreas"
              v-show="index <= pagerStep"
              :key="index">
              <a href="javascript:void(0)"
                  :class="{'area-type-active':selectAreaActiveData.name == area.name}"
                  @click="selectArea(area)">{{ area.name }}</a>
            </li>
          </ul>
          <!-- 横向翻页 -->
          <div class="transfer-area-pager" v-show="pagerState">
            <button type="button"
              class="transverse-btn"
              :disabled="!pagerPrevBtnState"
              @click="transverseBtnOpt('prev')">
              <i class="icon icon-pager-prev"></i>
            </button>
            <button type="button"
              class="transverse-btn"
              :disabled="!pagerNextBtnState"
              @click="transverseBtnOpt('next')">
              <i class="icon icon-pager-next"></i>
            </button>
          </div>
        </div>
        <!-- 客位Table-->
        <ul id="transferListId" class="tanfer-list-content">
          <li class="list-point icon"
            :class="[
              pointStateStyle(point),
              {'point-select-type-active': selectPointActiveId == point.id}
            ]"
            @click="selectPoint(point)"
            v-for="(point, index) in points"
            :key="index">
            <h2 v-show="point.state && point.state != 1" class="point-info">{{ point.code }}</h2>
            <p class="point-name">{{ point.name }}</p>
            <p v-show="point.state && point.state != 1"  class="point-bottom">
              <span class="point-people">
                <i class="icon icon-user"></i>
                <em>{{point.peopleqty}}/{{point.defCapacity}}</em>
              </span>
              <span class="point-openTime">
                {{new Date(point.openTime).getHours()}}:{{new Date(point.openTime).getMinutes()}}
              </span>
            </p>
          </li>
        </ul>
        <!-- 页脚 -->
        <div class="transfer-content-footer">
          <div class="transfer-search">
            <!-- <Search @search="onSearch"></Search> -->
            <label>
              <i class="icon icon-search"></i>
              <input
                type="text"
                v-switch-keyboard:top="keybordParams"
                :placeholder="$t('Dict.QuickSearch')"
                ref="input"
                v-model.trim ="searchText">
            </label>
          </div>
          <div class="transfer-pager">
          <Pager
            pagerId="transferListId"
            itemTag="li"
            :showInfo = "true"
            arrowDirection="up-down">
          </Pager>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</div>
</template>

<script>
import { isEmpty } from 'lodash';
import Dialog from '@/components/Pos/Common/Dialog';
import Pager from '@/components/Pos/Common/Pager';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

export default {
  props: {
    // 向上反馈数据,父组件的方法名
    upDateOptName: {
      type: String,
      default: 'doReserveOrder',
    },
    posBaseInfo: {
      type: Object,
      default: {},
    },
    savedOrderData: {
      type: Object,
      default: {},
    }
  },
  components: { Dialog, Pager },
  mixins: [DialogMixin],
  data() {
    return {
      defaultPoint: '',
      selectAreaActiveData: { name: this.$t('Dict.AllArea') }, // 默认的区域 全部区域
      selectTypeActiveData: { name: this.$t('Dict.AllTypes') }, // 默认的类型 全部类型
      selectPointActive: {},
      selectPointActiveId: '',
      searchText: '', // 快速查找内容
      pointTypes: [{ name: this.$t('Dict.AllTypes') }], // 类型列表, 全部类型
      pointAreas: [{ name: this.$t('Dict.AllArea') }], // 区域列表, 全部区域
      pointsList: [], // 没处理的客位列表
      transferData: {}, // 所有的信息
      pagerState: true, // 分页参数
      pagerStep: 5, // 分页步长
      pagerPrevBtnState: true, // 前一页按钮状态参数
      pagerNextBtnState: true, // 后一页按钮状态参数
      pagerNum: 1, // 当前页数(初始为1)
    };
  },
  computed: {
    // 键盘参数
    keybordParams() {
      if (!this.$store.state.pos || !this.$store.state.pos.posBaseInfo) {
        return {};
      }
      return {
        letterType: this.$store.state.pos.posBaseInfo.isEnableQWEKeyboard ? 'full' : 'nine',
      };
    },
    // 对客位列表过滤处理下
    points() {
      let filterList = [];
      if (this.pointsList) {
        filterList = this.pointsList.filter((list) => {
          if (!this.selectAreaActiveData.id && !this.selectTypeActiveData.id) {
            // 都是全部的时候
            return list.code.indexOf(this.searchText) !== -1;
            // eslint-disable-next-line no-else-return
          } else if (this.selectTypeActiveData.id && this.selectAreaActiveData.id) {
            // 都是不是全部的时候
            return `${list.areaid}` === `${this.selectAreaActiveData.id}`
                    && `${list.pointtypeid}` === `${this.selectTypeActiveData.id}`
                    && list.code.indexOf(this.searchText) !== -1;
          } else {
            // eslint-disable-next-line no-lonely-if
            if (this.selectTypeActiveData.id) {
              return `${list.pointtypeid}` === `${this.selectTypeActiveData.id}`
                        && list.code.indexOf(this.searchText) !== -1;
            // eslint-disable-next-line no-else-return
            } else {
              return `${list.areaid}` === `${this.selectAreaActiveData.id}`
                && list.code.indexOf(this.searchText) !== -1;
            }
          }
        });
        // console.log(filterList)
      }
      return this.pointsList ? filterList : [];
    },
  },
  methods: {
    // 打开事件
    onOpen() {
      this.transferData = this.resData; // 所有的数据
      this.defaultPoint = this.resData.defaultPoint;
      this.pointsList = this.resData.pointListJson; // 客位列表
      this.pointTypes = [{ name: this.$t('Dict.AllTypes') }]; // 类型列表初始值-全部类型
      this.pointAreas = [{ name: this.$t('Dict.AllArea') }]; // 区域列表初始值-全部区域
      this.pointTypes = this.pointTypes.concat(this.resData.pointTypes); // 客位类型列表
      this.pointAreas = this.pointAreas.concat(this.resData.areas); // 客位区域列表
      // eslint-disable-next-line prefer-destructuring
      this.selectAreaActiveData = this.pointAreas[0]; // 默认被选中的区域
      // eslint-disable-next-line prefer-destructuring
      this.selectTypeActiveData = this.pointTypes[0]; // 默认被选中的类型
      this.selectPointActive = {}; // 初始化下被选中的客位
      this.selectPointActiveId = '';
      // 搜索的内容监听
      // 横向分页 按钮显示处理
      if (this.pointAreas.length <= this.pagerStep) {
        this.pagerState = false;
      }
    },
    onClose() {
      // 弹窗关闭 执行重置分页参数
      this.pagerStep = 5;
      this.pagerPrevBtnState = true;
      this.pagerNextBtnState = true;
      this.pagerNum = 1;
    },
    // 客位状态 返回样式
    pointStateStyle(point) {
      if (+point.state === 1) {
        return 'freePoint';
      }
      return 'notFreePoint';
    },
    onSearch(text) {
      this.searchText = text;
    },
    // 类型的选择
    selectType(type) {
      this.selectTypeActiveData = type;
    },
    // 区域的选择
    selectArea(area) {
      this.selectAreaActiveData = area;
    },
    // 客位的选择
    selectPoint(pointData) {
      if (+pointData.state !== 1) {
        return false;
      }
      // 选择客位: 如果再次点击选中项, 取消选中
      if (`${this.selectPointActiveId}` === `${pointData.id}`) {
        this.selectPointActive = {};
        this.selectPointActiveId = '';
      } else {
        this.selectPointActive = pointData;
        this.selectPointActiveId = pointData.id;
      }
      return true;
    },
    // 横线分页按钮-点击操作
    transverseBtnOpt(type) {
      // 分页数据固定第一项为 '全部区域'
      this.pointAreas = [{ name: this.$t('Dict.AllArea') }]; // 全部区域
      // 翻页
      if (type === 'prev') {
      // 前一页
        this.pointAreas = this.pointAreas.concat(
          this.tmp.filter(
            (item, index) => index <= this.pagerStep * (this.pagerNum - 1)
                && index > this.pagerStep * (this.pagerNum - 1) - this.pagerStep - 1,
          ),
        );
        this.pagerNum -= 1;
        if (this.pagerNum < 2) {
          this.pagerPrevBtnState = false;
        }
        this.pagerNextBtnState = true;
      }
      /** 后一页
      最后一页控制 */
      if (this.pagerNum < this.tmp.length / this.pagerStep) {
        this.pointAreas = this.pointAreas.concat(
          this.tmp.filter(
            (item, index) => index >= this.pagerStep * this.pagerNum,
          ),
        );
        this.pagerNum += 1;
        if (this.pagerNum > parseInt(this.tmp.length / this.pagerStep, 10)) {
          this.pagerNextBtnState = false;
        }
        this.pagerPrevBtnState = true;
      }
    },
    // 选择完进行提交
    submit() {
      // 如果 未选择客位, 提示默认客位
      if (isEmpty(this.selectPointActiveId)) {
        this.$alert(
          // `您尚未选择客位, 是否使用默认客位 <strong style="color:#0096a4;">${this.defaultPoint.name}</strong>`,
          `${this.$t('Biz.Booking.BookTip38')}<strong style="color:#0096a4;">${this.defaultPoint.name}</strong>`,
          this.$t('Dict.Tips'), // '提示',
          {
            showCancelButton: true,
            confirmButtonText: this.$t('Dict.Sure'),
            cancelButtonText: this.$t('Dict.Cancel'),
            dangerouslyUseHTMLString: true,
          },
        ).then(() => {
          // 确定: 执行
          this.confirmDoReserve(this.defaultPoint.id);
        });
        // 取消: 执行: .catch()
      } else {
        this.confirmDoReserve(this.selectPointActiveId);
      }
    },
    // 提交时,选择默认客位,确认弹窗
    confirmDoReserve(id) {
      this.close();
      const url = 'canyin.pos.booking.doreserve';
      // 上传数据
      const upData = {
        pointId: id,
        reserveId: this.transferData.reserveId,
        reserveListSource: 1,
        modifyTimeStr: this.savedOrderData.modifyTime,
        posIdStr: this.posBaseInfo.id,
      };
      // 线上预订单-执行: 执行父组件回调-预订单执行接口方法
      this.$emit(this.upDateOptName, url, upData);
    },
  },
};

</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
@import "./BookingCommon/common.less";

.transfer {
  > .transfer-title {
    padding: 0 16px;
    line-height: 48px;
    height: 48px;
    font-size: 14px;
    font-weight: 400;

    > span{
      margin-right:17px;
    }

  }

  > .transfer-content {
    background-color: #fff;
    > .transfer-type {
      > ul::after {
        content: "";
        display: block;
        clear: both;

      }

      > ul {
        margin-left:16px;
        margin-right: 16px;
        border-bottom: 1px solid #b5b5b5;

        > li {
          height: 48px;
          line-height: 48px;
          font-size: 15px;
          margin-right: 8px;
          float: left;

          > a {
            width: 80px;
            height: 30px;
            line-height: 30px;
            text-align: center;
            border-radius:40px;
            display: inline-block;
          }

          > .area-type-active{
            background-color: #0babb9;
            color: #fff;
          }

        }
      }
    }
    .transfer-area::after{
      content: "";
      display: block;
      clear: both;

    }

    > .transfer-area {
       padding-left:16px;
       padding-right: 16px;
       border-bottom: 1px solid #b5b5b5;

      > ul {
        float: left;
          &::after {
            content: "";
            display: block;
            clear: both;
          }
        > li {
          // width: 80px;
          height: 48px;
          line-height: 48px;
          margin-right: 8px;
          font-size: 15px;
          float: left;

          > a {
            width: 80px;
            height: 30px;
            line-height: 30px;
            text-align: center;
            border-radius:40px;
            display: inline-block;
          }

          > .area-type-active{
            background-color: #0babb9;
            color: #fff;
          }
        }
      }

      > .transfer-area-pager{
        margin-left:480px;
        height: 48px;
        padding-top: 6px;
        text-align: right;

        .transverse-btn {
          width: 50px;
          height: 36px;
          border-radius: 18px;
          background-color: #f1f6f9;
          border: 1px solid #b5b5b5;
          color: #999a94;
        }

        > button[disabled] {
          color: #999;
          cursor: not-allowed;
        }

      }

    }

    > .tanfer-list-content::after{
      content: "";
      display: block;
      clear: both;
    }

    > .tanfer-list-content{
      padding-left: 16px;
      padding-right: 1px;
      margin-top:18px;
      margin-bottom: 33px;
      height: 282px!important;
      overflow: hidden;
      > .list-point{
        position: relative;
        border: 1px solid #ddd;
        width: 125px;
        height: 84px;
        padding: 5px 6px;
        margin-bottom: 10px;
        margin-right: 15px;
        float: left;
        cursor: pointer;

        > p {
          line-height: 32px;
        }
        > .point-name{
            text-align:center;
        }
        > .point-bottom {
          > span {
            display: block;
          }
          > .point-people {
            float: left;
            font-size: 0;
            > i {
              vertical-align: super;
            }
            > em {
              font-style: normal;
              font-size: 16px;
            }
          }
          > .point-openTime {
            float: right;
          }
        }
        > .repast-people{
          color: #bdb1b1;
          font-size: 10px;
          height: 20px;
          line-height: 20px;
          > i{
            font-size: 10px;
            vertical-align: top;
          }
        }
        > .repast-time-money::after{
          content: "";
          display: block;
          clear: both;
        }

        > .repast-time-money{
          margin-top: 16px;
          height: 12px;
          line-height: 12px;

          > .repast-time {
            font-size: 12px;
            float: left;
            > i{
              vertical-align: top;
              font-size: 12px;
            }
          }
          > .repast-money {
            font-size: 12px;
            float: right;
          }
        }
      }
      .freePoint {
        border-color: #b5b5b5;
        background-color: #fff;
        .point-name {
          .ver-center;
          text-align: center;
        }
      }
      .notFreePoint {
          border-color: #ff8787;
          background-color: #ffe1e1;
      }
      > .point-select-type-active{
        // background-color: #ffb4b4;
        border-color: #333;
        background-color: #e5e5e5;
      }
      > .point-select-type-active::after{
        content: '\e63a';
        position: absolute;
        top: -3px;
        right: -1px;
        font-size: 19px;
        color: #f24f64;
      }
    }

    > .transfer-content-footer::after{
        content: "";
        display: block;
        clear: both;
    }
    > .transfer-content-footer{
      border: 1px solid #b5b5b5;
      padding-top:10px;
      padding-left: 16px;
      padding-right: 16px;
      height: 57px;

      > .transfer-search{
        height: 36px;
        position: relative;
        float: left;
        line-height: 30px;
        background-color: #f5f5f5;
        border: 1px solid #b5b5b5;
        border-radius: 18px;

        > label {
          padding-left: 10px;
          color: #ccc;

          > i {
            font-size: 20px;
          }
          > input {
            background: transparent;
            border: none;
            font-weight: normal;
            font-size: 12px;
            color: #666;
          }
        }
      }
      > .transfer-pager{
        text-align: right;
      }
    }
  }

}

</style>
