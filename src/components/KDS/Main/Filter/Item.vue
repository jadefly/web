<template>
  <!--<div>-->
    <!--<div>{{ active.name }}</div>-->
    <!--<div>-->
      <!--<button-->
        <!--type="button"-->
        <!--:class="{ 'active': active.id === '' }"-->
        <!--@click="active = defaultActive"-->
      <!--&gt;{{ defaultText }}</button>-->
      <!--<button-->
        <!--type="button"-->
        <!--v-for="item in keyByList"-->
        <!--:key="item.id"-->
        <!--:class="{ 'active': active.id === item.id }"-->
        <!--@click="active = item"-->
      <!--&gt;{{ item.name }}（{{ item.num }}）</button>-->
    <!--</div>-->
  <!--</div>-->
  <div ref="selectItem" class="select-wrap">
    <div
        class="select"
        :class="{active: togglePanel}"
        @click="togglePanel = !togglePanel">
      <span>{{ active.name }}</span>
      <i :class="togglePanel ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"/>
    </div>
    <div :class="{hide: !togglePanel}" class="dish-practice">
      <ul class="item-wrap">
        <li
          :class="{active: active.id === ''}"
          class="item"
          @click="choosePractice()"
        >{{ defaultText }}</li>
        <li
          v-for="item in keyByList"
          :key="item.id"
          :class="{active: active.id === item.id}"
          class="item"
          @click="choosePractice(item)"
        >{{ item.name }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { keyBy, filter } from 'lodash';

export default {
  data() {
    return {
      togglePanel: false,
    };
  },
  props: {
    value: {
      type: String,
      default: '',
    },
    defaultText: {
      type: String,
      default: '全部',
    },
    list: {
      type: Array,
      default() {
        return [];
      },
    },
    filterMethod: Function,
    direction: {
      type: String,
      default: 'left',
    },
  },
  mounted() {
    window.addEventListener('click', this.globalToggle);
  },
  destroyed() {
    window.removeEventListener('click', this.globalToggle);
  },
  computed: {
    keyByList() {
      if (this.filterMethod) {
        return keyBy(filter(this.list, this.filterMethod), 'id');
      }
      return keyBy(this.list, 'id');
    },
    active: {
      get() {
        if (this.value === '') {
          return this.defaultActive;
        }
        return this.keyByList[this.value];
      },
      set(value) {
        this.$emit('input', value.id);
      },
    },
    defaultActive() {
      return {
        id: '',
        name: this.defaultText,
        num: 0,
      };
    },
  },
  methods: {
    choosePractice(item = null) {
      if (item) {
        this.active = item;
      } else {
        this.active = this.defaultActive;
      }
      this.togglePanel = false;
    },
    globalToggle(e) {
      if (!this.$refs.selectItem.contains(e.target)) {
        this.togglePanel = false;
      }
    },
  },
};
</script>

<style lang="less" scoped>
  .select-wrap {
    flex: 1;
    .select {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      padding: 0 15px;
      height: 40px;
      cursor: pointer;
      color: #9ca7b7;
      border: 1px solid #9ca7b7;
      background-color: #384c6a;
      &.active {
        background-color: #749ddc;
        color: #ffffff;
        transition: all .2s;
      }
      > span {
        flex: 1;
        overflow: hidden;
        text-overflow:ellipsis;
        white-space: nowrap;
      }
    }
    @keyframes showPanel {
      0%   {
        top: 24px;
        opacity: 0;
      }
      50% {
        top: 40px;
        opacity: .6;
      }
      100% {
        top: 48px;
        opacity: 1;
      }
    }
    .dish-practice {
      position: absolute;
      left: 0;
      top: 48px;
      z-index: 999999;
      padding: 9px;
      /*width: 245px;*/
      width: 100%;
      border-radius: 1px;
      box-shadow: 0 0 8px rgba(0, 0, 0, .5);
      animation: showPanel .2s;
      animation-timing-function:linear;
      background: #3d557a;
      &.hide {
        display: none;
      }
      .item-wrap {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
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
          background-color: #3d557a;
          border: 1px solid #749ddc;
          color: #ffffff;
        }
        .active {
          color: #ffffff;
          background-color: #749ddc;
        }
      }
    }
  }
</style>
