<template>
  <div class="region-modal">
    <span class="people">{{$t('Biz.KDS.EatPeople')}}：{{regionData.people}}</span>
    <el-button type="success" @click="demo">
      <img src="@/components/KDS/images/tableware.png" />
      {{$t('Biz.KDS.Tableware')}}
    </el-button>
  </div>
</template>

<script>

export default {
  props: {
    regionData: {
      type: Object,
      default: null,
    },
  },
  methods: {
    demo() {
      console.log('xxxxxxx', this.regionData);
      this.$emit('tableware', this.regionData, 1)
    }
  },
};
</script>
<style lang="less">
  .region-modal {
    .el-button {
      display: flex;
      align-items: center;
      img {
        width: 15px;
      }
    }
  }
</style>
<style lang="less" scoped>
.region-modal {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 65px;
  left: 0;
  height: calc(100% - 65px);
  width: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  .people {
    font-size: 22px;
    color: white;
    margin-bottom: 15px;
  }
}
</style>
