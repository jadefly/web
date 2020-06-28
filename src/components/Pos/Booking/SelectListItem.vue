<template>
  <div :id="id" class="bookingStatus-box customAnimite"
    :style="{width: width, background: disabled ? '#ebebe4': ''}"
    @click.stop="selectDown">
    <span class="status-btn"
    :class="{'overflow-ellipsis': overflowEllipsis}"
    :title="overflowEllipsis && title">
      {{ title }}<em class="status-btnLogo icon icon-arr-down"></em>
    </span>
    <ul class="status-list"
      :style="{bottom: selectList()}"
      v-show="statusSwitch">
      <li class="status-list-item"
        :class="{'overflow-ellipsis': overflowEllipsis}"
        v-for="(item, index) in statusBtns"
        @click="pointState(item)"
        :key="index"
        :title="overflowEllipsis && item.name">
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  /*
    父组件传入数据格式(必须)
    // 下拉列表集合
    businessShift: [
      { "startTime": "06:30", "id": "9900000000000004", "isStartShift": true, "name": "早市" },
      { "startTime": "12:00", "id": "9900000000000005", "isStartShift": false, "name": "午市" }
    ],
    title: '按钮默认名称',
  */
  props: {
    // 组件的HTML id
    id: {
      type: String,
      default: '',
    },
    // 触发父组件关闭方法对象
    closeList: {},
    // 子组件使用传入数据ID作为区别标识, 并返还id
    type: {
      type: String,
      default: '',
    },
    // 设置宽度
    width: {
      type: String,
      default: '160px',
    },
    // 弹出方向
    direction: {
      type: String,
      default: 'down',
    },
    // 默认显示第一项
    defaultFirstItem: {
      type: String,
    },
    // 可执行参数
    disabled: {
      type: Boolean,
      default: false,
    },
    // 默认传入数据对象
    statusBtns: {},
    // 向上反馈数据,父组件的方法名
    upDateOptName: {
      type: String,
      default: 'selectDone',
    },
    // 超出文本显示省略号，且存在文字提示
    overflowEllipsis: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      title: '',
      currItem: null,
      statusSwitch: false,
    };
  },
  created() {
    // 写死 默认传入数据对象数组的第一个的name属性
    this.title = this.defaultFirstItem ? this.defaultFirstItem : this.statusBtns[0].name;
  },
  methods: {
    selectList() {
      // 设定默认方式和位置参数
      return this.direction === 'up' ? '32px' : '';
    },
    selectDown() {
      if (this.disabled) {
        return false;
      }
      // 下拉列表开/关
      this.statusSwitch = !this.statusSwitch;
      // 执行触发父组件全局关闭方法, 并传递组件id
      if (this.closeList) {
        this.closeList(this.id);
      }
      return true;
    },
    // 客位状态按钮触发事件
    pointState(item) {
      this.title = item.name;
      // 执行,子组件反馈父组件数据:this.upDateOptName-父组件方法名, item-当前激活数据, this.type-父组件传入的类型(数据ID)
      this.$emit(this.upDateOptName, item, this.type);
    },
  },
};
</script>

<style lang="less" scoped>
@import "./BookingCommon/common.less";
@import "~@/common/less/mixins/text-overflow.less";

.bookingStatus-box {
  width: 160px;
  height: 32px;
  display: inline-block;
  position: relative;
  text-align: center;
  vertical-align: middle;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  .setFont(12px, #333);
  cursor: pointer;

  .bgc;

  &:hover {
    border-color: #c0c4cc;
  }

  > span {
    width: 100%;
    line-height: 32px;
    .aLineTxt;
    &.overflow-ellipsis {
      display: inline-block;
      padding: 0 24px 0 10px;
      .text-overflow();
    }
  }

  > em {
    line-height: 34px;
    margin-right: 18px;
    float: right;
  }

  > .status-list {
    width: calc(100% - 2px);
    max-height: 204px;
    overflow-x: hidden;
    overflow-y: auto;
    margin: 0 auto;
    left: 0;
    position: absolute;
    border: 1px solid #dcdfe6;
    text-align: center;
    .bgc(#fff);
    .boxShadow;
    z-index: 200;

    > .status-list-item {
      padding: 6px 0;
      border-bottom: 1px solid #dcdfe6;

      &:hover {
        .bgc(#0096a4);
      }

      &:last-child {
        border: none;
      }

      &.overflow-ellipsis {
        .text-overflow();
      }
    }
  }

  .status-btnLogo {
    .absolute;
    right: 8%;
  }
}

.lang-enUS {
  .bookingStatus-box {
    text-align: left;
    padding-left: 5px;
  }
  .bookingStatus-box .status-btnLogo {
    right: 1%;
  }
}
</style>
