<template>
  <Dialog
          name="Package.ChangeNum"
          title="小费"
          ref="dialog"
          :showSubmit="true"
          width="363px"
          @open="onOpen"
          @submit="submitChangeNum"
          append-to-body
          :hotkeys="hotKeySet"
          :submitId="submitId"
          close="onClose"
  >
    <div class="pos-dialog-content">
      <div class="ordering-changenum-wrap">
        <div class="ordering-changenum-form">
          <div class="form-group">
            <label for="iChangeNum">小费：</label>
            <div class="ordering-changenum-num">
              <input
                      v-judge
                      :id="submitId + 'Input'"
                      type="text"
                      name="addTip"
                      v-model="itemList.count"
                      v-keyboard:keyboard="{ mode: 'simple', autoSelect: true }"
                      ref="addTip"
                      v-autotest>
            </div>
          </div>
        </div>
        <div class="ordering-changenum-keyboard">
          <KeyBoard ref="keyboard"></KeyBoard>
        </div>
      </div>
    </div>
  </Dialog>
</template>
<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import { Message } from 'element-ui';

export default {
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin],
  props: {
    submitId: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      list: null,
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.submitChangeNum();
        },
      };
    },
    // 监听下数据中的num变化
    itemList() {
      // this.list 存在赋值
      if (this.list) {
        if (isNaN(Number(this.list.count)) || this.list.count < 0) {
          this.list.count = 0;
        }
        if (this.list.count > 999.99) {
          this.$message.warning('小费最多设置为999.99');
          this.list.count = 999.99;
        }
        if (this.list.count.toString().indexOf('.') !== -1 && +this.list.count !== 0) {
          const i = this.list.count.toString().indexOf('.');
          if (this.list.count.toString().substr(i + 1).length > 2 && !isNaN(Number(this.list.count))) {
            this.$message.warning('小数最多设置后两位');
            this.list.count = this.list.count.toString().substr(0, i + 3);
          }
        }
        return this.list;
      }
      return '';
    },
  },
  methods: {
    onOpen() {
      // 打开弹框的时候进行赋值
      this.list = this.resData.listItem;
      console.info('wdasdasd', this.list);
      // 打开进行input 聚焦
      setTimeout(() => {
        this.$refs.addTip.focus();
        if (this.$refs.keyboard) {
          this.$refs.keyboard.reSelect();
        }
      }, 200);
    },
    submitChangeNum() {
      // 确认事件 要判断当前的数值 情况 为零或者是空的时候提示
      if (`${this.itemList.count}` === '' || +this.itemList.count === 0) {
        const messageString = `${this.itemList.count}` === '' ? '小费不能为空' : '小费不能为零';
        this.$message.error(messageString);
        this.$refs.addTip.focus();
      } else {
        // 进行回调
        this.submit(this.itemList);
      }
    },
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";

  .ordering-changenum-wrap {
    padding-top: 12px;
    padding-bottom: 25px;
    background-color: @white;
    .clearfix();
  }

  .ordering-changenum-form {
    padding-left: 15px;
    padding-right: 15px;

    > .form-group {
      position: relative;
      padding-left: 70px;
      margin-bottom: 10px;

      .label2,
      label {
        position: absolute;
        left: 0;
        top: 0;
        width: 70px;
        height: 36px;
        line-height: 36px;
        margin-bottom: 0;
        font-weight: normal;
        text-align: right;
      }

      > .form-control-static {
        padding-top: 5px;
        padding-bottom: 5px;
        line-height: 26px;
        min-height: 26px;

        > span {
          margin-right: 20px;
        }
      }
    }
  }

  .ordering-changenum-num {
    position: relative;
    padding-right: 80px;
    > input {
      display: block;
      .size(100%, 36px);
      border: 1px solid #999;
      border-radius: 3px;
      text-align: center;
    }
  }

  .ordering-changenum-keyboard {
    padding-top: 15px;
    padding-left: 80px;
  }

  .ordering-changenum-error {
    /*padding: 15px;*/
  }
</style>
