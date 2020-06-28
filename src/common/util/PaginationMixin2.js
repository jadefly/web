export default {
  data() {
    return {
      // 当前页码
      currentPage2: 1,
      // 每页个数
      prePageSize2: 8,
      preBtnDisabled2: true, // 上一页按钮点击状态
      nextBtnDisabled2: false, // 下一页按钮点击状态
    };
  },
  methods: {
    // 总页码数
    pageCount2(list) {
      return Math.ceil(list.length / this.prePageSize2) == 0 ? 1 : Math.ceil(list.length / this.prePageSize2);
    },
    // 向上翻页
    upPage2() {
      if (this.currentPage2 > 1) {
        this.currentPage2--;
        this.preBtnDisabled2 = false;
        this.nextBtnDisabled2 = false;
      }
      if (this.currentPage2 === 1) {
        this.preBtnDisabled2 = true;
      }
    },
    // 向下翻页
    downPage2(list) {
      const length = this.pageCount2(list);
      if (this.currentPage2 < length) {
        this.currentPage2++;
        this.nextBtnDisabled2 = false;
        this.preBtnDisabled2 = false;
      }
      if (this.currentPage2 === length && length !== 1) {
        this.nextBtnDisabled2 = true;
      }
    },
    // 分页方法
    pagination2(pageNo, pageSize, array) {
      const offset = (pageNo - 1) * pageSize;
      return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
    },
  },
};
