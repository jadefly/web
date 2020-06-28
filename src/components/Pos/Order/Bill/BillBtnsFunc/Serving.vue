<template>
  <Dialog
    name="PosDialog.Serving"
    :title="$t('Dict.Btn.Serving')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    @submit="onSubmit"
    :showSubmit="true"
    width="720px"
    height="600px"
    :hotkeys="hotKeySet"
  >
    <template slot="other-button">
      <button  type="button" class="btn btn-default" @click="callAll">整桌起菜(F1)</button>
    </template>
    <div class="warp">
      <div class="besideTab">
        <p class="tabsGroup-item"
          v-for="(item, index) in tabsGroup"
          :class="{activeTabs: tabsGroupActive === index}"
          @click="toggleTabs(index)"
          :key="index">{{ item }}</p>
      </div>
      <div class="serving">
        <div class="serving-info">
          <strong>
            <span>{{servingData.pointName}}</span>
          </strong>
          <span class="openbill-time">{{ $t('Dict.OpeningTime') }}{{servingData.openTime}}</span>
          <span class="number-guest">{{ $t('Biz.Order.DinerPersonNumLabel') }}{{servingData.peopleQty}}</span>
        </div>
        <div class="serving-content">
          <div class="serving-content-title">
            <span class="head-item-checkedbox"></span>
            <!-- 序号 -->
            <span class="head-item-order">{{ $t('Dict.SerialNumber') }}</span>
            <span class="head-item-name" >{{ tabsGroupActive === 0 ? $t('Dict.Item') : $t('Dict.SmallClass') }}</span>
            <span class="head-item-number">{{ $t('Dict.Amount') }}</span>
            <span class="head-item-addbill-time" v-show="tabsGroupActive === 0">{{ $t('Biz.Order.HastenTime') }}</span>
          </div>
          <!-- 按品项 容器 -->
          <ul
            id="servingItemListId"
            class="list-content"
            v-show="tabsGroupActive === 0" >
            <li class="serving-content-body"
              @click="hanleItemCheckChange(item)"
              v-for="(item, index) in servingItems"
              :key="index" >
              <span class="item-checkedbox">
                <el-checkbox
                  v-model="item.isChecked"
                  @change="hanleItemCheckChange(item)"></el-checkbox>
              </span>
              <span class="item-order">{{ index + 1 }}</span>
              <span class="item-name"
                >{{ item.mergeScId
                    ? '[拼]' : ''
                  }}<em
                      v-show="item.itemSizeName"
                      >({{ item.itemSizeName }})</em>{{ item.itemName }}</span>
              <span class="item-number">{{ item.lastQty }}</span>
              <span class="item-addbill-time">{{ item.fromAddTime }}</span>
            </li>
          </ul>
          <!-- 按类别 容器 -->
          <ul
            id="servingClassListId"
            class="list-content"
            v-show="tabsGroupActive !== 0" >
            <li class="serving-content-body"
              @click="hanleItemCheckChange(item)"
              v-for="(item, index) in servingItems"
              :key="index" >
               <span class="item-checkedbox">
                <el-checkbox
                  v-model="item.isChecked"
                  @change="hanleItemCheckChange(item)"></el-checkbox>
                </span>
                <span class="item-order">{{ index + 1 }}</span>
                <span class="item-name">{{ item.smallClassName }}</span>
                <span class="item-number">{{ item.count }}</span>
              </li>
          </ul>
          <div class="serving-footer">
            <div class="select-all">
              <el-checkbox
                v-model="checkAll"
                @change="handleCheckAllChange"
                v-autotest
                >{{ $t('Dict.SelectAll') }}</el-checkbox>
            </div>
            <div class="pagerbtn">
              <Pager
                :pagerId="servingListId"
                itemTag="li"
                ref="servingListPager"
                :showInfo = "true"
                arrowDirection="up-down"></Pager>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import Pager from '@/components/Pos/Common/Pager';
import ajax from '@/common/js/ajax';

export default {
  components: { Dialog, Pager },
  mixins: [DialogMixin],
  data() {
    return {
      // "PressItem": "按品项", "PressCategory": "按类别"
      tabsGroup: [this.$t('Biz.Order.PressItem'), this.$t('Biz.Order.PressCategory')],
      tabsGroupActive: 0,
      // 分页组件绑定列表id, 在切换tabs列表后, 需要重新绑定并更改绑定id值
      servingListId: 'servingItemListId',
      // bsId:"11000030000000136"
      // fromAddTime:"12"
      // itemCode: "002008"
      // itemId:"11000000000000078"
      // itemName:"烧鱼头"
      // itemSizeId:"-1"
      // itemType:1
      // itemUnitName:"1份"
      // lastQty:1
      // pkgFlg:0
      // scId:"11000030000000501"
      // serveWayId:1
      // serveWayName:"叫起"

      // 起菜的所有的信息
      servingData: {},
      // 全选 开关
      checkAll: false,
      // 数据列表(容器),'按品相/按类别'数据内容填充容器,实现切换
      servingItems: [],
      // 按品项 数据列表
      servingItemList: [],
      // 按类别 数据列表
      servingClassList: [],
    };
  },
  computed: {
    hotKeySet() {
      return {
        PgDn: () => {
          this.onSubmit();
        },
        F1: () => {
          this.callAll();
        },
      };
    },
  },
  methods: {
    onClose() {
      // 起菜的所有的信息
      this.servingData = {};
      // 全选 开关
      this.checkAll = false;
      // 数据列表(容器),'按品相/按类别'数据内容填充容器,实现切换
      this.servingItems = [];
      // 按品项 数据列表
      this.servingItemList = [];
      // 按类别 数据列表
      this.servingClassList = [];
    },
    onOpen() {
      // 列表数据生成(添加选中属性)
      this.servingItemList = JSON.parse(JSON.stringify(this.resData.callUpList.map((item) => {
        const obj = item;
        obj.isChecked = false;
        return obj;
      })));
      // 类别 列表数据生成(添加选中属性)
      this.servingClassList = JSON.parse(JSON.stringify(this.resData.callUpClassList.map((item) => {
        const obj = item;
        obj.isChecked = false;
        return obj;
      })));
      // 初始化下(重置)数据
      this.tabsGroupActive = 0;
      this.servingListId = 'servingItemListId';
      this.checkAll = false; // 全选
      this.servingData = this.resData; // 起菜的所有的信息
      // 首屏数据填充
      this.servingItems = this.servingItemList;
      // 延迟执行分页重新绑定
      setTimeout(() => {
        this.$refs.servingListPager.refresh();
      }, 0);
    },
    toggleTabs(index) {
      // 激活tabs
      this.tabsGroupActive = index;
      // 当激活 '品项'时,
      if (index === 0) {
        // 改变分页的绑定id(需要翻页的不同的list)
        this.servingListId = 'servingItemListId';
        // 填入需显示的数据,并重置选中属性
        this.servingItems = this.servingItemList;
      } else {
      // 当激活 '类别'时,
        // 改变分页的绑定id(需要翻页的不同的list)
        this.servingListId = 'servingClassListId';
        // 填入需显示的数据,并重置选中属性
        this.servingItems = this.servingClassList;
      }
      // 切换时, 检测当前列表 选中状态
      this.filterItemChecked();
      // 重置分页
      setTimeout(() => {
        this.$refs.servingListPager.refresh();
      }, 200);
    },
    // 监听全选事件 并执行全部选择和全不选择的事件
    handleCheckAllChange(value) {
      this.servingItems.forEach((item) => {
        this.$set(item, 'isChecked', value);
      });
    },
    // 对每个item 监听是否选中,并做下全选的样式处理
    hanleItemCheckChange(value) {
      const data = value;
      if (typeof data === 'object') {
        data.isChecked = !data.isChecked;
        if (data.isChecked) {
          this.filterItemChecked();
        } else {
          this.checkAll = false;
        }
      } else {
        // 如果变成false 可定不是 全选的样式不被选中
        if (!data) {
          this.checkAll = false;
        }
        // 为true 有可能是最后一个选中的 全选按钮样式 变成全选模式
        if (data) {
          this.filterItemChecked();
        }
      }
    },
    filterItemChecked() {
      // 对数据进行过滤处理 找到选中的items
      const itemCheckeds = this.servingItems.filter(item => item.isChecked);
      // 如果找到的items 的长度和this.servingItems的数据长度一样的话 证明是全选
      if (itemCheckeds.length === this.servingItems.length) {
        this.checkAll = true;
      } else {
        this.checkAll = false;
      }
    },

    // 确认按钮提交方法
    onSubmit(isAllCall = false) {
      const itemCheckeds = [];
      let requestParams = null;
      let tmpArr = null;
      if (isAllCall) { // 整桌起菜
        requestParams = {
          bsId: this.resData.bsId,
          pointId: this.resData.pointId,
          isPointCallUp: isAllCall,
        };
      } else {
        if (this.tabsGroupActive === 0) {
          // 遍历当前菜品明细，将选中的菜品组装到数组中，稍后提交
          this.servingItems.forEach((item) => {
            if (item.isChecked) {
              const itemData = {};
              itemData.itemId = item.itemId;
              itemData.scId = item.scId;
              itemData.lastQty = item.lastQty;
              itemData.itemSizeId = item.itemSizeId;
              itemData.bsId = item.bsId;
              itemCheckeds.push(itemData);
            }
          });
          if (!itemCheckeds || itemCheckeds.length === 0) {
            // "ServingErMsg": "请先选择起菜明细再执行确认操作"
            this.$message.error(this.$t('Biz.Order.ServingErMsg'));
            return;
          }
          // 组装参数
          requestParams = { pointId: this.resData.pointId, callUps: itemCheckeds };
          // 过滤 类别 选中内容
          tmpArr = this.servingClassList.filter(item => item.isChecked === true);
        } else {
          // 遍历当前小类，将选中的菜品组装到数组中，稍后提交
          this.servingItems.forEach((item) => {
            if (item.isChecked) {
              const itemData = {};
              itemData.smallClassId = item.smallClassId;
              itemCheckeds.push(itemData);
            }
          });
          if (!itemCheckeds || itemCheckeds.length === 0) {
            this.$message.error(this.$t('Biz.Order.ServingErMsg'));
            return;
          }
          // 组装数据
          requestParams = {
            bsId: this.resData.bsId,
            pointId: this.resData.pointId,
            callUpClassList: itemCheckeds,
          };
          // 过滤 品项 选中内容
          tmpArr = this.servingItemList.filter(item => item.isChecked === true);
        }
        // 检查 是否 品项和类别同时选中
        if (tmpArr.length > 0) {
          // ServingErMsg01 品项和类别不能同时起菜
          this.$message.error(this.$t('Biz.Order.ServingErMsg01'));
          // eslint-disable-next-line consistent-return
          return false;
        }
      }

      // 执行 起菜接口
      ajax('canyin.pos.callup.callup', {
        contentType: 'paramsEncoded',
        data: requestParams,
      }).then((res) => {
        if (String(res.code) === '1') {
          if (res.data.success) {
            this.$message.success(this.$t('Biz.Order.ServingSucessMsg'));
            this.$vemit('loadBill', this.resData.pointId);
            this.close();
          } else {
            this.$message.error(res.data.msg);
          }
        } else {
          this.$message.error(res.msg);
        }
      });
      this.submit();
    },
    // 整桌起菜确认弹窗
    callAll() {
      this.$confirm('确定要整桌起菜吗？', this.$t('Dict.Tips'), {
        confirmButtonText: this.$t('Dict.Sure'),
        cancelButtonText: this.$t('Dict.Cancel'),
        type: 'warning',
      }).then(() => {
        this.onSubmit(true);
      }).catch(() => false);
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.warp {
  width: 100%;
  height: 100%;

  &:after {
    visibility: hidden;
    clear: both;
    display: block;
    height: 0;
    content: " ";
  }
}

.besideTab {
  width: 17%;
  height: 100%;
  float: left;
  padding: 16px 0;
  background-color: #fff;
  box-shadow: 2px -3px 6px #666;
}

.tabsGroup-item {
  padding: 14px 0;
  margin: 6px;
  font-size: 14px;
  text-align: center;
  cursor: pointer;

  &.activeTabs {
    background-color: #ddf1f6;
    color: #0babb9;
  }
}

.serving {
  width: 82%;
  float: right;
  // padding-left: 12px;
  padding-right: 12px;
  padding-bottom: 12px;

  > .serving-info {
    height: 48px;
    line-height: 48px;
    padding-left: 10px;

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

  > .serving-content {

    background-color: #fff;

    > .serving-content-title {
      border-bottom: 1px solid #ccc;
      font-size: 12px;
      height: 37px;
      font-weight: 400px;
      color: #666;
      line-height: 37px;

      > span {
        text-align: center;
        display: inline-block;
      }

      > .head-item-checkedbox {
        width: 8%;
      }
      > .head-item-order {
        width: 8%;
      }
      > .head-item-name {
        width: 25%;
      }
      > .head-item-number {
        width: 30%;
      }
      > .head-item-addbill-time {
        width: 26%;
      }
    }
    > .list-content {
      height: 392px;
      overflow: hidden;

      > .serving-content-body {
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
          width: 8%;
        }
        > .item-order {
          width: 8%;
          height: 48px;
          line-height: 48px;
        }
        > .item-name {
          width: 25%;

          > em {
            font-style: normal;
          }
        }
        > .item-number {
         width: 30%;
        }
        > .item-addbill-time {
          width: 26%;
        }
      }
    }

    > .serving-footer::after {
      content: "";
      display: block;
      clear: both;
    }
    > .serving-footer {
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

  &:after {

  }
}
</style>
