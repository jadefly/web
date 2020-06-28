<template>
  <div class="kds-screen-view" :class="[onlyShowSmallClass]">
    <div class="top" :class="[style]">
      <div class="left">
        <div class="filter">
          <slot name="filter"></slot>
        </div>
        <div class="main">
          <div class="list">
            <slot name="list"></slot>
          </div>
        </div>
      </div>
      <div class="right" v-if="style">
        <slot name="right-btn"></slot>
      </div>
    </div>
    <div class="bottom">
      <div class="footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      active: '',
    };
  },
  computed: {
    ...mapGetters('KDS', ['config']),
    style() {
      if (this.config.fixedKeyboard) {
        return 'padding';
      }
      return '';
    },
    onlyShowSmallClass() {
      if (this.config.onlyShowSmallClass) {
        return 'onlyShowSmallClass';
      }
      return '';
    },
  },
};
</script>

<style lang="less" scoped>
.kds-screen-view {
  position: relative;
  height: 100%;
  padding-bottom: 60px;
  background-image: linear-gradient(#3d557a, #3d557a),
  linear-gradient(#ffffff, #ffffff);
  background-blend-mode: normal, normal;
  .top {
    position: relative;
    height: 100%;
    .left {
      position: relative;
      height: 100%;
      padding-top: 50px;
      .filter {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 50px;
        padding: 5px 10px;
      }
      .main {
        height: 100%;
        .list {
          height: 100%;
        }
      }
    }
    .right {
      position: absolute;
      right: 4px;
      top: 0;
      width: 80px;
      height: 100%;
    }
  }
  .bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50px;
  }
  &.tables-screen-view {
    .top {
      &.padding {
        padding-right: 0;
      }
    }
    .right {
      display: none;
    }
  }
  &.dishes-screen-view {
    .top {
      &.padding {
        padding-right: 80px;
      }
    }
  }
}
</style>
<style lang="less">
  .col1, .col2 {
    .kds-screen-view {
      &.tables-screen-view {
        padding-bottom: 100px;
        .bottom {
          height: 100px;
          .footer {
            height: 100px;
            .pager {
              position: absolute;
              top: 55px;
              margin: 0 auto;
            }
            .search {
              position: absolute;
            }
          }
        }
      }
      &.dishes-screen-view {
        padding-bottom: 100px;
        .top {
          height: 100%;
          .left {
            padding-top: 100px;
            .filter {
              height: 100px;
              .main {
                height: 100%;
                .list {
                  height: 100%;
                }
              }
              .kds-filter-group {
                display: block;
                padding-bottom: 6px;
                &:first-child .select {
                  border-radius: 20px;
                }

                &:last-child .select {
                  border-radius: 20px;
                  border-right-style: solid;
                }
                .select-wrap:first-child {
                  margin-bottom: 5px;
                }
              }
            }
          }
        }
        .bottom {
          height: 100px;
          .footer {
            height: 100px;
            .pager {
              position: absolute;
              top: 55px;
              margin: 0 auto;
            }
            .search {
              position: absolute;
            }
          }
        }
      }
      &.onlyShowSmallClass {
        .top {
          .left {
            padding-top: 50px !important;
            .filter {
              height: 50px !important;
            }
          }
        }
      }
    }
  }
  .col1 {
    .bottom .footer .search input{
      width: 65px !important;
    }
    .kds-screen-view .bottom .footer .footer .pager > span{
      display: none;
    }
    &.fixedKeyboard.dishes-page {
      .kds-screen-view .bottom .footer .search input{
        width: 140px !important;
      }
      .kds-screen-view .bottom .footer .footer .pager > span{
        display: inline-block;
      }
    }
  }
</style>
