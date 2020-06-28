<template>
  <Dialog
    name="PosDialog.ArrangeMenuDetailPackageTemp"
    :title="$t('Dict.PkgModel')"
    ref="dialog"
    @open="onOpen"
    @close="onClose"
    @submit="onSubmit"
    width="533px"
    :append-to-body="true"
    :hotkeys="hotkeys"
    :showSubmit="true"
    submitId="packageTemp"
  >
    <div class="wrapper">
      <div class="content" :id="tempListId">
        <button
          class="btn btn-default"
          v-for="(item, index) in tempData"
          :key="item.id"
          :class="{'active': activeIndex == index}"
          @click="toggleItem(item, index)"
        >
          <span class="btn-content">{{ item.name }}</span>
        </button>
      </div>
      <div class="pager-box">
        <Pager
          class="scrollPager"
          :pagerId="tempListId"
          itemTag="> button"
          scrollMode="simple"
          arrowDirection="up-down"
          ref="scrollPager"
        ></Pager>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';

export default {
  components: { Dialog, Pager },
  mixins: [DialogMixin],
  data() {
    return {
      tempData: [],
      tempListId: 'tempListId',
      activeIndex: '',
      fullView: false
    };
  },
  computed: {
    hotkeys() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  methods: {
    onOpen() {
      this.tempData = this.resData.tempData;
      this.resData.tempData.forEach((temp, index) => {
        if (temp.id === this.resData.activeTemp.id) {
          this.activeIndex = index;
        }
      });
      this.$refs.scrollPager.refresh(); // 弹框弹出时刷新翻页数据
    },
    onClose() {
      this.activeIndex = 0;
    },
    toggleItem(item, index) {
      this.activeIndex = index;
    },
    onSubmit() {
      // 回调传回 当前选择项
      this.$emit('chosenPackageTemp', this.tempData[this.activeIndex]);
      this.close();
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.wrapper {
  height: 170px;
  .content {
    width: 100%;
    height: 59%;
    overflow-y: auto;

    > button {
      width: 100px;
      height: 44px;
      overflow: hidden;
      margin: 6px 16px 0;
    }

    button.active {
      background-color: #039eac;
      border-color: #047d88;
    }

    .btn-content {
      display: inline-block;
      width: 94%;
      overflow: hidden;
      vertical-align: middle;
    }
  }
  .pager-box {
    margin: 12px;
    float: right;
  }
}
</style>
