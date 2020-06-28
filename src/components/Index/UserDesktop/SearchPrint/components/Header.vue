<template>
  <div class="search-area">
    <el-form :inline="true" :model="searchForm">
      <el-form-item
        :label="$t('Dict.BusinessDay')"
        v-if="businessReportCurrentModuleId === 1524">
        <el-date-picker
          v-model="giftBizDate"
          type="date"
          value-format="yyyy-MM-dd"
          :placeholder="$t('Dict.SelectionDate')">
        </el-date-picker>
      </el-form-item>
      <el-form-item
        v-if="businessReportCurrentModuleId !== 1524"
        :label="$t('Dict.BusinessDay')">
        <div class="date-wrap">
          <div>
            <el-date-picker
              v-model="startDate"
              type="date"
              value-format="yyyy-MM-dd"
              :placeholder="$t('Dict.SelectionDate')">
            </el-date-picker>
          </div>
          <span>{{$t('Dict.To')}}</span>
          <div>
            <el-date-picker
              v-model="endDate"
              type="date"
              value-format="yyyy-MM-dd"
              :placeholder="$t('Dict.SelectionDate')">
            </el-date-picker>
          </div>
        </div>
      </el-form-item>
      <!--单选的市别-->
      <el-form-item
        :label="$t('Dict.Shift')"
        v-if="[1010,1346,1347,1348,1349,1353,1366,1367,1524].indexOf(+businessReportCurrentModuleId) === -1">
        <el-select v-model="searchForm.shiftName" :placeholder="$t('Dict.ChooseShift')">
          <el-option :label="$t('Dict.All')" value=""></el-option>
          <el-option
            v-for="item in businessReportViewData.shifts"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <!--多选的市别(营业和销售报表专用)-->
      <el-form-item
        :label="$t('Dict.Shift')"
        v-if="[1346,1347].indexOf(+businessReportCurrentModuleId) > - 1"
      >
        <el-select
          :value="shiftsVal"
          multiple
          collapse-tags
          style="margin-left: 20px;"
          :placeholder="$t('Dict.ChooseShift')">
          <el-option label="" value="">
            <div slot="">
              <el-checkbox
                v-model="chooseShiftsAll"
                v-if="shifts.length"
                @change="optionsSelectHandler('shifts','chooseShiftsAll')"
                style="width: 100%">{{$t('Dict.SelectAll')}}</el-checkbox>
            <span v-else>{{$t('Dict.NoData')}}</span>
            </div>
          </el-option>
          <el-option
            v-for="(item,index) in shifts"
            :key="item.name + index"
            :label="item.name"
            :value="item.checked">
            <div slot="">
              <el-checkbox
                v-model="item.checked"
                @change="optionsSelectHandler('shifts')"
                style="width: 100%">
                {{ item.name }}
              </el-checkbox>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        :label="$t('Dict.State')"
        v-if="[1346, 1347].indexOf(+businessReportCurrentModuleId) !== -1"
      >
        <el-select v-model="searchForm.status" :placeholder="$t('Dict.ChooseStatus')">
          <el-option :label="$t('Dict.All')" value="99"></el-option>
          <el-option :label="$t('Dict.Unfinished')" value="0"></el-option>
          <el-option :label="$t('Dict.AlreadyKnot')" value="1"></el-option>
        </el-select>
      </el-form-item>
      <!--单选消费区域-->
      <el-form-item
        :label="$t('Dict.ConsumptionArea')"
        v-if="[1010,1346,1347,1348,1349,1352,1353,1354,1355,1356,1357,1366,1367,1414,1524].indexOf(+businessReportCurrentModuleId) === -1"
      >
        <el-select v-model="searchForm.area" :placeholder="$t('Dict.ChooseAreas')">
          <el-option :label="$t('Dict.All')" value=""></el-option>
          <el-option
            v-for="item in businessReportViewData.areas"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <!--多选消费区域(营业和销售报表专用)-->
      <el-form-item
        :label="$t('Dict.ConsumptionArea')"
        v-if="[1346,1347].indexOf(+businessReportCurrentModuleId) > -1"
      >
        <el-select
          :value="areasVal"
          multiple
          collapse-tags
          :placeholder="$t('Dict.ChooseAreas')"
        >
          <el-option label="" value="">
            <div slot="">
              <el-checkbox
                v-model="chooseAreasAll"
                v-if="areas.length"
                @change="optionsSelectHandler('areas','chooseAreasAll')"
                style="width: 100%"
              >
                {{$t('Dict.SelectAll')}}
              </el-checkbox>
              <span v-else>{{$t('Dict.NoData')}}</span>
            </div>
          </el-option>
          <el-option
              v-for="(item,index) in areas"
              :key="item.name + index"
              :label="item.name"
              :value="item.checked">
            <div slot="">
              <el-checkbox
                v-model="item.checked"
                @change="optionsSelectHandler('areas')"
                style="width: 100%">
              {{ item.name }}
              </el-checkbox>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        :label="$t('Biz.Booking.Operator01')"
        v-if="[983,1010,1346,1348,1349,1352,1353,1354,1355,1356,1357,1366,1367,1414,1524].indexOf(+businessReportCurrentModuleId) === -1"
      >
        <el-input
          :placeholder="$t('Biz.UserDesktop.SearchPrint.HeaderPh6')"
          v-model="operationPeople">
        </el-input>
      </el-form-item>
      <div v-if="businessReportCurrentModuleId === 1347" style="display: inline-block">
        <el-form-item label="临时品项展示">
          <el-select v-model="searchForm.tempItemShowType" placeholder="是否展示">
            <el-option label="合并" :value=0></el-option>
            <el-option label="分开" :value=1></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('Biz.Pos.More.RModalLabel7')">
          <el-select v-model="itemsType" :placeholder="$t('Biz.Pos.More.ReportsModal.Placeholder3')">
            <el-option :label="$t('Biz.Pos.More.RModalLabel8')" value="10"></el-option>
            <el-option :label="$t('Biz.Pos.More.RModalLabel9')" value="20"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('Dict.BigClass')">
          <el-select
            :value="bigClassVal"
            multiple
            collapse-tags
            style="margin-left: 20px;"
            :placeholder="$t('Dict.PleaseChoose')">
            <el-option label="" value="">
              <div slot="">
                <el-checkbox
                  v-model="chooseBigClassAll"
                  v-if="bigClass.length"
                  @change="optionsSelectHandler('bigClass','chooseBigClassAll')"
                  style="width: 100%">{{$t('Dict.SelectAll')}}</el-checkbox>
                <span v-else>{{$t('Dict.NoData')}}</span>
              </div>
            </el-option>
            <el-option
              v-for="(item,index) in bigClass"
              :key="item.name + index"
              :label="item.name"
              :value="item.checked">
              <div slot="">
                <el-checkbox
                  v-model="item.checked"
                  @change="optionsSelectHandler('bigClass')"
                  style="width: 100%">{{ item.name }}</el-checkbox>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('Dict.SmallClass')">
          <el-select
            :value="smallClassVal"
            :disabled="!bigClassVal.length || !smallClass.length"
            multiple
            collapse-tags
            style="margin-left: 20px;"
            :placeholder="$t('Dict.PleaseChoose')">
            <el-option label="" value="">
              <div slot="">
                <el-checkbox
                  v-model="chooseSmallClassAll"
                  v-if="smallClass.length"
                  @change="optionsSelectHandler('smallClass','chooseSmallClassAll')"
                  style="width: 100%">{{$t('Dict.SelectAll')}}</el-checkbox>
                <span v-else>{{$t('Dict.NoData')}}</span>
              </div>
            </el-option>
            <el-option
              v-for="(item,index) in smallClass"
              :key="item.name + index"
              :label="item.name"
              :value="item.checked">
              <div slot="">
                <el-checkbox
                  v-model="item.checked"
                  @change="optionsSelectHandler('smallClass')"
                  style="width: 100%">{{ item.name }}</el-checkbox>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('Dict.Item')">
          <el-select
            :value="dishVal"
            :disabled="!smallClassVal.length|| !bigClassVal.length || !dish.length"
            multiple
            collapse-tags
            style="margin-left: 20px;"
            :placeholder="$t('Dict.PleaseChoose')">
            <el-option label="" value="" style="height: auto">
              <div slot="" style="width: 100%"  @click.stop.prevent="">
                <el-input
                  :placeholder="$t('Dict.Search')"
                  size="mini"
                  v-model="dishSearchVal">
                  <i slot="suffix" class="el-input__icon el-icon-search"></i>
                </el-input>
              </div>
            </el-option>
            <el-option label="" value="">
              <div slot="">
                <el-checkbox
                  v-model="chooseDishAll"
                  v-if="dish.length"
                  style="width: 100%"
                  @change="optionsSelectHandler('dish','chooseDishAll')"
                >{{$t('Dict.SelectAll')}}</el-checkbox>
                <span v-else>{{$t('Dict.NoData')}}</span>
              </div>
            </el-option>
            <el-option
              v-for="(item,index) in dish"
              :key="item.name + index"
              :label="item.name"
              :value="item.checked">
              <div slot="" >
                <el-checkbox
                  v-model="item.checked"
                  @change="optionsSelectHandler('dish')"
                  style="width: 100%">{{ item.name }}</el-checkbox>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </div>
      <el-form-item  v-if="[1349,1010].indexOf(+businessReportCurrentModuleId) > -1">
        <span class="margin-50">{{ currentShopInfo.shopId }} - {{ currentShopInfo.shopName }}</span>
      </el-form-item>
      <!--  BEGIN:结班报表查询参数 -->
      <div v-if="businessReportCurrentModuleId === 1367">
        <!--<el-form-item :label="$t('Biz.UserDesktop.SearchPrint.HeaderLabel9')" required>-->
          <!--<el-date-picker-->
            <!--v-model="endJobForm.settleDate"-->
            <!--type="date"-->
            <!--value-format="yyyy-MM-dd"-->
            <!--:placeholder="$t('Dict.SelectionDate')">-->
          <!--</el-date-picker>-->
        <!--</el-form-item>-->
        <el-form-item :label="$t('Biz.UserDesktop.SearchPrint.HeaderLabel10')">
          <div class="endradio">
            <el-radio-group v-model="endJobForm.psType">
              <el-radio :label="0">{{$t('Biz.UserDesktop.SearchPrint.HeaderRedio1')}}</el-radio>
              <el-radio :label="1">{{$t('Biz.UserDesktop.SearchPrint.HeaderRedio2')}}</el-radio>
            </el-radio-group>
          </div>
        </el-form-item>
      </div>
      <el-form-item
        :label="$t('Biz.Booking.Operator01')"
        v-if="businessReportCurrentModuleId === 1367"
      >
        <el-input
          v-model="endJobForm.operator"
          class="opInput"
          :placeholder="$t('Biz.UserDesktop.SearchPrint.HeaderPh6')"
        ></el-input>
      </el-form-item>
      <el-form-item v-if="businessReportCurrentModuleId === 1367">
        <el-checkbox
          v-model="endJobForm.isShowEndJob"
        >{{ $t('Biz.UserDesktop.SearchPrint.HeaderCb2') }}</el-checkbox>
        <el-checkbox
          v-model="endJobForm.isShowPsDetail"
          class="opCheckbox"
        >{{ $t('Biz.UserDesktop.SearchPrint.HeaderCb3') }}</el-checkbox>
      </el-form-item><!--  END:结班报表查询参数  -->
      <el-form-item>
        <el-button type="primary" @click="search">{{$t('Dict.Search2')}}</el-button>
        <!--已结账单报表,结班报表,可赠余额报表没有打印-->
        <el-button
          @click="print"
          v-if="[1366,1367,1524].indexOf(+businessReportCurrentModuleId) === -1">{{$t('Dict.Printing')}}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import {
  forEach, cloneDeep, find, extend,
} from 'lodash';
import ajax from '@/common/js/ajax';

export default {
  name: 'searchPrintHeader',
  props: {
    businessReportViewData: Object,
    businessReportCurrentModuleId: { // 当前的报表id
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      operationPeople: '', // 操作员
      tmpOperationPeople: '', //
      hadInit: false,
      searchForm: {
        shiftName: '',
        status: '99',
        area: '',
        tempItemShowType: 0,
      },
      tmpSearchForm: null,
      dataCache: null, // 缓存数据
      filterArr: ['DS2', 'DS3', 'DS4', 'DS5', 'DS6', 'DS7', 'DS8'], // 销售报表中的类别选中
      tmpTime: null, // 缓存时间记录
      tmpDataCache: null, // 缓存数据
      bigClass: [], // 当前大类数据
      smallClass: [], // 当前小类数据
      dish: [], // 当前品项数据
      itemsType: '10', // 品项类型
      chooseBigClassAll: false, // 大类全选状态
      chooseSmallClassAll: false, // 小类全选状态
      chooseDishAll: false, // 品项全选状态
      dishSearchVal: '', // 品项搜索条件
      startDate: '', // 开始时间
      endDate: '', // 结束时间
      currentShopInfo: {
        shopId: '',
        shopName: '',
      }, // 当前登录的店铺信息
      endJobForm: { // 结班报表查询参数
        psType: 1, // 结班类型
        settleDate: '', // 日期
        operator: '', // 操作人员
        isShowEndJob: false, // 是否显示未结班流水
        isShowPsDetail: false, // 是否显示结班明细
      },
      chooseShiftsAll: false, // 市别全选状态
      chooseAreasAll: false, // 消费区域全选状态
      shifts: [], // 当前市别数据
      areas: [], // 当前消费区域数据
      giftBizDate: '',
    };
  },
  mounted() {
    this.$von('saleReportIsChecked', (list) => {
      this.isChecked(list);
    });
  },
  computed: {
    ...mapGetters([
      'posInfo',
      'deskPageAuthModules',
    ]),
    bigClassVal() {
      return this.FilterToGetCheckedTrue('bigClass', 'chooseBigClassAll');
    },
    smallClassVal() {
      return this.FilterToGetCheckedTrue('smallClass', 'chooseSmallClassAll');
    },
    dishVal() {
      return this.FilterToGetCheckedTrue('dish', 'chooseDishAll');
    },
    shiftsVal() {
      return this.FilterToGetCheckedTrue('shifts', 'chooseShiftsAll');
    },
    areasVal() {
      return this.FilterToGetCheckedTrue('areas', 'chooseAreasAll');
    },
  },
  watch: {
    operationPeople(val) {
      localStorage.setItem('headerOperator', val);
    },
    searchForm: {
      handler(val) {
        if (this.tmpSearchForm) {
          if (
            val.shiftName !== this.tmpSearchForm.shiftName
            || val.status !== this.tmpSearchForm.status
            || val.area !== this.tmpSearchForm.area
          ) {
            this.tmpSearchForm = Object.assign({}, val);
            this.clearAllData();
          }
        } else {
          this.tmpSearchForm = Object.assign({}, val);
          this.clearAllData();
        }
      },
      deep: true,
    },
    startDate(val) {
      localStorage.setItem('headerStartDate', val);
      const compareTime = `${this.startDate}-${this.endDate}`;
      if (compareTime !== this.tmpTime) {
        this.tmpTime = compareTime;
        this.clearAllData();
      }
    },
    endDate(val) {
      localStorage.setItem('headerEndDate', val);
      const compareTime = `${this.startDate}-${this.endDate}`;
      if (compareTime !== this.tmpTime) {
        this.tmpTime = compareTime;
        this.clearAllData();
      }
    },
    dishSearchVal(val) {
      if (!val) {
        this.dish = this.tmpDataCache.DS4;
      } else {
        this.dish = this.dish.filter(item => item.name.indexOf(val) > -1);
      }
    },
    businessReportCurrentModuleId(newV, oldV) {
      if (newV === oldV) return;
      this.search();
    },
    businessReportViewData: {
      handler(val) {
        const { shifts, areas } = val;
        this.shifts = this.addProperty(shifts, 'checked', false);
        this.areas = this.addProperty(areas, 'checked', false);
      },
      deep: true,
    },
    shifts: {
      handler() {
        this.clearAllData();
      },
      deep: true,
    },
    areas: {
      handler() {
        this.clearAllData();
      },
      deep: true,
    },
  },
  methods: {
    /**
     *  进入页面时初始化的相关方法
     */
    onOpen() {
      this.itemsType = '10';
      Object.assign(this.searchForm, {
        shiftName: '',
        status: '1',
        area: '',
      });
      this.operationPeople = '';
      this.tmpOperationPeople = '';
      this.currentShopInfo = JSON.parse(localStorage.getItem('currentShopInfo'));
      this.endDate = this.formatDate();
      this.startDate = this.formatDate();
      this.giftBizDate = this.formatDate();
      this.endJobForm.settleDate = this.formatDate();
      this.tmpTime = `${this.startDate}-${this.endDate}`;
    },
    // 格式化时间
    formatDate() {
      // 数字不足两位，在前面补0
      const addZero = (num) => {
        const str = `${num}`;
        if (str.length === 1) return `0${str}`;
        return str;
      };
      // 转为正常时间字符串
      const date = new Date();
      const year = date.getFullYear();
      const month = addZero(date.getMonth() + 1);
      const day = addZero(date.getDate());
      return `${year}-${month}-${day}`;
    },
    /**
     *  离开页面时清空缓存数据相关方法
     */
    // 清空所有数据
    clearAllData() {
      this.bigClass = [];
      this.smallClass = [];
      this.dish = [];
      this.dishSearchVal = '';
      this.tmpDataCache = null;
      this.dataCache = null;
    },
    /**
     *  执行search方法前验证时间选择的是否合法（结束大于开始，并且不超过30天）
     */
    checkedBeforeSearch() {
      const { startDate, endDate } = this;
      const time1 = (new Date(`${startDate}`)).getTime();
      const time2 = (new Date(`${endDate}`)).getTime();
      if (time2 < time1) {
        this.$message.warning(`${this.$t('Dict.TimeVerify')}`);
        return false;
      }
      if ((time2 - time1) / (1000 * 60 * 60 * 24) > 31) {
        this.$message.warning(`${this.$t('Dict.TimeInterval')}`);
        return false;
      }
      return true;
    },
    /**
     *  执行对应的搜索方法
     */
    search() {
      // 在这里调用onOpen方法是为了解决search先于onOpen执行的问题
      // hadInit是为了在进入此页面时初始化数据，报表之间的切换不再重复初始化
      // 离开路由后重置
      if (!this.hadInit) {
        this.onOpen();
        this.hadInit = true;
      }
      this.tmpOperationPeople = '';
      const map = new Map([
        [1349, 'searchForBZHG'], // 运营报表（BZHG） 965
        [1346, 'searchForBusiness'], // 营业报表 966
        [1347, 'searchForSale'], // 销售报表 967
        [1352, 'searchForQFBZBusiness'], // 营业报表（QFBZ） 973
        [1353, 'searchForQFBZTime'], // 时段报表（QFBZ） 974
        [1354, 'searchForQFBZDish'], // 品项报表（QFBZ） 975
        [1355, 'searchForQFBZAbandon'], // 废单报表（QFBZ） 976
        [1357, 'searchForXYXSettle'], // 结算统计表（XYX） 1139
        [1356, 'searchForXYXBusiness'], // 营业统计表（XYX） 1142
        [1348, 'searchForMeal'], // 蒸制报表 1203
        [1366, 'searchBilledStatement'], // 已结账单报表
        [1367, 'searchBilledReport'], // 结班报表
        [1414, 'searchForYKBusiness'], // 鱼酷报表
        [1524, 'reportGift'], // 赠送额度报表
        [983, 'searchForXGSJBusiness'], // XGSJ营业报表
        [1010, 'searchForXGSJTime'], // XGSJ时段报表
      ]);
      const func = map.get(this.businessReportCurrentModuleId);
      if (func && this.checkedBeforeSearch()) {
        this[func]();
      }
    },
    /**
     *  各种报表查询的请求方法
     */
    // 可赠额度报表
    reportGift() {
      ajax('canyin.pos.businessreport.b14presentreport', {
        contentType: 'URLEncoded',
        data: {
          bizDate: this.giftBizDate,
        },
      }).then((data) => {
        this.dataCache = data.data;
        this.$vemit('reportGift', data.data);
      });
    },
    searchForXGSJBusiness() {
      ajax('canyin.pos.businessreport.b08businessreport', {
        contentType: 'URLEncoded',
        data: {
          startDate: this.startDate,
          endDate: this.endDate,
          shift: this.searchForm.shiftName,
          area: this.searchForm.area,
          state: 1,
        },
      }).then((data) => {
        this.dataCache = data;
        this.$vemit('reportBusinessXGSJ', data);
      });
    },
    searchForXGSJTime() {
      ajax('canyin.pos.businessreport.b09timereport', {
        contentType: 'URLEncoded',
        data: {
          startDate: this.startDate,
          endDate: this.endDate,
        },
      }).then((data) => {
        this.dataCache = data;
        this.$vemit('reportTimeXGSJ', data);
      });
    },
    // 已结账单报表
    searchBilledStatement() {
      this.tmpOperationPeople = this.operationPeople;
      this.$vemit('searchForBilledStatement', {
        startDate: this.startDate,
        endDate: this.endDate,
        operator: this.tmpOperationPeople,
      });
    },
    // 巴庄火锅营业报表
    searchForBZHG() {
      ajax('canyin.pos.businessreport.b03operationreport', {
        contentType: 'URLEncoded',
        data: {
          startDate: this.startDate,
          endDate: this.endDate,
          state: 1,
          fromType: 1,
        },
      }).then((data) => {
        this.dataCache = data;
        this.$vemit('searchForBZHG', data);
      });
    },
    // 常规营业报表
    searchForBusiness() {
      let area = this.getIds(this.areasVal, 'id');
      let shift = this.getIds(this.shiftsVal, 'id');
      area = area ? JSON.stringify(area) : area;
      shift = shift ? JSON.stringify(shift) : shift;
      ajax('canyin.pos.businessreport.b01businessreport', {
        contentType: 'URLEncoded',
        timeout: 60000,
        data: {
          area,
          shift,
          startDate: this.startDate,
          endDate: this.endDate,
          state: this.searchForm.status,
          fromType: 1,
        },
      }).then((data) => {
        this.dataCache = data;
        this.$vemit('searchForBusiness', data);
      });
    },
    // 常规销售报表
    searchForSale() {
      this.tmpOperationPeople = this.operationPeople;
      let area = this.getIds(this.areasVal, 'id');
      let shift = this.getIds(this.shiftsVal, 'id');
      let bigClassIds = this.getIds(this.bigClassVal, 'bigClassId');
      let smallClassIds = this.getIds(this.smallClassVal, 'smallClassId');
      let items = this.getIds(this.dishVal, 'itemId');
      area = area ? JSON.stringify(area) : area;
      shift = shift ? JSON.stringify(shift) : shift;
      bigClassIds = bigClassIds ? JSON.stringify(bigClassIds) : bigClassIds;
      smallClassIds = smallClassIds ? JSON.stringify(smallClassIds) : smallClassIds;
      items = items ? JSON.stringify(items) : items;
      ajax('canyin.pos.businessreport.b02salesreport', {
        contentType: 'URLEncoded',
        timeout: 60000,
        data: {
          area,
          shift,
          startDate: this.startDate,
          endDate: this.endDate,
          state: this.searchForm.status,
          tempItemShowType: this.searchForm.tempItemShowType,
          bigClassIds,
          smallClassIds,
          items,
          itemType: +this.itemsType,
          operator: this.tmpOperationPeople,
          fromType: 1,
        },
      }).then((data) => {
        data.DS2.map(item => item.checked = false); // 大类
        data.DS3.map(item => item.checked = false); // 小类
        data.DS4.map(item => item.checked = false); // 品项
        if (!this.tmpDataCache) {
          this.tmpDataCache = Object.freeze({ ...data });
          [this.bigClass, this.smallClass, this.dish] = [data.DS2, data.DS3, data.DS4];
        }
        this.dataCache = data;
        this.$vemit('searchForSale', data);
      });
    },
    // 营业统计表（XYX）
    searchForXYXBusiness() {
      ajax('canyin.pos.businessreport.b11businessreport', {
        contentType: 'URLEncoded',
        data: {
          area: this.searchForm.area,
          startDate: this.startDate,
          endDate: this.endDate,
          shift: this.searchForm.shiftName,
          state: 1,
          fromType: 1,
        },
      }).then((data) => {
        this.dataCache = data;
        this.$vemit('searchForXYXBusiness', data);
      });
    },
    // 结算统计表（XYX）
    searchForXYXSettle() {
      ajax('canyin.pos.businessreport.b10settlementreport', {
        contentType: 'URLEncoded',
        data: {
          area: this.searchForm.area,
          startDate: this.startDate,
          endDate: this.endDate,
          shift: this.searchForm.shiftName,
          state: 1,
          fromType: 1,
        },
      }).then((data) => {
        this.dataCache = data;
        this.$vemit('searchForXYXSettle', data);
      });
    },
    // 蒸制报表
    searchForMeal() {
      const { startDate, endDate } = this;
      if (startDate > endDate) {
        this.$alert('开始时间不能大于结束时间', '提示');
        return;
      }
      ajax('canyin.pos.businessreport.b12kvsreport', {
        contentType: 'URLEncoded',
        data: {
          startDate,
          endDate,
          state: 1,
          fromType: 1,
        },
      }).then((data) => {
        Object.assign(data, {
          totalInfo: {
            steamTotal: this.reduce(data.DS2, 'steamNum'),
            saleTotal: this.reduce(data.DS2, 'saleNum'),
            reduceTotal: this.reduce(data.DS2, 'reduceNum'),
          },
        });
        this.dataCache = data;
        this.$vemit('searchForMeal', data);
      });
    },
    // 营业报表（QFBZ）
    searchForQFBZBusiness() {
      ajax('canyin.pos.businessreport.b04businessreport', {
        contentType: 'URLEncoded',
        data: {
          area: this.searchForm.area,
          startDate: this.startDate,
          endDate: this.endDate,
          shift: this.searchForm.shiftName,
          state: 1,
          fromType: 1,
        },
      }).then((data) => {
        this.dataCache = data;
        this.$vemit('searchForQFBZBusiness', data);
      });
    },
    // 营业报表（YK）
    searchForYKBusiness() {
      ajax('canyin.pos.businessreport.b13businessreport', {
        contentType: 'URLEncoded',
        data: {
          startDate: this.startDate,
          endDate: this.endDate,
          shift: this.searchForm.shiftName,
          fromType: 1,
        },
      }).then((data) => {
        // 报表数据和打印数据格式不同 分别赋值
        this.dataCache = data.printResult;
        this.$vemit('searchForYKBusiness', data.reportResult);
      });
    },
    // 时段报表（QFBZ）
    searchForQFBZTime() {
      ajax('canyin.pos.businessreport.b05timereport', {
        contentType: 'URLEncoded',
        data: {
          area: this.searchForm.area,
          startDate: this.startDate,
          endDate: this.endDate,
          shift: this.searchForm.shiftName,
          state: 1,
          fromType: 1,
        },
      }).then((data) => {
        this.dataCache = data;
        this.$vemit('searchForQFBZTime', data);
      });
    },
    // 品项报表（QFBZ）
    searchForQFBZDish() {
      ajax('canyin.pos.businessreport.b06itemreport', {
        contentType: 'URLEncoded',
        data: {
          area: this.searchForm.area,
          startDate: this.startDate,
          endDate: this.endDate,
          shift: this.searchForm.shiftName,
          state: 1,
          fromType: 1,
        },
      }).then((data) => {
        this.dataCache = data;
        this.$vemit('searchForQFBZDish', data);
      });
    },
    // 废单报表（QFBZ）
    searchForQFBZAbandon() {
      ajax('canyin.pos.businessreport.b07abandonedreport', {
        contentType: 'URLEncoded',
        data: {
          area: this.searchForm.area,
          startDate: this.startDate,
          endDate: this.endDate,
          shift: this.searchForm.shiftName,
          state: 1,
          fromType: 1,
        },
      }).then((data) => {
        this.$vemit('searchForQFBZAbandon', this.formatAndSetData(data));
      });
    },
    // 查询结班报表
    searchBilledReport() {
      ajax('canyin.desktop.report.list', {
        contentType: 'URLEncoded',
        data: {
          data: JSON.stringify({
            psType: this.endJobForm.psType,
            operator: this.endJobForm.operator,
            startDate: this.startDate,
            endDate: this.endDate,
            state: 1,
            isShowEndJob: this.endJobForm.isShowEndJob ? 'on' : 'off',
            isShowPsDetail: this.endJobForm.isShowPsDetail ? 'on' : 'off',
            fromType: 1,
          }),
        },
      }).then((data) => {
        this.$vemit('searchBilledReport', data, {
          startDate: this.startDate,
          endDate: this.endDate,
          ...this.endJobForm,
        });
      });
    },
    /**
     * 报表查询所需要的辅助函数开始
     */
    // 销售报表模块的切换隐藏，用于打印的过滤
    isChecked(checked) {
      // 只有销售报表里才有
      const arr = ['DS7'];
      forEach(checked, (item) => {
        if (item === '1') {
          arr.push('DS2');
        } else if (item === '2') {
          arr.push('DS3');
        } else if (item === '3') {
          arr.push('DS4');
        } else if (item === '4') {
          arr.push('DS5');
        } else if (item === '5') {
          arr.push('DS6');
        } else if (item === '6') {
          arr.push('DS8');
        }
      });
      // 把各种品项名字转化为DS2 DS3 DS4 DS5 DS6
      // 数组去重
      this.filterArr = Array.from(new Set([...arr].sort(this.compare)));
    },
    // 排序
    compare(a, b) {
      return a > b;
    },
    // 给数组添加属性
    addProperty(arr, key, value) {
      if (!arr) return [];
      return arr.map((item) => {
        const newItem = Object.assign({}, item);
        newItem[key] = value;
        return newItem;
      });
    },
    // 销售报表模块获取id的数组
    getIds(arr, typeId) {
      const ids = [];
      arr.map(item => ids.push(item[typeId]));
      return ids.length > 0 ? ids : null;
    },
    reduce(arr, key) {
      return arr.reduce((sum, item) => sum + item[key], 0);
    },
    // 格式化并整理废单报表(QFBZ)
    formatAndSetData(data) {
      if (!data.DS2) {
        Object.assign(data, {
          DS2: [],
          DS3: [],
        });
        this.dataCache = data;
      } else {
        this.dataCache = cloneDeep(data);
        const obj = Object.create(null);
        const realArr = [];
        let tmpArr = cloneDeep(data.DS2);
        tmpArr = Object.freeze(tmpArr);
        tmpArr.map((item) => {
          if (obj[item.code]) {
            obj[item.code] = [].concat(obj[item.code], item);
          } else {
            obj[item.code] = item;
          }
          return item;
        });
        Object.keys(obj).forEach((key) => {
          const tmpObj = {
            children: Array.isArray(obj[key]) ? [...obj[key]] : [obj[key]],
            code: key,
          };
          realArr.push(tmpObj);
        });
        Object.assign(data, {
          DS2: realArr,
        });
      }
      return data;
    },
    /**
     *  销售报表中大类小类品项过滤相关方法
     */
    // 数组中的checked属性是否有false的状态
    isAllChecked(arr) {
      if (!arr.length) return false;
      return !arr.some(el => el.checked === false);
    },
    // 下拉框选择事件 有bool为多选 没有为单选
    optionsSelectHandler(arr, bool) {
      if (bool) {
        const tmpArr = [...this[arr]];
        tmpArr.map(item => item.checked = this[bool]);
        this[arr] = tmpArr;
      } else {
        this[arr] = [...this[arr]];
      }
      this.linkage(arr);
    },
    // 过滤数组中所有选中状态
    FilterToGetCheckedTrue(arr, type) {
      this[type] = this.isAllChecked(this[arr]);
      return this[arr].filter(({ checked }) => checked) || [];
    },
    // 大类联动小类联动品项
    linkage(arr) {
      switch (arr) {
        case 'bigClass':
          this.smallClass = this.linkageFilter('bigClassVal', 'DS3', 'bigClassId');
          this.dish = this.linkageFilter('smallClassVal', 'DS4', 'smallClassId');
          break;
        case 'smallClass':
          this.dish = this.linkageFilter('smallClassVal', 'DS4', 'smallClassId');
          break;
        default:
          break;
      }
    },
    // 大类过滤小类，小类过滤品项
    linkageFilter(arr1, arr2, idType) {
      const { tmpDataCache } = this;
      const tmpArr = [];
      const transferObj = this.setArrayToAttr(tmpDataCache[arr2], idType);
      this[arr1].map((item) => {
        if (transferObj[item[idType]]) {
          tmpArr.push(...transferObj[item[idType]]);
        }
      });
      return tmpArr;
    },
    // 用array[i]里的key值，把array[i]设置为Object的属性 为了不嵌套循环
    setArrayToAttr(arr, key) {
      const transferObj = Object.create(null);
      arr.map((item) => {
        if (transferObj[item[key]]) {
          transferObj[item[key]].push({ ...item });
        } else {
          Object.assign(transferObj, {
            [item[key]]: [{ ...item }],
          });
        }
      });
      return transferObj;
    },
    /**
     *  打印相关函数
     */
    // 组装数据执行打印
    print() {
      // 当前报表ID
      const printData = find(this.deskPageAuthModules.reportList, {
        moduleId: this.businessReportCurrentModuleId,
      });
      // 根据printSet
      if (printData) {
        if (!printData.printSet) {
          this.$message.error(this.$t('Dict.MsgTips1'));
          return;
        }
        // 市别列表
        const nowShift = this.shifts.filter(
          element => element.id == this.searchForm.shiftName,
        );
        // 区域列表
        const nowArea = this.areas.filter(
          element => element.id == this.searchForm.area,
        );
        let shiftName = nowShift.length > 0 ? nowShift[0].name : this.$t('Dict.All');
        let areaName = nowArea.length > 0 ? nowArea[0].name : this.$t('Dict.All');
        if ([1346, 1347].indexOf(this.businessReportCurrentModuleId) > -1) {
          shiftName = '';
          areaName = '';
          this.shiftsVal.forEach((item, index) => {
            shiftName += `${item.name}`;
            if (index !== this.shiftsVal.length - 1) {
              shiftName += ',';
            }
          });
          this.areasVal.forEach((item, index) => {
            areaName += `${item.name}`;
            if (index !== this.areasVal.length - 1) {
              areaName += ',';
            }
          });
        }
        // 状态
        let status;
        if (this.searchForm.status === '0') {
          status = this.$t('Dict.Unfinished');
        } else if (this.searchForm.status === '1') {
          status = this.$t('Dict.AlreadyKnot');
        } else {
          status = this.$t('Dict.All');
        }
        const meal = {
          startDate: this.startDate,
          endDate: this.endDate,
        };
        const other = {
          shift: shiftName,
          area: areaName,
          state: status,
          // queryDate: +new Date(this.searchForm.businessDate),
          startDate: +new Date(this.startDate),
          endDate: +new Date(this.endDate),
        };
        const need = +this.businessReportCurrentModuleId === 1348 ? meal : other;
        let printD = {
          fileid: printData.printSet ? printData.printSet.style_id : '',
          exporttype: 1,
          printer: printData.printSet ? printData.printSet.printer : '',
          printcnt: printData.printSet ? printData.printSet.print_times : '',
          style_data: printData.printSet ? printData.printSet : '',
          DS1: [
            {
              settlePos: '',
              shopName: this.businessReportCurrentModuleId === 1349
                ? `${this.currentShopInfo.shopId}-${this.currentShopInfo.shopName}`
                : this.businessReportViewData.curShop,
              user: this.tmpOperationPeople,
              printUser: this.businessReportViewData.curEmp,
              printDate: +new Date(),
              ...need,
            },
          ],
        };
        if (+this.businessReportCurrentModuleId === 1347) {
          // 如果是销售报表
          printD = extend(printD, this.filterData(this.filterArr, []));
        } else if (+this.businessReportCurrentModuleId === 1348) {
          const { startDate, endDate } = this;
          if (!this.verifyDate(startDate, endDate)) return;
          printD = extend({}, printD, {
            DS2: this.dataCache.DS2,
          });
        } else {
          printD = extend({}, printD, this.dataCache);
        }
        console.log('打印数据', printD);
        this.$devices.Printer.print(printD);
      } else {
        this.$message.error(this.$t('Dict.MsgTips2'));
      }
    },
    // 打印函数中验证时间
    verifyDate(startDate, endDate) {
      if (startDate > endDate) {
        this.$alert(this.$t('Dict.TimeVerify'), this.$t('Dict.Tips'));
        return false;
      }
      return true;
    },
    // 打印函数中过滤数据
    filterData(filterArr, nullData) {
      const returnData = {};
      forEach(this.dataCache, (value, key) => {
        if (filterArr.indexOf(key) !== -1) {
          returnData[key] = value;
        } else if (nullData !== undefined) {
          returnData[key] = nullData;
        }
      });
      return returnData;
    },
  },
};
</script>

<style lang="less" scoped>
  @import "~@/common/less/variables.less";
  @import "~@/common/less/mixins.less";
  .search-area {
    padding: 15px;
    border-bottom: 1px solid #b5b5b5;
    .el-form-item {
      margin: 8px 10px 0px 0px;
    }
    .date-wrap {
      display: flex;
    > span {
      margin: 0 10px;
    }
    }
    .margin-50 {
      display: block;
      margin: 0 50px;
      font-size: 16px;
      font-weight: bold;
    }
    .endradio{
      display: inline-block;
      vertical-align: middle;
    }
    .opInput{
      width: 220px;
    }
    .opCheckbox{
      width: 300px;
    }
  }
</style>
