<template>
  <!-- $t-会员卡列表 -->
  <Dialog
    name="PosDialog.Crm6CardList"
    :title="$t('Biz.Crm.VipCardList')"
    width="533px"
    ref="dialog"
    @open="onOpen"
    @close="onClose"
    @submit="onSubmit"
    :showSubmit=true
    :hotkeys="hotkeys"
    submitId="crm6CardList"
  >
    <div class="pos-dialog-content pos-activity-scheme-wrapper">
      <ul>
        <li v-for="(list, index) in crmCardList" :key="index" >
          <el-radio v-model="checkItem" :label="index" class="planListBtn">
            {{ list.cardNo }}
          </el-radio>
        </li>
      </ul>
    </div>
  </Dialog>
</template>

<script>
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';

export default {
  components: { Dialog },
  mixins: [DialogMixin],
  data() {
    return {
      // 列表
      crmCardList: [],
      // 当前选择项
      checkItem: '',
    };
  },
  computed: {
    // 添加快捷键
    hotkeys() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  methods: {
    onOpen() {
      this.crmCardList = this.resData.list ? this.resData.list : [];
      if (this.crmCardList && this.crmCardList.length) {
        this.checkItem = 0;
      } else {
        this.checkItem = '';
      }
    },
    // 提交前加载 相关卡号数据
    onSubmit() {
      this.loadCard();
    },
    // 选择卡后,再次请求接口完成选择卡数据获取
    loadCard() {
      ajax('canyin.pos.crm.crmsalescounter.readcard', {
        contentType: 'URLEncoded',
        data: {
          cardNo: this.crmCardList[this.checkItem].cardNo,
        },
      }).then((data) => {
        if (data.success) {
          this.$message.success(data.msg);
          // 重置组件中, 数据更改的方法(跨组件bus方法), 传值:详情数据对象(不是卡号)
          this.$vemit('crm6CardNoChangeBus', data.data);
          if (this.resData.callback) {
            this.resData.callback(data.data);
          }
          this.close();
        } else {
          this.$message.warning(data.msg);
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.pos-activity-scheme-wrapper {
  height: 286px;
  background-color: #ffffff;
  overflow: auto;
  >ul {
    height: 100%;
    padding: 10px;
    >li {
      width: 45%;
      height: 42px;
      line-height: 42px;
      border:1px solid #b5b5b5;
      border-radius: 5px;
      overflow: hidden;
      margin: 5px 12px;
      float: left;
      .planListBtn {
        height: 100%;
        width: 100%;
        line-height: 42px;
        padding-left: 10px;
        border: none;
        background-color: #ffffff;
      }
      &.active {
        border:1px solid #0babb9;
        color: #0babb9;
      }
    }
  }
}
</style>
