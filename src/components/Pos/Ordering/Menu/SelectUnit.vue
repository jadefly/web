<template>
  <!-- 国际化：单位 -->
  <Dialog
    name="PosDialog.SelectUnit"
    :title="$t('Dict.UnitName')"
    ref="dialog"
    @close="onClose"
    :appendToBody="true"
    :showSubmit="true"
    @open="onOpen"
    @submit="submit"
    width="480px"
  >
    <div class="pos-dialog-content unit-wrapper">
      <ul id="tempItemUnits">
        <li v-for="unit in itemUnits" :key="unit.id"
        @click="selectUnit(unit)" :class="{'active': unit.id === activeId}">
          {{ unit.name }}
        </li>
      </ul>
      <Pager :showInfo="true" arrowDirection="up-down"
      pagerId="tempItemUnits" ref="tempItemUnits"></Pager>
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
  props: {
    itemUnits: {
      type: Array,
      default: () => [],
    },
    selectedItem: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      activeId: -1,
      selectedUnit: null,
    };
  },
  methods: {
    onOpen() {
      this.selectUnit({
        id: this.selectedItem.unitId,
        name: this.selectedItem.unitName,
      });
      if (this.$refs.tempItemUnits) {
        this.$refs.tempItemUnits.refresh();
      }
    },
    selectUnit(unit) {
      this.selectedUnit = unit;
      this.activeId = unit.id;
    },
    submit() {
      this.$emit('selectUnit', this.selectedUnit);
      this.close();
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.unit-wrapper {
  background: white;
  > ul {
    height: 160px;
    overflow: hidden;
    > li {
      float: left;
      width: 100px;
      height: 40px;
      margin-top: 12px;
      margin-left: 12px;
      text-align: center;
      line-height: 40px;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
      &.active {
        color: #fff;
        background-color: #0babb9;
        border-color: #0a95a1;
      }
    }
  }
  .pos-pager {
    text-align: right;
    margin: 20px;
  }
}
</style>
