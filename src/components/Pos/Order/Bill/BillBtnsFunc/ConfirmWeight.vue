<template>
  <!-- $t-称重确认 -->
  <Dialog
    name="PosDialog.ConfirmWeight"
    :title="$t('Dict.Btn.ConfirmWeight')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :showSubmit="true"
    width="720px"
    :hotkeys="hotKeySet"
  >
    <div class="confirmweight">
      <div class="confirmweight-info">
        <strong>
          <!-- <i></i> -->
          <span>{{confirmWeightData.pointName}}</span>
        </strong>
        <!-- $t-开单时间：, 就餐人数： -->
        <span class="openbill-time">{{$t('Dict.OpeningTime')}}{{confirmWeightData.openTime}}</span>
        <span class="number-guest">{{$t('Biz.Order.DinerPersonNumLabel')}}{{confirmWeightData.peopleQty}}</span>
      </div>
      <div class="confirmweight-content">
        <div class="confirmweight-content-title">
          <!-- $t-序号,品项,数量,称重状态,称重数量 -->
          <span class="head-item-checkedbox"></span>
          <span class="head-item-order">{{ $t('Dict.SerialNumber') }}</span>
          <span class="head-item-name">{{ $t('Dict.Item') }}</span>
          <span class="head-item-number">{{ $t('Dict.Amount') }}</span>
          <span class="head-item-addbill-time">{{ $t('Dict.Remarks') }}</span>
          <span class="head-item-hasten-time">{{ $t('Biz.Order.WeighingNum') }}</span>
        </div>
        <ul class="list-content" id="confirmWeightListId">
          <li
            class="confirmweight-content-body"
            @click="setCheckAll(item.isChecked = !item.isChecked)"
            v-for="(item , index) in confirmWeightItems"
            :key="index"
          >
            <span class="item-checkedbox" @click.stop>
              <el-checkbox v-model="item.isChecked" @change="setCheckAll"></el-checkbox>
            </span>
            <span class="item-order">{{ index + 1 }}</span>
            <span class="item-name">{{ item.mergeScId ? '['+$t('Dict.Mixing')+']' : '' }}{{ item.itemName }}</span>
            <span class="item-number">{{ item.lastQty }}</span>
            <span class="item-addbill-time" :class="{'isConfirmWeigh': item.isConfirmWeigh}">
              <i>{{ $t('Dict.ConfirmWeigh') }}</i>
            </span>
            <span
              class="item-hasten-time"
              :class="item.auxiliaryUnitId
              ? 'item-have-auxiliary-unit' : ''"
              @click.stop
            >
              <el-input-number
                id="orderWeightNumber"
                v-judge
                v-model="item.num1"
                v-num-keyboard:left
                size="small"
                @change="handleChange(index)"
                :min="0.001"
                :label="$t('Dict.DescriptiveText')"
                @keyup.native="changeItemNum($event,index)"
              ></el-input-number>
              <span>{{item.unitName}}</span>
              <el-input-number
                id="orderAuxiliaryUnitNum"
                v-judge
                v-if="item.auxiliaryUnitId"
                v-model="item.auxiliaryUnitQty"
                v-num-keyboard:left
                size="small"
                :min="1"
                :max="99"
                :label="$t('Dict.AuxiliaryUnitQty')"
                @change="checkNum"
                @keyup.native="changeAuxNum($event,index)"
              ></el-input-number>
              <span>{{item.auxiliaryUnitName}}</span>
            </span>
            <span class="item-weight">
              <!-- #t-重新称重 -->
              <button
                type="button"
                class="btn btn-default"
                v-if="isWeighed"
                @click.stop="handleItemWeight(item,index)"
              >{{ $t('Biz.BizComm.ReWeighing') }}</button>
            </span>
          </li>
        </ul>
        <div class="confirmweight-footer">
          <div class="select-all">
            <!-- $t-全选 -->
            <el-checkbox v-model="checkAll" @change="handleCheckAllChange">{{ $t('Dict.SelectAll') }}</el-checkbox>
          </div>
          <div class="pagerbtn">
            <Pager
              pagerId="confirmWeightListId"
              itemTag="li"
              :showInfo="true"
              arrowDirection="up-down"
              ref="confirmWeightListPager"
            ></Pager>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';
import ajax from '@/common/js/ajax';
import LoadScaleMixin from '@/components/Pos/Common/LoadScaleMixin';
import newWeightUnitConversion from '@/common/js/newWeightUnitConversion';
import returnpointandsettle from '../../../../../common/js/logic/canyin/pos/returnpointandsettle';

export default {
  components: { Dialog, Pager },
  mixins: [DialogMixin, LoadScaleMixin],
  data() {
    return {
      checkAll: false,
      confirmWeightItems: [],
      confirmWeightData: {},
      auxiliaryUnitQty: 0,
    };
  },
  computed: {
    ...mapGetters(['newWeightData', 'posFastFood', 'posDevice', 'setting']),
    hotKeySet() {
      return {
        PgDn: () => {
          // 提交按钮获得焦点后执行提交
          this.whenSubmitBtnFocus(() => {
            this.onSubmit();
          });
        },
      };
    },
    isWeighed() {
      return this.posDevice.enableScale;
    },
  },
  methods: {
    // 弹窗加载数据
    onOpen() {
      this.checkAll = false;// 全选
      this.confirmWeightData = this.resData;// 称重确认的所有的信息
      this.confirmWeightItems = this.resData.scList;// 品项列表数据
      this.confirmWeightItems.forEach((item) => {
        // 数字框赋值
        this.$set(item, 'num1', item.lastQty);
        this.$set(item, 'isChecked', false);
        // 称重文本渲染
        // if (item.isConfirmWeigh) {
        //   // this.$set(item, 'weightstatus', '已称重');
        //   this.$set(item, 'weightstatus', this.$t('Biz.Order.BeenWeighed'));
        // } else {
        //   // this.$set(item, 'weightstatus', '未称重');
        //   this.$set(item, 'weightstatus', this.$t('Biz.Order.NotWeighed'));
        // }
      });
      setTimeout(() => {
        if (this.$refs.confirmWeightListPager) {
          this.$refs.confirmWeightListPager.refresh();
        }
      }, 0);
    },
    // 电子秤称重
    handleItemWeight(item, index) {
      // 去皮功能
      if (this.posDevice.isNetWeight && this.posDevice.isSupportNewWeight) {
        this.$set(item, 'name', item.itemName);
        const weightData = this.newWeightData.autoWeighNetValue
          ? this.newWeightData.autoWeighNetValue
          : 0;
        // 读电子秤如果小于等于0 则 不做任何操作
        if (weightData <= 0) {
          // this.$message.warning('当前菜品重量小于等于0');
          this.$message.warning(this.$t('Biz.Order.OrderOptMsg06'));
          return;
        }
        Object.assign(item, {
          num1: weightData,
        });
      } else {
        // 老版称重
        this.loadScale((weight, isError) => {
          let newWeight = weight;
          if (!isError) {
            newWeight = newWeightUnitConversion(newWeight, this.setting);
          }
          Object.assign(item, {
            num1: newWeight,
          });
        });
      }
      this.handleChange(index);
    },
    // 辅助单位数量的校验
    checkNum(value) {
      console.log(value);
      this.auxiliaryUnitQty = value;
      // return false;
      // console.log(index);
      const taleNumTest = /^[1-9]\d*$/g;
      // console.log(this.confirmWeightItems[index]);
      // if (this.confirmWeightItems[index]) {
      //   const { auxiliaryUnitQty } = this.confirmWeightItems[index];
      //   console.log(auxiliaryUnitQty);
      if (!value || !taleNumTest.test(value)) {
        this.$message.warning(this.$t('Dict.Validate.NumberMessage')); // 请输入正确数量
        this.auxiliaryUnitQty = value.toString().substr(0, value.toString().length - 1);
        console.log(this.auxiliaryUnitQty);
        if (!value.length) {
          this.auxiliaryUnitQty = 1;
        }
      }
      if (value && value > 99) { // 限制最大输入值
        // callback(new Error(this.$t('Dict.MaximumMessage', [`${this.maxNum}`])));
        this.$message.warning(this.$t('Dict.MaximumMessage', [`${this.maxNum}`]));
        // this.auxiliaryUnitQty = value.toString().substr(0, value.toString().length - 1);
        // this.$set(this.changeData, 'inputNum', value.toString().substr(0, value.toString().length - 1));
        // this.$forceUpdate();
      }
      // }

      // console.log(value);
    },
    // 改变数据
    changeAuxNum(ev, index) {
      const item = this.confirmWeightItems[index];
      console.log(ev);
      setTimeout(() => {
        this.$set(item, 'auxiliaryUnitQty', this.auxiliaryUnitQty);
      }, 0);
    },
    // 数字框change事件
    handleChange(index) {
      const item = this.confirmWeightItems[index];
      this.$set(item, 'isChecked', true);
      this.setCheckAll();
    },
    // 键盘触发就checked
    changeItemNum(ev, index) {
      this.handleChange(index);
    },
    // 全选方法
    handleCheckAllChange(value) {
      this.confirmWeightItems.forEach((item) => {
        this.$set(item, 'isChecked', value);
      });
    },
    // 设置全选情况
    setCheckAll() {
      const checkList = this.confirmWeightItems.filter(item => item.isChecked);
      const checkedCount = checkList.length;

      this.checkAll = checkedCount === this.confirmWeightItems.length;
    },
    // 确认按钮提交方法
    onSubmit() {
      const itemCheckeds = [];
      // 遍历当前菜品明细，将选中的菜品组装到数组中，稍后提交
      this.confirmWeightItems.forEach((item) => {
        console.log(item);
        if (item.isChecked) {
          const itemData = {};
          itemData.itemId = item.itemId;
          itemData.scId = item.id;
          itemData.qty = item.num1;
          itemData.itemName = item.itemName;
          if (item.auxiliaryUnitId) {
            itemData.auxiliaryUnitId = item.auxiliaryUnitId;
            itemData.auxiliaryUnitQty = item.auxiliaryUnitQty;
            itemData.auxiliaryUnitName = item.auxiliaryUnitName;
          }
          itemCheckeds.push(itemData);
        }
      });

      if (!itemCheckeds || itemCheckeds.length === 0) {
        // this.$message.error('请先选择菜品明细再执行确认操作');
        this.$message.error(this.$t('Biz.Order.OrderOptMsg07'));
        return;
      }

      ajax('canyin.pos.confirmWeigh.confirmweigh', {
        method: 'POST',
        contentType: 'paramsEncoded',
        data: {
          pointId: this.resData.pointId, items: itemCheckeds, bsId: this.resData.bsId,
        },
      }).then((res) => {
        if (res.code === '1') {
          // this.$message.success('称重确认成功');
          if (res.data.success) {
            this.$message.success(this.$t('Biz.Order.OrderOptMsg08'));
            this.submit();
            this.close();
          } else {
            this.$message.error(`${res.data.msg}`);
          }
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
.confirmweight {
  padding-left: 12px;
  padding-right: 12px;
  padding-bottom: 12px;
  > .confirmweight-info {
    line-height: 48px;
    height: 48px;

    > strong {
      font-size: 14px;
      color: #f24f64;
      > i {
        width: 20px;
        height: 20px;
        background-image: url("~@/common/images/pos/exitBill/table-number.png");
        background-repeat: no-repeat;
        background-size: 100%;
        display: inline-block;
        vertical-align: text-top;
      }
    }
    > .number-guest {
      margin-left: 23px;
      font-size: 14px;
      font-weight: 400;
    }
    > .openbill-time {
      margin-left: 27px;
      font-size: 14px;
      font-weight: 400;
    }
  }

  > .confirmweight-content {
    background-color: #fff;

    > .confirmweight-content-title {
      border-bottom: 1px solid #ccc;
      font-size: 12px;
      height: 37px;
      font-weight: 400;
      color: #666;
      line-height: 37px;

      > span {
        text-align: center;
        display: inline-block;
      }

      > .head-item-checkedbox {
        width: 4%;
      }
      > .head-item-order {
        width: 8%;
      }
      > .head-item-name {
        width: 25%;
      }
      > .head-item-number {
        width: 10%;
      }
      > .head-item-addbill-time {
        width: 6%;
      }
      > .head-item-hasten-time {
        width: 16%;
      }
    }
    > .list-content {
      height: 392px !important;
      overflow: hidden;

      > .confirmweight-content-body {
        border-bottom: 1px solid #ccc;

        > span {
          max-height: 48px;
          text-align: center;
          vertical-align: middle;
          font-size: 14px;
          font-weight: 600;
          display: inline-block;
          overflow: hidden;
        }
        > .item-checkedbox {
          width: 4%;
        }
        > .item-order {
          width: 8%;
          height: 48px;
          line-height: 48px;
        }
        > .item-name {
          width: 25%;
        }
        > .item-number {
          width: 10%;
        }
        > .item-addbill-time {
          width: 6%;
          >i {
            font-style:normal;
            color: #ffffff;
            background-color: #f24f64;
            display: inline-block;
            min-width: 16px;
            height: 16px;
            line-height: 16px;
            text-align: center;
            font-size: 12px;
            margin-left: 2px;
            margin-right: 2px;
          }
          &.isConfirmWeigh {
            >i {
              background-color:#5cb95c;
            }
          }
        }
        > .item-hasten-time {
          width: 29%;
          text-align: left;
          position: relative;
          >span {
            display: inline-block;
            width: 50px;
            padding: 0px 2px 0 4px;
            white-space: nowrap;
            overflow: hidden;
            position: absolute;
            top: 10px;
            text-align: center;
            &:nth-of-type(2) {
              top: 46px;
            }
          }
        }
        > .item-weight {
          width: 14%;
          cursor: pointer;
          button{
            font-size: 12px;
            padding: 6px 10px;
          }
        }
        >.item-have-auxiliary-unit {
          max-height: 84px;
          >.el-input-number:nth-of-type(1) {
            margin-top: 4px;
            margin-bottom: 2px;
          }
          >.el-input-number:nth-of-type(2) {
            margin-top: 2px;
            margin-bottom: 4px;
          }
        }
      }
    }

    > .confirmweight-footer::after {
      content: "";
      display: block;
      clear: both;
    }
    > .confirmweight-footer {
      height: 53px;
      padding: 6px 12px;
      > .pagerbtn {
        margin-left: 75px;
        text-align: right;
      }
      > .select-all {
        float: left;
        width: 65px;
        height: 30px;
        margin-top: 6px;
        border: 1px solid #ddd;
        text-align: center;
        line-height: 30px;
        background-color: #f1f6f8;
      }
    }
  }
}
.lang-enUS {
  .confirmweight > .confirmweight-content > .list-content > .confirmweight-content-body > .item-order,
  .confirmweight > .confirmweight-content > .confirmweight-content-title > .head-item-order {
    width: 5%;
  }
  .confirmweight > .confirmweight-content > .list-content > .confirmweight-content-body > .item-number,
  .confirmweight > .confirmweight-content > .confirmweight-content-title > .head-item-number {
    width: 8%;
  }
  .confirmweight > .confirmweight-content > .list-content > .confirmweight-content-body > .item-addbill-time,
  .confirmweight > .confirmweight-content > .confirmweight-content-title > .head-item-addbill-time {
    width: 18%;
    font-size: 12px;
  }
}
</style>
