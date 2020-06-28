/* 单品转台-选择客位 */
<template>
<div>
  <Dialog
    name="PosDialog.Transfer"
    :title="$t('Dict.ChoosePoint')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="submit"
    :showSubmit="true"
    width="720px"
    :hotkeys="hotKeySet"
    submitId="transferSubmit">
  <div class="transfer">
    <div class="transfer-title">
      <span class="currentPoint">{{transferData.pointName}}</span>
      <span class="openbill-time">{{transferData.openTime}}</span>
      <!-- "DinerPersonNumLabel": "就餐人数：", -->
      <span class="number-guest">{{ $t('Biz.Order.DinerPersonNumLabel') }}{{transferData.peopleQty}}</span>
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
            pagerId="pointAreas"
            itemTag="li"
          ></Pager>
        </div>
      </div>
      <Paging
        :data="points"
        :active.sync="activePoint"
        :itemWidth="125"
        :itemHeight="84"
        class="tanfer-list-content"
        ref="commonTableList"
        v-autotest
      >
        <div slot-scope="props"
          class="list-point icon"
          :class="{'point-select-type-active': selectPointActiveId == props.item.id, 'select-bg-active': activePoint.id === props.item.id }"
          @click="selectPoint(props.item)">
          <h2 class="point-info">{{ props.item.code }}</h2>
          <p class="point-name">{{props.item.name}}</p>
          <p class="point-bottom">
            <span class="point-people">
              <i class="icon icon-user"></i>{{props.item.peopleqty}}/{{props.item.defCapacity}}
            </span>
            <span class="point-openTime">
              {{new Date(props.item.openTime).getHours()}}:{{zeroizeFn(new Date(props.item.openTime).getMinutes())}}
            </span>
          </p>
        </div>
      </Paging>
      <div class="transfer-content-footer">
        <div class="transfer-search">
            <Search ref="Search" @search="onSearch" searchId="transferSearch"></Search>
        </div>
        <div class="transfer-pager">
          <PagingBtn
            :showInfo="true"
            arrowDirection="up-down"
            ref="commonTablesListPager"
          ></PagingBtn>
        </div>
      </div>
    </div>
  </div>
  </Dialog>
  <singleItemTransfer ref="sItemTransfer"></singleItemTransfer>

</div>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';
import Paging from '@/components/Pos/Common/Paging';
import PagingBtn from '@/components/Pos/Common/PagingBtn';
import Search from '@/components/Pos/Order/Tables/Search';
import ajax from '@/common/js/ajax';
import singleItemTransfer from './singleItemTransfer';

export default {
  components: {
    Dialog, Pager, Search, singleItemTransfer, Paging, PagingBtn,
  },
  mixins: [DialogMixin],
  data() {
    return {
      selectAreaActiveData: { name: this.$t('Dict.AllArea') }, // 默认的区域 全部
      selectTypeActiveData: { name: this.$t('Dict.AllTypes') }, // 默认的类型 全部
      selectPointActive: {},
      selectPointActiveId: '',
      searchText: '', // 快速查找内容
      pointTypes: [], // 类型列表
      pointAreas: [], // 区域列表,
      tempPointTypes: [{ name: this.$t('Dict.AllTypes') }],
      tempPointAreas: [{ name: this.$t('Dict.AllArea') }],
      pointsList: [], // 没处理的客位列表
      transferData: {}, // 所有的信息
      activePoint: {},
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.submit();
        },
        '↑': () => {
          this.$refs.commonTableList.select('↑');
        },
        '↓': () => {
          this.$refs.commonTableList.select('↓');
        },
        '←': () => {
          this.$refs.commonTableList.select('←');
        },
        '→': () => {
          this.$refs.commonTableList.select('→');
        },
        Enter: () => {
          this.selectPoint(this.activePoint);
        },
        BackSpace: () => {
          this.$refs.Search.delWordInBlur();
        },
        ...this.setKeySearchHotKey(),
      };
    },
    // 对客位列表过滤处理下
    points() {
      let filterList = [];
      if (this.pointsList) {
        filterList = this.pointsList.filter((list) => {
          if (!this.selectAreaActiveData.id && !this.selectTypeActiveData.id) {
          // 都是全部的时候
            return (list.code.indexOf(this.searchText) !== -1 || list.pinyin.indexOf((this.searchText).toUpperCase()) !== -1);
          } if (this.selectTypeActiveData.id && this.selectAreaActiveData.id) {
          // 都是不是全部的时候
            return +list.areaid === +this.selectAreaActiveData.id && +list.pointtypeid === +this.selectTypeActiveData.id && list.code.indexOf(this.searchText) !== -1;
          }
          if (this.selectTypeActiveData.id) {
            return +list.pointtypeid === +this.selectTypeActiveData.id && list.code.indexOf(this.searchText) !== -1;
          }
          return list.areaid === this.selectAreaActiveData.id && list.code.indexOf(this.searchText) !== -1;
        });
        if (filterList.length > 0) {
          this.activePoint = filterList[0];
        }
      }
      return this.pointsList ? filterList : [];
    },
  },
  methods: {
    // 打开事件
    onOpen() {
      this.transferData = this.resData; // 所有的数据
      this.pointsList = this.resData.points;// 客位列表
      this.pointTypes = this.resData.pointTypes;
      this.pointAreas = this.resData.areas;
      // 默认被选中的区域 默认被选中的类型
      [this.selectAreaActiveData, this.selectTypeActiveData] = [this.tempPointAreas[0], this.tempPointTypes[0]];
      this.selectPointActive = {}; // 初始化下被选中的客位
      this.selectPointActiveId = '';
      // 每次延迟使用分页刷新列表
      setTimeout(() => {
        this.$refs.commonTablesListPager.bind(this.$refs.commonTableList);
        this.$refs.commonTableList.refresh();
      }, 0);
    },
    // 获取搜索框用的快捷键
    setKeySearchHotKey() {
      const searchKeys = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890'.split('');
      const keysObj = {};
      searchKeys.forEach((item) => {
        keysObj[item] = () => {
          this.$refs.Search.addWordInBlur(item);
        };
      });
      return keysObj;
    },
    // 搜索的内容监听
    onSearch(text) {
      this.searchText = text;
      setTimeout(() => {
        this.$refs.commonTableList.refresh();
      }, 100);
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
      this.selectPointActive = pointData;
      this.selectPointActiveId = pointData.id;
      this.activePoint = pointData;
    },
    // 选择完进行提交
    submit() {
      if (!this.selectPointActiveId && this.selectPointActiveId === '') {
        this.$message({
          message: this.$t('Dict.PlsChoosePoint'),
          type: 'error',
        });
      } else {
        ajax('canyin.pos.tranItem.tranitemdetailview', {
          params: {
            bsId: this.resData.bsId,
            opentime: this.resData.openTime,
            peopleqty: this.resData.peopleQty,
            bscode: this.resData.bscode,
            authCode: this.resData.authCode,
            authId: this.resData.authId,
            pointId: this.resData.pointId,
            toPointId: this.selectPointActiveId,
          },
        }).then((data) => {
          this.close();
          this.$set(data, 'is_team', this.selectPointActive.is_team);
          this.$refs.sItemTransfer.open(data);
          // 清空搜索项历史内容
          if (this.$refs.Search) {
            this.$refs.Search.clearSearchText();
          }
        });
      }
    },
    onClose() {
      if (this.$refs.Search) {
        this.$refs.Search.clearSearchText();
      }
    },
    // 补零操作
    zeroizeFn(minuteTime) {
      return minuteTime < 10 ? `${'0 '}${minuteTime}` : minuteTime;
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
    .currentPoint{
      font-weight: bold;
      color: #f24f64;
    }
    > span{
      margin-right:17px;
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
      .allPointTypes{
        display: inline-block
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
      .area-type-active{
        background-color: #0babb9;
        color: #fff;
      }
      .itemsPointTypes{
        width: 500px !important;
      }
      .transfer-type-pager{
        position: absolute;
        top: 7px;
        right: 0;
      }
    }
    .transfer-area::after{
      content: "";
      display: block;
      clear: both;
    }
    > .transfer-area {
        height: 50px;
        overflow: hidden;
        padding-left:16px;
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
      .area-type-active{
          background-color: #0babb9;
          color: #fff;
        }
       > .transfer-area-pager{
         position: absolute;
         top: 7px;
         right: 15px;
       }
      .itemsPointAreas{
        width: 500px !important;
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
      .list-point{
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
        > .point-name{
            width: 100%;
            text-align:center;
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
      .point-select-type-active, .select-bg-active{
        background-color: #ffb4b4;
      }
      .point-select-type-active::after{
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
        position: relative;
        float: left;
        background-color: #f5f5f5;
        border: 1px solid #b5b5b5;
        border-radius: 18px;
      }
      > .transfer-pager{
        text-align: right;
      }
    }
  }

}
</style>
