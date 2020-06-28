<template>
  <div class="pos-order-tables-list">
    <TablesFilter
      :tables="tables"
      @changeAreas="changeAreas"
      @changeStates="changeStates"
    ></TablesFilter>
    <Paging
      :data="pagerTables"
      :active.sync="activePoint"
      :itemWidth="126"
      :itemHeight="86"
      @change="tablePagingChange"
      class="pos-order-tables-list-ul"
      :class="{'bigContinuedBillTag': isbigContinuedBillTag}"
      ref="tableList"
      id="orderTablesList"
       v-autotest
    >
      <div :class="{ 'table-active-yellow': config.tableActiveYellow }" slot-scope="props">
        <button type="button"
          :class="[
            'state-' + tableStateClassName(props.item.state),
            { 'active': props.item.id == activePoint.id },
            {'xianshang': props.item.state != 1 && props.item.orderType &&
            props.item.orderType >= 3 && props.item.orderType != 5},
            {'spend-timeout-alter': isShowTableTimeOutAlert(props.item)}
          ]"
          @click="clickHandler(props.item)"
          v-if="props.item.state != 1 && props.item.state != 4"
        >
          <!-- orderType 为 5 是桌边付类型 -->
          <span class="onlinePoint">{{$t('Biz.Order.OnlinePoint')}}</span>
          <strong>{{ props.item.name }}</strong>
          <ul>
            <li v-html="tableTemplate('B1', props.item)"></li>
            <li v-html="tableTemplate('B3', props.item)"></li>
            <li v-html="tableTemplate('C1', props.item)"></li>
            <li v-html="tableTemplate('C3', props.item)"></li>
            <li v-html="tableTemplate('D1', props.item)"></li>
            <li v-html="tableTemplate('D3', props.item)"></li>
          </ul>
        </button>
        <button type="button" v-autotest
          :class="[{ 'active': props.item.id == activePoint.id },
          'state-' + tableStateClassName(props.item.state),]"
          @click="clickHandler(props.item)"
          v-else
        >
          <p class="seat-code"
            v-show="props.item.state == 1">{{ props.item.code }}</p>
          <strong>{{ props.item.name }}</strong>
          <ul>
            <li>
              <div class="peopleInfo vacancy">
                <i class="icon icon-user"></i>0/{{ props.item.defaultCapacity }}
              </div>
            </li>
            <li v-if="props.item.state == 4">
              <!-- 如果是预订客位(看做空闲客位+写死的显示预订人) -->
              <div class="peopleInfo vacancy" v-html="tableTemplate('C3', props.item)"></div>
            </li>
            <li v-if="props.item.state == 4" class="booking-phone">
              <div v-html="tableTemplate('D3', props.item)"></div>
            </li>
            <li
              v-if="
                `${props.item.state}` === '4'
                && props.item.bookingTimes
                && Number(props.item.bookingTimes) > 1
              "
              class="booking-phone"
            >
              <div v-html="tableTemplate('D1', props.item)"></div>
            </li>
            <li class="booking-deposit" v-if="props.item.state == 4 && props.item.deposit!==0">
              {{$t('Dict.Btn.Deposit')}}{{props.item.deposit}}
            </li>
          </ul>
        </button>
      </div>
    </Paging>
    <div class="pos-order-tables-control">
      <Search
        ref="searchComp"
        @search="onSearch"
        :defaultKeyBoardPage="defaultKeyBoardPage"
        searchId="searchTables"
        :resultLength="pagerTables.length"
      ></Search>
      <PagingBtn
        :showInfo="true"
        arrowDirection="up-down"
        class="pos-order-tables-pager"
        ref="posOrderTablesPager"
      ></PagingBtn>
    </div>
  </div>
</template>

<script>
import {
  map, template, cloneDeep, find, first, isEmpty,
} from 'lodash';
import { mapGetters, mapMutations, mapActions } from 'vuex';
import * as tableState from '@/common/dictionary/pos-order-table-state';
import * as tableDictionary from '@/common/dictionary/pos-order-table-dictionary';
import TablesFilter from './Filter';
import Search from './Search';
import Paging from '@/components/Pos/Common/Paging';
import PagingBtn from '@/components/Pos/Common/PagingBtn';
import tableStyleTemplateFn from './table-style-template';
import dateFormat from '@/common/js/dateformat';
import ajax from '@/common/js/ajax';
import quickSearch from '@/common/js/quicksearch';

export default {
  components: {
    TablesFilter,
    Search,
    Paging,
    PagingBtn,
  },
  data() {
    return {
      // 客位数据词典
      tableDictionary,
      // 客位列表
      // 选中的客位区域列表，空代表全选
      areasFilter: '',
      // 选中的客位状态列表，空代表全选
      statesFilter: 0,
      // 快速查找文字
      searchText: '',
      upDateSpendTimeTimer: null,
      // defaultKeyBoardType: 'num',
      defaultKeyBoardPage: 3, // 是加单还是客位页面设置的软键盘
    };
  },
  computed: {
    ...mapGetters([
      'config',
      'posDevice',
      'posTables',
      'posBooking',
      'getPointsLastModifyTime',
      'posSettings',
      'getVuexPointData',
      'posOrderBill',
      'getVuexPosMode',
      'pointContentLayout', // 客位框上显示信息的自定义数据,
      'posBaseInfo',
      'getIsbatchOperation',
    ]),
    isbigContinuedBillTag() {
      return this.config.bigContinuedBillTag;
    },
    quickSearchText() {
      return quickSearch((`${this.searchText}`).toLowerCase());
    },
    // this.posSettings.isShowSpendTimeOutAlert
    // || pointContentLayoutStr.indexof('diningTime') != '-1'
    // 是否要去请求更新消费时长的接口,来更新客位的消费时长
    isNeedRequestDningTime() {
      const pointContentLayoutStr = JSON.stringify(this.pointContentLayout);
      // 更新消费时长的数据需要判断,如果需要非快餐模式下,并且是显示消费时长的话或者是消费时长的超时提醒
      return this.getVuexPosMode != 3 && (this.posSettings.isShowSpendTimeOutAlert || pointContentLayoutStr.indexOf('diningTime')　!= '-1');
    },
    // 对过来的数据进行处理
    tables() {
      // 克隆下不想对原有的vuex数据添加一些无用的东西
      const newTables = cloneDeep(this.posTables);
      // 遍历预订单数据
      newTables.forEach((table) => {
        if (table.state === tableState.BOOKING) {
          table.state = 1;
        }
        // 转换时间格式
        if (this.posBooking
          && !isEmpty(this.posBooking.reservePointMap)
          && this.posBooking.reservePointMap[table.id]
        ) {
          // 当客位状态空闲，或者预订客位进行预订开台时显示押金 -- 禅道121405
          table.deposit = table.state === 1 || table.orderType === 2 ? this.posBooking.reservePointMap[table.id].deposit : ''; // 押金
          // 添加 预订客位相关数据
          table.bookingInfo = this.posBooking.reservePointMap[table.id];
          // 修改客位状态为预订状态
          if (!table.bsId) {
            table.state = tableState.BOOKING;
          }
          // 更新预订的次数
          table.bookingTimes = this.posBooking.reservePointMap[table.id].bookingTimes;
        } else {
          table.bookingInfo = null;
        }
        if (table[tableDictionary.OPENTIME]) {
          const t = table[tableDictionary.OPENTIME].replace('T', ' ');
          table.openTimeStr = dateFormat('%H:%I', new Date(t));
        }
      });
      // newTables.filter(item => this.checkFilter(item))
      return newTables;
    },
    // 分页过滤的数据
    pagerTables() {
      return this.tables.filter(item => this.checkFilter(item));
    },
    // 点击的客位信息,当前操作的客位信息
    activePoint: {
      get() {
        return this.getVuexPointData ? this.getVuexPointData : {};
      },
      set(newPoint) {
        this.setPosPointData(newPoint);
      },
    },
    // getVuexPointData
  },
  created() {
    // 更新客位显示状态 isDoNewWs 是否执行新的改造推送
    this.$vonce('updatePoint', (callback, isDoNewWs) => {
      console.log(callback, isDoNewWs);
      // 小卖模式下不要走一下逻辑
      if (+this.getVuexPosMode === 3 || !isDoNewWs) {
        return false;
      }
      ajax('canyin.pos.reception.receptionbusiness.incrpointlist', {
        params: {
          lastModifyTime: this.getPointsLastModifyTime,
        },
        loading: false,
      }).then((data) => {
        if (data.points && data.points.length) {
          this.setPosPOintLastModifyTime(data.lastModifyTime);
          this.updatePointState(data.points, callback);
        }
      }).catch(() => {});
      return undefined;
    });
    // 整体刷新客位
    // this.$von('updatePoint', () => {
    //   ajax('canyin.pos.reception.receptionbusiness.receptionbusiness').then(data => {
    //     this.setOrderTables(data.tableInfo.tables)
    //   })
    // })

    // 重置订单搜索
    this.$von('resetOrderSearchText', () => {
      if (this.$refs.searchComp) {
        this.$refs.searchComp.clearSearchText();
      }
    });

    // 订单搜索文字添加
    this.$von('addOrderSearchTextdInBlur', (key) => {
      if (this.$refs.searchComp) {
        this.$refs.searchComp.addWordInBlur(key);
      }
    });

    // 订单搜索文字添加
    this.$von('delOrderSearchTextdInBlur', () => {
      if (this.$refs.searchComp) {
        this.$refs.searchComp.delWordInBlur();
      }
    });

    this.$von('tableSelect', (direction) => {
      this.$refs.tableList.select(direction);
    });

    this.$von('bindTablesPager', () => {
      if (this.$refs.posOrderTablesPager) {
        this.selectFirstTable();
        this.$refs.posOrderTablesPager.bind(this.$refs.tableList);
      }
    });
    // 结班/退出之后清除定时器
    this.$von('clearUpDateSpendTimeTimer', () => {
      clearInterval(this.upDateSpendTimeTimer);
    });
  },
  mounted() {
    this.$von('posOrderTablesListInitPager', () => {
      if (this.$refs.tableList) {
        this.$refs.tableList.refresh();
      }
    });
    // 清除定时器
    clearInterval(this.upDateSpendTimeTimer);
  },
  beforeDestroy() {
    clearInterval(this.upDateSpendTimeTimer);
  },
  methods: {
    // 消费超时提醒 isShowSpendTimeOutAlert是否开启消费超时的提醒
    isShowTableTimeOutAlert(point) {
      // console.log(point)
      return this.posSettings.isShowSpendTimeOutAlert
      && Number(point.spendTime) >= Number(this.posSettings.spendTimeLimit);
    },
    // 客位点击事件
    clickHandler(table) {
      this.setCurrentPointId(table.id); // 设置当前客位id
      // 再次点击则进入加单 添加非空闲状态的客位 (如果处于多次结算下的批量操作状态不进加单)
      if (this.activePoint.id === table.id && table.state !== tableState.VACANCY
      && table.state !== tableState.BOOKING && !this.getIsbatchOperation) {
        this.$nextTick(() => {
          this.$vemit('control_addorder');
        });
      }
      // 添加index为了防止pointId有相同的
      // // let { ...copyPoint } = table
      if (table.state === tableState.VACANCY) {
        // 当状态为【空闲】时执行开台
        this.getOrderBill({ list: null });
        this.setPosPointData(table);
        this.$vemit('posAddBill', table);
      } else if (table.state === tableState.OCCUPY) {
        this.$vemit('loadBill', table.id);
        // 储存下客位信息
        // this.activePoint = table
        // if(table.lastTotal) {
        //   this.$devices.CDI.price(table.lastTotal);      // 点击客位的时候更新客显
        // }
        this.setPosPointData(table);
        // 客显-根据设置推送
        if (this.posDevice.enableScreen) {
          this.$devices.CDI.price(table.lastTotal); // 点击客位的时候更新客显
        }
      } else if (table.state === tableState.CHECK_BILL) {
        this.$vemit('loadBill', table.id);
        if (this.posDevice.enableScreen) {
          this.$devices.CDI.price(table.lastTotal); // 点击客位的时候更新客显
        }
        // 储存下客位信息
        this.setPosPointData(table);
      } else if (table.state === tableState.BOOKING) {
      // 预订客位操作
        // 存储当前点击客位信息
        this.setPosPointData(table);

        /**
         * 预订业务屏蔽多平台对接(食尚订/新荣记/客必得) 交互和写活功能,
         * */
        // 新荣记 对接预订平台业务, 禁用线下预订客位的所有操作
        if (this.posBooking.bookedPlatform && +this.posBooking.bookedPlatform === 5) {
          this.$alert(
            this.$t('Biz.Order.LongMsg003'),
            this.$t('Dict.Tips'),
            { confirmButtonText: this.$t('Dict.Sure') },
          );
          return false;
        }
        // 提示 进行执行操作
        if (this.posBaseInfo.isReservePointOnlyInOpenTheStage === '1') { // 总部勾选‘预订客位只能预订开台’
          this.$confirm(this.$t('Biz.Order.LongMsg042'), this.$t('Dict.Tips'), {
            confirmButtonText: this.$t('Dict.Sure'),
            type: 'warning',
            closeOnClickModal: false,
          }).then(() => {
            // 点击'确定',调用接口,传参: this.getVuexPointData-当前点击客位信息,
            // this.posBooking.reservePointMap-客位预订的相关信息
            this.bookPointDoReserve(
              this.getVuexPointData.id,
              this.posBooking.reservePointMap,
            );
          });
        } else { // 总部未进行勾选，原有流程
          this.$confirm(this.$t('Biz.Order.LongMsg004'), this.$t('Dict.Tips'), {
            confirmButtonText: this.$t('Dict.Sure'),
            cancelButtonText: this.$t('Dict.Cancel'),
            type: 'warning',
            closeOnClickModal: false,
            distinguishCancelAndClose: true,
          }).then(() => {
            // 点击'确定',调用接口,传参: this.getVuexPointData-当前点击客位信息,
            // this.posBooking.reservePointMap-客位预订的相关信息
            this.bookPointDoReserve(
              this.getVuexPointData.id,
              this.posBooking.reservePointMap,
            );
          }).catch((action) => {
            // 点击取消按钮执行操作，点击X号直接关闭提示
            if (action === 'cancel') {
              // 点击'取消', 执行开台
              this.getOrderBill({ list: null });
              // this.setPosPointData(table)
              this.$vemit('posAddBill', table);
            }
          });
        }
      } else if (table.state === tableState.PRE_PAY) {
        this.$vemit('loadBill', table.id);
        if (this.posDevice.enableScreen) {
          this.$devices.CDI.price(table.lastTotal); // 点击客位的时候更新客显
        }
        // 储存下客位信息
        this.setPosPointData(table);
      } else if (table.state === tableState.LOCK) {
        this.$vemit('loadBill', table.id);
        if (this.posDevice.enableScreen) {
          this.$devices.CDI.price(table.lastTotal); // 点击客位的时候更新客显
        }
        // 储存下客位信息
        this.setPosPointData(table);
      } else if (table.state === tableState.CLEAR) { // ??
        this.$vemit('loadBill', table.id);
        if (this.posDevice.enableScreen) {
          this.$devices.CDI.price(table.lastTotal); // 点击客位的时候更新客显
        }
        // 储存下客位信息
        this.setPosPointData(table);
      }
      return undefined;
    },
    // 点击关闭开台模块
    closeDialog() {
      this.$el.focus();
    },
    // formatSpendTime(spendTime) {
    //   let tablespendTime = spendTime
    //   //这个是传来的是分钟数,如果大于60显示1:03
    //   if (data.spendTime > 60) {
    //     let minuteNum = (data.spendTime % 60) < 10 ? '0'
    // + data.spendTime % 60 : data.spendTime % 60
    //     tablespendTime = Math.floor(data.spendTime / 60) + ':' + minuteNum
    //   }
    // },
    // 客位模板 position：位置 data：数据
    tableTemplate(position, data) {
      const pointData = cloneDeep(data);
      // 根据位置获取插槽类型
      const type = this.pointContentLayout[position];
      if (type) {
        const tableStyleTemplate = tableStyleTemplateFn();
        // 判断是都是消费时长,后台是否允许了显示消费时长this.posSettings.isShowSpendTime
        if (type === 'diningTime') {
          let tablespendTime = data.spendTime;
          // 这个是传来的是分钟数,如果大于60显示1:03
          if (data.spendTime > 60) {
            const minuteNum = (data.spendTime % 60) < 10 ? `0${data.spendTime % 60}` : data.spendTime % 60;
            tablespendTime = `${Math.floor(data.spendTime / 60)}:${minuteNum}`;
          }
          this.$set(pointData, 'spendTime', tablespendTime);
        }
        // 消费金额  isNPosShowMoney == 1 && 仅在收银模式 显示
        if (type === 'billAmount') {
          this.$set(pointData, 'isShowBillAmount', true);
          // 如果开启了仅在收银模式下显示，那么录单模式下应不显示
          if (this.posBaseInfo.isNPosShowMoney && `${this.getVuexPosMode}` !== '1') {
            this.$set(pointData, 'isShowBillAmount', false);
          }
        }
        if (type === 'bookingName') {
          if (pointData.bookPerson === null || pointData.bookPerson === undefined) {
            this.$set(pointData, 'bookPerson', '');
          } else {
            this.$set(pointData, 'bookPerson', pointData.bookPerson);
          }
        }
        // 相应模板见 ./table-style-template.js
        // 本方法为 数据调用相应模板渲染样式和内容, 这里判断当 客位为非预订状态时(包含预订客位的常规开台,和预订开台,和埋单,和预付等状态), 不显示预订人
        // if (pointData.state !== 4 && type === 'bookingName') {
        //   return '';
        // }
        // 排出上述条件其他 正常显示(包含客位预订状态)
        // 预订客位 的 'D3'位置 固定显示为预订人(金立敏需求), 不做后台设置显示内容的判断
        if (pointData.state === 4) {
          if (position === 'C3') {
            return template(tableStyleTemplate.bookingName)(pointData);
          }
          if (position === 'D3') {
            return template(tableStyleTemplate.bookingPhone)(pointData);
          }
          if (position === 'D1') {
            return template(tableStyleTemplate.bookingTimes)(pointData);
          }
        }
        if (type === 'bookingTimes') {
          if (!pointData[type]) {
            return '';
          }
        }
        return template(tableStyleTemplate[type])(pointData);
      }
      return '';
    },
    // 选择区域时触发
    changeAreas(value) {
      // 更新选中区域数据
      this.areasFilter = value;
      // 刷新客位数据
      this.refreshTableData();
    },
    // 选中状态时触发
    changeStates(value) {
      // 更改选中状态数据
      this.statesFilter = value;
      // 刷新客位数据
      this.refreshTableData();
    },
    // 监听搜索框的搜索事件
    onSearch(searchText) {
      this.searchText = searchText.toLowerCase();
      this.$nextTick(() => {
        this.refreshTableData();
      });
    },
    // 刷新客位数据
    refreshTableData() {
      // 默认第一个客位
      this.throttle(this.selectFirstTable)();
      // 刷新分页组件
      if (this.$refs.tableList) {
        this.$refs.tableList.refresh();
      }
    },
    // 节流函数
    throttle(fn, interval = 200) {
      let timer;
      return () => {
        const self = this;
        const args = arguments;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          fn.apply(self, args);
        }, interval);
      };
    },
    tablePagingChange(active) {
      if (active) {
        if (active.state === tableState.VACANCY) {
          this.getOrderBill({ list: null });
        } else {
          this.$vemit('loadBill', active.id);
        }
      }
    },
    // 判断是否显示
    checkFilter(item) {
      // 检测区域筛选、状态筛选、快速查找文字
      return this.checkAreasFilter(item)
        && this.checkStatesFilter(item)
        && this.checkSearchText(item);
    },
    // 检测区域筛选
    checkAreasFilter(item) {
      return this.areasFilter === '' || this.areasFilter === item[tableDictionary.AREAID];
    },
    // 检测状态筛选
    checkStatesFilter(item) {
      return this.statesFilter === 0 || this.statesFilter === item[tableDictionary.STATE];
    },
    // 根据code name pinyin过滤客位
    checkSearchText(item) {
      const keyFilters = this.quickSearchText;
      let resultItem;
      for (let i = 0; i < keyFilters.length; i += 1) {
        const key = keyFilters[i];
        if (String(item.code).toLowerCase().indexOf(key) !== -1
        || item.pinyin.toLowerCase().indexOf(key) !== -1
        || item.name.toLowerCase().indexOf(key) !== -1) {
          resultItem = true;
        }
      }
      return !keyFilters.length || resultItem;
    },
    // 筛选默认第一个客位
    selectFirstTable() {
      // 限制在客位路由
      if (this.$router.history.current.name !== 'order') {
        return;
      }
      const firstTable = first(this.pagerTables);
      // 相同客位不执行更新
      // 排除 搜索内容匹配对象为空时
      if (!firstTable) {
        return;
      }
      if (this.activePoint.id === firstTable.id) {
        return;
      }
      // 存储已选客位
      this.activePoint = firstTable;
      // 读取和选中客位和账单
      if (firstTable) {
        this.setPosPointData(firstTable);
        if (firstTable.state === tableState.VACANCY) {
          this.getOrderBill({ list: null });
        } else {
          this.$vemit('loadBill', firstTable.id, null, true);
        }
      }
    },
    // 根据状态提供客位的 class 名
    tableStateClassName(state) {
      if (state === tableState.VACANCY) {
        return 'vacancy';
      } if (state === tableState.OCCUPY) {
        return 'occupy';
      } if (state === tableState.CHECK_BILL) {
        return 'check-bill';
      } if (state === tableState.BOOKING) {
        return 'booking';
      } if (state === tableState.LOCK) {
        return 'lock';
      } if (state === tableState.PRE_PAY) {
        return 'pre-pay';
      } if (state === tableState.CLEAR) {
        return 'clear';
      }
      return undefined;
    },
    ...mapMutations({
      setPosPointData: 'SET_POS_POINT_DATA',
      setPosPOintLastModifyTime: 'SET_POIONTS_LAST_MODIFY_TIOME',
      updateTables: 'UPDATE_TABLES',
    }),
    ...mapMutations(['setCurrentPointId']),
    ...mapActions([
      'getOrderBill',
    ]),
    // 更新客位状态
    updatePointState(updatePoints, callback) {
      // if (
      //   this.$route.name === 'order'
      //   && this.posOrderBill
      //   && this.posOrderBill.bsData
      //   && find(updatePoints, {
      //     id: this.posOrderBill.bsData.pointId,
      //     state: tableState.VACANCY,
      //   })
      // ) {
      //   this.getOrderBill({ list: null });
      // }
      this.updateTables(updatePoints);
      if (callback) {
        callback();
      }
    },
    hasClass(elements, cName) {
      return !!elements.className.match(new RegExp(`(\\s|^)${cName}(\\s|$)`)); // ( \\s|^ ) 判断前面是否有空格 （\\s | $ ）判断后面是否有空格 两个感叹号为转换为布尔值 以方便做判断
    },
    addClass(elements, cName) {
      // 拼接添加
      elements.className += ` ${cName}`;
    },
    removeClass(elements, cName) {
      elements.className = elements.className.replace(new RegExp(`(\\s|^)${cName}(\\s|$)`), ' '); // replace方法是替换
    },
    // 预订客位-执行(开台下单)
    bookPointDoReserve(pointId, reserveData) {
      let url = 'canyin.pos.booking.doreserve';
      // 上传数据
      const upData = {
        pointId,
        reserveId: reserveData[pointId].reserveId,
      };
      // 如果'reserveData'为多个值, 即为团队预订, 改变_url
      if (+reserveData[pointId].reservePointCount > 1) {
        url = 'canyin.pos.booking.doreserveteam';
      }
      ajax(url, {
        contentType: 'URIEncodedToken',
        needToken: true,
        data: upData,
      }).then((res) => {
        if (res.success) {
          // 提示
          this.$message({
            message: this.$t('Biz.Booking.BookTip35'),
            type: 'success',
          });
          // 非团队成功后需要跳到加单界面
          // if (!(+reserveData[pointId].reservePointCount > 1)) {
          this.goOrdering(pointId, reserveData[pointId].reserveId);
          // }
        } else {
          // 提示
          this.$message({
            message: this.$t('Biz.Order.BookOrderFailureMsg'),
            type: 'warning',
          });
        }
      });
    },
    goOrdering(pointId, orderId) {
      // 刷新账单,并直接跳转到加单界面
      this.$vemit('loadBill', pointId, {
        callback: () => {
          this.$vemit('control_addorder', pointId, orderId);
        },
        tableState: 1,
      });
    },
    // 打开消费时长请求的定时器
    openSpendTime(isOpen = false) {
      // 满足了开启定时更新消费时长的条件
      if (this.isNeedRequestDningTime) {
        clearInterval(this.upDateSpendTimeTimer);
        this.upDateSpendTimeTimer = null;
        // 如果打开
        if (isOpen) {
          this.upDateSpendTimeTimer = setInterval(() => {
            this.$emit('updateTables');
          }, 60000);
        }
      }
    },
  },
  watch: {
    isNeedRequestDningTime(val) {
      clearInterval(this.upDateSpendTimeTimer);
      // 如果满足了需要消费时长的条件话,就开启定时请求更新消费时长
      if (val) {
        this.upDateSpendTimeTimer = setInterval(() => {
          this.$emit('updateTables');
        }, 60000);
      }
    },
    'memberPicker.callListDateVal': {
      handler() {
        // 调用接口, 跟新来电列表及用户预订信息数据
        this.getIncomingCallsList();
      },
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

// Component Pos/Order/Tables/List

//== tables list padding top
@pos-order-tables-list-padding-top: 8px;

//== tables item

//** width for large screen
@pos-order-table-lg-width: 10%;
//** height
@pos-order-table-height: 90px;
//** padding horizontal
@pos-order-table-padding-horizontal: 5px;
//** title height
@pos-order-table-title-height: 24px;
//** title font size
@pos-order-table-title-font-size: 16px;
//** title text shadow
@pos-order-table-title-text-shadow: 1px 1px 1px #666;
//** slot height
@pos-order-table-slot-height: 20px;
//** slot font size
@pos-order-table-slot-font-size: 12px;

@pos-order-tables-btn-vacancy-bg: #51b063;

@pos-order-tables-btn-vacancy-active-bg: #3ecc58;
@keyframes occupyTimeOutBink {
  from {
    background-color: #F8D1D1;
  }
  to {
    background-color:@pos-order-table-state-occupy-color;
  }
}

@-webkit-keyframes occupyTimeOutBink {
  from {
    background-color: #F8D1D1;
  }
  to {
    background-color: @pos-order-table-state-occupy-color;
  }
}
@keyframes coverTimeOutBink {
  from {
    background-color: #DCC9EB;
  }
  to {
    background-color: @pos-order-table-state-check-bill-color;
  }
}

@-webkit-keyframes coverTimeOutBink {
  from {
    background-color: #DCC9EB;
  }
  to {
    background-color: @pos-order-table-state-check-bill-color;
  }
}

@keyframes prePayTimeOutBink {
  from {
    background-color: #ffd675;
  }
  to {
    background-color: @pos-order-table-state-pre-pay-color;
  }
}

@-webkit-keyframes prePayTimeOutBink {
  from {
    background-color: #ffd675;
  }
  to {
    background-color: @pos-order-table-state-pre-pay-color;
  }
}
.pos-order-tables-list {
  position: relative;
  height: 100%;
  padding-top: 116px;
  padding-bottom: @pos-order-tables-control-height + 10;
}

.pos-order-tables-list-ul {
  height: 100%;
  margin-left: @pos-order-table-space / -2;
  margin-right: @pos-order-table-space / -2;
  transition: transform 0.2s;
  .clearfix();

  > li {
    .booking-deposit{
      line-height: 1;
      text-align: right;
      width: 100%;
    }
    > div > button {
      display: block;
      .size(100%, 84px);
      padding: 0 @pos-order-table-padding-horizontal;
      border: none;
      background: none;
      background-color: @pos-order-tables-btn-vacancy-bg;
      position: relative;
      >.onlinePoint {
        position: absolute;
        left: 5px;
        top: 5px;
        color: #fff;
        font-size: 12px;
        display: none;
      }
      .seat-code {
        width: 50px;
        position: absolute;
        top: 0px;
        color: #fff;
        font-size: 12px;
        text-align: left;
        .text-overflow();
      }
      > strong {
        display: block;
        height: @pos-order-table-title-height;
        line-height: @pos-order-table-title-height;
        font-size: @pos-order-table-title-font-size;
        text-align: center;
        color: white;
        font-weight: normal;
        .text-overflow();
      }
      > ul {
        .clearfix();

        > li {
          float: left;
          .size(50%, @pos-order-table-slot-height);
          line-height: @pos-order-table-slot-height;
          font-size: @pos-order-table-slot-font-size;
          color: white;
        }
      }
      &.active {
        background-color: @pos-order-tables-btn-vacancy-active-bg;
        border: 1px solid #ffffff;
      }
      &.state-occupy {
        background-color: @pos-order-table-state-occupy-color;
        &.active {
          background-color: @pos-order-table-state-occupy-active-color;
        }
        &.spend-timeout-alter {
          animation: occupyTimeOutBink 1.2s infinite;
        }
      }

      &.state-check-bill {
        background-color: @pos-order-table-state-check-bill-color;
        &.active {
          background-color: @pos-order-table-state-check-bill-active-color;
        }
        &.spend-timeout-alter {
          animation: coverTimeOutBink 1.2s infinite;
        }
      }

      &.state-pre-pay {
        background-color: @pos-order-table-state-pre-pay-color;
        &.active {
          background-color: @pos-order-table-state-pre-pay-active-color;
        }
        &.spend-timeout-alter {
          animation: prePayTimeOutBink 1.2s infinite;
        }
      }

      &.state-lock {
        background-color: @pos-order-table-state-lock-color;
        &.active {
          background-color: @pos-order-table-state-lock-active-color;
        }
      }

      &.state-clear {
        background-color: @pos-order-table-state-clear-color;
        &.active {
          background-color: @pos-order-table-state-clear-active-color;
        }
      }

      &.state-booking {
        background-color: @pos-order-table-state-booking-color;
        &.active {
          background-color: @pos-order-table-state-booking-active-color;
        }
        .booking-phone {
          width: 100%;
          text-align: right;
        }
      }
      &.xianshang {
        >.onlinePoint {
          display: block;
        }
        > strong {
          width: 84px;
          float: right;
        }
      }
    }

    > div.table-active-yellow > button.active {
      border: none;
      box-shadow: inset 0 0 5px 7px #ffd306;
    }
  }
}

.pos-order-tables-control {
  position: absolute;
  bottom: 0;
  left: 0;
  .size(100%, @pos-order-tables-control-height);
  padding-right: @pos-order-tables-pager-width;
}

.pos-order-tables-pager {
  position: absolute;
  right: 0;
  top: 0;
}
</style>

<style lang="less">
@import "~@/common/less/variables.less";
@import "~@/common/less/mixins.less";

// Component Pos/Order/Tables/List

//== pager style

.pos-order-tables-control > .pos-order-tables-pager.pager > button {
  background-color: rgba(237, 254, 255, 0.5);
  color: #273844;
  border: none;
}

//== tables item

//** text flag

//**** height
@pos-order-table-text-flag-height: 18px;
//**** padding horizontal
@pos-order-table-text-flag-padding-horizontal: 4px;
//**** scaling ratio in special
@pos-order-table-text-flag-scaling-ratio: 0.85;

//** icon size
@pos-order-table-icon-size: 12px;

//** people info

//**** vacancy color
@pos-order-table-people-info-vacancy-color: #eee;
//**** occupy color
@pos-order-table-people-info-occupy-color: #ccc;

.pos-order-tables-list-ul > li {
    float: left;
    width: @pos-order-table-width;
    padding-left: @pos-order-table-space / 2;
    padding-right: @pos-order-table-space / 2;
    margin-bottom: @pos-order-table-space;

  > div > button {
    position: relative;
    > i {
      position: absolute;
      top: -10px;
      right: -10px;
      z-index: 1;
      color: #ea5a6e;
      font-size: 20px;
      &.icon-duihao2::before {
        background: white;
        border-radius: 50%;
      }
    }
    > ul > li {
      > div {
        height: 20px;
        line-height: 20px;
        .text-overflow();
        &.serveDishes > .icon-serve-dishes {
          font-size: 12px;
        }
        &.textOverHidden {
          text-overflow: clip;
        }
        &.billInfo,
        &.groupInfo,
        &.vip > span,
        &.continued > span {
          height: @pos-order-table-text-flag-height;
          line-height: @pos-order-table-text-flag-height;
          padding-left: @pos-order-table-text-flag-padding-horizontal;
          padding-right: @pos-order-table-text-flag-padding-horizontal;
          display: inline-block;
          background-color: @white;
          border-radius: @pos-order-table-text-flag-height / 2;
          -webkit-transform: scale(@pos-order-table-text-flag-scaling-ratio);
          transform: scale(@pos-order-table-text-flag-scaling-ratio);
        }
        &.vip > span,
        &.continued > span{
          background-color: #dfb14f;
          color: #fff;
          font-weight: bold;
          padding-left: 8px;
          padding-right: 8px;
        }
        &.continued > span {
          font-weight:normal;
          padding-left:10px;
          padding-right:10px;
          height:18px;
          line-height:18px;
          font-size:13px;
        }
        &.peopleInfo {
          > i.icon {
            font-size: @pos-order-table-icon-size;
            vertical-align: top;
          }
          > em {
            font-style: normal;
            color: @white;
          }

          &.vacancy {
            color: @pos-order-table-people-info-vacancy-color;
          }
        }

        &.startTime,
        &.diningTime {
          color: @white;

          > i.icon {
            font-size: @pos-order-table-icon-size;
            vertical-align: top;
          }
        }
        &.bookingTimesHide {
          display: none;
        }

        &.code .logo {
          vertical-align: baseline;
          text-shadow: 2px 0 5px #000;

          &.icon-huangguan {
            color: #f3d865;
          }
          &.icon-dangao {
            font-weight: bold;
            color: #f3d865;
          }
        }

        > .bookingStateTimes {
          height: 18px;
          line-height: 18px;
          padding-left: 4px;
          padding-right: 4px;
          display: inline-block;
          background-color: #fff;
          border-radius: 9px;
          -webkit-transform: scale(0.85);
          transform: scale(0.85);
          color: #35aee1;
        }
        > .bookingTimesHide {
          display: none;
        }
      }

      &:nth-child(odd) {
        text-align: left;
      }

      &:nth-child(even) {
        text-align: right;
      }
    }

    &.state-occupy {
      > ul > li {
        > div {
          &.billInfo,
          &.groupInfo {
            color: @pos-order-table-state-occupy-color;
          }

          &.peopleInfo {
            color: @pos-order-table-people-info-occupy-color;
          }
        }
      }
    }

    &.state-check-bill {
      > ul > li {
        > div {
          &.billInfo,
          &.groupInfo {
            color: @pos-order-table-state-check-bill-color;
          }
        }
      }
    }

    &.state-pre-pay {
      > ul > li {
        > div {
          &.billInfo,
          &.groupInfo {
            color: @pos-order-table-state-pre-pay-color;
          }
        }
      }
    }

    &.state-lock {
      > ul > li {
        > div {
          &.billInfo,
          &.groupInfo {
            color: @pos-order-table-state-lock-color;
          }
        }
      }
    }

    &.state-clear {
      > ul > li {
        > div {
          &.billInfo,
          &.groupInfo {
            color: @pos-order-table-state-clear-color;
          }
        }
      }
    }
    
    &.state-booking {
      > ul > li {
        > div {
          &.billInfo,
          &.groupInfo {
            color: @pos-order-table-state-booking-color;
          }
        }
      }
    }
  }
}
.pos-order-tables-list-ul.bigContinuedBillTag > li > div > button > ul > li > div.continued {
  margin-top: -6px;

  > span {
    height: 22px;
    line-height: 22px;
    font-size: 15px;
    font-weight: bold;
    border-radius: 11px;
    color: #111;
  }
}
</style>
