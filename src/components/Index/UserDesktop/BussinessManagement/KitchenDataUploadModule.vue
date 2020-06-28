<template>
  <div class="daily-settlement-wrapper">
    <div class="pic">
      <img src="@static/img/kitchen-data-upload.png" alt="厨房数据上传">
      <div class="text">
        <h3>厨房数据上传</h3>
        <p>注意：请在营业结束后再进行上传操作，否则会</p>
        <p>清除厨房系统正在显示的品项数据</p>
      </div>
    </div>
    <button type="button" class="btn" @click="upload">厨房数据上传</button>
  </div>
</template>

<script>
import ajax from '@/common/js/ajax'
export default {
  name: 'DailySettlementModule',
  methods: {
    upload() {
      this.$confirm('请确认厨房系统已无待制作品项，否则将会清空厨房系统品项数据', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        ajax('canyin.desktop.businessManagement.backupdata', {
          contentType: 'URLEncoded',
        }).then((data) => {

          this.$message.success("上传成功");
        });
      }).catch(() => false);
    },
  },
};
</script>

<style lang="less" scoped>
.daily-settlement-wrapper {
  .pic {
    position: relative;

    img {
      display: block;
      width: 100%;
    }
  }

  .text {
    position: absolute;
    left: 90px;
    top: 75px;
    width: 330px;

    h3 {
      line-height: 50px;
      font-size: 24px;
      font-weight: bold;
      color: #f0b017;
    }

    p {
      line-height: 24px;
    }
  }

  .btn {
    margin-top: 50px;
    display: block;
    width: 280px;
    height: 40px;
    background-color: #f0b017;
    margin-left: auto;
    margin-right: auto;
    font-size: 15px;
    color: #fff;
  }
}
</style>
