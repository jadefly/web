<template>
  <el-form
    class="form-warp"
    :model="consumerForm"
    :rules="consumerRules"
    ref="consumerForm"
    label-width="115px"
  >
    <el-form-item :label="$t('Biz.Crm.CardTelNum')" prop="cardnumber" class="card-input-warp">
      <el-input
        class="card-input"
        ref="consumerNumber"
        v-model.trim="consumerForm.cardnumber"
        v-judge
      >
      <!-- $t-读卡 -->
      </el-input><button type="button" class="btn btn-primary" @click="readCard">
        {{ $t('Dict.CardReading') }}<span class="quick-tip">(Enter)</span>
      </button>
    </el-form-item>
    <template v-if="list.length >= 0">
      <el-form-item class="info-warp" label-width="0">
        <ul class="table-head">
          <!-- $t-"档口名称","消费品项","数量","单位","消费金额(元)","消费时间", -->
          <li class="head-col-name">{{ $t('Biz.Crm.ShopName') }}</li>
          <li class="head-col-item">{{ $t('Biz.Crm.ConsumeItem') }}</li>
          <li class="head-col-count">{{ $t('Dict.Amount') }}</li>
          <li class="head-col-unit">{{ $t('Dict.UnitName') }}</li>
          <li class="head-col-money">{{ $t('Biz.Crm.ConsumeMoney') }}</li>
          <li class="head-col-time">{{ $t('Biz.Crm.ConsumeDate') }}</li>
        </ul>
        <div class="table-content-warp" ref="listwarp" v-loading="loadingList">
          <div class="table-content">
            <div class="table-item" v-for="(item, index) in list" :key="index">
              <div class="content-name">{{item.posName}}</div>
              <ul class="item-info-list">
                <li class="info-item" v-for="detilItem in item.consumeList" :key="detilItem.id">
                  <span class="content-col-item">{{detilItem.name}}</span>
                  <span class="content-col-count">{{detilItem.qty}}</span>
                  <span class="content-col-unit">{{detilItem.unitName}}</span>
                  <span class="content-col-money">{{detilItem.lastSubTotal}}</span>
                  <span class="content-col-time">{{detilItem.consumeTimeStr}}</span>
                </li>
              </ul>
              <h4 class="total">
                {{ $t('Dict.Total01') }}<span class="info">{{item.lastTotal}}</span>
              </h4>
            </div>
            <div class="no-item" v-if="list.length === 0">
              <!-- 暂无消费记录 -->
              {{ $t('Biz.Crm.CrmTip08') }}
            </div>
          </div>
        </div>
      </el-form-item>
      <el-form-item class="btn-warp" label-width="0">
        <button class="btn btn-default" @click="reset()" type="button">
          {{ $t('Biz.Crm.Reset') }}<span class="quick-tip">(PgUp)</span>
        </button>
        <button class="btn btn-default" @click="print()"
        type="button">{{ $t('Dict.Printing') }}<span class="quick-tip">(PgDn)</span></button>
        <div class="pos-pager pos-takeout-pager">
          <!-- 共{{list.length}}条，{{currentPage}}/{{pageCount}}页 -->
          <span class="page-info">{{
              $t('Dict.PageStyle.Text1', { length: list.length, currentPage: currentPage, totalPage: pageCount })
            }}</span>
          <button href="javascript:;" type="button" class="prev" @click="upPage">
            <i class="el-icon-arrow-up"></i>
          </button>
          <button href="javasctipt:;" type="button" class="next" @click="downPage">
            <i class="el-icon-arrow-down"></i>
          </button>
        </div>
      </el-form-item>
    </template>
  </el-form>
</template>
<script>

import { isEmpty } from 'lodash';
import ajax from '@/common/js/ajax';
import PageMixin from '@/common/util/PaginationScrollMixin';

export default {
  mixins: [PageMixin],
  model: {
    prop: 'cardInfo',
    event: 'change',
  },
  props: {
    cardInfo: {
      required: true,
    },
  },
  data() {
    return {
      list: [],
      loadingList: false,
      consumerForm: {
        cardnumber: '',
      },
      consumerRules: {
        cardnumber: [
          // { required: true, message: '请输入卡号或手机号', trigger: 'change' },
          { required: true, message: this.$t('Biz.Crm.CrmTip03'), trigger: 'change' },
        ],
      },
    };
  },
  mounted() {
    // 跨组件事件代理 处理显示'会员卡列表'组件返回的具体数据
    this.$von('crm6CardNoChangeBus', (data) => {
      this.$emit('change', data);
      this.consumerForm.cardnumber = data.cardNo;
    });
  },
  methods: {
    // 设置热键
    setCurrentHotkey() {
      this.$hotKey.set('Pos.Crm', {
        Enter: () => {
          this.readCard();
        },
        PgUp: () => {
          this.reset();
        },
      });
    },
    // 读卡
    readCard() {
      if (isEmpty(this.consumerForm.cardnumber)) {
        this.$devices.Cardop.read((card) => {
          if (+card.returnCode === 0) {
            this.consumerForm.cardnumber = card.CardNo;
            this.loadCard();
          } else {
            // this.$message.error('读卡失败');
            this.$message.error(this.$t('Biz.Crm.CrmTip04'));
          }
        });
      } else {
        this.loadCard();
      }
    },
    loadCard() {
      ajax('canyin.pos.crm.crmsalescounter.readcard', {
        contentType: 'URLEncoded',
        data: {
          cardNo: this.consumerForm.cardnumber,
        },
      }).then((data) => {
        const getCardTime = new Date().getTime();
        if (data.success) {
          // 如果data.data不为空且cardList为空时, 查询的是一个卡号或只绑定一个卡的手机号, 执行唯一卡数据处理
          if (data.data && isEmpty(data.cardList)) {
            this.$message.success(data.msg);
            this.loadList(getCardTime);
            this.$emit('change', data.data);
          } else if (isEmpty(data.data) && !isEmpty(data.cardList) && data.cardList.length > 1) {
          // 如果 data.data为空且cardList不为空时,且cardList数组length > 1, 手机号绑定多个卡, 执行卡列表选择
            // 传参 list-多卡列表数据, callback-传入需要执行的回调, 无回调置空
            this.$parent.$refs.crmCardList.open({
              list: data.cardList,
              msg: data.msg,
              callback: () => {
                this.loadList(getCardTime);
              },
            });
          }
        } else {
          this.$message.warning(data.msg);
        }
      });
    },
    // 加载列表
    loadList(getCardTime) {
      this.loadingList = true;
      ajax('canyin.pos.crm.crmsalescounter.consumelist', {
        contentType: 'paramsEncoded',
        data: {
          cardNo: this.consumerForm.cardnumber,
        },
      }).then((data) => {
        const getListTime = new Date().getTime();
        const delayTime = 2000 - (getListTime - getCardTime);
        this.loadingList = false;
        if (data.success) {
          this.list = data.data ? data.data : [];
          this.showDelayMessage('success', data.msg, delayTime);
          this.$nextTick(() => {
            this.setPageInfo(this.$refs.listwarp);
          });
        } else {
          this.showDelayMessage('warning', data.msg, delayTime);
        }
      }).catch(() => {
        this.loadingList = false;
      });
    },
    // 延时显示提示
    showDelayMessage(type, msg, delay = 2000) {
      let delayTime = delay;
      if (delayTime < 0) {
        delayTime = 0;
      }
      setTimeout(() => {
        this.$message[type](msg);
      }, delayTime);
    },
    // 重置表单
    reset() {
      this.$refs.consumerForm.resetFields();
      this.$emit('change', null);
      this.$refs.consumerNumber.focus();
      this.list = [];
    },
    // 打印
    print() {
      ajax('canyin.pos.crm.crmsalescounter.printcrmconsumelist', {
        method: 'post',
        contentType: 'URLEncoded',
        data: {
          data: JSON.stringify(
            {
              cardNo: this.cardInfo.cardNo,
              balanceMoney: this.cardInfo.balanceMoney,
              cardTypeName: this.cardInfo.cardTypeName,
              deposit: this.cardInfo.deposit,
            },
          ),
        },
        // {"cardNo":"0014201807260741","balanceMoney":66.9,"cardTypeName":"临时卡","deposit":0}
      }).then((res) => {
        console.log(res);
        if (res.printData.success === true && res.printData.printD !== null) {
          this.$devices.Printer.print(res.printData.printD);
        } else {
          this.$message.warning(res.printData.msg);
        }
      });
    },
  },
};
</script>
<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";
  button{
    font-size: 16px;
    .quick-tip{
      font-size: 14px;
    }
  }
  .form-warp{
    width: 523px;
    text-align: left;
  }
  .card-input-warp{
    .card-input{
      width: 290px;
    }
    button{
      height: 38px;
      margin-left: 16px;
      width: 100px;
    }
  }
  .table-head{
    background-color: #dcdcdc;
    overflow: hidden;
    font-size: 14px;
    color: #666;
    >li{
      line-height: 32px;
      float: left;
    }
    .head-col-name{
      width: 18%;
      padding-left: 12px;
    }
    .head-col-item{
      width: 27%;
    }
    .head-col-count{
      width: 9.5%;
    }
    .head-col-unit{
      width: 11.7%;
    }
    .head-col-time{
      width: 15.5%;
    }
    .head-col-money{
      width: 18%;
    }
  }
  .table-content-warp{
    height: 432px;
    overflow: scroll;
    &::-webkit-scrollbar {
        width: 0px;
    }
  }
  .table-content{
    margin-top: 4px;
    background-color: @white;
    padding: 0 12px;
    color: #333;
    line-height: 2;
    .table-item{
      padding: 10px 0;
      overflow: hidden;
    }
    .table-item + .table-item{
      border-top: 1px solid #b5b5b5;
    }
    .content-name,.item-info-list{
      float: left;
    }
    .info-item{
      overflow: hidden;
      width: 100%;
      >span{
        float: left;
      }
    }
    .content-name{
      width: 16.8%;
    }
    .item-info-list{
      width: 83.2%;
    }
    .content-col-item{
      width: 33.4%;
    }
    .content-col-count{
      width: 14.1%;
      padding-left: 10px;
    }
    .content-col-unit{
      width: 14.6%;
      padding-left: 4px;
    }
    .content-col-time{
      width: 19%;
      padding-left: 8px;
    }
    .content-col-money{
      width: 18.9%;
      text-align: center;
    }
    h4.total{
      clear: both;
      text-align: right;
      font-size: 14px;
      font-weight: bold;
      padding-right: 28px;
      .info{
        font-size: 16px;
        line-height: 1.625;
      }
    }
  }
  .no-item{
    color: #666;
    text-align: center;
    padding: 12px 0;
  }
  .btn-warp{
    button{
      width: 132px;
      height: 42px;
    }
    button+button{
      margin-left: 10px;
    }
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
