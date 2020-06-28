<template>
  <div class="collection-wrapper" :class="'col' + col">
    <header>
      <h1><i class="iconfont-kds icon-menus"></i>{{ $t('Biz.KDS.Summary') }}</h1>
    </header>
    <main>
      <ul id="collectedList">
        <li v-for="item in collectedList" :key="item.elId"
        v-show="item.num > 0">
          <div class="dishes-wrap">
            <div class="dishes" :class="{'has-method': item.methodText || item.remark}">
              <strong>
                <template v-if="item.sizeId !== '-1'">
                  ({{ item.sizeName }})
                </template>
                {{ item.itemName }}
              </strong>
              <span>{{demo(item)}}</span>
            </div>
            <div class="dishes-label">
              <span
                v-if="getIsReady(item)"
                class="dishes-label-ready"
              >备</span>
            </div>
          </div>
          <div class="num">
            <em>{{ item.num }} </em>
            <span>{{ item.unitName }}</span>
          </div>
        </li>
      </ul>
    </main>
    <footer class="footer particular-fix">
      <Pager
        pagerId="collectedList"
        :showInfo="true"
        arrowDirection="up-down"
        ref="collectedListPager"
      ></Pager>
    </footer>
  </div>
</template>

<script>
import { includes } from 'lodash';
import Pager from '@/components/KDS/components/Pager';

export default {
  components: { Pager },
  props: {
    col: {
      type: Number,
      default: 2,
    },
    collectedList: {
      type: Array,
      default: () => [],
    },
    isOnlyMoFoSummary: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    getIsReady(collected) {
      return includes([0, 7, 9], collected.kitchenFlg);
    },
    demo(data) {
      const filterMethodPrice = text => (text ? text.replace(/\(\+￥\w+\.\w+(x\d)\)/g, '$1') : '');
      const { methodText, remark } = data;
      if (methodText && remark && !this.isOnlyMoFoSummary) {
        return `${filterMethodPrice(methodText)}，${remark}`;
      }
      if (methodText || remark) {
        return `${filterMethodPrice(methodText)}`;
      }
      return '';
    },
  },
  watch: {
    'collectedList.length': {
      handler() {
        this.$nextTick(() => {
          this.$refs.collectedListPager.refresh();
        });
      },
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/common.less";
@import "~@/common/less/vendor-prefixes.less";
@import "~@/common/less/iconfont-kds.less";

/* 备字标识 */
.dishes-label {
  margin-left: 10px;
  font-size: 16px;
  vertical-align: middle;
  span {
    padding: 2px 5px;
    margin: 0 2px;
    line-height: 40px;
    border-radius: 2px;
    vertical-align: middle;
    color: #394551;
  }

  .dishes-label-ready {
    background-color: #ffffff;
  }
}

.collection-wrapper {
  position: absolute;
  top: 5px;
  left: 5px;
  bottom: 75px;
  margin: 5px;
  background-color: #2b2d3a;
  color: white;
  &.col2 {
    right: 66.67%;
  }
  &.col3 {
    right: 75%;
  }
  &.col4 {
    right: 80%;
  }
  &.col5 {
    right: 83.33%;
  }
  header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 60px;
    text-align: center;
    color: rgb(253, 224, 123);
    border-bottom: 2px solid rgb(253, 224, 123);
    > h1 {
      line-height: 60px;
      font-weight: bold;
      font-size: 18px;
      > i {
        font-size: 20px;
        padding-right: 4px;
      }
    }
  }
  main {
    height: 100%;
    padding-top: 60px;
    padding-bottom: 60px;
    ul {
      height: 100%;
      li {
        position: relative;
        height: 56px;
        padding: 8px 12px;
        border-bottom: 1px solid #394551;

        .dishes-wrap {
          width: calc(100% - 70px);
          div {
            float: left;
          }
        }

        .dishes {
          max-width: calc(100% - 40px);
          display: inline-block;
          height: 40px;
          .text_ellipsis();

          strong,
          span {
            display: block;
          }

          strong {
            height: 34px;
            line-height: 34px;
            font-weight: normal;
            // padding-right: 60px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            font-size: 24px;
          }

          span {
            font-size: 16px;
            height: 18px;
            line-height: 18px;
            color: #e2e2e2;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            // padding-right: 60px;
          }

          &.has-method strong {
            height: 24px;
            line-height: 24px;
          }

          &.has-method span {
            display: block;
          }
        }
        .num {
          position: absolute;
          right: 0;
          top: 10px;
          width: 70px;
          height: 34px;
          line-height: 34px;
          font-size: 16px;
          padding-left: 8px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;

          em {
            font-style: normal;
            font-size: 24px;
          }
        }
      }
    }
  }
}
</style>

<style lang="less">
@import "~@/common/less/vendor-prefixes.less";
@import "~@/common/less/iconfont-kds.less";
  .particular-fix {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 60px;
    > .pos-pager {
      > span {
        color: white;
        line-height: 60px;
        padding-left: 12px;
        font-size: 14px;
      }
      > button {
        float: right;
        margin-top: 7px;
        margin-right: 10px;
        background-color: #4d5266;
        border: none;
        > i {
          font-size: 26px;
        }
      }
    }
  }
</style>
