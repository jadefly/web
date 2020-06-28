<template>
  <div class="box"
    :style="position">
    <div v-if="firstFloor" class="upArrow"></div>
    <div v-else class="downArrow"></div>
    <button
      class="btn btn-default resetBtn"
      @click="doHandler('change')">{{$t('Dict.Modify')}}</button>
    <button
      class="btn btn-default resetBtn"
      @click="doHandler('delete')">{{$t('Dict.Delete')}}</button>
  </div>
</template>

<script>
export default {
  props: {
    discSchemeData: {
      type: Object,
      default: null,
    },
    postionData: {
      type: Object
    }
  },
  data() {
    return {
      firstFloor: true
    }
  },
  computed: {
    position() {
      if (this.postionData.top > 10) {
        this.firstFloor = false;
        return {
          top: `${this.postionData.top - 54}px`,
          left: `${this.postionData.left - 4}px`,
        };
      } else {
        this.firstFloor = true;
        return {
          top: `${this.postionData.top + 50 + 4}px`,
          left: `${this.postionData.left - 4}px`,
        };
      }
    }
  },
  methods: {
    doHandler(type) {
      this.$emit('rationDiscHandle', {
        type,
        discType: this.discSchemeData,
      });
    },
  },
}
</script>

<style lang="less" scoped>
.Arrow {
  width: 10px;
  height: 10px;
  position: absolute;
  left: 28px;
  border: 1px solid #ccc;
  border-bottom: none;
  border-right: none;
  background: #fff;
  z-index: 12;
}

.box {
  position: absolute;
  width: 164px;
  height: 50px;
  text-align: center;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  line-height: 45px;
  z-index: 8;

  .upArrow {
    .Arrow();
    top: -6px;
    transform: rotate(45deg);
  }
  
  .downArrow {
    .Arrow();
    bottom: -6px;
    transform: rotate(-135deg);
  }

  .resetBtn {
    width: 44%;
    height: 72%;
    &:nth-of-type(1) {
      color: #0babb9;
      border-color: #0babb9;
    }
  }
}

</style>
