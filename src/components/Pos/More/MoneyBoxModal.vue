<template>
  <Dialog
    name="PosDialog.MoneyBoxModal"
    :title="$t('Dict.OpenCashBox')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :showSubmit="true"
    :hotkeys="hotKeySet"
    :append-to-body="true"
    width="465px"
  >
  <div class="reason-area">
    <div class="reason-item" v-for="reason in showReasonList" :key="reason.id">
      <button type="button" class="btn"
        :class="{'btn-primary':getReasonIsActive(reason),'btn-default': !getReasonIsActive(reason)}"
        @click="chooseReason(reason)"
      >
        {{reason.name}}
      </button>
    </div>
    <div class="no-item" v-if="currentReasonList.length === 0">
      <p>{{$t('Biz.Pos.More.MoneyBoxModalP1')}}</p>
      <p>{{$t('Biz.Pos.More.IQModalP2')}}</p>
    </div>
  </div>
  <div class="reason-search">
    <el-input
      v-judge
      class="search-input"
      :placeholder="$t('Dict.QuickSearch')"
      prefix-icon="el-icon-search"
      v-switch-keyboard:bottom="keybordParams"
      v-model="keyword">
    </el-input>
    <div class="pos-pager pos-takeout-pager">
      <span class="page-info">{{
        $t('Dict.PageStyle.Text1', {
          length: currentReasonList.length,
          currentPage,
          totalPage: pageCount(currentReasonList),
        })
      }}</span>
      <button
        href="javascript:;"
        class="prev"
        @click="upPage"><i class="el-icon-arrow-up"></i></button>
      <button
        href="javasctipt:;"
        class="next"
        @click="downPage(currentReasonList)"><i class="el-icon-arrow-down"></i></button>
    </div>
  </div>
  </Dialog>
</template>

<script>
// import _ from 'lodash';
import { MessageBox } from 'element-ui';
import ajax from '@/common/js/ajax';
import quickSearch from '@/common/js/quicksearch';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import PageMixin from '@/common/util/PaginationMixin';

export default {
  components: { Dialog },
  mixins: [DialogMixin, PageMixin],
  data() {
    return {
      // 搜索关键字
      keyword: '',
      // 全部开钱箱原因
      reasonList: [],
      // 选中的原因
      selectedReason: null,
      // 每页个数
      prePageSize: 8,
    };
  },
  computed: {
    // 键盘参数
    keybordParams() {
      if (!this.$store.state.pos || !this.$store.state.pos.posBaseInfo) {
        return {};
      }
      return {
        letterType: this.$store.state.pos.posBaseInfo.isEnableQWEKeyboard ? 'full' : 'nine',
      };
    },
    // 当前服务员列表,经过筛选后的
    currentReasonList() {
      const keywordList = quickSearch(this.keyword);
      return this.reasonList.filter((item) => {
        if (this.keyword === '') return true;
        if (keywordList.find(keyword => item.pinyin.indexOf(keyword.toUpperCase()) >= 0)) {
          return true;
        }
        return false;
      });
    },
    // 最终显示的服务员列表
    showReasonList() {
      return this.pagination(this.currentPage, this.prePageSize, this.currentReasonList);
    },
    hotKeySet() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
      };
    },
  },
  methods: {
    onOpen() {
      this.selectedReason = null;
      ajax('canyin.pos.cashbox.cashboxreasonview')
        .then((data) => {
          this.reasonList = data.reasonsJson;
        })
        .catch((errorCode, msg) => {
          this.close();
          MessageBox.alert(msg, this.$t('Dict.WrongInfo'));
        });
      this.$vonce('authCode', (code) => {
        this.onSubmit(code);
      });
    },
    // 点击提交
    onSubmit(authData = {}) {
      if (!this.$store.state.pos.device.enableCashbox) {
        this.$message({
          message: this.$t('Biz.Pos.More.MoneyBoxModalMsg2'),
          type: 'warning',
        });
        return;
      }
      if (!this.selectedReason) {
        this.$message({
          message: this.$t('Biz.Pos.More.MoneyBoxModalMsg3'),
          type: 'warning',
        });
        return;
      }
      ajax('canyin.pos.cashbox.opencashbox', {
        needToken: true,
        contentType: 'paramsEncoded',
        data: {
          rzOpencashId: this.selectedReason.id,
          ...authData,
        },
      })
        .then(() => {
          this.$devices.Cashbox.open();
          this.close();
        });
    },
    // 选中服务员
    chooseReason(reason) {
      this.selectedReason = reason;
    },
    // 得到原因是否是选中的原因
    getReasonIsActive(reason) {
      return this.selectedReason && this.selectedReason.id === reason.id;
    },
  },
  watch: {
    // 筛选条件变化重置页码
    keyword() {
      this.currentPage = 1;
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

// 箭头按钮
.pos-takeout-pager {
    position: absolute;
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

// 选择原因区域
.reason-area{
  height: 185px;
  padding: 14px 6px;
  .reason-item{
    padding: 6px;
    display: inline-block;
    width: 25%;
  }
  button.btn{
    padding: 16px;
    width: 100%;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
  }
}

// 原因搜索区域
.reason-search{
  position: relative;
  background-color: @white;
  padding: 8px 14px;
  .search-input{
    width: 208px;
  }
  .pos-takeout-pager {
    right: 12px;
    top: 12px;
  }
  .page-info{
    font-size: 12px;
  }
}

.no-item{
  text-align: center;
  font-size: 14px;
  color: #999999;
  padding-top: 20px;
}

.lang-enUS {
  .reason-search .search-input {
    width: 165px;
  }
}
</style>
