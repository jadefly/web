<template>
  <!-- 赠菜 -->
  <Dialog
    name="PosDialog.OrderingGive"
    :title="$t('Dict.Btn.GiveDish')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :showSubmit="true"
    @submit="submitOrderingGive"
    width="480px"
    :hotkeys="hotKeySet"
  >
    <div class="pos-dialog-content">
      <div class="ordering-give-wrap">
        <div class="ordering-give-info">
          <p>
            <!-- $t-已点菜品： -->
            <strong>{{ $t('Biz.Order.OrderedDishes') }}</strong>
            <span>{{ list[0].name + (list[0].sizeName ? ('（' + list[0].sizeName + '）') : '') }}</span>
            <span>{{ list[0].price}}/{{ list[0].unitName }}</span>
          </p>
          <!-- $t-已点数量： -->
          <p><strong>{{ $t('Biz.Order.OrderedNum') }}</strong><span>{{ totalNum }}</span></p>
          <!-- 如果当前要赠送的品项是套餐的并且是不联动的话给提示,$t-注: 当前套餐属于不联动只能全部赠送-->
          <span v-show="!!list[0].isNotFollowAmount && list[0].isPackage" class="isShowTishi">{{ $t('Biz.BizComm.GiveTip01') }}</span>
        </div>
        <div class="ordering-give-control">
          <div class="ordering-give-form">
            <div class="ordering-give-num">
              <!-- $t-赠送数量： -->
              <label for="iGiveNum">{{ $t('Dict.PresentationNum01') }}</label>
              <div class="ordering-give-form-group">
                <!--isNotFollowAmount 来判断如果当前要赠送的品项是套餐的,要判断联动和不联动属性,如果是不联动的情况下要全部增不可修改 -->
                <button
                  type="button"
                  class="subtract"
                  :disabled="giveNum <= 1 || (!!list[0].isNotFollowAmount && list[0].isPackage)"
                  @click="subtractGiveNum"
                  id="subtractGiveNum"
                >
                  <i class="icon icon-subtract"></i>
                </button>
                <input
                  v-judge
                  type="text"
                  name="giveNum"
                  id="iGiveNum"
                  ref="giveNum"
                  v-model="giveNum"
                  :disabled="!!list[0].isNotFollowAmount && list[0].isPackage"
                  v-keyboard:keyboard="{ mode: 'simple', autoSelect: true }"
                >
                <button
                  type="button"
                  class="add"
                  :disabled="giveNum >= totalNum || (!!list[0].isNotFollowAmount && list[0].isPackage)"
                  @click="addGiveNum"
                  id="addGiveNum"
                >
                  <i class="icon icon-add"></i>
                </button>
              </div>
            </div>
            <div class="ordering-give-reason">
              <!-- $t-赠送原因： -->
              <strong>{{ $t('Biz.BizComm.GiveDishReason') }}</strong>
              <ul class="list" id="orderingGiveReason">
                <li v-for="item in showReasonList" :key="item.id">
                  <button
                    type="button"
                    :class="{ 'active': item.id == reasonId }"
                    @click="choiceReason(item.id)"
                  >
                    <div>
                      {{ item.name }}
                    </div>
                  </button>
                </li>
              </ul>
              <div class="pos-pager">
                <div class="pos-takeout-pager">
                  <span class="page-info">
                    <!-- 共{{reasonList.length}}条，{{currentPage}}/{{pageCount(reasonList)}}页 -->
                    {{$t('Dict.PageStyle.Text1', {
                      length: reasonList.length,
                      currentPage: currentPage,
                      totalPage: pageCount(reasonList),
                    })}}
                  </span>
                  <button href="javascript:;" class="prev" @click="upPage"><i class="el-icon-arrow-up"></i></button>
                  <button href="javasctipt:;" class="next" @click="downPage(reasonList)"><i class="el-icon-arrow-down"></i></button>
                </div>
              </div>
            </div>
          </div>
          <div class="ordering-give-keyboard" :class="{'disabledBtn':!!this.list[0].isNotFollowAmount && this.list[0].isPackage}">
            <KeyBoard ref="keyboard" v-show="reasonList.length > 0"></KeyBoard>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import { cloneDeep } from 'lodash';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import PageMixin from '@/common/util/PaginationMixin';
import { add, sub } from '@/common/js/math';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import { selectInput } from '@/common/js/dom';

export default {
  components: { Dialog, KeyBoard },
  mixins: [DialogMixin, PageMixin],
  data() {
    return {
      list: [{}],
      giveNum: 0,
      reasonList: [],
      prePageSize: 6,
      reasonId: null,

    };
  },
  computed: {
    ...mapGetters([
      'posSettings',
    ]),
    hotKeySet() {
      return {
        PgDn: () => {
          this.submitOrderingGive();
        },
      };
    },
    totalNum() {
      return this.list.reduce((sum, item) => add(sum, item.num), 0);
    },
    // 显示的团购券列表
    showReasonList() {
      return this.pagination(this.currentPage, this.prePageSize, this.reasonList);
    },
  },
  watch: {
    giveNum(value) {
      if (parseFloat(value) > this.totalNum || isNaN(Number(value))) {
        this.giveNum = this.totalNum;
      }
      if (parseFloat(value) < 0) {
        this.giveNum = 0;
      }
    },
  },
  mounted() {
    this.$von('closeFastFoodOrderingGiveModal', () => {
      this.close();
    });
  },
  methods: {
    orderingGiveDialog() {
      const tmp = {
        PgDn: () => {
          this.submitOrderingGive();
        },
      };
      return tmp;
    },
    onOpen() {
      this.list = this.resData;
      this.giveNum = this.totalNum;
      this.selectInput();
      this.currentPage = 1;
      const reasons = cloneDeep(this.posSettings.presentReasons);
      if (this.posSettings.isShowPresentReason) {
        let where = '';
        reasons.map((item, index) => {
          if (item.id === this.posSettings.defaultPresentReason) {
            where = index;
          }
        });
        if (where !== '') {
          [reasons[0], reasons[where]] = [reasons[where], reasons[0]];
        }
        this.reasonId = reasons[0].id;
      }
      this.reasonList = reasons;
      const uiData = this.list[0];
      this.$log.info(`打开赠菜窗口：id:${uiData.id},itemName:${uiData.itemName},num:${uiData.num},price:${uiData.price}`);
    },
    onClose() {
      this.list = [{}];
      this.reasonId = null;
    },
    subtractGiveNum() {
      this.giveNum = sub(this.giveNum, 1);
      this.selectInput();
    },
    addGiveNum() {
      this.giveNum = add(this.giveNum, 1);
      this.selectInput();
    },
    selectInput() {
      this.$refs.giveNum ? selectInput(this.$refs.giveNum) : null;
    },
    choiceReason(id) {
      this.reasonId = id;
    },
    submitOrderingGive() {
      if (!this.reasonId) {
        this.$message({
          type: 'error',
          // message: '请选择赠菜原因',
          message: this.$t('Biz.BizComm.GiveTip03'),
        });
        return;
      }
      this.submit(this.giveNum, this.reasonId);
      const uiData = this.list[0];
      this.$log.info(`提交赠菜窗口：id:${uiData.id},itemName:${uiData.itemName},giveNum:${this.giveNum},reasonId:${this.reasonId}`);
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
  >.isShowTishi {
    color: red;
  }
}

.ordering-give-control {
  padding-top: 12px;
  padding-bottom: 25px;
  .clearfix();
}

.ordering-give-form {
  float: left;
  width: 264px;
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
    height:150px;
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
      overflow: hidden;
      > div {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }

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
  width: 186px;
  &.disabledBtn {
    pointer-events: none;
    cursor: default;
    opacity: 0.6;
  }
}

.ordering-give-error {
  padding: 15px;
}

.pos-pager{
  overflow: hidden;
  padding: 12px 16px 0 0;
}

// 箭头按钮
.pos-takeout-pager {
  float: right;
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
</style>
