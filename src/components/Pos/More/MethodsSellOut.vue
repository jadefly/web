<template>
  <Dialog
    name="PosDialog.MethodsSellOut"
    :title="$t('Dict.Btn.MethodsSellout')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :showSubmit="true"
    :fullscreen="true"
    :hotkeys="hotKeySet"
    width="100%"
    submitId="methodsSellOutSubmit"
  >
    <div class="limitQuantity">
      <div style="position: absolute; height: 100%;z-index:100">
        <div class="limitItem">
          <!-- 做法 -->
          <div class="ItemSellOut-msg">
            <ul class="df">
              <li class="ItemSellOut-name borR w214">{{$t('Dict.Practice')}}</li>
              <li class="ItemSellOut-type borR">{{$t('Biz.Pos.More.ISellOutLi2')}}</li>
              <li class="ItemSellOut-delete" id="deleteSelloutItem" v-autotest>
                {{$t('Dict.Btn.DeleteItem')}}
              </li>
            </ul>
          </div>
          <div class="ItemSellOut-list">
            <ul class="ItemSellOut-list-ul" id="MethodsSellOutUl" v-autotest>
              <li
                class="ItemSellOut-list-ul-li df"
                v-for="(items, key) in methodsSelloutData"
                :key="key"
                :id="'selectSellOut'+items.id+items.code"
              >
                <div class="ItemSellOut-li-id fw">{{ key + 1 }}</div>
                <div class="ItemSellOut-li-name fw w195 textEllipsis">
                  {{ items.methodName }}
                </div>
                <div class="ItemSellOut-li-type">{{
                  items.type == 0
                    ? $t('Biz.Pos.More.ISellOutChildBtn3')
                    : items.type==1
                      ? $t('Biz.Pos.ShiftNow')
                      : $t('Biz.Pos.More.ISellOutChildBtn1')
                }}</div>
                <div class="ItemSellOut-li-delete" @click="sellOutDelete(items)"></div>
              </li>
            </ul>
          </div>
          <div class="ItemSellOut-list-pager">
            <span>{{ $t('Dict.PageStyle.Sim3', [methodsSelloutData.length]) }}，</span>
            <Pager
              pagerId="MethodsSellOutUl"
              itemTag="li"
              :showInfo = "true"
              arrowDirection="up-down"
              ref="selectSellOutPager"
            >
            </Pager>
          </div>
        </div>
      </div>
      <div class="module-bill-ItemSellOut">
        <LimitQuantityKind
          ref="limitQuantityKind"
          ulId="MethodsSellOut"
          :itemsBigClass="itemsMethodsClass"
          :itemsSmallClass="itemsKindsClass"
          @bigClassLiOut="bigClassLiOut"
          :allBigclassName="$t('Biz.Pos.More.AllMethods')"
          :allSubclassName="$t('Biz.Pos.More.AllKinds')"
        ></LimitQuantityKind>
        <div class="ItemSellOut-all-items-box">
          <div class="all-items">
            <Paging
              :data="checkMethodsData"
              :itemWidth="160"
              :itemHeight="100"
              :autoActive="false"
              :active.sync="activeMethod"
              :activeFindRules="['code', 'id']"
              class="all-sellout-items"
              ref="methodSellOutList"
              id="methodSellOutList">
              <div slot-scope="props"
                :id="'methodsSellOut'+props.item.id+props.item.code"
                :disabled="props.item.isSellout?true : false"
                class="item"
                :class="{
                  'itemsSellOutbox': props.item.isSellout,
                  'active': activeMethod
                    && props.item.id === activeMethod.id
                    && props.item.code === activeMethod.code
                }"
                @click="methodsSellOut(props.item, props.index)" >
                <div>
                  <span class="itemId">{{props.item.code}}</span>
                  <span
                    class="methodsSellOut"
                    :id="'span'+props.item.id+props.item.code"
                    v-if="props.item.isSellout"
                  >{{$t('Dict.Sellout')}}</span>
                </div>
                <div class="name">
                  <span v-show="props.item.itemSizeName && props.item.itemSizeName != '-'">
                    ({{ props.item.itemSizeName }})
                  </span>{{props.item.name}}
                </div>
                <div class="itemPrice text-right">
                  <span v-show="props.item.fee">+{{props.item.fee}}</span>
                </div>
              </div>
            </Paging>
          </div>
        </div>
        <div class="ItemSellOut-btns-footer">
          <div class="borT">
            <Search
              @search="onSearch"
              ref="searchTextSellOut"
              idName="methods"
              :resultLength="checkMethodsData.length"
            ></Search>
            <div class="sellout-habit-switch">
              <el-switch
                v-model="selloutHabit"
                active-color="#0babb9"
                inactive-color="#666"
                :active-value="1"
                :inactive-value="0"
                @change="updateSelloutHabit">
              </el-switch>
              <span>{{$t('Biz.Pos.More.ISellOutSpan1')}}</span>
            </div>
            <span> {{$t('Dict.Altogether')}}{{checkMethodsData.length}}{{$t('Dict.Strip')}}，</span>
            <PagingBtn
              ref="methodsSelloutPagingBtn"
              :showInfo="true">
            </PagingBtn>
          </div>
        </div>
      </div>
    </div>
    <ItemsSellOutChildDialog
      ref="MethodssSellOutChildDialog"
      @sellOutBtn="sellOutBtn"
    ></ItemsSellOutChildDialog>
  </Dialog>
</template>

<script>
import { find, cloneDeep, forEach } from 'lodash';
import { mapState } from 'vuex';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Paging from '@/components/Pos/Common/Paging';
import Pager from '@/components/Pos/Common/Pager';
import PagingBtn from '@/components/Pos/Common/PagingBtn';
import LimitQuantityKind from './LimitQuantity/LimitQuantityKind';
import Search from './LimitQuantity/LimitSearch';
import ItemsSellOutChildDialog from './ItemsSellOutChildDialog';
import quickSearch from '@/common/js/quicksearch';

export default {
  components: {
    Dialog, LimitQuantityKind, Paging, Search, Pager, PagingBtn, ItemsSellOutChildDialog,
  },
  mixins: [DialogMixin],
  props: {
    methodSellOutData: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      methodsSelloutData: [], // 已估清做法列表
      itemsMethodsClass: [], // 所有做法
      itemsKindsClass: [], // 所有类别
      methodsData: [], // 做法列表
      activeMethod: null, // 当前选中的做法
      searchText: '', // 快速查找字段
      selloutHabit: 0, // 切换是否清空助记符
      selectedKindClass: '', // 选中的做法类别
      isAllKinds: true, // 是否选中全部类别
      methodSellOutMsg: {}, // 暂时存储小弹窗确认/关闭前的估清信息
      addMethods: [], // 新增的估清方法
      deleteMethods: [], // 解估的制作方法合集
    };
  },
  computed: {
    ...mapState({
      itemMethodSellout: state => state.pos.itemMethodSellout,
    }),
    quickSearchText() {
      return quickSearch(`${this.searchText}`.toLowerCase());
    },
    // 做法快速查找
    checkMethodsData() {
      let filterList = [];
      if (this.methodsData) {
        // 输入英文匹配 pinyin, 输入数字匹配code
        const keyFilters = this.quickSearchText;
        filterList = this.methodsData.filter((list) => {
          let resultItem;
          for (let i = 0; i < keyFilters.length; i += 1) {
            const key = keyFilters[i];
            if (
              String(list.code).toLowerCase().indexOf(key) !== -1
              || list.pinyin.toLowerCase().indexOf(key) !== -1
              || list.name.toLowerCase().indexOf(key) !== -1) {
              resultItem = true;
            }
          }
          return (!keyFilters.length || resultItem)
           && (this.isAllKinds || list.parentId === this.selectedKindClass);
        });
        // 按照eslint规则，此处只能这么写，否则报错╮(╯▽╰)╭ 183-2051 by L.R
        if (filterList.length > 0) [this.activeMethod] = filterList;
        return filterList;
      }
      return [];
    },
    hotKeySet() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
        '↑': () => {
          this.$refs.methodSellOutList.select('↑');
        },
        '↓': () => {
          this.$refs.methodSellOutList.select('↓');
        },
        '←': () => {
          this.$refs.methodSellOutList.select('←');
        },
        '→': () => {
          this.$refs.methodSellOutList.select('→');
        },
        Enter: () => {
          this.methodsSellOut(this.activeMethod);
        },
        BackSpace: () => {
          this.$refs.searchTextSellOut.delWordInBlur();
        },
        ...this.setKeySearchHotKey(),
      };
    },
  },
  methods: {
    // 做法估清窗口初始化
    onOpen() {
      this.itemsMethodsClass = this.methodSellOutData.methodAttrs.map((met) => {
        const obj = {};
        obj.id = met.attrId;
        obj.name = met.attrName;
        return obj;
      });
      this.itemsKindsClass = this.methodSellOutData.methodTypes;
      this.methodsData = this.methodSellOutData.methods;
      this.methodsSelloutData = cloneDeep(this.methodSellOutData.selloutMethods);
      this.selloutHabit = this.methodSellOutData.selloutHabit.value;
      // 重置 新增/解估 做法列表
      this.addMethods = [];
      this.deleteMethods = [];
      // 重置导航栏
      setTimeout(() => {
        this.$refs.limitQuantityKind.zero();
      }, 500);
      // 手动添加父级id，保证类别与做法关联
      this.itemsKindsClass.map((item) => {
        const obj = item;
        obj.pid = this.itemsMethodsClass[0].id;
        return obj;
      });
      // 授权号
      this.$vonce('authCode', (code) => {
        this.onSubmit(code);
      });
      // 初始化做法列表分页
      this.$nextTick(() => {
        this.$refs.methodsSelloutPagingBtn.bind(this.$refs.methodSellOutList); // 右侧品项分页
        this.$refs.methodSellOutList.refresh();
      });
    },
    // 选择导航（做法/类别）
    bigClassLiOut(result) {
      this.isAllKinds = result.isAllSmall;
      this.selectedKindClass = result.selectedSmallClass;
    },
    // 快速查找
    onSearch(text) {
      this.searchText = text;
    },
    // 切换是否清空注记符开关状态
    updateSelloutHabit() {
      ajax('canyin.sys.syshabit.updatehabit', {
        contentType: 'json',
        data: {
          type: 10, // 1是品项估清开关，10是做法估清开关
          value: this.selloutHabit,
        },
      }).then(() => {});
    },
    // 获取搜索框用的快捷键
    setKeySearchHotKey() {
      const searchKeys = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890'.split('');
      const keysObj = {};
      searchKeys.forEach((item) => {
        keysObj[item] = () => {
          this.inputKey(item);
        };
      });
      return keysObj;
    },
    // 选择做法进行估清
    methodsSellOut(method) {
      if (method.isSellout) {
        this.$confirm(this.$t('Biz.Pos.More.ISellOutMsg4'), this.$t('Dict.Tips')).then(() => {
          // 在已估清的做法列表中查找当前选中的做法
          const finded = find(this.methodsSelloutData, {
            methodId: method.id,
          });
          if (finded) {
            this.sellOutDelete(finded);
          }
        }).catch(() => {});
      } else {
        this.$refs.MethodssSellOutChildDialog.open();
        this.methodSellOutMsg = method;
      }
    },
    // 选择估清时长的子弹窗中按钮的点击事件 ，只有没估清，或重新估清才会触发弹窗中按钮的点击事件
    sellOutBtn(type) {
      // 当关闭‘不清空注记符’开关时，清空搜索框
      if (!this.selloutHabit) {
        this.searchText = '';
        this.$refs.searchTextSellOut.searchTextClean();
      }
      // 新增估清做法,用于视图显示
      this.methodsSelloutData.push({
        methodId: this.methodSellOutMsg.id,
        methodName: this.methodSellOutMsg.name,
        methodTypeId: this.methodSellOutMsg.parentId,
        addMethods: true,
        type, // 估清类型；0不指定,1当前市别,2当天
      });
      // 新增的做法估清数据，用于确认时保存使用
      this.addMethods.push({
        methodId: this.methodSellOutMsg.id,
        methodTypeId: this.methodSellOutMsg.parentId,
        type,
      });
      // 循环匹配搜索项 点击的对象, 设置相应右侧做法列表相应做法进行估清
      this.methodsData.filter((val) => {
        if (val.id === this.methodSellOutMsg.id) {
          this.$set(val, 'isSellout', true);
          this.$set(val, 'addMethods', true);
        }
        return val;
      });
    },
    // 删除已估清的做法
    sellOutDelete(method) {
      // 清除右侧做法列表的估清样式
      forEach(this.methodsData, (val, i) => {
        if (this.methodsData[i].id === method.methodId) {
          this.methodsData[i].isSellout = false;
        }
      });
      // 判断是否在已估清 或 新估清的数据里
      let index = -1;
      forEach(this.methodsSelloutData, (val, i) => {
        if (this.methodsSelloutData[i].methodId === method.methodId) {
          index = i;
        }
      });
      if (index !== -1) {
        this.methodsSelloutData.splice(index, 1);
        if (method.addMethods) { // 如果是新增的估清,在新增的估清做法数组中清除
          forEach(this.addMethods, (val, i) => {
            if (this.addMethods[i].methodId === method.methodId) {
              this.addMethods.splice(i, 1);
            }
          });
        } else { // 添加到解估的列表中
          this.deleteMethods.push({
            methodId: method.methodId,
            methodTypeId: method.methodTypeId,
          });
        }
      }
    },
    // 确定
    onSubmit(authData = {}) {
      ajax('canyin.pos.methodsellout.methodsellout', {
        contentType: 'paramsEncoded',
        data: {
          addMethods: this.addMethods,
          deleteMethods: this.deleteMethods,
          ...authData,
          maxModifyTime: this.methodSellOutData.maxModifyTime,
        },
      }).then((data) => {
        if (data.result === -2) {
          this.$vemit('posAuthCheck', {
            message: data.msg,
          });
        } else {
          this.close();
          if (data.success) {
            this.$message({
              message: data.msg,
              type: 'success',
            });
          } else {
            this.$message({
              customClass: 'errorMsgCustomClass',
              message: data.msg,
              type: 'error',
            });
          }
        }
      });
    },
  },
  watch: {
    methodsSelloutData() {
      setTimeout(() => {
        this.$refs.selectSellOutPager.refresh();
      }, 500);
    },
    // websocket 推送
    itemMethodSellout(newVal) {
      this.methodsData.forEach((item) => {
        newVal.forEach((newItem) => {
          // 根据推送数据设置做法估清状态
          if (item.id === newItem.methodId) {
            // 将未估清的做法添加到左侧显示栏
            if (!item.isSellout) {
              this.methodsSelloutData.push({
                methodId: item.id,
                methodName: item.name,
                methodTypeId: item.parentId,
                type: newItem.type,
              });
            }
            this.$set(item, 'isSellout', true);
          }
        });
      });
    },
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";

  .textEllipsis{
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
  }
  .itemsSellOutbox{
    background: #f5f5f5;
    color: #ddd;
  }
  .bc0{
    background: rgba(0, 0, 0, 0.5);
  }
  .disNone{
    display: none !important;
  }
  .pl10{
    padding-left: 10px;
  }
  .limitQuantity{
    width: 100%;
    height: 100%;
    background: @body-bg;
    position: relative;
  }
  .borR{
    border-right: 1px solid #ddd;
  }
  .df{
    display: flex;
  }
  .fw{
    font-weight: bold;
  }
  //
  .limitItem{
    width: 410px;
    height: 100%;
    position: relative;
    border-right: 1px solid #999;
    box-shadow: darkgrey 9px 2px 13px -4px;
  }
  .ItemSellOut-msg{
    width: 100%;
    height: 50px;
    padding:15px;
    position: absolute;
    top: 0;
    left: 0;
    border-bottom:1px solid #b5b5b5;
  }
  .ItemSellOut-name{
    width: 140px;
    padding-left: 25px;
  }
  .w214{
    width: 214px !important;
  }
  .ItemSellOut-type, .ItemSellOut-li-type{
    width: 110px;
    padding: 0 5px;
  }
  .ItemSellOut-count, .ItemSellOut-li-count{
    width: 74px;
  }
  .ItemSellOut-delete, .ItemSellOut-li-delete{
    width: 50px;
    text-align: center;
  }
  .ItemSellOut-li-delete{
    cursor: pointer;
    background: url('./images/itemsDelete.png') no-repeat;
    background-position: center center;
  }
  .ItemSellOut-li-name{
    width: 115px;
  }
  .w195{
    width: 195px !important;
  }
  .ItemSellOut-li-id{
    width: 25px;
  }
  // 已选估清菜品列表
  .ItemSellOut-list{
    // border-top:1px solid #9d9d9d;
    // border-bottom:1px solid #9d9d9d;
    height: 100%;
    padding-top: 50px;
    padding-bottom: 55px;
    .ItemSellOut-list-ul{
      margin: 0 8px;
      height: 100%;
      overflow-x: hidden;
      overflow-y: scroll !important;
      .ItemSellOut-list-ul-li{
        border-bottom: 1px solid #b5b5b5;
        height: 45px;
        line-height: 45px;
      }
    }
  }
  .ItemSellOut-list-pager{
    position: absolute;
    bottom: 0;
    width: 410px;
    padding: 0 15px;
    border-top: 1px solid #b5b5b5;
    height: 55px;
    padding-top: 10px;
    padding-left: 165px;
    display: flex;
    justify-content: center;
    >span{
      display: inline-block;
      padding-top: 9.2px;
      color: #999;
      font-size: 12px;
    }
    .pos-pager{
      text-align: right;
    }
  }
  //
  .limitTip, .methodsSellOut{
    display: inline-block;
    font-size: 13px;
    padding: 0 5px;
    border-radius: 30px;
    color: @white;
  }
  .limitTip{ //限量标记
    background: @pos-flag-promotion-color;
  }
  .methodsSellOut{ //估清标记
    background: #cccccc;
  }
  .module-bill-ItemSellOut{
    height: 100%;
    margin-left: 410px;
    position: relative;
    .ItemSellOut-all-items-box{
      padding-top: 100px;
      padding-bottom: 55px;
      height: 100%;
      .all-items{
        height: 100%;
        padding:15px;
        border-top: 1px solid #b5b5b5;
        .all-sellout-items{
          flex-wrap: wrap;
          height: 100%;
          overflow: hidden;
          .active {
            background-color: rgba(0, 0, 0, .1);
          }
          .item {
            float: left;
            width: 150px;
            height: 90px;
            // margin-right: 1.5%;
            margin-right: 10px;
            margin-bottom: 10px;
            border: 1px solid #b5b5b5;
            padding:5px;
            position: relative;
            cursor: pointer;
            .itemId{
              color: #ddd;
            }
            .name{
              height: 36px;
              line-height: 1.3;
              overflow : hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }
            .itemPrice{
              position: absolute;
              bottom: 0;
              right: 5px;
              font-size: 12px;
            }
          }
          // li:nth-child(5n+5) {
          //   margin-right: 0;
          // }
        }
      }
    }
  }
  // 底部搜索+翻页组件
  .ItemSellOut-btns-footer {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 55px;
    background-color: white;
    .sellout-habit-switch {
      float: left;
      margin-top: 18px;
      margin-left: 24px;
    }
    .borT{
      border-top: 1px solid #b5b5b5;
      margin:0 15px;
      height: 100%;
      >span{
        display: inline-block;
        position: absolute;
        top: 21px;
        right: 170px;
        font-size: 12px;
        color: #999;
      }
    }
    .pos-pager{
      position: absolute;
      top: 0;
      right: 0;
      margin-top: 10px;
      margin-right: 18px;
    }
  }

  .mlr10{
    margin: 0 10px;
  }

.lang-enUS{
  .ItemSellOut-msg{
    font-size: 12px;
    .ItemSellOut-type{
      text-align: center;
      padding: 0;
    }
  }
}
</style>
