<template>
  <Dialog
    name="PosDialog.ChooseWaiter"
    title="修改点菜员"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :hotkeys="PayWayEasyLifeModal"
    :showSubmit="true"
    :submit-text="$t('Dict.Confirm')"
    :closeByClickModel="false"
    :append-to-body="true"
    width="600px"
    height="490px"
    top="10vh"
  >
    <div class="body">
      <div class="table-main">
        <div class="table-body">
          <div class="waiter-description">
            <div>
              <span>{{$t('Biz.UserDesktop.OldWaiter')}}</span>
              <span>{{oldWaiter ? oldWaiter.creator : ''}}</span>
            </div>
            <div>
              <span>{{$t('Biz.UserDesktop.NewWaiter')}}</span>
              <span>{{newWaiter ? newWaiter.name : ''}}</span>
            </div>
          </div>
          <ul id="cardList">
            <li
              v-for="(item, index) in showWaiterLists"
              :key="index"
              @click="chooseWaiter(item, index)">
              <button
                type="button"
                class="btn btn-default"
                :class="currentCardIndex === ((currentPage - 1) * prePageSize + index) ? 'active' : ''">
                {{ item.name }}
              </button>
            </li>
          </ul>
        </div>
      </div>
      <!--分页按钮-->
      <div class="pos-pager pos-takeout-pager">
        <button class="prev" :disabled="preBtnDisabled" @click="upPage">
          <i class="el-icon-arrow-up"></i>
        </button>
        <button class="next" :disabled="nextBtnDisabled" @click="downPage(waiterList)">
          <i class="el-icon-arrow-down"></i>
        </button>
      </div>
    </div>
  </Dialog>
</template>
<script>
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import PageMixin from '@/common/util/PaginationMixin';

export default {
  name: 'posIpLoginInfo',
  components: { Dialog },
  mixins: [DialogMixin, PageMixin],
  data() {
    return {
      waiterList: [],
      currentCardIndex: 0,
      prePageSize: 20, // 每页6条数据
      newWaiter: null, // 新点菜员信息
      oldWaiter: null, // 旧点菜员信息
    };
  },
  computed: {
    // 添加快捷键
    PayWayEasyLifeModal() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
    // 显示列表
    showWaiterLists() {
      return this.pagination(this.currentPage, this.prePageSize, this.waiterList);
    },
  },
  methods: {
    // 获取所有点菜员列表
    getAllWaiterList() {
      ajax('canyin.pos.checkViewBill.getorderoperator').then((res) => {
        this.waiterList = res.emps || [];
        for (let i = 0; i < this.waiterList.length; i += 1) {
          if (this.waiterList[i].id === this.oldWaiter.waiterId) {
            this.newWaiter = this.waiterList[i];
            this.currentCardIndex = i;
            break;
          }
        }
        if (!this.newWaiter) {
          this.newWaiter = this.waiterList[0];
          this.currentCardIndex = 0;
        }
      });
    },
    // 修改点菜员
    changeWaiterHandler(waiter) {
      ajax('canyin.pos.checkViewBill.updateoperator', {
        contentType: 'json',
        data: {
          newWaiterId: waiter.id,
          ssId: this.oldWaiter.ssId,
          bsId: this.oldWaiter.bsId,
        },
      }).then((res) => {
        console.log('xxxxxxxx', res);
        this.submit();
        this.close();
      });
    },
    onOpen() {
      this.oldWaiter = this.resData.waiter;
      this.getAllWaiterList();
    },
    onClose() {
      this.waiterList = [];
      this.currentPage = 1;
      this.currentCardIndex = 0;
      this.newWaiter = null;
      this.oldWaiter = null;
      this.preBtnDisabled = false;
      this.nextBtnDisabled = false;
    },
    chooseWaiter(waiter, index) {
      this.newWaiter = waiter;
      this.currentCardIndex = ((this.currentPage - 1) * this.prePageSize + index);
    },
    onSubmit() {
      const { waiterList, currentCardIndex } = this;
      this.newWaiter = waiterList[currentCardIndex] || '';
      if (!this.newWaiter) {
        this.$message.error(`${this.$t('Biz.Settlement.Error37')}`);
      } else {
        if (this.oldWaiter.waiterId === this.newWaiter.id || this.oldWaiter.id === this.newWaiter.id) {
          this.close();
          return;
        }
        this.changeWaiterHandler(this.newWaiter);
      }
    },
  },
};
</script>
<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.body {
  width: 100%;
  height: 100%;
  background-color: #fff;
  overflow: hidden;
  .table-main {
    padding: 1rem 1rem 0;
    .table-head {
      padding: 4px 0;
      background-color: #7bcad6;
      color: #fff;
      table {
        width: 100%;
        tr {
          width: 100%;
          th {
            font-weight: normal;
            border-right: 1px solid #fff;
            padding-left: 1rem;
          }
          th:last-child {
            border: none;
          }
        }
      }
    }
    .table-body {
      .waiter-description {
        font-size: 16px;
      }
      ul {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        overflow: hidden;
        li {
          width: 25%;
          height: 63px;
          overflow: hidden;
          padding: 8px;
          button {
            width: 100%;
            height: 100%;
          }
          .active {
            background-color: #039eac;
            border-color: #047d88;
            color: #ffffff;
          }
        }
      }
    }
  }
  > .pos-pager {
    width: 100%;
    border-top: 1px solid #000;
    padding: 1rem;
    overflow: hidden;
    position: absolute;
    bottom: 0;
    background-color: #fff;
    > .pos-pager {
      float: right;
      margin-right: 2rem;
    }
  }
  // 箭头按钮
  .pos-takeout-pager {
    position: absolute;
    bottom: 12px;
    text-align: right;
    > button {
      display: inline-block;
      width: 44px;
      height: 30px;
      border: 1px solid #9a9a9a;
      line-height: 28px;
      border-radius: 14px;
      text-align: center;
      margin-left: 8px;
      background-color: white;

      > i {
        color : #9a9a9a;
      }

      &[disabled] {
        color: @btn-disabled-color;
        cursor: not-allowed;
      }
    }
  }
}
</style>
