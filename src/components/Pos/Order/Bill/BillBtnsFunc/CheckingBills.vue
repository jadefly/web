<template>
  <!-- $t-核对单据 -->
  <Dialog
    name="PosDialog.CheckingBills"
    :title="$t('Dict.Btn.CheckingBills')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    width="510px"
  >
    <div class="pos-dialog-content pos-checkbills-wrapper">
      <div class="checkbills-header">
        <ul>
          <li class="className no-wrap">{{checkBilltitle.pointCode}}</li>
          <!-- $t-开单时间：, 人数： ，席数：-->
          <li>{{$t('Dict.OpeningTime')}}{{checkBilltitle.openTime}}</li>
          <li>{{$t('Dict.NumberOfPeople01')}}{{checkBilltitle.peopleQty}}</li>
          <li>{{$t('Biz.Order.SeatsNum')}}{{checkBilltitle.tableQty}}</li>
        </ul>
      </div>
      <div class="checkbills-content" id="checkbillsPagerId" v-if="checkBills">
        <li v-for="(operationContent , index) in checkBills" :key="index">
         <tr class="changeprice-content-body">
          <td class="title">
            <span class="module-name">
              <strong :style="{color:fontColors[operationContent.color]}">
                {{ formatStr(operationContent.moduleName) }}
              </strong>
            </span>
            <span><strong>{{operationContent.creatorTime}}</strong></span>
          </td>
          <td class="timeline" :class="index+1 == checkBills.length ? 'last': ''">
            <i
              class="icon icon-circle warning"
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
                    src="../../../More/images/printer_color.png" alt="">
                  <img
                    class="w-20"
                    v-else-if="operationContent.unKitchenPrinting === true"
                    src="../../../More/images/printer.png" alt="">
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
              <li><span v-html="formatStr(operationContent.content)"></span></li>
            </ul>
          </td>
         </tr>
        </li>
      </div>
      <div class="checkbills-footer">
        <Pager
          pagerId="checkbillsPagerId"
          arrowDirection="up-down"
          scrollMode="simple"
          ref="pager"
          :showInfo="true"></Pager>
      </div>
    </div>
    <ModifyWaiter ref="modifyWaiter"></ModifyWaiter>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';
import ModifyWaiter from '@/components/Pos/More/ModifyWaiter';

export default {
  components: { Dialog, Pager, ModifyWaiter },
  mixins: [DialogMixin],
  props: {
    checkData: {},
  },
  data() {
    return {
      // 头部数据
      checkBilltitle: {},
      checkBills: [],
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
  computed: {
    ...mapGetters(['CHECK_BILL_AUTHOPERS']),
  },
  watch: {
    checkData(val) {
      if (!val) return;
      this.checkBilltitle.pointCode = val.pointName;
      this.checkBilltitle.openTime = val.openTime;
      this.checkBilltitle.peopleQty = val.peopleQty;
      this.checkBilltitle.tableQty = val.tableQty;
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
      if (this.$refs.pager) {
        this.$refs.pager.refresh();
      }
    },
  },
  methods: {
    onOpen() {
      if (this.CHECK_BILL_AUTHOPERS) {
        const authModule = this.CHECK_BILL_AUTHOPERS['190'].children;
        for (let i = 0; i < authModule.length; i += 1) {
          if (authModule[i].id === '1284') {
            this.haveAuth = authModule[i].checked;
            break;
          }
        }
      }
    },
    // 功能名称的替换, 含中文的操作,多语言后, 必须改了!!!
    formatStr(content) {
      if (content.indexOf('更换客位') !== -1) {
        return content.replace('更换客位', '换台');
      }
      return content;
    },
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

.pos-checkbills-wrapper {
  position: relative;
  .square(100%);

  > .checkbills-header {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
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
         &:nth-child(3) {
          padding-right: 20px;
        }
      }
      > li.className{
        font-weight: bold;
        color: #f24f64;
      }
      .no-wrap {
        max-width: 200px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
  }

  > .checkbills-content {
    width: 100%;
    max-height: 496px;
    padding-top: 48px;
    padding-bottom: 54px;
    background-color: white;
    padding-left: 16px;
    padding-right: 16px;
    overflow: scroll;
    > li {
      list-style: none;
    }
    > li:first-child {
      margin-top: 22px;
    }
    tr {
      position: relative;
      display: block;
      .square(100%);
      padding-bottom: 30px;
      margin: 0;

      > .title {
        position: absolute;
        top: 0;
        left: 0;
        width: 90px;
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
        left: 90px;
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
          width: 0px;
          height: 0px;
          content: '';
          display: block;
          position: absolute;
          border-left: solid 5px transparent;
          border-right: solid 5px transparent;
          border-top: solid 10px #9ad97b;
          bottom: 0px;
          left: 5px;
        }
      }

      > .content {
        .square(100%);
        padding-left: 120px;
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

      // &:first-child {
      //   margin-top: 22px;
      // }
    }
  }

  > .checkbills-footer {
    position: absolute;
    left: 0;
    bottom: 0;
    z-index: 1;
    .size(100%, 54px);
    text-align: right;
    padding-top: 10px;
    padding-right: 16px;
    border-top: 1px solid #ccc;
    background-color: white;
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
