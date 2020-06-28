<template>
  <Dialog
    name="PosDialog.LimitQuantityChildDialog"
    :title="$t('Biz.Pos.More.LimitQChildTitle1')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    :append-to-body="true"
    :showSubmit="true"
    @submit="onSubmit"
    :hotkeys="hotKeySet"
    width="560px"
    top="60px"
    :submitId="type + 'LimitQuantityChildSubmit'"
    class="limitBox"
  >
  <template slot="other-button" v-if="type === 'change'">
    <button
      type="button"
      class="btn btn-default"
      @click="cancelLimit"
    >{{$t('Biz.Pos.More.LimitQChildBtn1')}}(F1)</button>
  </template>
  <div class="itemsLimitDialog">
    <div class="pull-left itemsLimit-selected">
      <form action="">
        <div class="name textEllipsis">
          {{$t('Biz.Pos.More.IPByTimeChildDiv1')}}<span v-show="sizeName && sizeName != '-'">({{ sizeName }})</span>{{itemsName}}
        </div>
        <div class="count">
          <span>{{$t('Biz.Pos.More.LimitQTh401')}}</span>
          <numberAddDel :id="type + '-limitQuantityCount'"
            :inputNum="sitemsCount"
            @changeLimit="changeLimit_sitems">
          </numberAddDel>
        </div>
        <div class="textEllipsis borT">
          {{$t('Biz.Pos.More.LimitQTh301')}}
          <el-switch
            v-model="isAutoRestore"
            active-color="#0babb9"
            inactive-color="#b5b5b5">
          </el-switch>
        </div>
        <div class="name describe">
          {{ $t('Biz.Pos.More.LimitQChildMsg2') }}
        </div>
        <!-- 限量方式、限售数量框，开启自动重置后显示 -->
        <div class="typePanel" v-show="isAutoRestore">
          <div class="type" :id="type + 'limitQuantityType'" v-autotest>
            <span>{{$t('Biz.Pos.More.LimitQTh201')}}</span>
            <button
              type="button"
              class="btns"
              :class="{ active: isSelect == 2 }"
              @click="sellOutBtn('2')"
            >{{$t('Biz.Pos.More.ISellOutChildBtn1')}}</button>
            <button
              type="button"
              class="btns"
              :class="{ active: isSelect == 1 }"
              @click="sellOutBtn('1')"
            >{{$t('Biz.Pos.ShiftNow')}}</button>
          </div>
          <div class="count">
            <span>{{$t('Biz.Pos.More.LimitQChildSpan3')}}</span>
            <numberAddDel
              :inputNum="sitemsCountLimit"
              @changeLimit="changeLimit_Reset">
            </numberAddDel>
          </div>
        </div>

        <div v-if="source!=='kds'">
          <div class="name borT">{{$t('Biz.Pos.More.LimitQTh6')}} <!--外卖限量上、下架：-->
            <el-switch v-model="isTakeoutLimit" active-color="#0babb9" inactive-color="#b5b5b5" :disabled="posSettings.takeawayPlatformList.length===0"></el-switch>
          </div>
          <div class="typePanel" v-show="isTakeoutLimit">
            <div class="count">
              <span>{{$t('Biz.Pos.More.LimitQTh6_Lower')}}：</span><!--指定数量自动下架-->
              <numberAddDel
                :inputNum="autoLowerQuantity"
                @changeLimit="changeLimit_Lower">
              </numberAddDel>
            </div>
            <div class="count">
              <span>{{$t('Biz.Pos.More.LimitQTh6_Upper')}}：</span><!--指定数量自动上架-->
              <numberAddDel
                :inputNum="autoUpperQuantity"
                @changeLimit="changeLimit_Upper">
              </numberAddDel>
            </div>
            <div class="takeoutPlatform">
              <span class="ftLeft">{{$t('Biz.Pos.More.LimitQTh7_Takeout')}}：</span> <!--外卖平台-->
              <ul class="list" ref="takeoutbox">
                <li :class="item.selected?'selected':''" v-for="(item,index) in showTakeoutList" @click="takeoutClick(item,index)">
                  {{item.takeawayPlatformName}}
                </li>
              </ul>
            </div>
            <div class="pos-pager">
              <div class="pos-takeout-pager">
                <span class="page-info">
                  {{ $t('Dict.PageStyle.Text1', { length: takeawayList.length, currentPage: currentPage, totalPage: pageCount(takeawayList) }) }}
                  <!-- 共{{takeawayList.length}}条，{{currentPage}}/{{pageCount(takeawayList)}}页 -->
                </span>
                <button href="javascript:;" :disabled="preBtnDisabled" class="prev" @click="upPage"><i class="el-icon-arrow-up"></i></button>
                <button href="javasctipt:;" :disabled="nextBtnDisabled" class="next" @click="downPage(takeawayList)"><i class="el-icon-arrow-down"></i></button>
              </div>
              
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
  <!-- <div class="pull-right">
    <KeyBoard ref="keyboard"></KeyBoard>
  </div> -->
  </Dialog>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
import { selectInput } from '@/common/js/dom';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import { add, sub } from '@/common/js/math';
import PageMixin from '@/common/util/PaginationMixin';
import { cloneDeep } from 'lodash';
import numberAddDel from '@/components/Pos/More/numberAddDel'

export default {
  props: {
    type: {
      
    },
    source: {
      type: String,
      default: '',
    },
  },
  components: { Dialog, KeyBoard, numberAddDel },
  mixins: [DialogMixin, PageMixin],
  data() {
    return {
      sitemsCount: 0, // 限制数量，默认为1
      sitemsCountLimit: 0, // 限售數量
      sitemsCountLimitCatch: 0, // 限售数量初始值暂存
      itemsName: '', // 选中品项
      sizeName: '', // 选中品项的规格名称
      isSelect: 2, // 默认选中时间为：当前
      add,
      sub,
      isAutoRestore: false,
      isTakeoutLimit: false, // 外卖限量上下架开关
      autoLowerQuantity: 0, // 指定数量自动下架
      autoUpperQuantity: 0, // 指定数量自动上架
      takeawayList: [], // 外卖平台数据
      showTakeoutList: [], // 某页数据-分页
      currentPage: 1,
      prePageSize: 4,
      disabled_lowerAdd: false,
      disabled_upAdd: false,
    };
  },
  computed: {
    ...mapGetters(['posSettings']),
    hotKeySet() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
        F1: () => {
          if (this.type === 'change') {
            this.cancelLimit();
          }
        },
      };
    },
  },
  methods: {
    onOpen() {
      if (this.resData.id) {
        this.isSelect = 2;
        this.sitemsCount = 0; // 恢复默认
        this.sitemsCountLimit = 0;
        this.sitemsCountLimitCatch = 0;
        this.isAutoRestore = false;
      } else { // 编辑修改
        this.sitemsCountLimit = this.resData.limitQuantity;
        this.sitemsCountLimitCatch = this.resData.limitQuantity;
        this.sitemsCount = this.resData.restQuantity;
        this.isSelect = this.resData.isSelect;
        this.isAutoRestore = this.resData.isAutoRestore;
      }
      this.itemsName = this.resData.name;
      this.sizeName = this.resData.size_name;
      this.selectInput();
      // 外卖限量
      this.isTakeoutLimit = this.resData.isTakeoutLimit || false; // 默认关闭
      this.autoLowerQuantity = this.resData.autoLowerQuantity || 0;
      this.autoUpperQuantity = this.resData.autoUpperQuantity || 0;
      if (!this.posSettings.takeawayPlatformList) {
        this.isTakeoutLimit = false;
        this.takeoutLimitDisabled = false; // 不可点
      }
      this.takeawayList = (this.posSettings && cloneDeep(this.posSettings.takeawayPlatformList)) || [];
      this.takeawayPlatformIdList = this.resData.takeawayPlatformIdList || []; // 选中的 res.resData.takeawayPlatformIdList
      this.takeawayList.forEach((cur) => {
        cur.selected = false;
        if (this.takeawayPlatformIdList.includes(cur.takeawayPlatformId)) cur.selected = true;
      });
      // 外卖平台数据列表-分页
      this.showTakeoutList = this.pagination(this.currentPage, this.prePageSize, this.takeawayList);
    },
    takeoutClick(item, index) {
      this.takeawayList.forEach((tt) => {
        if (item.takeawayPlatformId === tt.takeawayPlatformId) tt.selected = !tt.selected;
      });
      this.showTakeoutList = this.pagination(this.currentPage, this.prePageSize, this.takeawayList);
    },
    selectInput() {
      if (this.$refs.input) {
        selectInput(this.$refs.input);
      }
    },
    cancelLimit() {
      this.$emit('cancelLimit');
      this.close();
    },
    onSubmit() {
      if (!this.sitemsCount) {
        this.$message({
          message: this.$t('Biz.Pos.More.IPByTimeChildMsg1'),
          type: 'error',
        });
        return;
      }
      if (this.isTakeoutLimit
        && (!this.autoLowerQuantity || !this.autoUpperQuantity
        || this.autoUpperQuantity < this.autoLowerQuantity)) {
        this.$message({
          message: '下架、上架数量不能为0，并且上架大于下架数量！',
          type: 'error',
        });
        return;
      }
      if (!this.isTakeoutLimit) { // 开关关闭-清空数据
        this.takeawayPlatformIdList = [];
        this.autoLowerQuantity = '';
        this.autoUpperQuantity = '';
      } else {
        this.takeawayPlatformIdList = this.takeawayList.reduce((total, cur) => {
          if (cur.selected === true) total.push(cur.takeawayPlatformId);
          return total;
        }, []);
      }
      this.$emit('submitChildDialog', {
        restQuantity: Number(this.sitemsCount),
        limitQuantity: this.isAutoRestore ? Number(this.sitemsCountLimit) : Number(this.sitemsCountLimitCatch),
        type: this.isSelect,
        isAutoRestore: this.isAutoRestore,
        isTakeoutLimit: this.isTakeoutLimit,
        takeawayPlatformIdList: this.takeawayPlatformIdList, // id格式 ['1','2']
        autoLowerQuantity: this.autoLowerQuantity,
        autoUpperQuantity: this.autoUpperQuantity,
      });
      this.close();
    },
    changeLimit_Reset(val) {
      this.sitemsCountLimit = val;
    },
    changeLimit_sitems(val) {
      
      this.sitemsCount = val;
    },
    changeLimit_Lower(val) {
      this.autoLowerQuantity = val;
    },
    changeLimit_Upper(val) {
      this.autoUpperQuantity = val;
    },
    sellOutBtn(type) {
      this.isSelect = type;
      this.$emit('sellOutBtn', type);
    },
  },
  watch: {
    sitemsCount(value) {
      // 空字符串转换我零
      if (value === '') {
        this.sitemsCount = 0;
      }
      // 多小数点情况处理
      if (value.toString().indexOf('.') !== -1) {
        const arr = value.toString().split('.');
        if (arr.length > 2) {
          this.sitemsCount = parseFloat(value);
        }
        // 小数点后两位限制
        if (arr.length === 2 && arr[1].length > 2) {
          const result = value.toString().split('').slice(0, arr[0].length + 3).join('');
          this.sitemsCount = parseFloat(result);
        }
      }
    },
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .btns{
    width: 100px;
    height: 40px;
    background: #ffffff;
    border: 1px solid #b5b5b5;
    border-radius: 5px;
  }
  .active{
    background: #0babb9 !important;
    color: #fff;
  }
  .limitBox{
    overflow: hidden;
  }
  .itemsLimitDialog{
    height: 100%;
    background: @white;
    padding:13px 16px;
    overflow: hidden;
    // float: left;
    .keyboard-static {
      width: 186px !important;
    }
    .keyboard.keyboard-static.keyboard-bordered{
      .keyboard-control{
        display: none !important;
      }
    }
    .itemsLimit-selected{
      .name{
        line-height: 32px;
      }
      .borT{
        border-top: 1px dashed #ddd;
        margin-top: 10px;
        padding-top: 10px;
      }
      .describe{
        color: rgb(102,102,102);
        font-size: 12px;
        margin-top: 5px;
        line-height: 1.5;
        margin-bottom: 10px;
      }
      .typePanel{
        padding: 12px 10px;
        background: #f5f5f5;
        overflow:hidden;
        .type{
          height: 55px;
        }
      }
      .count{
        margin-bottom: 14px;
        display: flex;
        line-height: 34px;
      }
      .takeoutPlatform{
        display:flex;
        .ftLeft {
          width: 70px;
          line-height: 40px;
        }
        .list {
          display: flex;
          flex-wrap: wrap;
          width: calc(100% - 70px);
          height: 40px;
          overflow: hidden;
          > li {
            width: 100px;
            height: 40px;
            background: #fff;
            border-radius:4px;
            color:#333;
            font-size: 14px;
            text-align: center;
            line-height: 40px;
            border: 1px solid #b5b5b5;
            margin-right: 9px;
            &.selected {
              color: #0BABB9;
              border: 1px solid #0BABB9;
              background: #DCF9FB url(~@/common/images/pos/bill/recharge-checked.png) no-repeat right bottom;
            }
          }
        }
      }
    }

    .pos-pager{
      overflow: hidden;
      padding: 12px 16px 0 0;
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
    }
  }
  .pull-right{
    width: 220px;
    height: 370px;
    overflow: hidden;
    padding: 45px 20px;
    border-left: 1px;
  }
</style>
