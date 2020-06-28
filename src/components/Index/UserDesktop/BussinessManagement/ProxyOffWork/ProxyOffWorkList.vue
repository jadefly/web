<template>
    <el-row :class="[
      'offwork-list-body',
      {
        'list-border': isShowBorder,
        'active': psId === item.psId
      }
    ]">
      <div class="order-num" v-show="isBatchOperation">{{index + 1}}</div>
      <li class="offwork-list-item" style="width: 187px">
        <div>
          <p class="clearing-item">{{item.code}}</p>
          <p class="sign-in-time">{{item.openTime}}</p>
        </div>
      </li>
      <li class="offwork-list-item baseline" style="width: 131px">
        <div>
          <p class="clearing-item">{{item.operatorName}}</p>
          <p class="sign-out-time">{{item.endTime}}</p>
        </div>
      </li>
      <li class="offwork-list-item">
        <span
        :class="[
          'close-default',
          { 'isclosed': !item.isClosed  }
        ]">{{item.isClosed ? $t('Dict.AlreadyKnot') : $t('Dict.Unfinished')}}</span>
      </li>
    </el-row>
</template>

<script>
export default {
  name: 'ProxyOffWorkList',
  props: {
    isShowBorder: {
      type: Boolean,
      default() {
        return false;
      },
    },
    index: {
      type: Number,
      default() {
        return 0;
      },
    },
    isBatchOperation: {
      type: Boolean,
      default() {
        return false;
      },
    },
    item: {
      type: Object,
      default() {
        return {};
      },
    },
    psId: {
      type: String,
      default() {
        return '';
      },
    },
  },
  mounted() {
  },
  methods: {
  },
};
</script>
<style lang="less" scoped>
  .baseline {
    align-self: baseline;
  }
  .active{
    background: #ddf1f6;
  }
  .offwork-list-body{
    height: 57px;
    padding: 12px 0;
    display: flex;
    align-items: center;
    cursor: pointer;
      .offwork-list-item{
      display: flex;
      align-items: center;
      height: 38px;
      }
      .order-num{
        width: 14px;
        height: 14px;
        margin-right: 5px;
        font-size: 12px;
      }
      .close-default{
        font-size: 12px;
      }
      .isclosed{
        color: #ff0000;
      }
  }
  .clearing-item{
    font-size: 12px;
    height: 19px;
  }
  .list-border{
    border-bottom: 1px solid #d7d7d7;
  }
  .sign-in-time {
    font-size: 12px;
    color: #0babb9;
    height: 19px;
  }
  .sign-out-time {
    font-size: 12px;
    color: #ffa200;
    height: 19px;
  }
</style>
