export default {
  data() {
    return {
      // 当前页码
      currentPage: 1,
      // 每页个数
      prePageSize: 8,
      preBtnDisabled: true, // 上一页按钮点击状态
      nextBtnDisabled: false, // 下一页按钮点击状态
    };
  },
  methods: {
    // 总页码数
    pageCount(list) {
      return Math.ceil(list.length / this.prePageSize) == 0 ? 1 : Math.ceil(list.length / this.prePageSize);
    },
    // 向上翻页
    upPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.preBtnDisabled = false;
        this.nextBtnDisabled = false;
      }
      if (this.currentPage === 1) {
        this.preBtnDisabled = true;
      }
    },
    // 向下翻页
    downPage(list) {
      const length = this.pageCount(list);
      if (this.currentPage < length) {
        this.currentPage++;
        this.nextBtnDisabled = false;
        this.preBtnDisabled = false;
      }
      if (this.currentPage === length && length !== 1) {
        this.nextBtnDisabled = true;
      }
    },
    // 分页方法
    pagination(pageNo, pageSize, array) {
      const offset = (pageNo - 1) * pageSize;
      return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
    },
  },
};
