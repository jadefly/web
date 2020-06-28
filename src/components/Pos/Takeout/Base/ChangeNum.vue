<template>
  <Dialog
          name="Package.ChangeNum"
          title="修改菜品数量"
          ref="dialog"
          :showSubmit="true"
          width="480px"
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
            <strong class="label2">已点菜品：</strong>
            <p class="form-control-static">
              <span>{{itemList.name}}</span>
            </p>
          </div>
          <div class="form-group">
            <label for="iChangeNum">已点数量：</label>
            <div class="ordering-changenum-num">
              <button
                      type="button"
                      class="subtract"
                      :disabled="isDisabled"
                      @click="changeNumHandle('-')"
              >
                <i class="icon icon-subtract"></i>
              </button>
              <input
                      v-judge
                      :id="submitId + 'Input'"
                      type="text"
                      name="changeNum"
                      v-model="itemList.count"
                      v-keyboard:keyboard="{ mode: 'simple', autoSelect: true }"
                      ref="changeNum"
                      v-autotest
              >
              <button type="button" class="add" @click="changeNumHandle('+')">
                <i class="icon icon-add"></i>
              </button>
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
        isDisabled: false,
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
          // 如果num 数据小于等于1就要把减的按钮设为不可点 否则可点
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.isDisabled = this.list.count <= 1;
          if (isNaN(Number(this.list.count)) || this.list.count < 0) {
            this.list.count = 1;
          }
          if(this.list.count > 9.99){
            this.$message.warning('数量最多设置为9.99');
            this.list.count = 9.99;
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
        console.info("wdasdasd",this.list);
        // 打开进行input 聚焦
        setTimeout(() => {
          this.$refs.changeNum.focus();
          if (this.$refs.keyboard) {
            this.$refs.keyboard.reSelect();
          }
        }, 200);
      },
      submitChangeNum() {
        // 确认事件 要判断当前的数值 情况 为零或者是空的时候提示
        if (`${this.itemList.count}` === '' || +this.itemList.count === 0) {
          const messageString = `${this.itemList.count}` === '' ? '所改的菜品数量不能为空' : '所改的菜品数量不能为零';
          this.isShowMessage(messageString);
          this.$refs.changeNum.focus();
        } else {
          // 进行回调
          this.submit(this.itemList);
        }
      },
      // 加加 减减 按钮事件
      changeNumHandle(btnName) {
        if (btnName === '-') {
          if (this.itemList.count > 1) {
            this.itemList.count = (this.itemList.count * 1000 - 1 * 1000) / 1000;
          }
        } else {
          this.itemList.count = (this.itemList.count * 1000 + 1 * 1000) / 1000;
        }
      },
      isShowMessage(message, type, duration) {
        const options = {
          message: message || '提示的内容', // 提示的内容
          type: type || 'error', // 类型 success/warning/info/error
          duration: duration || 1500, // 显示的时间
          center: true, // 中间显示
        };
        Message(options); // 需要多的可以查看element-ui 的官网 Message组件
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
    float: left;
    width: 280px;
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

  .ordering-changenum-keyboard {
    float: left;
    width: 186px;
  }

  .ordering-changenum-error {
    padding: 15px;
  }
</style>
