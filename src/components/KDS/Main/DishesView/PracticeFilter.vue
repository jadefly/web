<template>
  <div class="select-wrap" v-if="showDom">
    <Paging
      class="practice-list"
      :data="practiceList"
      :itemWidth="itemWidth"
      :itemHeight="itemHeight"
      id="practiceList"
      ref="practiceList"
    >
      <div slot-scope="props" class="item-area">
        <button
          class="item"
          :class="{ 'active': props.item.name === currentPractice }"
          @click="choosePractice(props.item)"
        >
          {{ props.item.name }}
        </button>
        <div class="num">{{props.item.num}}</div>
      </div>
    </Paging>
    <PagingBtn
      ref="practiceListPager"
      :arrowDirection="arrowDirection"
      :vertical="vertical"
      :showInfo="false"
    ></PagingBtn>
  </div>
</template>

<script>
import Paging from '@/components/Pos/Common/Paging';
import PagingBtn from '@/components/Pos/Common/PagingBtn';

export default {
  components: {
    Paging, PagingBtn,
  },
  props: {
    kitchenItemInfoList: {},
    practiceList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      itemWidth: 104,
      itemHeight: 34,
      currentPractice: '',
      arrowDirection: 'up-down',
      vertical: true,
      showDom: true,
    };
  },
  watch: {
    practiceList(val) {
      this.choosePractice({
        name: '',
        num: 0,
      });
      if (val.length < 1) {
        this.showDom = false;
        return;
      }
      this.showDom = true;
      this.$nextTick(() => {
        this.$refs.practiceListPager.bind(this.$refs.practiceList);
      });
    },
  },
  methods: {
    choosePractice(item) {
      if (this.currentPractice === item.name) {
        this.currentPractice = '';
        this.$emit('choosePractice', {
          name: '',
          num: 0,
        });
      } else {
        this.currentPractice = item.name;
        this.$emit('choosePractice', item);
      }
    },
  },
};
</script>
<style lang="less" scoped>
  .select-wrap {
    position: relative;
    padding-right: 70px;
    width: 100%;
    height: 100%;
    .practice-list {
      display: flex;
      flex-wrap: wrap;
      width: 100%;
      height: 100%;
      transition: transform .2s;
      li {
        display: inline-block;
      }
    }
    .item-area{
      position: relative;
      .item {
        position: relative;
        margin: 4px;
        width: 94px;
        height: 36px;
        cursor: pointer;
        text-align: center;
        line-height: 34px;
        border-radius: 4px;
        overflow: hidden;
        text-overflow:ellipsis;
        white-space: nowrap;
        color: #ffffff;
        border: 1px solid #749ddc;
        background: #3d557a;
      }
      .num {
        position: absolute;
        display: inline-block;
        right: -2px;
        top: -2px;
        width: 18px;
        height: 18px;
        text-align: center;
        line-height: 18px;
        color: #494949;
        border-radius: 50%;
        background-color: #ffffff;
        z-index: 999;
      }
    }
    .active {
      font-weight: bold;
      border-color: #749ddc !important;
      background-color: #749ddc !important;
    }
  }
</style>
<style lang="less">
  .select-wrap {
    .pos-pager {
      position: absolute;
      right: 0;
      top: 0;
      >span{
        color: #ffffff;
      }
      .pager-btn:disabled{
        background: #9ca7b7;
        i{
          color: #2a4163;
        }
      }
      .pager-btn{
        background: #749ddc;
        i{
          color: #ffffff;
        }
      }
    }
  }
</style>
