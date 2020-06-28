<!-- 复制菜品-选择客位 -->
<template>
<div>
  <Dialog
    name="PosDialog.CopyDishes"
    :title="$t('Dict.ChoosePoint')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="submit"
    :showSubmit="true"
    width="720px"
    :hotkeys="hotKeySet"
  >
  <div class="transfer">
    <div class="transfer-title">
      <span class="currentPoint">{{transferData.pointName}}</span>
      <span class="openbill-time">{{transferData.openTime}}</span>
      <span class="number-guest">{{ $t('Dict.EatPersonNum') }}:{{transferData.peopleQty}}</span>
    </div>
    <div class="transfer-content">
      <div class="transfer-type">
        <ul>
          <li>
            <a
              href="javascript:void(0)"
              @click="selectType(tempPointTypes[0])"
              :class="{'area-type-active':selectTypeActiveData.name == tempPointTypes[0].name}">
              {{tempPointTypes[0].name}}
            </a>
          </li>
        </ul>
        <ul id="pointTypes" class="itemsPointTypes">
          <li v-for="(type , index) in pointTypes" :key="index">
            <a
              href="javascript:void(0)"
              :class="{'area-type-active':selectTypeActiveData.name == type.name}"
              @click="selectType(type)">
              {{ type.name }}
            </a>
          </li>
        </ul>
        <div class="transfer-type-pager">
          <Pager
            ref="typePager"
            pagerId="pointTypes"
            itemTag="li"
          ></Pager>
        </div>
      </div>
      <div class="transfer-area">
        <ul>
          <li>
            <a
              href="javascript:void(0)"
              @click="selectArea(tempPointAreas[0])"
              :class="{'area-type-active':selectAreaActiveData.name == tempPointAreas[0].name}">
              {{tempPointAreas[0].name}}
            </a>
          </li>
        </ul>
        <ul id="pointAreas" class="itemsPointAreas">
          <li v-for="(area , index) in pointAreas" :key="index">
            <a
              href="javascript:void(0)"
              :class="{'area-type-active':selectAreaActiveData.name == area.name}"
              @click="selectArea(area)">
              {{ area.name }}
            </a>
          </li>
        </ul>
        <div class="transfer-area-pager">
          <Pager
            ref="areaPager"
            pagerId="pointAreas"
            itemTag="li"
          ></Pager>
        </div>

      </div>
      <ul id="transferListId" class="tanfer-list-content">
        <li
          class="list-point icon"
          v-for="(point , index) in points"
          :key="index"
          :class="{'point-select-type-active': selectPointActiveId == point.id}"
          @click="selectPoint(point)">
          <h2 class="point-info">{{ point.code }}</h2>
          <p class="point-name">{{point.name}}</p>
          <p class="point-bottom">
            <span class="point-people">
              <i class="icon icon-user"></i>{{point.peopleqty}}/{{point.defCapacity}}
            </span>
            <span class="point-openTime">
              {{new Date(point.openTime).getHours()}}
              :
              {{zeroizeFn(new Date(point.openTime).getMinutes())}}
            </span>
          </p>
        </li>
      </ul>
      <div class="transfer-content-footer">
        <div class="transfer-search">
            <Search ref="Search" @search="onSearch"></Search>
        </div>
        <div class="transfer-pager">
          <Pager
          ref="pager"
          pagerId="transferListId"
          itemTag="li"
          :showInfo = "true"
          arrowDirection="up-down"
          ></Pager>
        </div>

      </div>
    </div>

  </div>

  </Dialog>
  <!-- <singleItemTransfer ref="sItemTransfer"></singleItemTransfer> -->
  <CopyDishesItem ref="CopyDishesItem" @selected='selected'></CopyDishesItem>
</div>
</template>

<script>
import { mapState } from 'vuex';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';
import Search from '@/components/Pos/Order/Tables/Search';
// import singleItemTransfer from './singleItemTransfer'
import CopyDishesItem from './CopyDishesItem';
import ajax from '@/common/js/ajax';

export default {
  components: {
    Dialog,
    Pager,
    Search,
    CopyDishesItem,
    // singleItemTransfer
  },
  mixins: [DialogMixin],
  data() {
    return {
      selectAreaActiveData: { name: this.$t('Dict.AllArea') }, // 默认的区域
      selectTypeActiveData: { name: this.$t('Dict.AllTypes') }, // 默认的类型
      selectPointActive: {},
      selectPointActiveId: '',
      searchText: '', // 快速查找内容
      pointTypes: [], // 类型列表
      pointAreas: [], // 区域列表,
      tempPointTypes: [{ name: this.$t('Dict.AllTypes') }],
      tempPointAreas: [{ name: this.$t('Dict.AllArea') }],
      pointsList: [], // 没处理的客位列表
      transferData: {}, // 所有的信息
    };
  },
  computed: {
    ...mapState({
      currentPointId: state => state.pos.currentPointId,
    }),
    hotKeySet() {
      return {
        PgDn: () => {
          this.submit();
        },
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
          }
          if (this.selectTypeActiveData.id && this.selectAreaActiveData.id) {
          // 都是不是全部的时候
            return list.areaid == this.selectAreaActiveData.id
              && list.pointtypeid == this.selectTypeActiveData.id
              && list.code.indexOf(this.searchText) !== -1;
          }
          if (this.selectTypeActiveData.id) {
            return list.pointtypeid == this.selectTypeActiveData.id
              && list.code.indexOf(this.searchText) !== -1;
          }
          return list.areaid == this.selectAreaActiveData.id
            && list.code.indexOf(this.searchText) !== -1;
        });
      }
      this.$nextTick(() => {
        if (this.$refs.pager) {
          this.$refs.pager.refresh();
        }
      });
      return this.pointsList ? filterList : [];
    },
  },
  methods: {
    // 打开事件
    onOpen() {
      this.transferData = this.resData; // 所有的数据
      this.pointsList = this.resData.points; // 客位列表
      this.pointTypes = this.resData.pointTypes;
      this.pointAreas = this.resData.areas;
      this.selectAreaActiveData = this.tempPointAreas[0];// 默认被选中的区域
      this.selectTypeActiveData = this.tempPointTypes[0];// 默认被选中的类型
      this.selectPointActive = {}; // 初始化下被选中的客位
      this.selectPointActiveId = '';
      this.$nextTick(() => {
        this.$refs.pager.refresh();
        this.$refs.typePager.refresh();
        this.$refs.areaPager.refresh();
      });
      this.$log.info('打开复制菜品窗口。');
    // 搜索的内容监听
    },
    onSearch(text) {
      this.searchText = text;
    },
    // 类型的选择
    selectType(type) {
      this.selectTypeActiveData = type;
    },
    // 选择好菜品了
    selected(list) {
      this.$emit('selected', list);
    },
    // 区域的选择
    selectArea(area) {
      this.selectAreaActiveData = area;
    },
    // 客位的选择
    selectPoint(pointData) {
      this.selectPointActive = pointData;
      this.selectPointActiveId = pointData.id;
    },
    // 选择完进行提交
    submit() {
      if (this.selectPointActiveId === '') {
        this.$message({
          message: this.$t('Dict.PlsChoosePoint'),
          type: 'error',
        });
        return;
      }
      ajax('canyin.pos.addorder.copymenupointbsinfo', {
        params: { 
          pointId: this.selectPointActive.id, // 复制的客位id
          currentPointId: this.currentPointId, // 当前客位id
        },
      }).then((data) => {
        this.close();
        this.$set(data, 'is_team', this.selectPointActive.is_team);
        this.$refs.CopyDishesItem.open(data);
        // 清空搜索项历史内容
        if (this.$refs.Search) {
          this.$refs.Search.clearSearchText();
        }
      });
      this.$log.info('提交复制菜品窗口。');
    },
    onClose() {
      if (this.$refs.Search) {
        this.$refs.Search.clearSearchText();
      }
    },
    // 补零操作
    zeroizeFn(minuteTime) {
      return minuteTime < 10 ? `${'0'}${minuteTime}` : minuteTime;
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.transfer {
  > .transfer-title {
    padding: 0 16px;
    line-height: 48px;
    height: 48px;
    font-size: 14px;
    font-weight: 400;
    .currentPoint {
      font-weight: bold;
      color: #f24f64;
    }
    > span {
      margin-right: 17px;
    }
  }

  > .transfer-content {
    background-color: #fff;
    > .transfer-type {
      height: 50px;
      display: flex;
      position: relative;
      border-bottom: 1px solid #b5b5b5;
      margin: 0 15px;
      .allPointTypes {
        display: inline-block;
      }
      > ul::after {
        content: "";
        display: block;
        clear: both;
      }
      > ul {
        height: 49px !important;
        > li {
          height: 49px;
          line-height: 66px;
          font-size: 15px;
          margin-right: 6px;
          float: left;

          > a {
            width: 76px;
            height: 30px;
            line-height: 32px;
            text-align: center;
            border-radius: 40px;
            display: inline-block;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            margin-top: 8px;
          }
        }
      }
      .area-type-active {
        background-color: #0babb9;
        color: #fff;
      }
      .itemsPointTypes {
        width: 500px !important;
      }
      .transfer-type-pager {
        position: absolute;
        top: 7px;
        right: 0;
      }
    }
    .transfer-area::after {
      content: "";
      display: block;
      clear: both;
    }
    > .transfer-area {
      height: 50px;
      overflow: hidden;
      padding-left: 16px;
      padding-right: 16px;
      display: flex;
      position: relative;
      border-bottom: 1px solid #b5b5b5;
      > ul::after {
        content: "";
        display: block;
        clear: both;
      }
      > ul {
        height: 49px !important;
        > li {
          height: 49px;
          line-height: 66px;
          font-size: 15px;
          margin-right: 6px;
          float: left;

          > a {
            width: 76px;
            height: 30px;
            line-height: 32px;
            text-align: center;
            border-radius: 40px;
            display: inline-block;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            margin-top: 8px;
          }
        }
      }
      .area-type-active {
        background-color: #0babb9;
        color: #fff;
      }
      > .transfer-area-pager {
        position: absolute;
        top: 7px;
        right: 15px;
      }
      .itemsPointAreas {
        width: 500px !important;
      }
    }
    > .tanfer-list-content::after {
      content: "";
      display: block;
      clear: both;
    }
    > .tanfer-list-content {
      padding-left: 16px;
      padding-right: 1px;
      margin-top: 18px;
      margin-bottom: 33px;
      height: 282px !important;
      overflow: hidden;
      > .list-point {
        position: relative;
        border: 1px solid #ff6c6c;
        width: 125px;
        height: 84px;
        padding: 5px 6px;
        margin-bottom: 10px;
        margin-right: 15px;
        background-color: #ffe1e1;
        float: left;
        > p {
          line-height: 32px;
        }
        > .point-name {
          width: 100%;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
        }
        > .point-bottom {
          > span {
            display: block;
          }
          > .point-people {
            float: left;
          }
          > .point-openTime {
            float: right;
            font-size: 13px;
            padding-top: 3px;
          }
        }
        > .repast-people {
          color: #bdb1b1;
          font-size: 10px;
          height: 20px;
          line-height: 20px;
          > i {
            font-size: 10px;
            vertical-align: top;
          }
        }
        > .repast-time-money::after {
          content: "";
          display: block;
          clear: both;
        }
        > .repast-time-money {
          margin-top: 16px;
          height: 12px;
          line-height: 12px;

          > .repast-time {
            font-size: 12px;
            float: left;
            > i {
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
      > .point-select-type-active {
        background-color: #ffb4b4;
      }
      > .point-select-type-active::after {
        content: "\e63a";
        position: absolute;
        top: -3px;
        right: -1px;
        font-size: 19px;
        color: #f24f64;
      }
    }

    > .transfer-content-footer::after {
      content: "";
      display: block;
      clear: both;
    }
    > .transfer-content-footer {
      border: 1px solid #b5b5b5;
      padding-top: 10px;
      padding-left: 16px;
      padding-right: 16px;

      height: 57px;

      > .transfer-search {
        position: relative;
        float: left;
        background-color: #f5f5f5;
        border: 1px solid #b5b5b5;
        border-radius: 18px;
      }
      > .transfer-pager {
        text-align: right;
      }
    }
  }
}
</style>
