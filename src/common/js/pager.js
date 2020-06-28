import $ from 'jquery';
import { debounce } from 'lodash';

function debug(title, value, isDebug) {
  if (isDebug) {
    // eslint-disable-next-line no-console
    console.log(title, value);
  }
}

export default class Pager {
  constructor(wrap, item, options) {
    this.wrap = $(wrap);
    this.item = item;
    const defaults = {
      scrollMode: 'data',
      direction: 'vertical',
      fullView: true,
      animate: 0,
    };
    this.options = $.extend(defaults, options);
    this.itemHeight = 0;
    this.itemWidth = 0;
    this.colSize = 0;
    this.pageSize = 0;
    this.rowNum = 0;
    this.totalPage = 0;
    this.currentPage = 1;
    this.wrapHeight = 0;
    this.init();
  }

  init() {
    this.refreshState();
    window.onresize = debounce(() => {
      this.refreshState();
    }, 500);
  }

  refreshState(isDebug, isScorllTop = true, wrap = null) {
    if (wrap) {
      this.wrap = $(wrap);
    }
    this.wrap.removeAttr('style');
    debug('容器', this.wrap, isDebug);
    debug('容器高', this.wrap.width(), isDebug);
    debug('容器宽', this.wrap.height(), isDebug);
    this.itemHeight = this.getItemHeight();
    debug('Item高度', this.itemHeight, isDebug);
    this.itemWidth = this.getItemWidth();
    debug('Item宽度', this.itemWidth, isDebug);
    this.colSize = this.itemWidth ? parseInt(this.wrap.width() / this.itemWidth, 10) : 0;
    debug('列', this.colSize, isDebug);
    this.pageSize = this.itemHeight ? parseInt(this.wrap.height() / this.itemHeight, 10) : 0;
    debug('每页行', this.pageSize, isDebug);
    this.currentPage = 1;

    this.rowNum = this.colSize ? parseInt((this.wrap.find(`${this.item}:visible`).length - 1) / this.colSize + 1, 10) : 0;
    debug('总行数', this.rowNum, isDebug);
    this.totalPage = this.pageSize ? parseInt((this.rowNum - 1) / this.pageSize + 1, 10) : 1;
    debug('总页数', this.totalPage, isDebug);
    if (this.options.fullView && this.options.scrollMode === 'data') {
      this.wrap.css('height', `${this.itemHeight * this.pageSize}px`);
      debug('DATA模式-计算后的容器高度', this.itemHeight * this.pageSize, isDebug);
      this.wrap.css('overflow', 'hidden');
    }
    if (this.options.scrollMode === 'simple') {
      this.wrapHeight = this.wrap.height();
      debug('简单模式-计算后的容器高度', this.wrap.height(), isDebug);
    }
    // 需要补充的行数
    this.virtualRow = this.pageSize - (this.rowNum % this.pageSize);
    if (this.virtualRow === this.pageSize) {
      this.virtualRow = 0;
    }
    // 滚动到顶部
    if (isScorllTop) {
      this.wrap.scrollTop(0);
    }
  }

  getItemHeight() {
    const items = this.wrap.find(`${this.item}:visible`);
    this.itemHeight = items.length ? items.outerHeight(true) : 0;
    // console.log('getItemHeight:', this.itemHeight, items);
    return this.itemHeight;
  }

  getItemWidth() {
    const items = this.wrap.find(`${this.item}:visible`);
    this.itemWidth = items.length ? this.wrap.find(`${this.item}:visible`).outerWidth(true) : 0;
    return this.itemWidth;
  }

  prev() {
    if (this.options.animate) {
      this.wrap.stop().animate({
        scrollTop: this.wrap.scrollTop() - this.itemHeight * this.pageSize,
      }, this.options.animate);
    } else {
      this.wrap.scrollTop(this.wrap.scrollTop() - this.itemHeight * this.pageSize);
    }
  }

  next() {
    if (this.options.animate) {
      this.wrap.stop().animate({
        scrollTop: this.wrap.scrollTop() + this.itemHeight * this.pageSize,
      }, this.options.animate);
    } else {
      // 如果是0 的话可能是子节点的一个元素的高度超出了父节点的高度, 那样话pages
      if (this.pageSize === 0) {
        this.pageSize = 1;
      }
      this.wrap.scrollTop(this.wrap.scrollTop() + this.itemHeight * this.pageSize);
    }
  }

  to(page, slient) {
    this.checkState();
    this.currentPage = page;
    this.doPager();
    if (this.options.onPager && !slient) {
      this.options.onPager(this.currentPage, this.pageSize, this.colSize);
    }
  }

  checkState() {
    if (
      !this.colSize
      || !this.itemHeight
      || !this.itemWidth
      || !this.pageSize
      || !this.rowNum
      || !this.totalPage
    ) {
      this.refreshState();
    }
  }

  doPager() {
    if (this.options.animate) {
      this.wrap.stop().animate({
        scrollTop: (this.currentPage - 1) * this.itemHeight * this.pageSize,
      }, this.options.animate);
    } else {
      this.wrap.scrollTop((this.currentPage - 1) * this.itemHeight * this.pageSize);
    }
  }

  state() {
    return {
      current: this.currentPage,
      total: this.totalPage,
    };
  }
}
