<template>
<!-- 取消赠菜 -->
  <Dialog
    name="PosDialog.CancelGive"
    :title="$t('Biz.Order.CancelGive')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :showSubmit="true"
    submitBtnName="$t('Dict.Btn.CancelGive')"
    @submit="submitOrderingCancelGive"
    width="480px"
    :hotkeys="hotKeySet"
    submitId="cancelGiveSubmit"
  >
    <div class="pos-dialog-content">
      <div class="ordering-give-wrap" v-if="list && list.length">
        <div class="ordering-give-info">
          <p>
            <!-- 已点菜品 -->
            <strong>{{ $t('Biz.Order.OrderedDishes') }}</strong>
            <span>{{
              list[0].name + (list[0].sizeName
                ? ('（' + list[0].sizeName + '）')
                : ''
              )
            }}</span><span>{{ list[0].price }} /{{ list[0].unitName }}</span></p>
          <p><strong>{{ $t('Biz.Order.OrderedNum') }}</strong><span>{{ totalNum }}</span></p>
          <p>
            <strong>{{ $t('Biz.BizComm.GiveDishReason') }}</strong>
            <span>{{ reasonText(list[0].reasonId) }}</span>
          </p>
        </div>
      </div>
      <div class="ordering-give-error" v-else>
        {{ $t('Biz.BizComm.BizCommTip01') }}
      </div>
    </div>
  </Dialog>
</template>

<script>
import { reduce, find } from 'lodash';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import { add } from '@/common/js/math';
import ajax from '@/common/js/ajax';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  data() {
    return {
      list: null,
      giveNum: 0,
      reasonId: null,
      reasonList: [],
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.submitOrderingCancelGive();
        },
      };
    },
    totalNum() {
      return reduce(this.list, (sum, n) => add(sum, n.num), 0);
    },
  },
  methods: {
    onOpen() {
      ajax('canyin.pos.bill.presentreasonview').then((data) => {
        this.reasonList = data.reasons;
        this.list = this.resData;
        const uiData = this.list[0];
        this.$log.info(`打开取消赠菜窗口：id:${uiData.id},itemName:${uiData.itemName},num:${uiData.num},price:${uiData.price}`);
      });
    },
    submitOrderingCancelGive() {
      this.submit(true);
      this.close();
      const uiData = this.list[0];
      this.$log.info(`提交取消赠菜窗口：id:${uiData.id},itemName:${uiData.itemName},num:${uiData.num},price:${uiData.price}`);
    },
    reasonText(id) {
      const finded = find(this.reasonList, { id });
      return finded ? finded.name : '';
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.ordering-give-wrap {
  padding-left: 15px;
  padding-right: 15px;
  background-color: @white;
}

.ordering-give-info {
  padding-top: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #b5b5b5;

  > p {
    line-height: 28px;
    padding-top: 5px;
    padding-bottom: 5px;

    > strong {
      font-weight: normal;
    }

    > span {
      margin-right: 20px;
    }
  }
}

.ordering-give-control {
  padding-top: 12px;
  padding-bottom: 25px;
  .clearfix();
}

.ordering-give-form {
  float: left;
  width: 265px;
}

.ordering-give-num {
  position: relative;
  padding-left: 78px;
  margin-bottom: 5px;

  > label {
    position: absolute;
    left: 0;
    top: 0;
    .size(78px, 36px);
    line-height: 36px;
    font-weight: normal;
    margin-bottom: 0;
  }
}

.ordering-give-form-group {
  position: relative;
  padding-left: 40px;
  padding-right: 40px;
  .size(130px, 36px);

  > button {
    position: absolute;
    top: 0;
    .square(36px);
    border: 1px solid #999;
    background-color: transparent;
    border-radius: 3px;

    > i.icon {
      color: #999;
    }

    &.subtract {
      left: 0;
    }

    &.add {
      right: 0;
    }

    &:disabled {
      border-color: #ccc;
      cursor: not-allowed;

      > i.icon {
        color: #ccc;
      }
    }
  }

  > input {
    display: block;
    .size(100%, 36px);
    border: 1px solid #999;
    border-radius: 3px;
    text-align: center;
  }
}

.ordering-give-reason > strong {
  display: block;
  height: 36px;
  line-height: 36px;
  font-weight: normal;
  margin-bottom: 0;
}

.ordering-give-reason > .list {
  .clearfix();

  > li {
    float: left;
    margin-top: 5px;
    margin-right: 8px;
    margin-bottom: 5px;

    > button {
      display: inline-block;
      .size(100px, 40px);
      background-color: transparent;
      border: 1px solid #b5b5b5;
      border-radius: 3px;

      &.active {
        border: none;
        background-color: @brand-primary;
        color: @white;
      }
    }
  }
}

.ordering-give-keyboard {
  float: right;
  width: 185px;
}

.ordering-give-error {
  padding: 15px;
}
</style>
