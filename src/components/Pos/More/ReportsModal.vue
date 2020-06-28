<template>
  <Dialog
    name="PosDialog.BilledModal"
    :title="$t('Dict.BusinessReport')"
    ref="dialog"
    @close="onClose"
    @open="onOpen"
    width="100%"
    :fullscreen="true"
  >
    <div class="content-area">
      <div class="category-list">
        <div
          @click="changeTab(item.label, item.moduleId)"
          v-for="item in reportList" :key="item.label"
          :class="{'active':activeTab === item.label}" class="tab-item">
            {{item.label}}
        </div>
          <!-- 本版本只显示营业报表,销售报表和蒸制报表,暂时屏蔽其他报表 966代表营业报表  967代表销售报表 1203代表蒸制报表 -->
      </div>
      <div class="report-area">
        <div class="search-area">
          <el-form :inline="true" :model="searchForm">
            <el-form-item :label="$t('Dict.BusinessDay')" v-if="[1348,1414].indexOf(+moduleId) > -1">
              <div class="date-wrap">
                <div>
                  <el-date-picker
                    v-model="mealStartDate"
                    type="date"
                    value-format="yyyy-MM-dd"
                    :placeholder="$t('Dict.SelectionDate')">
                  </el-date-picker>
                </div>
                <span>{{$t('Dict.To')}}</span>
                <div>
                  <el-date-picker
                    v-model="mealEndDate"
                    type="date"
                    value-format="yyyy-MM-dd"
                    :placeholder="$t('Dict.SelectionDate')">
                  </el-date-picker>
                </div>
              </div>
            </el-form-item>
            <el-form-item :label="$t('Dict.BusinessDay')" v-else>
              <el-date-picker
                v-model="searchForm.businessDate"
                type="date"
                value-format="yyyy-MM-dd"
                :placeholder="$t('Dict.SelectionDate')">
              </el-date-picker>
            </el-form-item>
            <!--单选的市别-->
            <el-form-item
              :label="$t('Dict.Shift')"
              v-if="[1010,1346,1347,1348,1349,1353,1524].indexOf(+moduleId) === -1"
            >
              <el-select v-model="searchForm.shiftName" :placeholder="$t('Dict.ChooseShift')">
                <el-option :label="$t('Dict.All')" value=""></el-option>
                <el-option v-for="item in shifts" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <!--多选的市别(营业和销售报表专用)-->
            <el-form-item
              :label="$t('Dict.Shift')"
              v-if="[1346,1347].indexOf(+moduleId) > -1"
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
                      style="width: 100%"
                    >
                      {{$t('Dict.SelectAll')}}
                    </el-checkbox>
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
              v-if="[1346, 1347].indexOf(+moduleId) !== -1"
            >
              <el-select v-model="searchForm.status" :placeholder="$t('Dict.ChooseStatus')">
                <el-option :label="$t('Dict.All')" value="99"></el-option>
                <el-option :label="$t('Dict.Unfinished')" value="0"></el-option>
                <el-option :label="$t('Dict.AlreadyKnot')" value="1"></el-option>
              </el-select>
            </el-form-item>
            <!--单选的消费区域-->
            <el-form-item
              :label="$t('Dict.ConsumptionArea')"
              v-if="[1010,1346,1347,1348,1349,1352,1353,1354,1355,1356,1357,1414,1524].indexOf(+moduleId) === -1"
            >
              <el-select v-model="searchForm.area" :placeholder="$t('Dict.ChooseAreas')">
                <el-option :label="$t('Dict.All')" value=""></el-option>
                <el-option v-for="item in areas" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <!--多选消费区域(营业和销售报表专用)-->
            <el-form-item
              :label="$t('Dict.ConsumptionArea')"
              v-if="[1346,1347].indexOf(+moduleId) > -1"
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
              v-if="[983,1010,1346,1348,1349,1352,1353,1354,1355,1356,1357,1366,1367,1414,1524].indexOf(+moduleId) === -1"
            >
              <el-input
                :placeholder="$t('Biz.UserDesktop.SearchPrint.HeaderPh6')"
                v-model="operationPeople">
              </el-input>
            </el-form-item>
            <div  v-if="moduleId === 1347">
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
                      <el-checkbox v-model="chooseBigClassAll" v-if="bigClass.length"
                        @change="optionsSelectHandler('bigClass','chooseBigClassAll')" style="width: 100%">
                        {{$t('Dict.SelectAll')}}
                      </el-checkbox>
                      <span v-else>{{$t('Dict.NoData')}}</span>
                    </div>
                  </el-option>
                  <el-option
                    v-for="(item,index) in bigClass"
                    :key="item.name + index"
                    :label="item.name"
                    :value="item.checked">
                    <div slot="">
                      <el-checkbox v-model="item.checked" @change="optionsSelectHandler('bigClass')" style="width: 100%">{{ item.name }}</el-checkbox>
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
                      <el-checkbox v-model="chooseSmallClassAll" v-if="smallClass.length"
                        @change="optionsSelectHandler('smallClass','chooseSmallClassAll')" style="width: 100%">
                        {{$t('Dict.SelectAll')}}
                      </el-checkbox>
                      <span v-else>{{$t('Dict.NoData')}}</span>
                    </div>
                  </el-option>
                  <el-option
                    v-for="(item,index) in smallClass"
                    :key="item.name + index"
                    :label="item.name"
                    :value="item.checked">
                    <div slot="">
                      <el-checkbox v-model="item.checked" @change="optionsSelectHandler('smallClass')" style="width: 100%">{{ item.name }}</el-checkbox>
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
                      <el-checkbox v-model="chooseDishAll" v-if="dish.length" style="width: 100%"
                        @change="optionsSelectHandler('dish','chooseDishAll')" >
                        {{$t('Dict.SelectAll')}}
                      </el-checkbox>
                      <span v-else>{{$t('Dict.NoData')}}</span>
                    </div>
                  </el-option>
                  <el-option
                    v-for="(item,index) in dish"
                    :key="item.name + index"
                    :label="item.name"
                    :value="item.checked">
                    <div slot="" >
                      <el-checkbox v-model="item.checked" @change="optionsSelectHandler('dish')" style="width: 100%">{{ item.name }}</el-checkbox>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </div>
            <el-form-item  v-if="moduleId === 1349">
              <span class="margin-50">{{ currentShopInfo.shopId }} - {{ currentShopInfo.shopName }}</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="search">{{$t('Dict.Search2')}}</el-button>
              <el-button v-if="moduleId !== 1524" @click="print">{{$t('Dict.Printing')}}</el-button>
            </el-form-item>
          </el-form>
        </div>
        <ReportBusiness
          :area="areasVal"
          :settle-biz-date="searchForm.businessDate"
          :shift="shiftsVal"
          :state="searchForm.status"
          @loadData=loadData
          v-if="moduleId === 1346"
          ref="reportBusiness"
        >
        </ReportBusiness>
        <ReportSales v-if="moduleId === 1347"
          :area="areasVal"
          :settle-biz-date="searchForm.businessDate"
          :shift="shiftsVal"
          :state="searchForm.status"
          :tempItemShowType="searchForm.tempItemShowType"
          @isChecked=isChecked
          @reportData=reportData
          :itemsType="itemsType"
          :bigClassIds="bigClassVal"
          :smallClassIds="smallClassVal"
          :dishIds="dishVal"
          ref="reportSales"
        ></ReportSales>
        <ReportMeal
          :startDate ="mealStartDate"
          :endDate="mealEndDate"
          @mealData="mealData"
          v-if="moduleId === 1348"
          ref="reportMeal"
        >
        </ReportMeal>
        <ReportGift
          :giftBizDate="searchForm.businessDate"
          @mealData="mealData"
          v-if="moduleId === 1524"
          ref="reportGift"
        >
        </ReportGift>
        <SettleStatisticsReport
          ref="settleStatisticsReport"
          :area="searchForm.area"
          :settle-biz-date="searchForm.businessDate"
          :shift="searchForm.shiftName"
          @settleStatisticsReport="settleStatisticsReport"
          v-if="moduleId === 1357">
        </SettleStatisticsReport>
        <BusinessStatisticsReport
          ref="businessStatisticsReport"
          :area="searchForm.area"
          :settle-biz-date="searchForm.businessDate"
          :shift="searchForm.shiftName"
          @businessStatisticsReport="businessStatisticsReport"
          v-if="moduleId === 1356">
        </BusinessStatisticsReport>
        <ReportBusinessBZHG
          ref="reportBusinessBZHG"
          :settle-biz-date="searchForm.businessDate"
          @businessStatisticsReport="businessStatisticsReport"
          v-if="moduleId === 1349">
        </ReportBusinessBZHG>
        <AbandonReportQFBZ
          ref="abandonReportQFBZ"
          :settle-biz-date="searchForm.businessDate"
          :shift="searchForm.shiftName"
          @businessStatisticsReport="businessStatisticsReport"
          v-if="moduleId === 1355">
        </AbandonReportQFBZ>
        <ReportBusinessQFBZ
          ref="reportBusinessQFBZ"
          :settle-biz-date="searchForm.businessDate"
          :shift="searchForm.shiftName"
          @businessStatisticsReport="businessStatisticsReport"
          v-if="moduleId === 1352">
        </ReportBusinessQFBZ>
        <ReportDishInfoQFBZ
          ref="reportDishInfoQFBZ"
          :settle-biz-date="searchForm.businessDate"
          :shift="searchForm.shiftName"
          @businessStatisticsReport="businessStatisticsReport"
          v-if="moduleId === 1354">
        </ReportDishInfoQFBZ>
        <ReportTimeQFBZ
          ref="reportTimeQFBZ"
          :settle-biz-date="searchForm.businessDate"
          @businessStatisticsReport="businessStatisticsReport"
          v-if="moduleId === 1353">
        </ReportTimeQFBZ>
        <ReportBusinessYK
          ref="reportBusinessYK"
          :startDate ="mealStartDate"
          :endDate="mealEndDate"
          :shift="searchForm.shiftName"
          @businessStatisticsReport="businessStatisticsReport"
          v-if="moduleId === 1414">
        </ReportBusinessYK>
        <ReportBusinessXGSJ
          ref="reportBusinessXGSJ"
          :area="searchForm.area"
          :settle-biz-date="searchForm.businessDate"
          :shift="searchForm.shiftName"
          @businessStatisticsReport="businessStatisticsReport"
          v-if="moduleId === 983">
        </ReportBusinessXGSJ>
        <ReportTimeXGSJ
          ref="reportTimeXGSJ"
          :settle-biz-date="searchForm.businessDate"
          @businessStatisticsReport="businessStatisticsReport"
          v-if="moduleId === 1010">
        </ReportTimeXGSJ>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import { extend, find, forEach } from 'lodash';
import { MessageBox } from 'element-ui';
import * as allId from '@/components/Index/UserDesktop/base/moudle-ids';
import i18n from '@/locales/index';
import ajax from '@/common/js/ajax';
import Dialog from '@/components/Pos/Common/Dialog';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import ReportBusiness from './components/ReportBusiness';
import ReportSales from './components/ReportSales';
import ReportMeal from './components/ReportMeal';
import ReportGift from './components/ReportGift';
import SettleStatisticsReport from './components/SettleStatisticsReport';
import BusinessStatisticsReport from './components/BusinessStatisticsReport';
import ReportBusinessBZHG from './components/ReportBusinessBZHG';
import ReportBusinessYK from './components/ReportBusinessYK';
import AbandonReportQFBZ from './components/AbandonReportQFBZ';
import ReportBusinessQFBZ from './components/ReportBusinessQFBZ';
import ReportDishInfoQFBZ from './components/ReportDishInfoQFBZ';
import ReportTimeQFBZ from './components/ReportTimeQFBZ';
import ReportBusinessXGSJ from './components/ReportBusinessXGSJ';
import ReportTimeXGSJ from './components/ReportTimeXGSJ';

export default {
  components: {
    Dialog,
    ReportSales,
    ReportBusiness,
    ReportMeal,
    SettleStatisticsReport,
    BusinessStatisticsReport,
    ReportBusinessBZHG,
    AbandonReportQFBZ,
    ReportBusinessQFBZ,
    ReportDishInfoQFBZ,
    ReportTimeQFBZ,
    ReportBusinessYK,
    ReportGift,
    ReportBusinessXGSJ,
    ReportTimeXGSJ,
  },
  mixins: [DialogMixin],
  data() {
    return {
      operationPeople: '', // 操作员
      tmpOperationPeople: '', //
      activeTab: null,
      reportList: [], // 报表列表
      searchForm: {
        businessDate: new Date(),
        shiftName: '',
        status: '99',
        area: '',
        tempItemShowType: 0,
      },
      tmpSearchForm: null,
      moduleId: null, // 报表对应名称Id 996营业报表 967销售报表
      businessReportDate: {}, // 报表查询所有数据
      dataCache: null, // 缓存数据
      filterArr: ['DS2', 'DS3', 'DS4', 'DS5', 'DS6', 'DS7', 'DS8'], // 销售报表中的类别选中
      tmpDataCache: null, // 缓存数据
      itemsType: '10', // 当前品项类型
      bigClass: [], // 当前大类数据
      smallClass: [], // 当前小类数据
      dish: [], // 当前品项数据
      chooseBigClassAll: false, // 大类全选状态
      chooseSmallClassAll: false, // 小类全选状态
      chooseDishAll: false, // 品项全选状态
      dishSearchVal: '', // 品项搜索条件
      mealStartDate: '', // 蒸制报表查询开始时间
      mealEndDate: '', // 蒸制报表查询结束时间
      currentShopInfo: {
        shopId: '',
        shopName: '',
      }, // 当前登录的店铺信息
      chooseShiftsAll: false, // 市别全选状态
      chooseAreasAll: false, // 消费区域全选状态
      shifts: [], // 当前市别数据
      areas: [], // 当前消费区域数据
      pageData: null, // page接口返回的数据
      tmpTabs: [], // 所有报表的信息{name: 'a', id: 2}
    };
  },
  computed: {
    ...mapGetters([
      'posInfo',
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
    searchForm: {
      handler(val) {
        if (this.tmpSearchForm) {
          if (
            val.businessDate !== this.tmpSearchForm.businessDate
            || val.shiftName !== this.tmpSearchForm.shiftName
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
    dishSearchVal: 'dishSearchValFunc',
  },
  methods: {
    // 观察dishSearchVal变化后的cb
    dishSearchValFunc(val) {
      if (!val) {
        this.dish = this.tmpDataCache.DS4;
        // this.dish = this.dataCache.DS4;
      } else {
        this.dish = this.dish.filter(item => item.name.indexOf(val) > -1);
      }
    },
    /**
     *  数组中的checked属性是否有false的状态
     */
    isAllChecked(arr) {
      if (!arr.length) return false;
      return !arr.some(el => el.checked === false);
    },
    /**
     *  下拉框选择事件 有bool为多选 没有为单选
     */
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
    /**
     *  过滤数组中所有选中状态
     */
    FilterToGetCheckedTrue(arr, type) {
      this[type] = this.isAllChecked(this[arr]);
      return this[arr].filter(({ checked }) => checked);
    },
    /**
     *  大类联动小类联动品项
     */
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
    /**
     *  大类过滤小类，小类过滤品项
     */
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
    /**
     *  用array[i]里的key值，把array[i]设置为Object的属性 为了不嵌套循环
     */
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
    // 搜索
    search() {
      this.tmpOperationPeople = '';
      switch (+this.moduleId) {
        case 1346:
          this.$refs.reportBusiness.search();
          break;
        case 1347:
          this.tmpOperationPeople = this.operationPeople;
          this.$refs.reportSales.search(this.tmpOperationPeople);
          break;
        case 1348:
          this.$refs.reportMeal.search();
          break;
        case 1357:
          this.$refs.settleStatisticsReport.search();
          break;
        case 1356:
          this.$refs.businessStatisticsReport.search();
          break;
        case 1349:
          this.$refs.reportBusinessBZHG.search();
          break;
        case 1352:
          this.$refs.reportBusinessQFBZ.search();
          break;
        case 1353:
          this.$refs.reportTimeQFBZ.search();
          break;
        case 1354:
          this.$refs.reportDishInfoQFBZ.search();
          break;
        case 1355:
          this.$refs.abandonReportQFBZ.search();
          break;
        case 1414:
          this.$refs.reportBusinessYK.search();
          break;
        case 1524:
          this.$refs.reportGift.search();
          break;
        case 983:
          this.$refs.reportBusinessXGSJ.search();
          break;
        case 1010:
          this.$refs.reportTimeXGSJ.search();
          break;
        default:
          break;
      }
    },
    // 营业报表的数据
    loadData(data) {
      this.dataCache = data;
    },
    // 销售报表的数据
    reportData(data) {
      data.DS2.map((item) => { // 大类
        item.checked = false;
      });
      data.DS3.map((item) => { // 小类
        item.checked = false;
      });
      data.DS4.map((item) => { // 品项
        item.checked = false;
      });
      if (!this.tmpDataCache) {
        this.tmpDataCache = Object.freeze({ ...data });
        [this.bigClass, this.smallClass, this.dish] = [data.DS2, data.DS3, data.DS4];
      }
      this.dataCache = data;
    },
    // 蒸制报表数据
    mealData(data) {
      this.dataCache = data;
    },
    // 结算统计表（XYX）数据
    settleStatisticsReport(data) {
      this.dataCache = data;
    },
    // 营业统计表（XYX）数据
    businessStatisticsReport(data) {
      this.dataCache = data;
    },
    print() {
      // 当前报表ID this.moduleId
      const printData = find(this.businessReportDate.reportList, {
        moduleId: Number(this.moduleId),
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
        if ([1346, 1347].indexOf(+this.moduleId) > -1) {
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
          startDate: this.mealStartDate,
          endDate: this.mealEndDate,
        };
        const other = {
          shift: shiftName,
          area: areaName,
          state: status,
          startDate: +new Date(this.searchForm.businessDate),
          endDate: +new Date(this.searchForm.businessDate),
        };
        const need = +this.moduleId === 1348 ? meal : other;
        let printD = {
          fileid: printData.printSet ? printData.printSet.style_id : '',
          exporttype: 1,
          printer: printData.printSet ? printData.printSet.printer : '',
          printcnt: printData.printSet ? printData.printSet.print_times : '',
          style_data: printData.printSet ? printData.printSet : '',
          DS1: [
            {
              settlePos: '',
              shopName: +this.moduleId === 1349
                ? `${this.currentShopInfo.shopId}-${this.currentShopInfo.shopName}`
                : this.businessReportDate.curShop,
              user: this.tmpOperationPeople,
              printUser: this.businessReportDate.curEmp,
              printDate: +new Date(),
              ...need,
            },
          ],
        };
        if (+this.moduleId === 1347) {
          // 如果是销售报表
          printD = extend(printD, this.filterData(this.filterArr, []));
        } else if (+this.moduleId === 1348) {
          const { mealStartDate, mealEndDate } = this;
          if (!this.verifyDate(mealStartDate, mealEndDate)) return;
          printD = extend({}, printD, {
            DS2: this.dataCache.DS2,
          });
        } else {
          printD = extend({}, printD, this.dataCache);
        }
        this.$devices.Printer.print(printD);
      } else {
        this.$message.error(this.$t('Dict.MsgTips2'));
      }
    },
    verifyDate(startDate, endDate) {
      if (startDate > endDate) {
        this.$alert(this.$t('Dict.TimeVerify'), this.$t('Dict.Tips'));
        return false;
      }
      return true;
    },
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
    /**
     *  打印相关结束
     * */
    formatDate() {
      // 转为正常时间字符串
      const date = new Date();
      const year = date.getFullYear();
      const month = addZero(date.getMonth() + 1);
      const day = addZero(date.getDate());
      // 数字不足两位，在前面补0
      function addZero(num) {
        const str = `${num}`;
        if (str.length === 1) return `0${str}`;
        return str;
      }
      return `${year}-${month}-${day}`;
    },
    initTmpTabs() {
      this.tmpTabs = [{
        moduleId: allId.REPORT_BUSINESS_ID,
        label: i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel1'),
        name: 'reportBusiness',
      }, {
        moduleId: allId.REPORT_SALES_ID,
        label: i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel2'),
        name: 'reportSales',
      }, {
        moduleId: allId.BILLED_STATEMENT_ID,
        label: i18n.t('Dict.Btn.ClosedAccount'),
        name: 'billedStatement',
      }, {
        moduleId: allId.BILLED_REPORT_ID,
        label: i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel4'),
        name: 'billedReport',
      }, {
        moduleId: allId.REPORT_BUSINESS_BZHG_ID, // 权限id
        label: `${i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel5')}（BZHG）`, // 显示text
        name: 'reportBusinessBZHG', // 路由
      }, {
        moduleId: allId.BUSINESS_STATISTICS_REPORT_ID,
        label: `${i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel6')}（XYX）`,
        name: 'businessStatisticsReport',
      }, {
        moduleId: allId.SETTLE_STATISTICS_REPORT_ID,
        label: `${i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel7')}（XYX）`,
        name: 'settleStatisticsReport',
      }, {
        moduleId: allId.REPORT_MEAL_ID,
        label: i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel8'),
        name: 'reportMeal',
      }, {
        moduleId: allId.REPORT_BUSINESS_QFBZ_ID,
        label: `${i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel1')}（QFBZ）`,
        name: 'reportBusinessQFBZ',
      }, {
        moduleId: allId.REPORT_TIME_QFBZ_ID,
        label: `${i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel10')}（QFBZ）`,
        name: 'reportTimeQFBZ',
      }, {
        moduleId: allId.REPORT_DISH_INFO_QFBZ_ID,
        label: `${i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel11')}（QFBZ）`,
        name: 'reportDishInfoQFBZ',
      }, {
        moduleId: allId.ABANDON_REPORT_QFBZ_ID,
        label: `${i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel12')}（QFBZ）`,
        name: 'abandonReportQFBZ',
      }, {
        moduleId: allId.REPORT_BUSINESS_YK_ID,
        label: i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel13'),
        name: 'reportBusinessYK',
      }, {
        moduleId: allId.REPORT_GIFT_ID,
        label: '赠送额度报表',
        name: 'reportGift',
      }, {
        moduleId: allId.REPORT_BUSINESS_XGSJ_ID,
        label: `${i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel1')}（XGSJ）`,
        name: 'reportBusinessXGSJ',
      }, {
        moduleId: allId.REPORT_TIME_XGSJ_ID,
        label: `${i18n.t('Biz.UserDesktop.SearchPrint.IndexLabel10')}（XGSJ）`,
        name: 'reportTimeXGSJ',
      }];
    },
    // 把老报表的id转换成新报表的,为了统一，省的外面一套里面一套
    transferIdOldToNew(authByModules = []) {
      const hash = {
        965: '1349',
        966: '1346',
        967: '1347',
        973: '1352',
        974: '1353',
        975: '1354',
        976: '1355',
        1399: '1357',
        1142: '1356',
        1203: '1348',
        1411: '1414',
        1518: '1524',
      };
      return authByModules.map((item) => {
        if (hash[item.id]) {
          item.id = hash[item.id];
        }
        return item;
      });
    },
    getModuleAuth(authModules = []) {
      const obj = {};
      authModules.forEach((item) => {
        obj[item.id] = item.checked;
      });
      return this.tmpTabs.filter(item => obj[item.moduleId]);
    },
    async onOpen() {
      this.itemsType = '10';
      this.activeTab = null;
      Object.assign(this.searchForm, {
        shiftName: '',
        status: '1',
        area: '',
      });
      this.operationPeople = '';
      this.tmpOperationPeople = '';
      this.currentShopInfo = JSON.parse(localStorage.getItem('currentShopInfo'));
      this.searchForm.businessDate = this.mealStartDate = this.mealEndDate = this.formatDate();
      this.initTmpTabs();
      ajax('canyin.pos.businessreport.view')
        .then((data) => {
          this.businessReportDate = data;
          const authByModules = this.transferIdOldToNew(data.authByModules);
          const tmpReportList = this.getModuleAuth(authByModules);
          this.reportList = tmpReportList.filter(
            ({ moduleId }) => {
              let arr = [];
              if (+this.posInfo.controlMode === 3) {
                arr = [1349, 1346, 1347, 1352, 1353, 1354, 1355, 1357, 1356, 1348, 1524, 983, 1010];
              } else {
                arr = [1349, 1346, 1347, 1348, 1414, 1524];
              }
              return arr.indexOf(+moduleId) > -1;
            },
          );
          this.shifts = this.addProperty(data.shifts, 'checked', false);
          this.areas = this.addProperty(data.areas, 'checked', false);
          if (this.reportList && this.reportList.length > 0) {
            this.changeTab(this.reportList[0].label, this.reportList[0].moduleId);
          }
        })
        .catch((code, msg) => {
          this.close();
          MessageBox.alert(msg, this.$t('Dict.WrongInfo'));
        });
    },
    // 切换tab
    changeTab(tabName, tabId) {
      this.activeTab = tabName;
      // 切换报表获取对应的报表Id
      this.moduleId = tabId;
      this.$nextTick(() => {
        this.search();
      });
    },
    // 关闭页面初始化
    onClose() {
      this.clearAllData();
    },
    // 清空所有数据
    clearAllData() {
      this.bigClass = [];
      this.smallClass = [];
      this.dish = [];
      this.dishSearchVal = '';
      this.tmpDataCache = null;
      this.dataCache = null;
    },
  },
  created() {},
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

.content-area {
  height: 100%;
  width: 100%;
  display: table;
  > * {
    display: table-cell;
    vertical-align: top;
    position: relative;
  }
}

.category-list {
  /*width: 112px;*/
  width: 130px;
  background-color: @white;
  box-shadow: 6px 0px 8px #777;
  z-index: 1;
  .tab-item {
    color: #666;
    font-size: 14px;
    line-height: 3.7;
    text-align: center;
    cursor: pointer;
    word-break: break-word;
    &.active {
      background-color: #ddf1f6;
      color: #0babb9;
    }
  }
}

.report-area {
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: #f5f5f5;
  padding: 16px;
  height: 100%;
}

.search-area {
  border-bottom: 1px solid #b5b5b5;
  padding-bottom: 10px;
  .el-form-item {
    margin-bottom: 1px;
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
}
</style>
