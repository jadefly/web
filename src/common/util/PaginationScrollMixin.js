let $_scrollContent = null;

export default {
  data () {
    return {
      // 当前页码
      currentPage: 1,
      pageCount: 0,
    }
  },
  // 离开实例前，取消监听并置空scroll对象
  beforeDestroy () {
    if ($_scrollContent){
      $_scrollContent.removeEventListener('scroll', this.scrollListener);
      $_scrollContent = null;
    }
  },
  methods: {
    // 切换流水时清除绑定事件并初始化当前页，用于解决
    removeScrollEven() {
      $_scrollContent.removeEventListener('scroll', this.scrollListener);
      this.currentPage = 1;
    },
    // 设置分页信息
    setPageInfo (scrollContent) {
      // 账单查询和已结账单公用一个组件，如果不将$_scrollContent重置一下，则造成有一个绑定不上滚动事件
      $_scrollContent = null
      this.initScroll(scrollContent);
      this.pageCount =  Math.ceil(scrollContent.scrollHeight/scrollContent.clientHeight);
    },
    // 滚动监听
    scrollListener () {
      if ($_scrollContent.scrollHeight <= $_scrollContent.scrollTop + $_scrollContent.clientHeight){
        this.currentPage = this.pageCount;
      } else {
        this.currentPage = parseInt(($_scrollContent.scrollTop / $_scrollContent.clientHeight),10) + 1;
      }
    },
    // 初始化滚动
    initScroll (scrollContent) {
      if (!$_scrollContent){
        scrollContent.addEventListener('scroll', this.scrollListener);
      }
      $_scrollContent = scrollContent;
    },
    // 向上翻页
    upPage () {
      if (!$_scrollContent) return;
      if (this.currentPage > 1) this.currentPage--
      this.setScrollTop();
    },
    // 向下翻页
    downPage () {
      if (!$_scrollContent) return;
      if (this.currentPage < this.pageCount) this.currentPage++
      this.setScrollTop();
    },
    setScrollTop () {
      $_scrollContent.scrollTop = (this.currentPage-1) * $_scrollContent.clientHeight
    }
  },
}
