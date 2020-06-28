<template>
  <div
    class="item"
    :class="{
      'item-done': isDone,
      'item-chosed': dishesChosed,
      'item-time-warn': (isOverStandardTime || isOverWarnTime)
    }"
    @click="hanldeItem(dishesData)"
  >
    <div class="dishes-icon">
      <i
        v-if="showCheckBox"
        class="iconfont-kds"
        :class="{'icon-unchecked': !isDone, 'icon-checked': isDone, 'disabled': !allowHandle}"
      ></i>
    </div>
    <div
      class="dishes"
      :class="{'has-method': dishesSubhead}"
    >
      <div
        class="dishes-name"
        :class="{
          [`dishes-has-label-${currentStatNumber}`]: true,
          'flash': isHasten,
          'hasten': isHasten,
        }"
      >
        <strong :title="dishesData.itemName">
          <template v-if="dishesData.sizeId !== '-1'">({{ dishesData.sizeName }})</template>
          {{ dishesData.itemName }}
        </strong>
        <span
          v-if="dishesSubhead"
          :title="dishesSubhead"
        >{{ dishesSubhead }}</span>
      </div>
      <div class="dishes-label">
        <span
          v-if="isHasten"
          class="dishes-label-hasten"
          :class="{flash: isHasten}"
        >催</span>
        <span
          v-if="isReady"
          class="dishes-label-ready"
        >备</span>
        <span
          v-if="isPresent"
          class="dishes-label-present"
        >赠</span>
      </div>
    </div>
    <div class="dishes-num">
      <em>{{ dishesData.num }}</em>
      <span>{{ dishesData.unitName }}</span>
    </div>
    <div class="dishes-state">{{ this.currentMode.dishesState(dishesData) }}</div>
  </div>
</template>

<script>
import { includes } from 'lodash';
import { mapState } from 'vuex';
import { PACKAGE } from '../../../store/order/orderConfig';

export default {
  props: {
    dishesData: {
      type: Object,
      required: true,
    },
    dishesChosed: {
      type: Boolean,
      default: false,
    },
    getIsDone: {
      type: Function,
      required: true,
    },
    isOverStandardTime: {
      type: Boolean,
      default: false,
    },
    isOverWarnTime: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState('order', ['currentMode']),
    // 催
    isHasten() {
      const { dishesData: data } = this;
      return data.hastenFlg > 0 && !this.currentMode.dishesIsDone(data);
    },
    // 赠
    isPresent() {
      return this.dishesData.discFlg === 1;
    },
    // 备
    isReady() {
      return includes([0, 7, 9], this.dishesData.kitchenFlg);
    },
    // OK
    isDone() {
      return this.getIsDone(this.dishesData);
    },
    currentStatNumber() {
      return (Number(this.isHasten) + Number(this.isPresent) + Number(this.isReady));
    },
    allowHandle() {
      /* eslint-disable no-else-return */
      // 判断是否可操作，完成时，若可取消，则可进行操作，未完成时，若可完成，则可进行操作  181 by L.R
      // eslint问题（无意义的eslint，无需修改，个人观点）
      if (this.currentMode.dishesIsDone(this.dishesData)) {
        return this.currentMode.dishesCanCancel(this.dishesData);
      } else {
        return this.currentMode.dishesCanEnables(this.dishesData);
      }
    },
    // 外卖屏不显示选择框
    showCheckBox() {
      return this.currentMode.currentState !== PACKAGE;
    },
    // 若该品项为转台品项，则做法栏显示转台前台位。 182-1663 by L.R
    // 将整单备注的显示挪到品项做法上 bugfix97128 by L.R
    dishesSubhead() {
      const { dishesData: { methodText, sourcePointName, remark } } = this;
      const sourcePoint = sourcePointName ? `${sourcePointName}转` : '';
      // 按照产品经理要求，将做法中的单价过滤，只显示做法数量
      const method = methodText && methodText.replace(/\(\+￥\w+\.\w+(x\d)\)/g, '$1');
      return [sourcePoint, method, remark].reduce((p, c) => {
        if (c) return p.concat(c);
        else return p;
      }, []).join(' | ');
    },
  },
  methods: {
    hanldeItem(item) {
      if (this.allowHandle) {
        this.$vemit(
          this.currentMode.dishesIsDone(item)
            ? 'cancelReady'
            : 'dishesReady',
          item,
        );
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import '~@/common/less/common.less';

@dishes-icon-wrap-width: 25px;
@dishes-num-wrap-width: 70px;
@dishes-num-wrap-small-width: 60px;
@dishes-state-wrap-width: 40px;
@dishes-state-wrap-small-width: 28px;
@dishes-label-width: 34px;
// li内部上下padding
@content-vertical-padding: 8px;
// li高度
@content-height: 50px;
// li内部实际高度
@content-inner-height: @content-height - @content-vertical-padding*2;

.item {
  position: relative;
  height: 100%;
  border-bottom: 1px solid #2b2d39;
  font-size: 0;
  .inline_vertical_middle();

  > div {
    display: inline-block;
  }
}
.item-done {
  > div {
    opacity: 0.2;
  }
}
.item-time-warn {
  border-bottom: none;
}

.dishes-icon {
  width: @dishes-icon-wrap-width;
  vertical-align: middle;

  i {
    font-size: 24px;
  }
  .disabled {
    opacity: 0.3;
  }
}

.dishes {
  width: calc(
    100% - @dishes-icon-wrap-width - @dishes-num-wrap-width -
      @dishes-state-wrap-width
  );
  padding: 0 8px;
  vertical-align: middle;
  white-space: nowrap;
}
.dishes-hasten {
  opacity: 0.1;
}

.generate-dishes-width(3);
.generate-dishes-width(@n, @i: 0) when (@i =< @n) {
  .dishes-has-label-@{i} {
    max-width: calc(~'100% - ' @dishes-label-width* @i);
  }
  .generate-dishes-width(@n, (@i + 1));
}

.dishes-name,
.dishes-label {
  float: left;
}

.dishes-name {
  padding-right: 10px;
  font-size: 20px;

  strong,
  span {
    display: block;
    .text_ellipsis();
  }
  strong {
    height: @content-inner-height;
    line-height: @content-inner-height;
  }
  span {
    height: 14px;
    line-height: 14px;
    font-size: 16px;
    color: #e2e2e2/*#da3e66*/;
  }

  &.hasten {
    color: #fffc00;
  }
}

.has-method strong {
  height: 24px;
  line-height: 24px;
}

.dishes-label {
  font-size: 16px;
  vertical-align: middle;
  span {
    padding: 2px 5px;
    margin: 0 2px;
    line-height: @content-inner-height;
    border-radius: 2px;
    vertical-align: middle;
    color: #394551;
  }

  .dishes-label-present,
  .dishes-label-ready {
    background-color: #ffffff;
  }

  .dishes-label-hasten {
    background-color: #fffc00;
  }
}

.dishes-num {
  width: @dishes-num-wrap-width;
  vertical-align: middle;
  font-size: 16px;
  .text_ellipsis();

  em {
    font-style: normal;
    font-size: 24px;
  }
  span {
    vertical-align: text-bottom;
  }
}

.dishes-state {
  width: @dishes-state-wrap-width;
  vertical-align: middle;
  font-size: 18px;
}

.custom-screen-width {
  .dishes {
    width: calc(100%
      - @dishes-icon-wrap-width
      - @dishes-num-wrap-small-width
      - @dishes-state-wrap-small-width
    );
  }

  .dishes-name {
    font-size: 13px;
  }

  .dishes-state {
    width: @dishes-state-wrap-small-width;
    font-size: 12px;
  }

  .dishes-num {
    width: @dishes-num-wrap-small-width;
  }
}
</style>

<style>
.flash {
  animation: flash 2s infinite;
}

@keyframes flash {
  0% {
    opacity: 1;
  }

  60% {
    opacity: 0.1;
  }
}
</style>
