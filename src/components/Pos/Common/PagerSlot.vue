<template>
  <div class="pageSlotBox">
    <div class="pageList" ref="ref_pageList" id="pageList"
    :style="{overflowY: type=== 'scroll'&&totalPage>1 ?'scroll':'hidden',
    height: paginationBtnShow ? 'calc(100% - 40px)': '100%'}"
     @mousewheel.prevent @touchmove.prevent>
      <ul id="pageListUl" ref="ref_pageListUl" :style="{height: type==='scroll'?'auto':'100%'}">
        <!--翻页数据List-->
        <slot name="list" :showList="showList"></slot>
        <!-- <li v-for="(item, index) in showList" :key="index">
          <button class="btn btn-default" :class="item.selected?'selected':''">{{ item.name }}</button>
        </li> -->
      </ul>
    </div>
    
    <div class="pos-pager" v-if="paginationBtnShow">
      <div class="pos-takeout-pager" :class="{left:arrowAlign==='left',right:arrowAlign=='right',center:arrowAlign==='center'}">
        <span class="page-info" v-if="paginationShow">
          {{$t('Dict.PageStyle.Text2', {length:listAll.length, currentPage: currentPage, totalPage: totalPage})}}
          <!-- 共{{listAll.length}}条，{{currentPage}}/{{pageCount(listAll)}}页 -->
        </span>
        <button href="javascript:;" class="prev"
          :disabled="preBtnDisabled"
          @click="upPage">
          <i class="el-icon-arrow-up"></i>
        </button>
        <button href="javasctipt:;" class="next"
          :disabled="nextBtnDisabled"
          @click="downPage(listAll)">
          <i class="el-icon-arrow-down"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    listAll: {
      type: Array,
      default: [],
    },
    pageSize: {
      // type: Number,
      default: 1,
    },
    curPage: {
      // type: Number,
      default: 1,
    },
    paginationShow: { // 页码显示
      type: Boolean,
      default: true,
    },
    paginationBtnShow: { // 页码箭头btn显示
      type: Boolean,
      default: true,
    },
    type: { // 翻页形式，默认为正常翻页，scroll为滚动翻页
      type: String,
      default: '',
    },
    arrowAlign: { // 翻页箭头位置
      type: String,
      default: 'right',
    }
  },
  data() {
    return {
      preBtnDisabled: true, // 上一页按钮点击状态
      nextBtnDisabled: false, // 下一页按钮点击状态
      currentPage: 1,
      prePageSize: this.pageSize || 1,
      listObj: null,
      listUlObj: null,
      pageH: 0, // 区域高度
      allH: 0, // 内容总高度
      scroll_top: 0,
    }
  },
  computed: {
    showList() {
      // this.$nextTick(() => this.getEle());
      if (this.type === 'scroll') { // 上下滚动翻页，有滚动条
        return this.listAll;
      }
      return this.pagination(this.currentPage, this.prePageSize, this.listAll);
    },
    totalPage() {
      return Math.ceil(this.listAll.length / this.prePageSize); // 向上取整
    },
  },
  methods: {
    getEle() {
      this.listObj = this.$refs.ref_pageList;
      this.listUlObj = this.$refs.ref_pageListUl;
      this.pageH = this.listObj.offsetHeight;
      this.pageW = this.listObj.offsetWidth;
      this.allH = this.listUlObj.offsetHeight;
    },
    // 总页码数
    pageCount(list) {
      return Math.ceil(list.length / this.prePageSize) == 0 ? 1 : Math.ceil(list.length / this.prePageSize);
    },
    // 向上翻页
    upPage() {
      this.getEle();
      if (this.currentPage > 1) {
        if (this.type === 'scroll') { // 上下滚动翻页，有滚动条
          this.listObj.scrollTop = this.listObj.scrollHeight - this.pageH * this.currentPage;
        }
        this.currentPage--;
        this.preBtnDisabled = false;
        this.nextBtnDisabled = false;
      }
      if (this.currentPage === 1) {
        this.listObj.scrollTop = 0;
        this.preBtnDisabled = true;
      }
      this.scroll_top = this.listObj.scrollTop;
    },
    // 向下翻页
    downPage(list) {
      this.getEle();
      const length = this.pageCount(list);
      if (this.currentPage < length) { // 可翻页
        this.nextBtnDisabled = false;
        this.preBtnDisabled = false;
        // 有滚动条
        if (this.type === 'scroll') {
          this.listObj.scrollTop = this.listObj.scrollHeight + this.pageH*this.currentPage;
        }
        this.currentPage++;
      }
      // if (this.type === 'scroll' && this.allH - this.listObj.scrollHeight < this.pageH) { // 到底了
      //   this.nextBtnDisabled = true;
      // }
      this.scroll_top = this.listObj.scrollTop;
      if (this.currentPage === length && length !== 1) this.nextBtnDisabled = true;
    },
    // 分页方法
    pagination(pageNo, pageSize, array) {
      const offset = (pageNo - 1) * pageSize;
      return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
    },
    getPageSize(obj) {
      const listLi = obj.children[0];
      if (listLi) {
        // console.log('----W', this.pageW, listLi.offsetWidth, listLi);
        // console.log('----H', this.pageH, listLi.offsetHeight);
        const rowNum = parseInt(this.pageW / listLi.offsetWidth);
        const colNum = parseInt(this.pageH / listLi.offsetHeight);
        console.log('geshu:', rowNum * colNum);
        return rowNum * colNum;
      }
      return 1;
    },
    init() { // 初始化
      this.prePageSize = this.pageSize === 0 ? 1 : parseInt(this.pageSize); // 一页显示数量
      this.$nextTick(() => {
        this.getEle(); // 获取元素
        // 未设置一页显示数量，根据长宽计算
        if (this.prePageSize === 1 && this.listAll.length > 0) this.prePageSize = this.getPageSize(this.listUlObj);
        if (this.currentPage !== +this.curPage) {
          this.currentPage = this.curPage;
          // 更新初始化数据
          this.preBtnDisabled = true;
          this.nextBtnDisabled = false;
          this.pagination(this.currentPage, this.prePageSize, this.listAll); // 重新渲染数据
        }
      });
    },
  },
};
</script>
<style lang="less">
.pageSlotBox .pos-pager{
  button {
    width: 44px;
    height: 30px;
    border: 1px solid #9a9a9a;
    line-height: 28px;
    border-radius: 14px;
    text-align: center;
    margin-left: 8px;
    background-color: white;
    color : #273844;
    cursor: pointer;
    > i { font-size: 18px;}
    &[disabled] {
      color: #999;
      cursor: not-allowed;
    }
    &.next { margin-left: 8px; }
  }
}
</style>
<style lang="less" scoped>
.pageList {
  ul {
    min-height: 100%;
    > li:nth-last-child(1) {
      margin-bottom: 0;
    }
  }
  &::-webkit-scrollbar{ /*滚动条整体样式*/
    width: 5px; /*高宽分别对应横竖滚动条的尺寸*/
    height: 1px;
  }
  &::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
    border-radius: 3px;
    background: #999;
  }
  &::-webkit-scrollbar-track {/*滚动条里面轨道*/
    border-radius: 3px;
    background: #EDEDED;
  }
}
.pos-pager{
  overflow: hidden;
  // 箭头按钮
  .pos-takeout-pager {
    display: flex;
    justify-content: flex-end;
    &.center {
      justify-content: center;
    }
    &.left {
      justify-content: flex-start;
    }
  }
}
</style>
