<template>
  <div class="tables-filter-wrapper">
    <div class="filter-item" :class="(Number(typePagerNum) && types.length > Number(typePagerNum)) ? 'paddingRt' : ''">
      <div class="choice-all">
        <button
          type="button"
          @click="choiceAllTypes"
          :class="{active: -1 === selectedTypesTab}"
        >{{$t('Dict.AllTypes')}}</button>
      </div>
      <ul :id="typeId ||'typeId'">
        <li v-for="(item, index) in types"
          :key="index"
          @click="choiceTypes(item, index)"
          :class="{active: index === selectedTypesTab}"
        >{{ item.name }}</li>
      </ul>
     <Pager
      v-if="Number(typePagerNum) && types.length > Number(typePagerNum)"
      :showInfo="false"
      class="table-btns-pager"
      arrowDirection="up-down"
      :pagerId="typeId ||'typeId'"
      ref="filterTypePager"
     ></Pager>
    </div>
    <div class="filter-item has-pager">
      <div class="choice-all">
        <button
          type="button"
          @click="choiceAllAeras"
          :class="{active: -1 === selectedAreasTab}"
        >{{$t('Dict.AllArea')}}</button>
      </div>
      <ul :id="teamAreasId">
        <li
          v-for="(item, index) in areas"
          @click="choiceAeras(item, index)"
          :class="{active: index === selectedAreasTab}"
          :key="item.id"
        >{{ item.name }}</li>
      </ul>
     <Pager
      :showInfo="false"
      class="table-btns-pager"
      arrowDirection="up-down"
      :pagerId="teamAreasId"
      ref="filterPager"
     ></Pager>
    </div>
  </div>
</template>

<script>
import Pager from '@/components/Pos/Common/Pager';

export default {
  components: { Pager },
  props: ['types', 'areas', 'teamAreasId', 'typeId', 'typePagerNum'],
  data() {
    return {
      selectedTypesTab: -1,
      selectedAreasTab: -1,
    };
  },
  created() {
    this.$von('initFilterHeader', () => {
      this.selectedTypesTab = -1;
      this.selectedAreasTab = -1;
    });
  },
  methods: {
    choiceAllTypes() {
      this.$emit('choiceAllTypes');
      this.selectedTypesTab = -1;
    },
    choiceAllAeras() {
      this.$emit('choiceAllAeras');
      this.selectedAreasTab = -1;
    },
    choiceTypes(item, index) {
      this.$emit('choiceTypes', item);
      this.selectedTypesTab = index;
    },
    choiceAeras(item, index) {
      this.$emit('choiceAeras', item);
      this.selectedAreasTab = index;
    },
    refreshFilterPager() {
      this.$refs.filterPager.refresh();
      if (this.$refs.filterTypePager) {
        this.$refs.filterTypePager.refresh();
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.tables-filter-wrapper {
  .size(100%, 100px);
  background-color: white;

  .filter-item {
    position: relative;
    padding: 8px 18px;
    cursor: pointer;
    height: 52px;
    overflow: hidden;
    .clearfix();
    &.paddingRt {
      padding-right: 120px;
    }
    &.has-pager {
      padding-right: 120px;
      border-bottom: 1px solid rgb(181, 181, 181);
    }

    &:first-child {
      border-bottom: 1px solid rgb(181, 181, 181);
    }

    > ul {
      height: 35px;
      padding-left: 100px;
      color: rgb(102, 102, 102);
      overflow: hidden;

      > li {
        float: left;
        .size(100px, 35px);
        line-height: 35px;
        border-radius: 18px;
        text-align: center;

        &.active {
        background-color: #0babb9;
          color: white;
        }
      }
    }

    > .table-btns-pager {
      position: absolute;
      top: 8px;
      right: 18px;
    }

    .choice-all {
      position: absolute;
      top: 8px;
      left: 18px;

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
</style>


<style lang="less">
  .tables-filter-wrapper .pager > .pager-btn {
    background-color: white;
  }
</style>
