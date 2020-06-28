<template>
  <div :id="id" @click.stop="triggerOff">
    <!-- 区域选择 -->
    <div class="dropdown-btnGroup"
      :class="{'active': btnNameList[dropDownActive] == btnNameList[0]}" >
      <p class="dropdown-btn-txt aLineTxt"
        @click ="dropDownToggle(0)">
        <!-- 加载客位筛选按钮过滤, 传入当前所在btnNameList的index, 和对应下拉列表对象chartFilterArea -->
        {{ btnNameList | chartFilterTxt(0, chartFilterArea) }}
        <em class="icon icon-arr-down"></em>
      </p>
      <!-- 弹出层 -->
      <ul class="dropdown-btn-itemBox firstDropItem"
        v-show="btnNameList[dropDownActive] == btnNameList[0]">
        <li class="dropdown-btn-item"
          v-for="(item, index) in chartFilterArea"
          @click="chartFilterItemCheck(item, 'area_id')" :key="index">
          <!-- checkbox -->
          <span>
            <em v-show="item.check == 1" class="checkSign icon icon-duihao"></em>
          </span>
          <!-- 内容 -->
          {{ item.name }}
        </li>
        <!-- 底部全选反选按钮:传入当前数据对象和操作类型 -->
        <li class="dropdown-btn-allOrNo">
          <!-- 全选 -->
          <span @click="chartFilterIsAllCheck(chartFilterArea, 1, 'area_id')">{{ $t('Dict.SelectAll') }}</span>
          /
          <!-- 反选 -->
          <span @click="chartFilterIsAllCheck(chartFilterArea, 0, 'area_id')">{{ $t('Biz.Booking.SelectRe') }}</span>
        </li>
      </ul>
    </div>
    <!-- 客位类型选择 -->
    <div class="dropdown-btnGroup"
      :class="{'active': btnNameList[dropDownActive] == btnNameList[1]}">
      <p class="dropdown-btn-txt aLineTxt"
        @click="dropDownToggle(1)">
        {{ btnNameList | chartFilterTxt(1, chartFilterType) }}
        <em class="icon icon-arr-down"></em>
      </p>
      <!-- 弹出层 -->
      <ul class="dropdown-btn-itemBox"
        v-show="btnNameList[dropDownActive] == btnNameList[1]">
        <li class="dropdown-btn-item"
          v-for="(item, index) in chartFilterType"
          @click="chartFilterItemCheck(item, 'type_id')" :key="index">
          <!-- checkbox -->
          <span >
            <em v-show="item.check == 1" class="checkSign icon icon-duihao"></em>
          </span>
          <!-- 内容 -->
          {{ item.name }}
        </li>
        <!-- 底部全选反选按钮:传入当前数据对象和操作类型 -->
        <li class="dropdown-btn-allOrNo">
          <!-- 全选 -->
          <span @click="chartFilterIsAllCheck(chartFilterType, 1, 'type_id')">{{ $t('Dict.SelectAll') }}</span>
          /
          <!-- 反选 -->
          <span @click="chartFilterIsAllCheck(chartFilterType, 0, 'type_id')">{{ $t('Biz.Booking.SelectRe') }}</span>
        </li>
      </ul>
    </div>
    <!-- 客位标签选择 -->
    <div class="dropdown-btnGroup"
      :class="{'active': btnNameList[dropDownActive] == btnNameList[2]}">
      <p class="dropdown-btn-txt aLineTxt"
        @click="dropDownToggle(2)">
        {{ btnNameList | chartFilterTxt(2, chartFilterRequest) }}
        <em class="icon icon-arr-down"></em>
      </p>
      <!-- 弹出层 -->
      <ul class="dropdown-btn-itemBox" v-show="btnNameList[dropDownActive] == btnNameList[2]">
        <li class="dropdown-btn-item"
          v-for="(item, index) in chartFilterRequest"
          @click="chartFilterItemCheck(item, 'pointLabelIds')" :key="index">
          <!-- checkbox -->
          <span >
            <em v-show="item.check == 1" class="checkSign icon icon-duihao"></em>
          </span>
          <!-- 内容 -->
          {{ item.name }}
        </li>
        <!-- 底部全选反选按钮:传入当前数据对象和操作类型 -->
        <li class="dropdown-btn-allOrNo">
          <span @click="chartFilterIsAllCheck(chartFilterRequest, 1, 'pointLabelIds')">{{ $t('Dict.SelectAll') }}</span>
          /
          <span @click="chartFilterIsAllCheck(chartFilterRequest, 0, 'pointLabelIds')">{{ $t('Biz.Booking.SelectRe') }}</span>
        </li>
      </ul>
    </div>
    <!-- 人数选择 -->
    <div class="dropdown-btnGroup lastItem chartFilterRange"
      :class="{'active': btnNameList[dropDownActive] == btnNameList[3]}"
      v-if="chartFilterRange">
      <p class="dropdown-btn-txt"
        @click="dropDownToggle(3, $event)">
        {{ btnNameList[3] }}
        <em class="icon icon-arr-down"></em>
      </p>
      <div class="dropdown-btn-itemBox" v-show="btnNameList[dropDownActive] == btnNameList[3]">
        <span class="chartFilterRange-scale">0<em class="startSign">|</em></span>
        <el-slider
          class="chartFilterRange-reWrite"
          v-model="chartFilterRange.val"
          @change="changeNum"
          :max="chartFilterRange.max"
          :step="1">
        </el-slider>
        <span
          class="chartFilterRange-scale"
          >{{ chartFilterRange.max }}<em class="endSign">|</em></span>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  props: {
    id: {
      type: String,
      default: '',
    },
    // 触发父组件关闭方法对象
    closeList: {},
    // 按钮名称数组
    btnNameList: {},
    // 客位区域渲染数据对象
    chartFilterArea: {},
    // 客位类型渲染数据对象
    chartFilterType: {},
    // 客位标签渲染数据对象
    chartFilterRequest: {},
    // 客位人数渲染数据对象
    chartFilterRange: {},
    // 直接更改的 过滤条件对象: 父组件传入, 子组件直接更改
    conditions: {},
  },

  data() {
    return {
      dropDownActive: null,
    };
  },
  // created() {
  // },
  methods: {
    triggerOff() {
      // 执行触发父组件全局关闭方法, 并传递组件id
      if (this.closeList) {
        this.closeList(this.id);
      }
    },
    // 客位筛选器: 下拉列表弹出
    dropDownToggle(state) {
      // 传入当前按钮渲染数据下标, 激活样式切换: 当前按钮名称 等于 按钮数组[当前下标], 选中下标置位null时, 不激活
      // 特意使用,this.dropDownActive 与 '0和false' 呈现的boolean比较结果做业务处理
      // eslint-disable-next-line eqeqeq
      this.dropDownActive = this.dropDownActive == state ? null : state;
    },
    // 人数选择
    changeNum(val) {
      // 根据选择, 实时改变筛选条件人数(父组件存储)
      this.conditions.num = val;
      // 手动触发执行客位筛选实时数据(刷新接口)
      setTimeout(() => {
        this.$emit('executeBookFilte');
      }, 0);
    },
    // 客位筛选器: 下拉列表单选功能
    chartFilterItemCheck(item, type) {
      // 参数item-点击对象, type-筛选类型
      // 执行当前项, 选中与否
      // eslint-disable-next-line no-param-reassign
      item.check = item.check === 1 ? 0 : 1;
      // 调用客位Table筛选条件添加方法: 传入当前操作类型
      this.chartFilterAddConditions(type);
    },

    // 客位筛选器: 下拉列表'全选'/'反选'
    chartFilterIsAllCheck(obj, check, type) {
      // 传入obj为操作数据, check为操作方式, item.check为操作状态
      obj.forEach((item) => {
        // 全选即选中, 反选即反选中或不选中
        if (check === 1) {
          // eslint-disable-next-line no-param-reassign
          item.check = check;
        } else if (item.check === 0) {
          // eslint-disable-next-line no-param-reassign
          item.check = 1;
        } else {
          // eslint-disable-next-line no-param-reassign
          item.check = 0;
        }
      });
      // 调用客位Table筛选条件添加方法: 传入当前操作类型
      this.chartFilterAddConditions(type);
    },

    // 客位筛选功能-筛选条件添加存储公共方法(单勾选和全选调用)
    chartFilterAddConditions(type) {
      /* 客位筛选功能-类型和条件存储 */

      // 声明命令对象: (结构序列与 this.conditions相同)筛选类型 对应 执行的条件查询数组
      const arr = {
        area_id: 'chartFilterArea',
        type_id: 'chartFilterType',
        pointLabelIds: 'chartFilterRequest',
      };
      // 每次执行清空条件数组
      this.conditions[type] = '';
      if (type !== 'pointLabelIds') {
        // 执行查询判定, 并存入条件数组(vue对象data设计的过滤条件存储对象数组)
        this[arr[type]].forEach((_) => {
          if (_.check !== 0) {
            // this.conditions[type].push(_.id);
            // 废除上面方法,改为直接拼接字符串,以方便直接传给接口查询
            this.conditions[type] += `${_.id},`;
          }
        });
      } else {
        // 客位标签默认不选中, 过滤选中项
        this[arr[type]].forEach((_) => {
          if (_.check === 1) {
            // this.conditions[type].push(_.id);
            this.conditions[type] += `${_.id},`;
          }
        });
      }
      // 手动触发执行客位筛选实时数据(刷新接口)
      this.$emit('executeBookFilte');
    },
  },
  filters: {
    // 预订客位筛选按钮名称过滤器
    chartFilterTxt(btnArr, index, dropdown) {
      const str = [];
      dropdown.forEach((item) => {
        if (item.check === 1) {
          str.push(item.name);
        }
      });
      // 全选或全部选, 均输出按钮原名称, 否则输出选择项
      return str.length === 0 || str.length === dropdown.length
        ? btnArr[index]
        : str.join(',');
    },
  },
};

</script>

<style lang="less" scoped>
@import "./BookingCommon/common.less";

.booking-dropdown-group {
  height: 36px;
  display: table;
  text-align: center;
  border-radius: 18px;
  .bgc(@toggleBtnBg);

  .dropdown-btnGroup {
    width: 25%;
    float: left;
    position: relative;
    cursor: pointer;
    border-right: 1px solid @rgba255-20;

    &:first-child {
      border-radius: 20px 0 0 20px;
    }

    &:last-child {
      border: none;
      border-radius: 0 20px 20px 0;
      &.lastItem {
        padding-right: 18px;

        .dropdown-btn-txt {
          > em {
            right: calc(4% + 18px);
          }
        }
      }
    }

    &.active {
      .bgc(@toggleBtnActive);

      .dropdown-btn-txt {
        > em:before {
          content: "\e8aa";
        }
      }
    }

    &.chartFilterRange .dropdown-btn-itemBox {
      width: 306%;

      .chartFilterRange-scale {
        width: 14px;
        height: 14px;
        float: left;
        display: block;
        margin-top: 34px;
        position: relative;
        .setFont(12px, #fff);

        .startSign,
        .endSign {
          position: absolute;
          color: @activeColor;
          .normalFont;
          bottom: 16px;
          right: -2px;
        }
        .endSign {
          left: -15px;
        }
      }
      .chartFilterRange-reWrite {
        width: 80%;
        float: left;
      }
    }

    .dropdown-btn-txt {
      width: 76%;
      height: 36px;
      margin: 0 auto;
      line-height: 36px;
      .setFont(14px, #273844);

      > em {
        position: absolute;
        right: 4%;
        top: 0;
      }
    }

    .dropdown-btn-itemBox {
      width: 440px;
      border-radius: 4px;
      position: absolute;
      top: 37px;
      left: 0;
      padding: 22px;
      .bgc(rgba(46, 74, 89, 0.95));
      cursor: default;
      z-index: 500;

      &.firstDropItem {
        left: 13px;
      }

      .dropdown-btn-item {
        float: left;
        margin: 0 30px 12px 0;
        color: #fff;
        cursor: pointer;

        > span {
          width: 18px;
          height: 18px;
          line-height: 14px;
          display: inline-block;
          margin-right: 6px;
          vertical-align: middle;
          border: 1px solid #9aa7af;
          border-radius: 3px;

          .checkSign {
            .setFont(12px, @activeColor);
          }
        }
      }

      .dropdown-btn-allOrNo {
        width: 100%;
        float: left;
        margin-top: 10px;
        text-align: left;
        color: @activeColor;

        > span {
          margin: 0 6px;
          cursor: pointer;
          &:active {
            border-bottom: 1px solid @activeColor;
          }
        }
      }
    }
  }
}

.booking-dropdown-originBox {
  width: 66%;
}


</style>
