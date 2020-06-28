<template>
  <div class="select-wrap">
    <div class="select" @click="togglePanel = !togglePanel">
      <span>{{text}}</span>
      <i :class="togglePanel ? 'el-icon-caret-top' : 'el-icon-caret-bottom'"/>
    </div>
    <div
        :class="{hide: !togglePanel}"
        class="dish-practice">
      <ul class="item-wrap">
        <li
            v-for="(item, index) in practiceList"
            :key="index"
            :class="{active: currentPractice === item}"
            class="item"
            @click="choosePractice(item)">{{item}}</li>
      </ul>
    </div>
  </div>
</template>

<script>
const tmpArr = ['不要葱', '不要姜', '不要盐', '煎饼果子不要鸡蛋不要油条不要面', '不要肉', '只要汤'];

export default {
  props: {
      kitchenItemInfoList: {},
  },
  data() {
    return {
      text: '全部做法',
      togglePanel: false,
      practiceList: [],
      currentPractice: null,
    }
  },
  mounted() {
    this.practiceList = tmpArr;
  },
  methods: {
    choosePractice(item) {
      this.text = item;
      this.currentPractice = item;
      this.togglePanel = false;
    },
  }
};
</script>
<style lang="less" scoped>
  .select-wrap {
    position: relative;
    .select {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      padding: 0 15px;
      width: 200px;
      height: 40px;
      cursor: pointer;
      border-radius: 20px;
      color: #273844;
      background-color: #E1E3E5;
      > span {
        flex: 1;
        overflow: hidden;
        text-overflow:ellipsis;
        white-space: nowrap;
      }
    }
    .dish-practice {
      position: absolute;
      top: 48px;
      z-index: 999999;
      right: 0;
      padding: 9px;
      width: 245px;
      border-radius: 1px;
      box-shadow: 0 0 8px rgba(0, 0, 0, .5);
      background-color: #FFFFFF;
      background: #FFFFFF;
      &.hide {
        display: none;
      }
      .item-wrap {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
        .item {
          position: relative;
          margin: 4px;
          padding: 0 5px;
          width: 104px;
          height: 34px;
          cursor: pointer;
          text-align: center;
          line-height: 34px;
          border-radius: 3px;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
          border: 1px solid #959392;
        }
        .active {
          color: #ffffff;
          background-color: #16ABEC;
        }
      }
    }
  }
</style>
