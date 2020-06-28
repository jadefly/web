<template>
  <div class="kds-filter-group">
    <slot></slot>
  </div>
</template>

<style lang="less">
  .kds-filter-group {
    position: relative;
    display: flex;
    padding-bottom: 4px;
    border-bottom: 1px dashed #A1BAC1;

    .select-wrap {
      .select {
        border-right-style: none;
      }

      &:first-child .select {
        border-top-left-radius: 20px;
        border-bottom-left-radius: 20px;
      }

      &:last-child .select {
        border-top-right-radius: 20px;
        border-bottom-right-radius: 20px;
        border-right-style: solid;
      }
      &:only-child {
        border-radius: 20px !important;
      }
    }
  }
</style>
