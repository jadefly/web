<template>
  <div class="userdesktop-search">
    <i class="icon icon-search"></i>
    <input
      type="text"
      ref="input"
      :placeholder="placeholder"
      v-judge
      v-model="searchText"
    >
  </div>
</template>

<script>
    import {debounce} from 'lodash';

    export default {
  props: {
    placeholder: {
      type: String,
      default() {
          return this.$t('Dict.Search');
      },
    },
  },
  data() {
    return {
      searchText: '',
    };
  },
  methods: {
    clearSearchText() {
      this.searchText = '';
    },
  },
  watch: {
    // 节流函数搜索
    searchText: debounce(function (value) {
      // this问题：此处不使用箭头函数
      this.$emit('onSearch', value);
    }, 600),
  },
};
</script>

<style lang="less" scoped>
 .userdesktop-search {
   position: relative;
   > .icon-search {
      position: absolute;
      left: 0;
      top: 0;
      font-size: 14px;
      line-height: 30px;
      padding-left: 8px;
   }
   > input {
     width: 300px;
     height: 30px;
     padding-left: 30px;
     border:1px solid #ddd;
   }
 }
</style>
