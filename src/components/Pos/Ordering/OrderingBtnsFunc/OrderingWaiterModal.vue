<template>
<!-- 选择xxx -->
  <Dialog
    name="PosDialog.OrderingWaiterModal"
    :title="$t('Biz.Order.SelectWhat', [title])"
    ref="dialog"
    @close="onClose"
    append-to-body
    @open="onOpen"
    @submit="onSubmit"
    :showSubmit="true"
    width="710px"
    :hotkeys="hotKeySet"
  >
    <div class="current-waiter">
      <!-- 当前xxx -->
      {{ $t('Biz.Order.SelectedWhat', [title]) }}
      <span v-if="currentWaiter || changeWaiterData" class="waiter">
      {{
        changeWaiterData
          ? changeWaiterData.code
          : currentWaiter.code
      }}-{{
        changeWaiterData
          ? changeWaiterData.name
          : currentWaiter.name
      }}
    </span>
      <span class="zhushi" v-if="waiterType===2">{{ $t('Biz.Order.SalesmanTip')}}</span>
    </div>
    <div class="waiter-categorys">
      <div class="duty-list" ref="scrollContent">
        <!-- 全部 -->
        <div
          class="category"
          :class="{active: activeCategory === 'all'}"
          @click="changeCategory('all')"
        >{{ $t('Dict.All') }}</div>
        <div
          class="category"
          v-for="duty in dutyList"
          :key="duty.id"
          :class="{active: activeCategory === duty.id}"
          @click="changeCategory(duty.id)"
        >{{duty.name}}</div>
      </div>
      <div class="pos-pager pos-takeout-pager">
        <button
          href="javascript:;"
          @click="dutyPageUp"
          class="prev"
        ><i class="el-icon-arrow-left"></i></button>
        <button
          href="javasctipt:;"
          @click="dutyPageDown"
          class="next"
        ><i class="el-icon-arrow-right"></i></button>
      </div>
    </div>
    <div class="waiter-area" style="padding:0">
      <Paging
        :data="currentWaiterList"
        :active.sync="selectedWaiter"
        :itemWidth="171.5"
        :itemHeight="44"
        class="waiter-area"
        ref="waiterList"
        id="waiter-area-id"
      >
        <div class="waiter" slot-scope="props">
          <button
            type="button"
            @click="chooseWaiter(props.item)"
            class="btn btn-default"
            :class="{
              'btn-primary': selectedWaiter && selectedWaiter.id === props.item.id
            }"
          >{{props.item.code}}-{{props.item.name}}</button>
        </div>
      </Paging>
    </div>
    <div class="waiter-search">
      <!-- 快速查找 -->
      <el-input
        v-judge
        class="search-input"
        :placeholder="$t('Dict.QuickSearch')"
        prefix-icon="el-icon-search"
        v-num-keyboard:top
        v-model="keyword">
      </el-input>
      <!-- 共几条 -->
      <span class="page-info">{{ $t('Dict.PageStyle.Sim3', [currentWaiterList.length]) }},</span>
      <PagingBtn
        :paging="$refs.waiterList"
        :showInfo="true"
        arrowDirection="up-down"
        ref="waiterBtn"
        class="pos-pager pos-takeout-pager"
      ></PagingBtn>
    </div>
  </Dialog>
</template>

<script>
import { find } from 'lodash';
import $ from 'jquery';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Paging from '@/components/Pos/Common/Paging';
import PagingBtn from '@/components/Pos/Common/PagingBtn';

export default {
  components: { Dialog, Paging, PagingBtn },
  mixins: [DialogMixin],
  props: {
    waiterType: {
      type: Number,
      default: 3,
    },
  },
  data() {
    return {
      activeCategory: '',
      keyword: '',
      // 当前服务员
      currentWaiter: null,
      // 全部服务员
      waiterList: [],
      // 职责列表
      dutyList: [],
      // 选中的服务员
      selectedWaiter: null,
      // 每页个数
      prePageSize: 25,
      // 页码
      currentPage: 1,
      // 修改过的点餐员记录下
      changeWaiterId: '',
      changeWaiterData: null,
      // dutyList偏移参数
      scrollLeft: 0,
      offset: 100,
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
        '↑': () => {
          this.$vemit('waiterListSelect', '↑');
        },
        '↓': () => {
          this.$vemit('waiterListSelect', '↓');
        },
        '←': () => {
          this.$vemit('waiterListSelect', '←');
        },
        '→': () => {
          this.$vemit('waiterListSelect', '→');
        },
      };
    },
    // 当前服务员列表,经过筛选后的
    currentWaiterList() {
      if (!this.activeCategory) return [];
      return this.waiterList.filter((item) => {
        if (item.dutyId !== this.activeCategory && this.activeCategory !== 'all') return false;
        const searchStr = item.code + item.pinyin;
        if (searchStr.indexOf(this.keyword.toUpperCase()) < 0 && this.keyword !== '') return false;
        return true;
      });
    },
    // 最终显示的服务员列表
    showWaiterList() {
      return this.pagination(this.currentPage, this.prePageSize, this.currentWaiterList);
    },
    // 职务列表
    // dutyList () {
    //   return _.uniqBy(this.waiterList, 'dutyId').map(({dutyId, dutyName}) => ({
    //     dutyId,
    //     dutyName
    //   }));
    // },
    // 总页码数
    pageCount() {
      return Math.ceil(this.currentWaiterList.length / this.prePageSize);
    },
    // 弹窗title 为了和开台页面服务员 营销员公用   王磊修改
    title() {
      const { waiterType } = this;
      // 点菜员
      let name = this.$t('Biz.Order.DianCaiYuan');
      if (Object.is(waiterType, 1)) {
        // 服务员
        name = this.$t('Dict.Waiter');
      } else if (Object.is(waiterType, 2)) {
        // 营销员
        name = this.$t('Dict.Salesman');
      } else if (Object.is(waiterType, 3)) {
        // 点菜员
        name = this.$t('Biz.Order.DianCaiYuan');
      }
      this.chooseCurrentTypeFilter(name);
      return name;
    },
  },
  mounted() {
    this.$von('waiterListSelect', (direction) => {
      if (this.$refs.waiterList) {
        this.$refs.waiterList.select(direction);
      }
    });
  },
  methods: {
    // 打开时默认选择对应的员工  title为选择服务员时，默认过滤出所有职务为服务员的员工，以此类推
    chooseCurrentTypeFilter(name) {
      if (this.dutyList.length) {
        const data = find(this.dutyList, { name });
        if (data) {
          this.changeCategory(data.id);
        }
      }
    },
    onOpen() {
      this.keyword = ''; // 清空搜索
      this.activeCategory = 'all';
      this.selectedWaiter = null;
      this.scrollLeft = 0;
      ajax('canyin.pos.ordering.waiter')
        .then((data) => {
          if (Object.is(this.waiterType, 3)) {
            this.currentWaiter = data.current;
          } else {
            this.currentWaiter = null;
          }
          this.waiterList = data.listJson;
          this.dutyList = data.filterList;
          // 记录上次修改的点菜员的id
          // 记录上次修改的点菜员的id
          if (this.waiterType === 3) {
            this.changeWaiterId = this.resData;
            if (this.changeWaiterId) {
              this.findChangeWaiterData();
            }
          }
          this.$log.info(`打开改点菜员窗口。currentWaiter:${this.currentWaiter}`);
          this.$nextTick(() => {
            this.$refs.waiterList.refresh();
            this.$refs.waiterBtn.bind(this.$refs.waiterList);
            this.autoShow();
          });
        });
    },
    // 点菜员的话进来显示不全，自动调整让文字显示全
    autoShow() {
      const wrapWidth = $('.duty-list').width();
      const dom = $('.category.active');
      const domWidth = dom.width();
      let beforeActiveSonWidth = domWidth || 0;
      const sibilngs = dom.prevAll();
      sibilngs.map((index, item) => {
        beforeActiveSonWidth += (item.offsetWidth + 8); // 这里+8是因为每个按钮margin-left: 8px
      });
      if (domWidth + beforeActiveSonWidth > wrapWidth + 8) {
        // 这里-8是因为第一个按钮全部没有margin-left
        this.scrollLeft += domWidth + beforeActiveSonWidth - wrapWidth - 8;
        this.$refs.scrollContent.scrollLeft = this.scrollLeft;
      }
    },
    findChangeWaiterData() {
      const { ...changeData } = this.waiterList.filter(_ => _.id == this.changeWaiterId)[0];
      this.selectedWaiter = changeData;
      this.changeWaiterData = changeData;
    },
    dutyPageUp() {
      if (this.scrollLeft < this.offset) {
        this.$refs.scrollContent.scrollLeft = 0;
        this.scrollLeft = 0;
        return;
      }
      this.scrollLeft -= this.offset;
      this.$refs.scrollContent.scrollLeft = this.scrollLeft;
    },
    dutyPageDown() {
      if (
        this.scrollLeft + this.$refs.scrollContent.clientWidth
        > this.$refs.scrollContent.scrollWidth
      ) { return; }
      this.scrollLeft += this.offset;
      this.$refs.scrollContent.scrollLeft = this.scrollLeft;
    },
    // 点击提交更改点菜员
    // 王磊添加了服务员和营业员判断   1服务 2营销 3点菜
    onSubmit() {
      const { waiterType, selectedWaiter } = this;
      if (Object.is(waiterType, 3)) {
        this.close();
        this.keyword = '';
        this.submit(selectedWaiter && selectedWaiter.id);
        this.$log.info(`提交改点菜员窗口。id:${this.selectedWaiter && this.selectedWaiter.id}`);
      } else if (selectedWaiter) {
        this.close();
        this.keyword = '';
        this.submit(selectedWaiter.code);
        this.$log.info(`提交改点菜员窗口。id:${this.selectedWaiter.code}`);
      } else {
        // 选择一个xxx吧
        this.$message.warning(this.$t('Biz.Order.PleaseSelectWhat', [this.title]));
      }
    },
    // 切换类别
    changeCategory(category) {
      this.activeCategory = category;
    },
    // 选中服务员
    chooseWaiter(waiter) {
      this.selectedWaiter = waiter;
      this.currentWaiter = waiter;
    },
    // 向上翻页
    upPage() {
      if (this.currentPage > 1) {
        this.currentPage -= 1;
      }
    },
    // 向下翻页
    downPage() {
      if (this.currentPage < this.pageCount) {
        this.currentPage += 1;
      }
    },
    // 分页方法
    pagination(pageNo, pageSize, array) {
      const offset = (pageNo - 1) * pageSize;
      return (offset + pageSize >= array.length)
        ? array.slice(offset, array.length)
        : array.slice(offset, offset + pageSize);
    },
  },
  watch: {
    // 筛选条件变化重置页码
    activeCategory() {
      this.currentPage = 1;
    },
    // 筛选条件变化重置页码
    keyword() {
      this.currentPage = 1;
      // 搜索-切换到全部
      this.changeCategory('all');
      this.scrollLeft = 0;
      this.$refs.scrollContent.scrollLeft = 0;
    },
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";

  // 箭头按钮
  .pos-takeout-pager {
    position: absolute;
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

  // 当前服务员区域
  .current-waiter{
    line-height: 60px;
    padding-left: 16px;
    color: @gray-dark;
    .waiter{
      font-size: 16px;
    }
    .zhushi {
      float: right;
      color: #888;
      padding-right: 12px;
    }
  }
  // 服务员类别区域
  .waiter-categorys{
    position: relative;
    box-shadow: 0px -2px 4px #888888;
    border-bottom: 1px solid #b5b5b5;
    background-color: @white;
    padding: 0 16px;
    .duty-list{
      white-space: nowrap;
      width: 570px;
      overflow: hidden;
    }
    .category{
      cursor: pointer;
      display: inline-block;
      padding: 10px 12px 8px;
    }
    .category + .category{
      margin-left: 8px;
    }
    .active{
      border-bottom: 4px solid @brand-primary;
    }
    .pos-takeout-pager {
      right: 12px;
      top: 8px;
    }
  }
  // 服务员区域
  .waiter-area{
    background-color: @white;
    height: 316px;
    box-sizing: border-box;
    border-bottom: 1px solid #b5b5b5;
    overflow: hidden;
    li {
      .waiter{
        // display: inline-block;
        float: left;
        width: 100%;
        padding: 5px;
        button{
          width: 100%;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  // 服务员搜索区域
  .waiter-search{
    position: relative;
    background-color: @white;
    padding: 8px 14px;
    .search-input{
      width: 208px;
    }
    .pos-takeout-pager {
      right: 12px;
      top: 12px;
    }
    .page-info{
      position: absolute;
      right: 157px;
      top:21px;
      font-size: 12px;
    }
  }
  .lang-enUS {
    .waiter-search .page-info {
      right: 185px;
    }
  }
</style>
<style>
  .waiter-area li{
    overflow: hidden;
    width: 25%;
    float: left;
  }
</style>
