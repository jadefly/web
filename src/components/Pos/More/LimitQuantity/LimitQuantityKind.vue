<template>
  <div class="limit-filter-wrapper">
    <div class="limit-filter-item">
      <div class="choice-all">
        <button :id="'allBigClass'+ulId" type="button" class="active" @click="allBigClass('big')">{{allBigclassName}}</button>
      </div>
      <ul :id="'itemBigClasses'+ulId" style="width:100%">
        <li v-for="(item, index) in itemsBigClass" :id="'big'+item.id+ulId" :key="index" @click="bigClassLi(item.id)" :class="'big'+ulId" class="textEllipsis">{{ item.name }}</li>
      </ul>
      <Pager :pagerId="'itemBigClasses'+ulId" :showInfo="false" class="limit-btns-pager" arrowDirection="left-right"  ref="filterPager1"></Pager>
    </div>
    <div class="limit-filter-item">
      <div class="choice-all">
        <button :id="'allSmallClass'+ulId" type="button" class="active" @click="allBigClass('small')">{{allSubclassName}}</button>
      </div>
      <ul :id="'itemSmallClasses'+ulId">
        <li v-for="(item, index) in itemsSmallClass"
          :id="'small'+item.id+ulId" :class="'small'+ulId"
          :key="index" v-show="isShowItems.isAllBig||item.pid==isShowItems.selectedBigClass"
          @click="smallClassLi(item.id)" class="textEllipsis">{{ item.name }}</li>
      </ul>
     <Pager :pagerId="'itemSmallClasses'+ulId" :showInfo="false" class="limit-btns-pager" arrowDirection="left-right" ref="filterPager2"></Pager>
    </div>
  </div>
</template>


<script>
import $ from 'jquery';
import Pager from '@/components/Pos/Common/Pager';

export default {
  components: { Pager },
  props: {
    allBigclassName: {
      type: String,
      default() {
        return this.$t('Dict.AllBigclass');
      },
    },
    allSubclassName: {
      type: String,
      default() {
        return this.$t('Dict.AllSubclass');
      },
    },
    ulId: {
      type: String,
      default: '',
    },
    itemsBigClass: {
      type: Array,
      default: () => [],
    },
    itemsSmallClass: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      isShowItems: {
        isAllBig: true, // 是否选中全部大类，是：全部小类name全部展示，否：展示对应大类下的小类name
        selectedBigClass: '', // 选中大类的id
        isAllSmall: true, // 是否选中全部小类，是：全部小类品项全部展示，否：展示对应大类下的小类下的品项
        selectedSmallClass: '', // 选中小类的id
      },
    };
  },
  methods: {
    bigClassLi(id) {
      this.isShowItems.isAllBig = false;
      this.isShowItems.selectedBigClass = id;
      this.isShowItems.isAllSmall = true;
      this.isShowItems.selectedSmallClass = '';
      if (this.ulId == 'Limit') {
        this.$emit('bigClassLi', this.isShowItems); // 向父元素传递数据
      } else {
        this.$emit('bigClassLiOut', this.isShowItems); // 向父元素传递数据
      }
      this.$refs.filterPager2.refresh();
      $(`.big${this.ulId}`).removeClass('active');
      $(`.small${this.ulId}`).removeClass('active');
      $(`#allBigClass${this.ulId}`).removeClass('active');
      $(`#big${id}${this.ulId}`).addClass('active');
      $(`#big${id}${this.ulId}`).siblings().removeClass('active');
      $(`#allSmallClass${this.ulId}`).addClass('active');
    },
    // 点击其中一个小类时
    smallClassLi(id) {
      this.isShowItems.isAllSmall = false;
      this.isShowItems.selectedSmallClass = id;
      // this.$emit('bigClassLi',this.isShowItems); //向父元素传递数据
      if (this.ulId == 'Limit') {
        this.$emit('bigClassLi', this.isShowItems); // 向父元素传递数据
      } else {
        this.$emit('bigClassLiOut', this.isShowItems); // 向父元素传递数据
      }
      $(`#allSmallClass${this.ulId}`).removeClass('active');
      $(`#small${id}${this.ulId}`).addClass('active');
      $(`#small${id}${this.ulId}`).siblings().removeClass('active');
    },
    // 点击全部大类||全部小类
    allBigClass(type) {
      if (type == 'big') {
        this.zero();
      } else { // 点击全部小类时
        this.isShowItems.isAllSmall = true;
        this.isShowItems.selectedSmallClass = '';
        // this.$emit('bigClassLi',this.isShowItems); //向父元素传递数据
        if (this.ulId == 'Limit') {
          this.$emit('bigClassLi', this.isShowItems); // 向父元素传递数据
        } else {
          this.$emit('bigClassLiOut', this.isShowItems); // 向父元素传递数据
        }
        $(`#allSmallClass${this.ulId}`).addClass('active');
        $(`#itemSmallClasses${this.ulId} li.active`).removeClass('active');
      }
    },
    zero() {
      this.isShowItems.isAllBig = true;
      this.isShowItems.selectedBigClass = '';
      this.isShowItems.isAllSmall = true;
      this.isShowItems.selectedSmallClass = '';
      // this.$emit('bigClassLi',this.isShowItems); //向父元素传递大类的id
      if (this.ulId == 'Limit') {
        this.$emit('bigClassLi', this.isShowItems); // 向父元素传递数据
      } else {
        this.$emit('bigClassLiOut', this.isShowItems); // 向父元素传递数据
      }
      $(`#allBigClass${this.ulId}`).addClass('active');
      $(`.big${this.ulId}`).removeClass('active');
      $(`.small${this.ulId}`).removeClass('active');
      $(`#allSmallClass${this.ulId}`).addClass('active');
      this.$refs.filterPager1.refresh();
      this.$refs.filterPager2.refresh();
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.textEllipsis{
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
}
.limit-filter-wrapper {
  .size(100%, 100px);
  background-color: white;
  position: absolute;
  top: 0;
  .limit-filter-item {
    position: relative;
    margin: 0 15px;
    padding: 8px 0;
    cursor: pointer;
    height: 50px;
    overflow: hidden;
    .clearfix();

    &.has-pager {
      padding-right: 120px;
      border-bottom: 1px solid rgb(181, 181, 181);
    }

    &:first-child {
      border-bottom: 1px solid rgb(181, 181, 181);
    }

    > ul {
      height: 36px !important;
      padding-left: 100px;
      color: rgb(102, 102, 102);
      overflow: hidden;
      padding-right: 105px;
      font-size: 15px;
      > li {
        float: left;
        .size(100px, 36px);
        line-height: 36px;
        border-radius: 18px;
        text-align: center;
        &.active {
        background-color: #0babb9;
          color: white;
        }
      }
    }

    > .limit-btns-pager {
      position: absolute;
      top: 8px;
      right: 0;
    }

    .choice-all {
      position: absolute;
      top: 8px;
      left: 0;

      > button {
        .size(100px, 36px);
        border: none;
        border-radius: 18px;
        background-color: white;

        &.active {
          background-color: #0babb9;
          color: white;
        }
      }
    }
  }
}

.lang-enUS{
  .choice-all, .limit-filter-item li{
    font-size: 12px;
    line-height: 1;
  }
}

</style>
