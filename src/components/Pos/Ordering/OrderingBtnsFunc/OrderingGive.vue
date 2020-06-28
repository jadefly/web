<template>
<!-- 赠菜 -->
  <Dialog
    name="PosDialog.OrderingGive"
    :title="$t('Biz.Order.DishGiving')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :showSubmit="true"
    @submit="submitOrderingGive"
    width="516px"
    :hotkeys="hotKeySet"
    submitId="orderingGiveSubmit"
  >
    <div class="pos-dialog-content">
      <div class="ordering-give-wrap">
        <div class="ordering-give-info">
          <p>
            <!-- 已点菜品： -->
            <strong>{{ $t('Biz.Order.OrderedDishes') }}</strong>
            <span>{{
              list[0].name + (
                list[0].sizeName
                  ? ('（' + list[0].sizeName + '）')
                  : ''
              )
            }}</span>
            <span>{{ list[0].price }} /{{ list[0].unitName }}</span>
          </p>
          <p>
            <!-- 已点数量： -->
            <strong>{{ $t('Biz.Order.OrderedNum') }}</strong>
            <span>{{ totalNum }}</span>
          </p>
          <!-- 如果当前要赠送的品项是套餐的并且是不联动的话给提示-->
          <!-- 注: 当前套餐属于不联动只能全部赠送 -->
          <span
            v-show="!!list[0].isNotFollowAmount && list[0].isPackage"
            class="isShowTishi"
          >
            {{ $t('Biz.BizComm.GiveTip01') }}
          </span>
        </div>
        <div class="ordering-give-control">
          <div class="ordering-give-form">
            <div class="ordering-give-num">
              <!-- 赠送数量： -->
              <label for="iGiveNum">{{ $t('Dict.PresentationNum01') }}</label>
              <div class="ordering-give-form-group">
                <button
                  type="button"
                  class="subtract"
                  :disabled="giveNum <= 1 ||
                    (!!list[0].isNotFollowAmount && list[0].isPackage)
                    || (list && auxiliaryUnitData)"
                  @click="subtractGiveNum"
                  id="subtractGiveNum"
                >
                  <i class="icon icon-subtract"></i>
                </button>
                <input
                  type="text"
                  name="giveNum"
                  id="iGiveNum"
                  ref="giveNum"
                  v-judge
                  v-model="giveNum"
                  :disabled="(!!list[0].isNotFollowAmount && list[0].isPackage) ||
                    (list && auxiliaryUnitData)"
                  v-keyboard:keyboard="{ mode: 'simple', autoSelect: true }"
                >
                <button
                  type="button"
                  class="add"
                  :disabled="giveNum >= totalNum || (
                    !!list[0].isNotFollowAmount && list[0].isPackage
                  )"
                  @click="addGiveNum"
                  id="addGiveNum"
                >
                  <i class="icon icon-add"></i>
                </button>
              </div>
            </div>
            <div v-show="list && auxiliaryUnitData" class="auxiliaryTips">
              {{$t('Biz.Order.TipsMsg')}}
            </div>
            <div class="ordering-give-reason">
              <!-- 赠送原因： -->
              <strong>{{ $t('Biz.BizComm.GiveDishReason') }}</strong>
              <ul class="list" id="orderingGiveReason">
                <li v-for="item in showReasonList" :key="item.id">
                  <button
                    type="button"
                    :class="{ 'active': item.id == reasonId }"
                    @click="choiceReason(item.id)"
                  >
                    <div>{{ item.name }}</div>
                  </button>
                </li>
              </ul>
              <div class="pos-pager">
                <div class="pos-takeout-pager">
                  <span class="page-info">{{
                    $t('Dict.PageStyle.Text1', {
                      length: reasonList.length,
                      currentPage,
                      totalPage: pageCount(reasonList),
                    })
                  }}</span>
                  <button
                    href="javascript:;"
                    class="prev"
                    @click="upPage"
                  ><i class="el-icon-arrow-up"></i></button>
                  <button
                    href="javasctipt:;"
                    class="next"
                    @click="downPage(reasonList)"
                  ><i class="el-icon-arrow-down"></i></button>
                </div>
              </div>
            </div>
          </div>
          <!-- //如果当前操作的品项是不联动的话,不能部分赠送 -->
          <!-- v-if="list && this.auxiliaryUnitData" -->
          <div
            class="auxiliaryUniBox"
            v-if="list && auxiliaryUnitData"
          >
            <label class="auxiliaryLabel" for="auxiliaryNumGive">{{ $t('Dict.AuxiliaryAmountLabel') }}</label>
            <NumberInput
              :changeData="auxiliaryUnitData"
              id="auxiliaryNumGive"
            >
            </NumberInput>
          </div>
          <div
            class="ordering-give-keyboard"
            :class="{
              'disabledBtn': (!!this.list[0].isNotFollowAmount && this.list[0].isPackage)
                || (list && auxiliaryUnitData)
            }"
          ><KeyBoard ref="keyboard"></KeyBoard></div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import { isNaN, cloneDeep } from 'lodash';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import PageMixin from '@/common/util/PaginationMixin';
import { add, sub } from '@/common/js/math';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import NumberInput from '@/components/Pos/Common/NumberInput';
import { selectInput } from '@/common/js/dom';

export default {
  components: { Dialog, KeyBoard, NumberInput },
  mixins: [DialogMixin, PageMixin],
  data() {
    return {
      list: [{}],
      giveNum: 0,
      reasonId: null,
      reasonList: [],
      prePageSize: 6,
      auxiliaryUnitData: null,
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
      // 辅助单位的判断以及处理
      if (this.list[0].auxiliaryUnitId) {
        this.auxiliaryUnitData = { inputNum: this.list[0].auxiliaryUnitQty };
      }
      const reasons = cloneDeep(this.posSettings.presentReasons);
      // ajax('canyin.pos.bill.presentreasonview')
      //   .then((res) => {
      //     const { reasons } = res;
      if (this.posSettings.isShowPresentReason) { // 后台如果开启了默认赠菜原因，把默认原因置顶
        let where = ''; // 如果没有开启默认赠菜原因，必须手动选择一个
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
      // });
      const uiData = this.list[0];
      this.$log.info(`打开赠菜窗口：id:${uiData.id},itemName:${uiData.itemName},num:${uiData.num},price:${uiData.price}`);
    },
    onClose() {
      this.list = [{}];
      this.reasonId = null;
      this.auxiliaryUnitData = null;
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
      if (this.$refs.giveNum) {
        selectInput(this.$refs.giveNum);
      }
    },
    choiceReason(id) {
      this.reasonId = id;
    },
    submitOrderingGive() {
      if (!this.reasonId) {
        this.$message.error(this.$t('Biz.BizComm.GiveTip03'));
        return;
      }
      this.submit(this.giveNum, this.reasonId);
      this.close();
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
    height: 150px;
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
.auxiliaryUniBox {
  width: 216px;
  height: 44px;
  float: right;
  line-height: 44px;
  pointer-events: none;
  cursor: default;
  .auxiliaryLabel {
    font-weight: normal;
  }
  .el-form {
    float: right;
    width: 142px;
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
.lang-enUS {
  .pos-pager {
    font-size: 12px;
    padding-right: 10px;
  }
}
.auxiliaryTips {
  color: red;
}
</style>
