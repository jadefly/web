<template>
  <div class="billed-check">
    <div class="checkbills-header">
      <ul>
        <li>{{checkBilltitle.pointCode}}</li>
        <li>{{$t('Dict.OpeningTime')}}{{checkBilltitle.openTime}}</li>
        <li>{{$t('Dict.NumberOfPeople01')}}{{checkBilltitle.peopleQty}}</li>
      </ul>
    </div>
    <div class="check-scroll" ref="scrollContent">
      <div class="checkbills-content">
        <tr class="changeprice-content-body"
        v-for="(operationContent , index) in checkBills" :key="index">
        <td class="title">
          <span class="module-name"><strong :style="{color:fontColors[operationContent.color]}">
            {{operationContent.moduleName}}</strong>
          </span>
          <span><strong>{{operationContent.creatorTime}}</strong></span>
        </td>
        <td class="timeline" :class="index+1 == checkBills.length ? 'last': ''">
          <i class="icon icon-circle warning"
          :class="[operationContent.color == 'green' ? 'greenColor' : 'orangeColor' ]">
          </i>
          <em v-show="index+1 != checkBills.length" class="pointerStyle"></em>
        </td>
        <td class="content warning" >
          <ul :class="bgkColors[operationContent.color]">
            <li>
              <strong>
                {{operationContent.creator}} {{operationContent.pos}} {{operationContent.ip}}
              </strong>
              <em v-if="operationContent.moduleId === 178">
                <img
                  class="w-20"
                  v-if="operationContent.unKitchenPrinting === false"
                  src="../../../../../Pos/More/images/printer_color.png" alt="">
                <img
                  class="w-20"
                  v-else-if="operationContent.unKitchenPrinting === true"
                  src="../../../../../Pos/More/images/printer.png" alt="">
                <img
                  v-if="operationContent.editable && haveAuth"
                  src="@/common/images/pos/singleItemTransfer/btn_edit_n.png"
                  class="edit"
                  @click="modifyWaiter(operationContent)" alt="编辑">
                <img
                  v-else
                  src="@/common/images/pos/singleItemTransfer/btn_edit.png"
                  class="edit no"
                  alt="不可编辑">
              </em>
            </li>
            <li><span v-html="operationContent.content"></span></li>
          </ul>
        </td>
        </tr>
      </div>
    </div>
    <div class="pos-pager pos-takeout-pager">
      <span class="page-info">
        {{$t('Dict.PageStyle.Sim1', {currentPage: currentPage,totalPage: pageCount})}}
      </span>
      <button href="javascript:;" @click="upPage" class="prev">
        <i class="el-icon-arrow-up"></i>
      </button>
      <button href="javasctipt:;" @click="downPage" class="next">
        <i class="el-icon-arrow-down"></i>
      </button>
    </div>
    <ModifyWaiter ref="modifyWaiter"></ModifyWaiter>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import PageMixin from '@/common/util/PaginationScrollMixin';
import ModifyWaiter from '@/components/Pos/More/ModifyWaiter';

export default {
  mixins: [PageMixin],
  props: {
    checkData: {},
  },
  components: {
    ModifyWaiter,
  },
  data() {
    return {
      checkBills: [],
      // 头部数据
      checkBilltitle: {},
      // 背景颜色对应的css class 名
      bgkColors: {
        orange: 'orangeBKg',
        green: 'greenBkg',
      },
      fontColors: {
        green: '#53B324',
        orange: '#EC945A',
      },
      haveAuth: true, // 是否有修改点菜员权限
    };
  },
  mounted() {
    let authModule = [];
    if (this.deskPageAuthModules.checkBillAuthOpers) {
      authModule = this.deskPageAuthModules.checkBillAuthOpers['190'].children;
      for (let i = 0; i < authModule.length; i += 1) {
        if (authModule[i].id === '1284') {
          this.haveAuth = authModule[i].checked;
          break;
        }
      }
    }
  },
  computed: {
    ...mapGetters(['deskPageAuthModules']),
  },
  watch: {
    checkData(val) {
      if (!val) return;
      this.checkBilltitle.pointCode = val.pointName;
      this.checkBilltitle.openTime = val.openTime;
      this.checkBilltitle.peopleQty = val.peopleQty;
      if (Array.isArray(val.bills)) {
        val.bills.forEach((item) => {
          const arr = item.content.split('<br/>');
          if (arr.length === 1) { // 'hello world'
            item.content = arr[0];
            return;
          }
          const str = arr[arr.length - 1];
          try {
            const obj = JSON.parse(str);
            if (Object.prototype.toString.call(obj) === '[object Object]') {
              arr.length -= 1;
              item.unKitchenPrinting = obj.unKitchenPrinting;
            } else {
              item.content = arr.join('<br/>');
            }
          } catch (e) {
            item.unKitchenPrinting = false;
          }
          item.content = arr.join('<br/>');
        });
      }
      this.checkBills = val.bills;
      this.$nextTick(() => {
        this.setPageInfo(this.$refs.scrollContent);
      });
    },
  },
  methods: {
    modifyWaiter(item) {
      const data = {
        bsId: this.bsId,
        waiter: item,
      };
      this.$refs.modifyWaiter.open(data, {
        submit: () => {
          this.$vemit('billedCheckRefresh');
        },
      });
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
  right: 12px;
  bottom: 12px;
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

.billed-check {
  height: 100%;
  position: relative;
  overflow: hidden;

  > .checkbills-header {
    .size(100%, 48px);
    line-height: 48px;
    background-color: #e4e4e4;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2) inset;

    > ul {
      padding-left: 16px;
      padding-right: 16px;
      .clearfix();
      > li {
        float: left;
        font-size: 15px;
        color: black;

        &:nth-child(2) {
          padding-left: 20px;
          padding-right: 20px;
        }
      }
    }
  }

  .check-scroll{
    position: absolute;
    top: 50px;
    bottom: 48px;
    overflow: auto;
    width: 100%;
  }

  .checkbills-content {
    width: 100%;
    padding-bottom: 16px;
    background-color: @white;
    padding-left: 16px;
    padding-right: 16px;

    > tr {
      position: relative;
      display: block;
      .square(100%);
      padding-bottom: 30px;

      > .title {
        position: absolute;
        top: 0;
        left: 0;
        width: 106px;
        font-size: 15px;
        .text-overflow();
        span {
          display: block;
          text-align: center;
          &:first-child {
            color: #0babb9;
            &.warning {
              color: #ffad23;
            }
            &.test {
              color:#0babb9
            }
          }
        }
        .module-name {
          white-space: initial;
        }
      }

      > .timeline {
        position: absolute;
        left: 112px;
        top: 0;
        height: 100%;
        overflow: hidden;
        &::before {
          position: absolute;
          top: 21px;
          left: 9px;
          content: '';
          display: inline-block;
          height: 100%;
          border-left: 2px solid #d1d1d1;
        }
        &.last::before {
          display: none;
        }
        > i {
          display: inline-block;
          .square(20px);
          text-align: center;
          line-height: 15px;
          border-radius: 50%;
          border: 3px solid #e4e4e4;
          background-color: #0babb9;
          color: white;
          &.warning {
            font-size: 12px;
            font-weight: bold;
          }
          &.orangeColor {
            background-color: #ffad23;
            border: 3px solid #ffe3b2;
          }
          &.greenColor {
            border: 3px solid #DDF4CA;
            background-color: rgb(83, 179, 36);
          }
        }
        >.pointerStyle {
          width: 0;
          height: 0;
          content: '';
          display: block;
          position: absolute;
          border-left: solid 5px transparent;
          border-right: solid 5px transparent;
          border-top: solid 10px #9ad97b;
          bottom: 0;
          left: 5px;
        }
      }

      > .content {
        .square(100%);
        padding-left: 150px;
        font-size: 13px;

        > ul {
          position: relative;
          .size(360px, 100%);
          background-color: #e4e4e4;
          padding: 6px 8px;
          border-radius: 6px;

          &.greenBkg {
            background-color:#DDF4CA;
          }
          &.orangeBKg {
            background-color:#FFE3C5;
          }
          &::before {
            content: '';
            .square(0);
            position: absolute;
            top: 8px;
            left: -10px;
            border-top: 5px solid transparent;
            border-right: 11px solid #e4e4e4;
            border-bottom: 5px solid transparent;
          }
          &.greenBkg::before {
            border-right: 11px solid #DDF4CA;
          }
          &.orangeBKg::before {
            border-right: 11px solid #FFE3C5;
          }

        }
      }

      &:first-child {
        margin-top: 22px;
      }
    }
  }

}

img.edit {
  float: right;
  width: 20px;
}
img.no {
  cursor: not-allowed;
}
</style>
