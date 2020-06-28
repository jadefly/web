<template>
  <Dialog
    name="PosDialog.posIpLoginInfo"
    :title="$t('Biz.Settlement.ChooseCardNumber')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :hotkeys="PayWayEasyLifeModal"
    :showSubmit="true"
    :submit-text="$t('Dict.Confirm')"
    :closeByClickModel="false"
    :append-to-body="true"
    width="400px"
    height="350px"
    top="18vh"
  >
    <div class="body">
      <div class="table-main">
        <div class="table-body">
          <ul id="cardList">
            <li
              v-for="(item, index) in showCardLists"
              :key="index"
              @click="chooseCard(item, index)">
              <button
                type="button"
                class="btn btn-default"
                :class="currentCardIndex === index ? 'active' : ''">
                {{ item.cardNo }}
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
        <button class="next" :disabled="nextBtnDisabled" @click="downPage(cardList)">
          <i class="el-icon-arrow-down"></i>
        </button>
      </div>
    </div>
  </Dialog>
</template>
<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import PageMixin from '@/common/util/PaginationMixin';

export default {
  name: 'posIpLoginInfo',
  components: { Dialog },
  mixins: [DialogMixin, PageMixin],
  data() {
    return {
      cardList: [],
      cardCno: '',
      currentCardIndex: 0,
      prePageSize: 6, // 每页4条数据
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
    showCardLists() {
      return this.pagination(this.currentPage, this.prePageSize, this.cardList);
    },
  },
  methods: {
    onOpen() {
      this.cardList = this.resData;
    },
    onClose() {
      this.cardList = [];
      this.currentPage = 1;
    },
    chooseCard(item, index) {
      this.cardCno = item.cardNo;
      this.currentCardIndex = index;
    },
    onSubmit() {
      const { showCardLists, currentCardIndex } = this;
      this.cardCno = showCardLists[currentCardIndex].cardNo || '';
      if (!this.cardCno) {
        this.$message.error(`${this.$t('Biz.Settlement.Error37')}`);
      } else {
        // 过滤出当前选中的卡信息
        const currentCardData = this.cardList.filter((item) => {
          return item.cardNo === this.cardCno;
        })
        this.submit(currentCardData);
        this.close();
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
      ul {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        overflow: hidden;
        li {
          width: 50%;
          height: 70px;
          overflow: hidden;
          padding: 10px;
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
    border-top: 1px solid #ccc;
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
