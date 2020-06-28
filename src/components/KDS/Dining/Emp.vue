<template>
  <li :class="{ 'new': isNew }">
    <strong>{{ emp.empName }}</strong>
    <span><em>{{ Number(emp.cookedCount) }}</em>{{ $t('Dict.Copies') }}</span>
    <button type="button" v-if="emp.recentlyCookedKcKscId">
      {{ emp.recentlyCookedItemName }}
    </button>
  </li>
</template>

<script>
export default {
  data() {
    return {
      isNew: false,
      newTimer: null,
    };
  },
  props: {
    emp: {
      type: Object,
      required: true,
    },
  },
  watch: {
    'emp.recentlyCookedKcKscId': {
      handler(kscId) {
        if (kscId) {
          clearTimeout(this.newTimer);
          this.isNew = true;
          this.newTimer = setTimeout(() => {
            this.isNew = false;
          }, 3000);
        }
      },
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

@keyframes kitchen-dining-new {
  from {
    background: none;
    box-shadow: none;
  }
  to {
    background: #0c466c;
    box-shadow: 0 0 30px 10px #0c466c;
  }
}

li {
  position: relative;
  height: 88px;
  border-top: 1px solid #000201;
  padding-left: 120px;
  cursor: pointer;

  > strong {
    position: absolute;
    left: 10px;
    top: 10px;
    color: @white;
    font-size: 28px;
  }

  > span {
    position: absolute;
    top: 48px;
    left: 10px;
    color: #7a7f95;
    font-size: 24px;

    > em {
      font-style: normal;
    }
  }

  > button {
    display: block;
    .square(100%);
    text-align: right;
    padding-right: 0;
    padding-left: 0;
    background: none;
    border: none;
    color: #5bb95b;
    font-size: 30px;
    font-weight: bold;
    font-family: "微软雅黑";
    overflow: hidden;

    &:focus {
      outline: none;
    }
  }

  &.new {
    .animation(kitchen-dining-new .8s ease infinite alternate);
  }

  @media (min-width: 1920px) {
    height: 120px;
    padding-left: 172px;

    > strong {
      left: 20px;
      top: 20px;
      font-size: 30px;
    }

    > span {
      top: 64px;
      left: 20px;
    }
  }
}
</style>
