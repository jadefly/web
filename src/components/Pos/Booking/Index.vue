<template>
  <div
    ref="bookingComponent"
    class="booking-container"
    :class="{'booking-container-fold': !leftAreaFold }"
  >
    <!-- 左侧列表区 -->
    <div class="booking-leftArea">
      <button
        class="foldBtn icon"
        v-show="isFoldBtn"
        :class="leftAreaFold == true ? 'icon-shuangjiantouzuo':'icon-shuangjiantouyou foldBtn-off'"
        :style="{top:(memberInfoOrListActive&&comingCallPathsTabs.length>1)||(!memberInfoOrListActive&&comingCallShow)?'55px':'20px'}"
        @click="leftAreaFold = !leftAreaFold"
      ></button>
      <div
        v-show="leftAreaFold"
        class="booking-leftArea-centent">
        <!-- 切换1-1 预订用户信息 -->
        <div
          v-show="memberInfoOrListActive"
          class="memberCallInfo"
        >
          <div class="memberCallInfo-title">
            <p class="phoneLogo icon icon-telephone"></p>
            <span class="phoneNumber">
              {{ memberInfoList.mobile
                  ? memberInfoList.mobile
                  : memberInfoList.contactTel
                    ? memberInfoList.contactTel
                    : currCalledListItem.telNo }}
            </span>
            <p class="memberName">
              {{ memberInfoList.name
                  ? memberInfoList.name
                    : memberInfoList.bookperson
                    ? memberInfoList.bookperson : '' }}
              <em>
                <!-- 判断,为空不显示,或先生女士 -->
                {{ memberInfoList.sex == undefined
                    ? ''
                    : memberInfoList.sex == true
                      ? $t('Biz.Booking.Sir') : $t('Biz.Booking.Lady') }}
              </em>
            </p>
            <span
              class="memberType"
              :style="{'color': memberInfoList.name ? '#f45333' : '#11cbca' } "
            >
              <!-- {{ memberInfoList.name ? '会员客户' : memberInfoList.bookperson ? '预订客户' : '' }} -->
              <!-- bookCustomerType字段，增加为判断用户类型，输出相应会员类型名：
                    0-CRM会员，1-预订会员，2-非会员（新来电不做判断和显示，与后台规约逻辑判断，不接收此值） -->
              {{ memberInfoList.bookCustomerType == 0
                  ? $t('Biz.Booking.User01')
                  : memberInfoList.bookCustomerType == 1
                    ? $t('Biz.Booking.User02')
                    : '' }}
            </span>
          </div>
          <!-- 来电线路Tab -->
          <ul class="multipathstabs" v-if="comingCallPathsTabs.length>1">
            <li v-for="(item,index) in comingCallPathsTabs" class="multipathstab"
              :style="{width: comingCallPathsTabs.length==4?'25%':'50%'}"
              :class="{'active':item.state==1,'warn':item.state == 2,'valibale':item.state==3}"
              :key="index" @click="checkPathTab(item)">
              <em class="multipaths-tab-icons icon icon-phone_l"></em>
              <span>{{ item.no }}</span>
            </li>
          </ul>
          <div class="memberCallInfo-detail">
            <ul class="memberCallTabs">
              <!-- 会员信息和预定信息Tabs切换 -->
              <li
                v-for="(item, index) in memberCallBtn"
                :class="{'memberCallBtn-active': memberCallBtnActive.code == item.code}"
                @click="memberCallBtnActive.code = item.code"
                :key="index"
              >
                <!-- @click执行改变memberCallBtnActive为当前item, 选中项样式memberCallBtn-active -->
                {{ item.name }}
                <i
                  v-show=" bookedInfo && bookedInfo.notexecutecount != 0 && item.code == 'bookInfo'"
                  class="unExecuteOrder-warn"
                ></i>
              </li>
            </ul>
            <!-- 切换2-1 会员信息和预订信息 -->
            <ul
              class="memberInfoList memberInfoListHeight"
              v-if="memberCallBtnActive.code == 'vipInfo' && !memberInfoNonContent"
            >
              <li class="memberInfoList-item">
                <!-- 所属店： -->
                <em>{{ $t('Biz.Booking.Belong') }}</em>
                <span>{{ memberInfoList.shopName }}</span>
              </li>
              <li class="memberInfoList-item">
                <!-- 生日： -->
                <em>{{ $t('Biz.Booking.Birthday') }}</em>
                <span>{{ memberInfoList.birthday }}</span>
              </li>
              <li class="memberInfoList-item">
                <!-- 卡型： -->
                <em>{{ $t('Dict.CardType1') }}</em>
                <span>{{ memberInfoList.cardTypeName }}</span>
              </li>
              <li class="memberInfoList-item">
                <!-- 消费次数： -->
                <em>{{ $t('Biz.Booking.ConsumeTimes') }}</em>
                <span class="lang-en-consume">{{ memberInfoList.totalConsumeTimes
                          ? memberInfoList.totalConsumeTimes + $t('Biz.Booking.Times')
                          : '' }}</span>
              </li>
              <li class="memberInfoList-item">
                <!-- 消费金额： -->
                <em>{{ $t('Biz.Booking.ConsumeMoney') }}</em>
                <span  class="lang-en-consume">{{ memberInfoList.totalConsumeMoney }}</span>
              </li>
              <li class="memberInfoList-item">
                <!-- 客人要求： -->
                <em>{{ $t('Biz.Booking.UserAsk') }}</em>
                <span class="lang-en-userask">
                  <em v-for="(item, index) in memberInfoList.labelList" :key="index">
                    {{ item }}
                    <i v-show="index != (memberInfoList.labelList.length - 1)">、</i>
                  </em>
                </span>
              </li>
            </ul>
            <!-- 切换2-2 会员信息和预订信息 -->
            <div
              class="memberBookedInfo"
              v-if="memberCallBtnActive.code == 'bookInfo' && !memberbookedNonContent"
            >
              <!-- 预定信息环图和列表 -->
              <div class="memberBookedInfo-chartList">
                <div class="booking-chart-pie">
                  <div class="bgLayer"></div>
                  <div
                    class="pie-left"
                    :style="{
                      transform: bookingChartPieLeftRender(
                        parseInt(bookedInfo.executecount / bookedInfo.total * 100) ) }"
                  ></div>
                  <div
                    class="pie-right"
                    :style="{
                      transform: bookingChartPieRightRender(
                        parseInt(bookedInfo.executecount / bookedInfo.total * 100) ) }"
                    :class="{
                      'pie-right-per50': parseInt(
                        parseInt(bookedInfo.executecount / bookedInfo.total * 100) ) >= 50 }"
                  ></div>
                  <div class="blankArea">
                    <!-- <span>{{ bookedInfo.percent ? bookedInfo.percent : '0%' }}</span> -->
                    <span>{{ (bookedInfo.total && bookedInfo.total != 0)
                                ? parseInt(bookedInfo.executecount / bookedInfo.total * 100) + '%'
                                : '0%' }}</span>
                    <!-- 预订执行率 -->
                    <p>{{ $t('Biz.Booking.ExecueRate') }}</p>
                  </div>
                </div>
                <ul class="booking-chart-list">
                  <!-- 总预订数： -->
                  <li>{{ $t('Biz.Booking.BookedTotal') }}{{ bookedInfo.total }}</li>
                  <!-- 订单执行： -->
                  <li>{{ $t('Biz.Booking.ExecueNum') }}{{ bookedInfo.executecount }}</li>
                  <!-- 订单取消： -->
                  <li>{{ $t('Biz.Booking.CancelNum') }}{{ bookedInfo.cancelcount }}</li>
                  <!-- 订单过期： -->
                  <li>{{ $t('Biz.Booking.OverdueNum') }}{{ bookedInfo.overduecount }}</li>
                </ul>
              </div>
              <!-- 最近预订情况 -->
              <ul class="memberInfoList">
                <li class="memberInfoList-item">
                  <!-- 最近预订： -->
                  <em>{{ $t('Biz.Booking.LatelyBook') }}</em>
                  <span
                    v-show="bookedInfo.lastestbooktime"
                  >{{ bookedInfo.lastestbooktime
                        ? bookedInfo.lastestbooktime.replace(/\./g, '-')
                        : '' }}</span>
                </li>
                <li class="memberInfoList-item">
                  <!-- 常用客位： -->
                  <em>{{ $t('Biz.Booking.UsedSeat') }}</em>
                  <span v-show="bookedInfo.favorPoints">
                    <em
                      v-for="(item, index) in bookedInfo.favorPoints"
                      :key="index"
                    >
                      {{ item.point }}(
                      <i v-show="item.count" style="color: #f00;">{{ item.count }}{{ $t('Biz.Booking.Times') }}</i>)
                      <i v-show="index != (bookedInfo.favorPoints.length - 1)">、</i>
                    </em>
                  </span>
                </li>
                <li class="memberInfoList-item">
                  <!-- 客位标签： -->
                  <em>{{ $t('Biz.Booking.SeatLabel') }}</em>
                  <span
                    v-show="bookedInfo.favorLabels"
                  >{{ (bookedInfo.favorLabels && bookedInfo.favorLabels.split(','))
                        ? bookedInfo.favorLabels.split(',').join('、')
                        : '' }}</span>
                </li>
              </ul>
              <!-- 隐藏关卡: 未执行订单 -->
              <ul
                v-show="bookedInfo.notexecutecount && (bookedInfo.notexecutecount != 0)"
                class="memberInfoList-unExecuteOrder"
              >
                <!-- 未执行订单 -->
                <li class="memberInfoList-unExecuteOrder-title">
                  {{ $t('Biz.Booking.UnExecuteOrder') }}
                  <em>{{ bookedInfo.notexecutecount }}</em>
                </li>
                <li class="memberInfoList-unExecuteOrder-col">
                  <!-- 预定日期 -->
                  <span>{{ $t('Biz.Booking.BookDate') }}</span>
                  <!-- 市别 -->
                  <span>{{ $t('Dict.Shift') }}</span>
                  <!-- 客位 -->
                  <span>{{ $t('Dict.Seat') }}</span>
                </li>
                <!-- 点击事件 激活 修改预订单 -->
                <li
                  class="memberInfoList-unExecuteOrder-col unExecuteOrder-list"
                  v-for="(item, index) in bookedInfo.orderList"
                  @click="unExecuteOrderOpt(item)"
                  :key="index"
                >
                  <span>{{ item.bookTimeStr }}</span>
                  <span>{{ item.shiftName }}</span>
                  <span>{{ item.pointNameStr }}</span>
                </li>
              </ul>
            </div>
            <!-- 切换2-3 无数据显示 留白 -->
            <div
              class="memberInfoList lackItemContent"
              v-else-if="memberCallBtnActive.code == 'vipInfo' && memberInfoNonContent"
            >
              <p class="lackItemLogo icon icon-lack"></p>
              <!-- 此人不是会员 -->
              <span>{{ $t('Biz.Booking.BookTip01') }}</span>
            </div>
            <div
              class="memberInfoList lackItemContent"
              v-else-if="memberCallBtnActive.code == 'bookInfo' && memberbookedNonContent"
            >
              <p class="lackItemLogo icon icon-lack"></p>
              <!-- 没有预订信息 -->
              <span>{{ $t('Biz.Booking.BookTip02') }}</span>
            </div>
          </div>
          <!-- 点击跳转预订记录列表: 触发,只传'空'以进行点击模块的数据过滤 -->
          <!-- 所有来电记录 -->
          <p class="allCalledBtn" @click="memberInfoOrListToggle('')">{{ $t('Biz.Booking.AllCalledInfo') }}</p>
        </div>
        <!-- 切换1-2 预订记录信息 -->
        <div
          class="memberCallList memberCallInfo"
          v-show="!memberInfoOrListActive"
          :style="{paddingTop:comingCallShow?'152px':'117px'}"
        >
          <div class="memberCallList-title">
            <!-- 多路来电显示Tab标签 -->
            <div class="multipaths-panel" v-show="comingCallShow">
              <div class="multipaths" >
                <ul class="multipaths-tabs">
                  <li
                    class="multipaths-tab"
                    v-for="(item,index) in comingCallpaths"
                    :key="index"
                    @click="handleNewComingCall(item)">
                    <p class="warnInfo">
                      <em class="multipaths-tab-icons icon icon-phone_l"></em>
                      <span>{{ item }}</span>
                    </p>
                    <span class="multipaths-tab-break" v-show="index!=(comingCallpaths.length-1)">|</span>
                  </li>
                </ul>
              </div>
            </div>
            <!-- 预订记录 -->
            <p class="caption">{{ $t('Biz.Booking.BookedRecord') }}</p>
            <div class="datePicker-box">
              <el-date-picker
                id="comingCallDatePicker"
                name="comingCallDatePicker"
                v-model="memberPicker.callListDateVal"
                popper-class="pickerDatePopperClass"
                :picker-options="memberPicker.pickerDateAfter"
                :editable="false"
                :clearable="false"
                value-format="timestamp"
                :placeholder="$t('Dict.SelectionDate')"
                type="date"
                size="small"
              ></el-date-picker>
            </div>
            <!-- 预订状态按钮的点击事件, 注册为全局事件判断是否本对象id -->
            <div
              id="bookingStatusBox"
              class="bookingStatus-box customAnimite"
              @click.stop="pointStateBtnToggle('bookingStatusBox')"
            >
              <span class="status-btn">
                {{ bookingStatusBtn.title.name }}
                <em class="status-btnLogo icon icon-arr-down"></em>
              </span>
              <ul
                class="status-list"
                v-show="bookingStatusSwitch"
              >
                <li
                  class="status-list-item"
                  v-for="(item, index) in bookingStatusBtn.item"
                  @click="pointState(item)"
                  :key="index"
                >{{ item.name }}</li>
              </ul>
            </div>
          </div>
          <!-- 预订记录列表 -->
          <ul
            :id="bookingPagerId"
            class="memberCallList-bookingList"
          >
            <li
              class="listItem"
              v-for="(item, index) in memberCallList"
              v-show="memberCallListFilterMethod(item.state, item.callTimeLong)"
              @click="memberInfoOrListToggleBefore(item)"
              :key="index"
            >
              <p class="leftInfo">
                <!-- 显示来电线路图标 -->
                <span class="pathNo">
                  <em class="pathNo-icons icon icon-phone_l"></em>
                  <span>{{item.telLineNo}}</span>
                </span>
                <!-- 电话:拆分数据结构, 添加分位符号'-' -->
                <span>{{ item.telNo.substr(0, 3)
                      }}-{{ item.telNo.substr(3, 4)
                         }}-{{ item.telNo.substr(7) }}</span>
                <!-- 时间:格式化数据 实现年月日时-->
                <em>{{ item.callTimeLong | dateFormat('%Y-%M-%D %H:%I:%S') }}</em>
              </p>
              <span
                class="rightBtn"
                :style="{'background-color': item.state === 0 ? '': '#12bdcc'}"
              >
                <!-- 预订记录列表项预订状态显示: 传入的item.state只能 0 / 1    -->
                {{ memberCallListState[item.state] }}
              </span>
            </li>
          </ul>
          <!-- 分页组件引入 -->
          <div class="memberCallList-pagerBox">
            <span
              class="pagerBox-tip"
              >{{ $t('Dict.Altogether') }}
              <em>{{ memberCallList.length }}</em>{{ $t('Dict.Strip') + $t('Biz.Booking.Record') }}</span>
            <Pager
              class="pos-booking-list-pager"
              :pagerId="bookingPagerId"
              :showInfo="showInfo"
              ref="leftPager"
            ></Pager>
          </div>
        </div>
      </div>
    </div>
    <!-- 右侧预订业务Table -->
    <div class="booking-rightArea">
      <div class="rightArea-content">
        <!-- 预订日历和预订单Tabs -->
        <ul class="rightArea-tabsBox">
          <li
            v-for="(item, index) in bookingTableBtn"
            class="rightArea-tabsBox-item"
            :class="{'active': bookingTableBtnActive.code == item.code }"
            @click="bookingTableBtnToggle(item)"
            :key="index"
          >{{ item.name }}</li>
        </ul>
        <div class="rightArea-table">
          <!-- 预订日历table -->
          <div
            class="table-chartBox"
            v-show="bookingTableBtnActive.code == 'calendar'"
          >
            <div class="table-fnBtn-box">
              <p
                class="table-fnBtn refresh"
                @click="reloadBookingData"
              >
                <!-- 刷新 -->
                <em class="icon icon-reload"></em>{{ $t('Dict.Btn.Refresh') }}
              </p>
              <p class="table-fnBtn analogCall" @click="virtualTel">
                <!-- 模拟来电 -->
                <em class="icon icon-reload"></em>{{ $t('Biz.Booking.AnalogCall') }}
              </p>
              <!-- 下拉列表选择区 -->
              <div class="booking-dropdown-group booking-dropdown-originBox">
                <!-- 客位过滤, cheboxbox弹出框组件 -->
                <PointFilterBox
                  id="bookingFilterBox"
                  ref="bookingFilterBox"
                  :closeList="selectListStateToggle"
                  :btnNameList="chartFilterBtn"
                  :chartFilterArea="chartFilterArea"
                  :chartFilterType="chartFilterType"
                  :chartFilterRequest="chartFilterRequest"
                  :chartFilterRange="chartFilterRange"
                  :conditions="bookFilteConditions"
                  @executeBookFilte="executeBookFilte"
                >
                  <!--
                    btnNameList - 多个按钮的名称列表数组,
                    以下对象, 传入组件, 被组件渲染:
                      chartFilterArea - 客位区域条件数据对象
                      chartFilterType - 客位类型条件数据对象
                      chartFilterRequest - 客位标签条件数据对象
                      chartFilterRange - 客位人数条件数据对象
                      conditions - 选择后(组件操作后)存储的过滤条件对象(由组件直接操作更改)
                      executeBookFilte - 子组件操作后执行客位接口数据刷新
                  -->
                </PointFilterBox>
              </div>
              <!-- 市别选择 -->
              <ul class="booking-dropdown-group businessShift-btnBox">
                <li
                  class="dropdown-btnGroup businessShift-btn"
                  :class="{'active': businessShiftActive == index }"
                  v-for="(item, index) in businessShift"
                  @click="businessShiftToggle('businessShiftActive', item, index)"
                  :key="index"
                >
                  <!-- 市别切换: 市别均为市别列表渲染, 不同市别列表选中的开关参数不同, 传参第一项为当前市别选中开关参数 -->
                  {{ item.name }}
                </li>
              </ul>
            </div>
            <!-- 预定客位table -->
            <!-- table title: 固定不翻页 -->
            <ul class="booking-chartTable-positionTitle chartTable-row">
              <!-- 桌位/日期 -->
              <li class="chartTable-row-item chartTable-row-itemFirst">{{ $t('Biz.Booking.TableDate') }}</li>
              <li
                class="chartTable-row-item"
                :class="tableColItemStyle(tableDateInColActive)"
                v-for="item in tableDateInColActive"
                :key="item"
              >
                <!-- 休市标志 -->
                <!-- <span class="chartTable-title-sign"
                  v-show="false">
                  {{ chartTableStateSign }}
                </span>-->
                <!-- 日期和周:日期起始与datePicker日期联动, 显示天数为选择天数模式; 由于空间尺寸限制, 15天及以下展示 -->
                <p>{{
                      bookingChartPicker.chartDateVal + ((item -1) * 86400000)
                        | dateFormat('%M-%D')}}</p>
                <span
                  v-show="!(tableDateInColActive > 15)"
                >{{
                    bookingChartPicker.chartDateVal + (item -1) * 86400000
                      | dateFormat('周%W')}}</span>
              </li>
            </ul>
            <!-- 预订日历table列表: 根据客位过滤选择, 显示过滤结果 -->
            <div class="booking-chartTable">
              <ul
                class="chartTable-row chartTable-content"
                v-for="(item, index) in bookingTable"
                :key="index"
              >
                <!-- v-show="bookingTableFilteMethod(item ,index)" ul的v-show方法不在使用,184改真分页处理 -->
                <li
                  class="chartTable-row-item chartTable-row-itemFirst content-item"
                >{{ item.name }}</li>
                <li
                  class="chartTable-row-item content-item"
                  :class="[
                    tableColItemStyle(tableDateInColActive),
                    bookingPointState(sub, 'style') ]"
                  v-for="(sub, subIndex) in item.states"
                  v-show="subIndex < tableDateInColActive"
                  @click="openBooking(item, index, sub, subIndex)"
                  :key="subIndex"
                >
                  <span v-show="sub != 1">
                    <!-- 客位: 不同日期下, 显示相应客位状态
                    注: 后台设置, '已预订客位'点击可执行: 直接修改 / 打开预订信息列表,选择新建或修改-->
                    {{ bookingPointState(sub, 'content') }}
                    <em
                      v-show="sub.bookCount"
                    >{{ sub.bookCount }}</em>
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <!-- 预订单table 判断条件: "bookingTableBtnActive == '预订单'"-->
          <div class="table-ordersBox"
            v-show="bookingTableBtnActive.code == 'bookList'"
          >
            <div class="table-order-queryBox table-fnBtn-box clear">
              <!-- 预订单查询日期 -->
              <div class="table-datePicker datePicker-box">
                <el-date-picker
                  v-model="orderChartPicker.chartDateVal"
                  popper-class="pickerDatePopperClass"
                  :editable="false"
                  :clearable="false"
                  value-format="timestamp"
                  :placeholder="$t('Dict.SelectionDate')"
                  type="date"
                  ref="orderChartPicker"
                  size="small"
                ></el-date-picker>
              </div>
              <!-- 市别选择 -->
              <ul class="booking-dropdown-group businessShift-btnBox">
                <li
                  class="dropdown-btnGroup businessShift-btn"
                  :class="{'active': orderTableShiftActive == index }"
                  v-for="(item, index) in orderBusinessShift"
                  @click="businessShiftToggle('orderTableShiftActive', item, index)"
                  :key="index"
                >{{ item.name }}</li>
              </ul>
              <!-- 查询按钮:条件依据日期和市别 -->
              <!-- 查询 -->
              <p
                class="queryBtn"
                @click="queryOrderTable"
              >{{ $t('Dict.Search') }}</p>
              <!-- 预订品项汇总 -->
              <p
                class="queryBtn sumOfItemsBtn"
                @click="sumOfBookedItemsDialogOpen"
              >{{ $t('Biz.Booking.BookItemTotal') }}</p>
              <!-- 预订单筛选器: 状态,来源,预订类型过滤按钮组 -->
              <div
                id="orderFilterBox"
                class="booking-dropdown-group order-dropdown-group"
                @click.stop="orderTriggerOff('orderFilterBox')"
              >
                <!-- 状态选择 -->
                <div
                  class="dropdown-btnGroup orderDropDown"
                  :class="{
                    'active': orderFilterBtns[orderFilterCheckActive] == orderFilterBtns[0]}"
                >
                  <p
                    class="dropdown-btn-txt aLineTxt"
                    @click="orderFilterToggle(0)"
                  >
                    {{ orderFilterBtns | chartFilterTxt(0, orderState) }}
                    <em
                      class="icon icon-arr-down"
                    ></em>
                  </p>
                  <ul
                    class="dropdown-btn-itemBox firstDropItem"
                    v-show="orderFilterBtns[orderFilterCheckActive] == orderFilterBtns[0]"
                  >
                    <li
                      class="dropdown-btn-item"
                      v-for="(item, index) in orderState"
                      @click="orderFilterItemCheck(item, 'state')"
                      :key="index"
                    >
                      <span>
                        <em
                          class="checkSign icon icon-duihao"
                          v-show="item.check == 1"
                        ></em>
                      </span>
                      <!-- 内容 -->
                      {{ item.name }}
                    </li>
                    <!-- 底部全选反选按钮:传入当前数据对象和操作类型 -->
                    <li class="dropdown-btn-allOrNo">
                      <!-- 全选 -->
                      <span
                        @click="orderFilterIsAllCheck(orderState, 1, 'state')"
                      >{{ $t('Dict.SelectAll') }}</span>
                      /
                      <span
                        @click="orderFilterIsAllCheck(orderState, 0, 'state')"
                      >{{ $t('Biz.Booking.SelectRe') }}</span>
                      <!-- 反选 -->
                    </li>
                  </ul>
                </div>
                <!-- 来源选择 -->
                <div
                  class="dropdown-btnGroup orderDropDown"
                  :class="{
                    'active': orderFilterBtns[orderFilterCheckActive] == orderFilterBtns[1]}"
                >
                  <p
                    class="dropdown-btn-txt aLineTxt"
                    @click="orderFilterToggle(1)"
                  >
                    {{ orderFilterBtns | chartFilterTxt(1, ordersSource) }}
                    <em
                      class="icon icon-arr-down"
                    ></em>
                  </p>
                  <ul
                    class="dropdown-btn-itemBox"
                    v-show="orderFilterBtns[orderFilterCheckActive] == orderFilterBtns[1]"
                  >
                    <li
                      class="dropdown-btn-item"
                      v-for="(item, index) in ordersSource"
                      @click="orderFilterItemCheck(item, 'orderSource')"
                      :key="index"
                    >
                      <span>
                        <em
                          class="checkSign icon icon-duihao"
                          v-show="item.check == 1"
                        ></em>
                      </span>
                      <!-- 内容 -->
                      {{ item.name }}
                    </li>
                    <!-- 底部全选反选按钮:传入当前数据对象和操作类型 -->
                    <li class="dropdown-btn-allOrNo">
                      <!-- 全选 -->
                      <span
                        @click="orderFilterIsAllCheck(ordersSource, 1, 'orderSource')"
                      >{{ $t('Dict.SelectAll') }}</span>
                      /
                      <!-- 反选 -->
                      <span
                        @click="orderFilterIsAllCheck(ordersSource, 0, 'orderSource')"
                      >{{ $t('Biz.Booking.SelectRe') }}</span>
                    </li>
                  </ul>
                </div>
                <!-- 预定类型选择 -->
                <div
                  class="dropdown-btnGroup orderDropDown"
                  :class="{'active': orderFilterBtns[orderFilterCheckActive] == orderFilterBtns[2]}"
                >
                  <p
                    class="dropdown-btn-txt aLineTxt"
                    @click="orderFilterToggle(2)"
                  >
                    {{ orderFilterBtns | chartFilterTxt(2, orderBookingTypeList) }}
                    <em
                      class="icon icon-arr-down"
                    ></em>
                  </p>
                  <ul
                    class="dropdown-btn-itemBox"
                    v-show="orderFilterBtns[orderFilterCheckActive] == orderFilterBtns[2]"
                  >
                    <li
                      class="dropdown-btn-item"
                      v-for="(item, index) in orderBookingTypeList"
                      @click="orderFilterItemCheck(item, 'bookTypeName')"
                      :key="index"
                    >
                      <span>
                        <em
                          class="checkSign icon icon-duihao"
                          v-show="item.check == 1"
                        ></em>
                      </span>
                      <!-- 内容 -->
                      {{ item.name }}
                    </li>
                    <!-- 底部全选反选按钮:传入当前数据对象和操作类型 -->
                    <li class="dropdown-btn-allOrNo">
                      <!-- 全选 -->
                      <span
                        @click="orderFilterIsAllCheck(orderBookingTypeList, 1, 'bookTypeName')"
                      >{{ $t('Dict.SelectAll') }}</span>
                      /
                      <span
                        @click="orderFilterIsAllCheck(orderBookingTypeList, 0, 'bookTypeName')"
                      >{{ $t('Biz.Booking.SelectRe') }}</span>
                    </li>
                  </ul>
                </div>
              </div>
              <!-- 关键词搜索框 -->
              <div class="queryKeyWord">
                <em class="icon icon-fangdajing"></em>
                <input
                  type="text"
                  v-model="orderSearchTxt"
                  :placeholder="$t('Biz.Booking.OrderSeatTelPerson')">
                <span></span>
              </div>
            </div>
            <!-- Order Table -->
            <!-- table title:固定不翻页 -->
            <ul class="orderTable-title orderTable-row">
              <li
                v-for="(item, index) in orderTableTitle"
                class="orderTable-title-item orderTable-row-item textCenter"
                :key="index"
              >{{ item }}</li>
            </ul>
            <!-- table 列表-->
            <div
              class="orderTable-listBox"
              :id="bookingOrderPagerId"
            >
              <!-- 列表: ul循环行, li固定 -->
              <ul
                v-for="(item, index) in orderTable"
                :class="{'active': orderTableItemActive == index }"
                v-show="orderTableFilteMethod(item, index)"
                @click=" orderTableItemActive = orderTableItemActive == index ? null: index "
                @dblclick="dblClickChangeAddOrder(item, index)"
                class="orderTable-row"
                :key="index"
              >
                <!-- @click: 预订单table 当前行 选中事件-不是当前项选中(=item),
                  是当前项取消(=''), 并改变orderTableItemActive, 激活选中项样式,
                  同时, 监听orderTableItemActive, 供单选中时, 执行打印当前项 -->
                <li class="orderTable-row-item">
                  {{ item.bookPerson }}
                  <!-- 预订人 -->
                </li>
                <li class="orderTable-row-item">
                  {{ item.contactTel }}
                  <!-- 联系电话 -->
                </li>
                <li class="orderTable-row-item">
                  {{ item.expectArriveTimeStr }}
                  <!-- 到店时间(字符串信息) -->
                </li>
                <li class="orderTable-row-item">
                  {{ orderListShfitName(item) }}
                  <!-- 市别 -->
                </li>
                <li class="orderTable-row-item">
                  {{ item.pointNameStr }}
                  <!-- 已选客位 -->
                </li>
                <li class="orderTable-row-item">
                  {{ item.peopleQty }}
                  <!-- 就餐人数 -->
                </li>
                <li class="orderTable-row-item">
                  {{ item.orderNo }}
                  <!-- 订单号 -->
                </li>
                <li class="orderTable-row-item">
                  <!-- 来源: 1-线上 2-来电预订 3-到店预订 4-食尚订 5....-->
                  <!-- {{ item.orderSource == 1
                            ? '线上'
                            : item.orderSource == 2
                              ? '来电'
                              : item.orderSource == 3
                                ? '到店' : '食尚订' }} -->
                  {{ orderAllSource.filter(el => el.value == item.orderSource).shift().name }}
                </li>
                <li class="orderTable-row-item">
                  {{ item.bookTypeName }}
                  <!-- 预订类型 -->
                </li>
                <li class="orderTable-row-item">
                  {{ item.marketEmpName }}
                  <!-- 营销员 -->
                </li>
                <li class="orderTable-row-item">
                  {{ item.operEmpName }}
                  <!-- 操作员 -->
                </li>
                <li class="orderTable-row-item">
                  {{ item.deposit }}
                  <!-- 订金 -->
                </li>
                <li class="orderTable-row-item">
                  {{ item.remark }}
                  <!-- 备注 -->
                </li>
                <li class="orderTable-row-item textCenter">
                  <!-- 状态 -->
                  <span
                    class="item-stateLogo"
                    :class="orderTableItemStateShow(item.state, 'style')"
                  >
                    <!-- orderTableItemStateShow - 根据state参数,return不同样式或不同文本  -->
                    {{ orderTableItemStateShow(item.state, 'txt') }}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <!-- 右侧table底部: 与预订日历或预订单分别联动 -->
      <!-- 预订日历footer -->
      <div
        class="rightArea-footer"
        v-show="bookingTableBtnActive.code == 'calendar'"
      >
        <!-- 日期datePicker选择 -->
        <div class="table-datePicker datePicker-box">
          <el-date-picker
            id="bookingTableDatePicker"
            name="bookingTableDatePicker"
            v-model="bookingChartPicker.chartDateVal"
            popper-class="pickerDatePopperClass"
            :picker-options="bookingChartPicker.pickerDateBefore"
            :editable="false"
            :clearable="false"
            value-format="timestamp"
            :placeholder="$t('Dict.SelectionDate')"
            @focus="bookingPickDate"
            type="date"
            ref="bookingChartPicker"
            size="small"
          ></el-date-picker>
        </div>
        <!-- 显示table 预览天数模式 -->
        <div class="table-dateInCol-box">
          <el-dropdown
            trigger="click"
            @command="tableDateInColToggle"
          >
            <!-- 选择天列表 @command与:command联动,接收:command传来当前item -->
            <span class="el-dropdown-link">
              {{ tableDateInColActive }}{{ $t('Dict.Day') }}
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu size="small" slot="dropdown">
              <el-dropdown-item
                v-for="(item, index) in tableDateInCol"
                :command="item"
                :key="index"
              >{{ item }}{{ $t('Dict.Day') }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <!-- 快速日期查询 -->
        <div class="table-dateInterval-box">
          <span @click="dateIntervalQuery('front')">
            <em>&lt;</em>
            {{ tableDateIntervalStart | dateFormat('%Y-%M-%D') }}
          </span>{{ $t('Dict.To') }}<span
          @click="dateIntervalQuery('after')">
            {{ tableDateIntervalEnd | dateFormat('%Y-%M-%D') }}
            <em>&gt;</em>
          </span>
        </div>
        <!-- 分页 -->
        <div class="table-pager-box">
          <div class="orderTable-pagerBtn-box">
            <p class="pagerBtn-pageNum">{{
              $t('Dict.PageStyle.Sim1', {
                currentPage: currentPageNum,
                totalPage: allPageNum,
              })
            }}</p>
            <p class="pagerBtn-btn">
              <span class="pagerBtn-upBtn icon icon-pager-up" @click="turnPageUp"></span>
              <span class="pagerBtn-downBtn icon icon-pager-down" @click="turnPageDown"></span>
            </p>
          </div>
        </div>
      </div>
      <!-- 预订单footer -->
      <div
        class="rightArea-footer"
        v-show="bookingTableBtnActive.code == 'bookList'"
      >
        <div class="orderTable-listNum">{{
          $t('Dict.Altogether') +' '+ orderTable.length + $t('Dict.Strip') + $t('Biz.Booking.Record') + ' '
          }}</div>
        <!-- 预订单记录报表 操作 -->
        <ul class="orderTable-option">
          <!-- 取消,修改,执行: 当前行未选中时, 不可点击,并且订单状态为1-已执行,2-已过期,3-已取消时, 也均不可改执行 -->
          <li
            class="cancel"
            :class="{'btnDisalbed': orderTableOperation('cancel') }"
            @click="orderCancel(orderTable[orderTableItemActive])"
          >{{ $t('Dict.Cancel') }}</li>
          <!-- 修改, 增加判断:当订单来源为线上时, 不可修改 -->
          <li
            class="modify"
            :class="{'btnDisalbed': orderTableOperation('modify') }"
            @click="orderModify"
          >{{ $t('Dict.Modify') }}</li>
          <li
            class="execute"
            :class="{'btnDisalbed': orderTableOperation('execute') }"
            @click="orderExecute"
          >{{ $t('Biz.Booking.Execute') }}</li>
          <!-- 打印, 执行判断, 调用接口后并推送 设备管理器 -->
          <li
            class="print"
            :class="{'btnDisalbed': orderTableOperationPrint() }"
            @click="orderListPrint"
          >
            <!-- 过滤结果, 并且 来源为4的订单 打印和全部打印, 置灰 -->
            {{ orderTableItemActive == null ? $t('Biz.Booking.AllPrinting') : $t('Dict.Printing') }}
          </li>
        </ul>
        <div class="orderTable-pagerNum">
          <Pager
            :pagerId="bookingOrderPagerId"
            itemTag=".orderTable-row"
            :showInfo="showInfo"
            class="pos-booking-order-pager"
            ref="orderPager"
          ></Pager>
        </div>
      </div>
    </div>
    <!-- 预订单弹窗: 公用弹窗三种模式: 新建/修改/查看 -->
    <Dialog
      name="PosDialog.BookDialog"
      ref="addBooking"
      width="780px"
      height="666px"
      top="auto"
      :title="dialogTitle.name"
      @open="orderOpen"
      @close="orderClose"
      customClass="moudel-center"
      :hotkeys="bookingDialog"
      :beforeClosingPrompt="true"
      :closingMsg="closingMsg"
    >
      <!-- header插槽 -->
      <div slot="title" class="pos-dialog-header">
        <h3 class="pos-dialog-title">{{ dialogTitle.name }}</h3>
        <!-- 新建/修改/查看 弹窗三种状态 -->
        <div class="pos-dialog-control">
          <!-- 关闭 -->
          <button
            type="button"
            class="btn btn-default addBookingDialog"
            @click="orderClose"
          >{{ $t('Dict.Close') }}<em>(Esc)</em></button>
          <!-- v取消订单 -->
          <button
            type="button"
            class="btn btn-danger addBookingDialog"
            v-show="onlyChangeOrder"
            @click="orderCancel"
          >{{ $t('Dict.CancellationOfOrder') }}</button>
          <!-- 只有新建预订单时显示“确认并发送短信” -- CY7-2907 -->
          <!-- 确认并发送短信 -->
          <button
            type="button"
            class="btn btn-primary addBookingDialog"
            v-show="!onlyChangeOrder&&addAndChangOrder"
            @click="addBookingSubmit('',true)"
          >{{ $t('Biz.Booking.ConfirmSendSMS') }}</button>
          <!-- 确认 -->
          <button
            type="button"
            class="btn btn-primary addBookingDialog"
            v-show="addAndChangOrder"
            @click="addBookingSubmit('')"
          >{{ $t('Dict.Confirm') }}<em>(PgDn)</em></button>
        </div>
      </div>
      <!-- 布局容器 -->
      <div class="booking-addOrder-container">
        <!-- 预订时间 -->
        <div class="addOrder-itemBox">
          <!-- 预订时间 -->
          <h3 class="itemBox-title">{{ $t('Biz.Booking.BookTime') }}</h3>
          <div class="itemBox-content">
            <p class="itemBox-row">
              <!-- 预订日期 -->
              <span class="itemBox-sub">
                <ItemTitle :itemTitle="$t('Biz.Booking.OrderTime')"></ItemTitle>
                <span class="addOrder-dateBox">
                  <el-date-picker
                    v-model="addOrderDate.val"
                    popper-class="pickerDatePopperClass"
                    :picker-options="addOrderDate.pickerDateBefor"
                    :disabled="orderDisabledState"
                    :editable="false"
                    :clearable="false"
                    value-format="timestamp"
                    :placeholder="$t('Dict.SelectionDate')"
                    type="date"
                    size="small"
                  ></el-date-picker>
                </span>
              </span>
              <!-- 市别选择 -->
              <span>
                <ItemTitle :itemTitle="$t('Dict.Shift')"></ItemTitle>
                <SelectList
                  id="addOrderShiftList"
                  ref="addOrderShiftList"
                  type="shiftIdStr"
                  :disabled="orderDisabledState"
                  :statusBtns="businessShift"
                  :defaultFirstItem="addOrderShiftShowTitle"
                  :closeList="selectListStateToggle"
                  @selectDone="selectDone"
                >
                  <!--id - 组件id,
                      ref - DOM节点,
                      type - 选择后列表数据属性(固定数据结构),
                      statusBtns -下拉列表数据对象,
                      defaultFirstItem - 默认列表显示标题
                      closeList - 全局点击事件回调
                  selectDone - 子组件触发父组件方法: 上传数据-->
                </SelectList>
              </span>
            </p>
            <!-- 到店时间 -->
            <p class="itemBox-row">
              <ItemTitle :itemTitle="$t('Biz.Booking.Arrive')"></ItemTitle>
              <!-- 首选时间选项按钮 -->
              <span class="addOrder-arrivalTime">
                <!-- 选中样式判断当前点击获取的元素与其下表相同, 点击改变当前选中变量的值(下标) -->
                <button
                  type="button"
                  class="timeBtn btn"
                  :class="{'active': arrivalTimeShowListSelected == index}"
                  :disabled="arrivalTimeItemDisabled(item, index)"
                  v-for="(item, index) in arrivalTimeList"
                  @click="(arrivalTimeShowListSelected = index) && arrivalTimeItemOpt()"
                  v-if="index < arrivalTimeShowNumber"
                  :key="index"
                >
                  <!-- 循环到店时间列表,显示前5项(即arrivalTimeShowNumber参数); @click执行选中项为当前index -->
                  {{ item }}
                </button>
              </span>
              <!-- 更多时间弹出按钮 -->
              <span
                class="btn moreTimeBtn"
                v-show="!(orderDisabledState || arrivalTimeList.length < 6)"
                @click.stop=" arrivalTimeDropListToggle('addOrderoreArrivalTime') "
              >
                <!-- 当设置禁用隐藏 或 到店时间列表小于6, 任意条件满足即隐藏按钮
                @click.stop, stop-阻止冒泡, 方法传入需要执行显示隐藏的模块的id-->
                {{ $t('Dict.Btn.More') }}
              </span>
              <!-- 多预订到店时间提醒间隔时间 -->
              <span class="intervalTimeWarn" v-show="multiBookTimeActive">
                <!-- multiBookTime-小于该到店时间的时间选择,将激活multiBookTimeActive -->
                {{ $t('Biz.Booking.BookTip03', [multiBookTime]) }}
              </span>
              <!-- 菜单更多(非首选-隐藏)时间选项列表 -->
              <span
                id="addOrderoreArrivalTime"
                class="addOrder-moreArrivalTime"
                v-show="arrivalTimeDropListActive"
              >
                <button
                  type="button"
                  class="timeBtn btn"
                  :disabled="arrivalTimeItemDisabled(item, index)"
                  v-for="(item, index) in arrivalTimeList"
                  @click="arrivalTimeDropItem(item, index)"
                  v-if="index >= arrivalTimeShowNumber"
                  :key="index"
                >
                  <!-- 循环到店时间列表,显示第6项之后  -->
                  {{ item }}
                </button>
              </span>
            </p>
          </div>
        </div>
        <!-- 客位信息 -->
        <div class="addOrder-itemBox">
          <!-- 预订客位信息 -->
          <h3 class="itemBox-title">{{ $t('Biz.Booking.BookSeatInfo') }}</h3>
          <div class="itemBox-content">
            <p class="itemBox-row banOverflow">
              <ItemTitle :itemTitle="$t('Biz.Booking.ChosenSeat')"></ItemTitle>
              <span class="itemBox-pointChosen-box">
                <span
                  class="pointChosen-item"
                  v-for="(item ,index) in currPointInBookingTable"
                  :key="index"
                >
                  {{ item.name }}
                  <em
                    class="icon icon-close"
                    v-show="!orderDisabledState"
                    @click="pointChosenItemDelete(item, index, currPointInBookingTable)"
                  ></em>
                </span>
              </span>
              <!-- 新增/修改客位 -->
              <span
                class="btn pointAddBtn"
                v-show="!orderDisabledState"
                @click="openPointDetailDailog(addBookCurrentPageNum)"
              >{{ $t('Biz.Booking.NewModify') }}</span>
            </p>
          </div>
        </div>
        <!-- 预订关联排菜业务 -->
        <div class="addOrder-itemBox">
          <!-- 预订品项信息 -->
          <h3 class="itemBox-title">{{ $t('Biz.Booking.BookItemInfo') }}</h3>
          <div class="itemBox-content">
            <p class="itemBox-row banOverflow">
              <!-- <ItemTitle itemTitle="已选排菜单"></ItemTitle> -->
              <!-- 已选排菜单： -->
              <span class="itemBox-item-normalTitle">{{ $t('Biz.Booking.ChosenMenu') }}</span>
              <span class="itemBox-pointChosen-box bookedOfArrangeMenu-box">
                <span class="pointChosen-item bookedOfArrangeMenu-item"
                  v-for="(item,index) in arrangelist" :key="index">
                  {{ item.arrangeName ? item.arrangeName : '' }}
                  <em
                    class="icon icon-close"
                    v-show="!orderDisabledState"
                    @click="relationArrangeMenuDelete(item)"
                  ></em>
                </span>
              </span>
              <!-- v关联/修改排菜单 -->
              <span
                class="btn pointAddBtn"
                v-show="!orderDisabledState"
                @click="openArrangeMenuListDailog" >{{ $t('Biz.Booking.RelateModify') }}</span>
            </p>
          </div>
        </div>
        <!-- 预订人信息 -->
        <div class="addOrder-itemBox">
          <!-- 预订人信息 -->
          <h3 class="itemBox-title">{{ $t('Biz.Booking.BookPersonInfo') }}</h3>
          <div class="itemBox-content">
            <!-- 预订人, 联系电话, 就餐人数 -->
            <p class="itemBox-row">
              <label class="itemBox-inputBox">
                <ItemTitle :itemTitle="$t('Biz.Booking.BookPerson')"></ItemTitle>
                <input
                  v-model="addOrderInput.bookPerson"
                  type="text"
                  class="addOrder-input sex-select"
                  @focus="showAndroidInput('addOrderInput.bookPerson')"
                  :disabled="orderDisabledState"
                  :placeholder="$t('Biz.Booking.BookPersonName')"
                >
              </label>
              <SelectList
                id="bookPersonSexList"
                ref="bookPersonSexList"
                type="gender"
                width="8%"
                :overflowEllipsis=false
                :disabled="orderDisabledState"
                :direction="selectListDirection"
                :statusBtns="bookPersonSexList"
                :defaultFirstItem="bookPersonSexShowTitle"
                :closeList="selectListStateToggle"
                @selectDone="selectDone"
              ></SelectList>
              <label class="itemBox-inputBox itemBox-inputBox-lang-en-tel">
                <!-- 联系电话 -->
                <ItemTitle :itemTitle="$t('Dict.ContactNumber')"></ItemTitle>
                <input
                  v-model="addOrderInput.contactTel"
                  @focus="showAndroidInput('addOrderInput.contactTel')"
                  type="text"
                  class="addOrder-input addOrder-input-lang-en-tel"
                  :disabled="orderDisabledState"
                  :placeholder="$t('Biz.Booking.BookPersonTel')"
                >
              </label>
              <label class="itemBox-inputBox">
                <!-- v就餐人数 -->
                <ItemTitle :itemTitle="$t('Dict.EatPersonNum')"></ItemTitle>
                <input
                  v-model="addOrderInput.peopleQty"
                  @focus="showAndroidInput('addOrderInput.peopleQty')"
                  type="text"
                  class="addOrder-input specialWidth"
                  :disabled="orderDisabledState"
                >
                <!-- 人/桌 -->
                <i>{{ $t('Biz.Booking.PersonTable') }}</i>
              </label>
            </p>
            <!-- 营销员, 预定类型, 订金 -->
            <p class="itemBox-row">
              <label class="itemBox-inputBox">
                <!-- 营销员： -->
                <span class="itemBox-item-normalTitle">{{ $t('Biz.Booking.SalesmanLabel') }}</span>
                <SelectList
                  id="addOrderEmpList"
                  ref="addOrderEmpList"
                  type="marketEmpIdStr"
                  :width="selectListWidth"
                  :disabled="orderDisabledState"
                  :direction="selectListDirection"
                  :statusBtns="empList"
                  :defaultFirstItem="empListShowTitle"
                  :closeList="selectListStateToggle"
                  @selectDone="selectDone"
                ></SelectList>
              </label>
              <label class="itemBox-inputBox itemBox-inputBox-lang-en-tel">
                <!-- 预订类型 -->
                <ItemTitle :itemTitle="$t('Biz.Booking.BookType')"></ItemTitle>
                <SelectList
                  id="addOrderBookTypeList"
                  ref="addOrderBookTypeList"
                  type="bookTypeStr"
                  :width="selectTypeWidth"
                  :disabled="orderDisabledState"
                  :direction="selectListDirection"
                  :statusBtns="diningTypeList"
                  :defaultFirstItem="diningTypeListShowTitle"
                  :closeList="selectListStateToggle"
                  @selectDone="selectDone"
                ></SelectList>
              </label>
              <label class="itemBox-inputBox itemBox-inputBox-lang-en-deposit" v-if="!openBuffetDeposit">
                <!-- 订金： -->
                <span class="itemBox-item-normalTitle2">{{ $t('Biz.Booking.BookDeposit') + addOrderInput.deposit }}</span>
                <!-- 登记/退 -->
                <span
                  v-if="addAndChangOrder"
                  class="btn pointAddBtn pointAddBtn-lang-en width-auto"
                  @click="addBookingSubmit(true)"
                >{{ $t('Biz.Booking.RegisteOr') }}</span>
              </label>
            </p>
            <!-- 自定义标签: 受总部自定义标签开关控制 -->
            <p class="itemBox-row"
              v-show="posSettings.isUsePercentageTab">
              <label class="itemBox-inputBox special-position">
                <span class="itemBox-item-normalTitle">{{ $t('Biz.Order.CustomLabel01') }}</span>
                <SelectList
                  id="customLabel"
                  ref="customLabel"
                  type="customTagId"
                  :width="selectListWidth"
                  :disabled="orderDisabledState"
                  :direction="selectListDirection"
                  :statusBtns="customLabelList"
                  :defaultFirstItem="customLabelShowTitle"
                  :closeList="selectListStateToggle"
                  @selectDone="selectDone"
                ></SelectList>
              </label>
            </p>
            <!-- 备注 -->
            <p class="itemBox-row banOverflow">
              <!-- 备注： -->
              <span class="itemBox-item-normalTitle3">{{$t('Dict.Remarkss')}}</span>
              <textarea
                @focus="showAndroidInput('addOrderInput.remark')"
                v-model="addOrderInput.remark"
                :disabled="orderDisabledState"
                class="addOrder-textArea"
                maxlength="220"
              ></textarea>
            </p>
          </div>
        </div>
      </div>
    </Dialog>
    <!-- 新建/修改预订单(弹窗)-新增/修改客位弹窗 -->
    <template>
      <Dialog
        name="PosDialog.AddBookingPoint"
        ref="addBookingPointDetailList"
        top="auto"
        width="780px"
        height="666px"
        customClass="moudel-center"
        @open="addBookingPointOpen"
        @close="addBookingPointClose"
        :closeByEsc="false"
        :hotkeys="AddBookingPointDialog"
        :showSubmit="false"
      >
        <!-- header插槽 -->
        <div slot="title" class="pos-dialog-header">
          <!-- 新增/修改客位 -->
          <h3 class="pos-dialog-title">{{ $t('Biz.Booking.NewModify') }}</h3>
          <div class="pos-dialog-control">
            <!-- 修改 -->
            <button
              type="button"
              class="btn btn-primary booking-addOrder-comfirm"
              @click="addBookingPointClose"
            >{{ $t('Dict.Modify') }}<i>(PgDn)</i></button>
          </div>
        </div>
        <!-- 布局容器 -->
        <div class="booking-addOrder-container booking-addOrderNewPoint">
          <!-- 顶部:客位过滤功能 -->
          <div class="addBookingChoosePoint-header">
            <div class="booking-dropdown-group addOrder-pointDropDown-box">
              <!-- 客位过滤, cheboxbox弹出框组件 -->
              <PointFilterBox
                id="addOrderFilterBox"
                ref="addOrderFilterBox"
                :closeList="selectListStateToggle"
                :btnNameList="chartFilterBtn"
                :chartFilterArea="addBookingPointFilterArea"
                :chartFilterType="addBookingPointFilterType"
                :chartFilterRequest="addBookingPointFilterRequest"
                :chartFilterRange="addOrderFilterRange"
                :conditions="addOrderFilteConditions"
                @executeBookFilte="executeAddBookPointFilte"
              ></PointFilterBox>
            </div>
            <!-- 额外过滤条件: 已开台客位, 不显示 -->
            <p class="addOrder-newPoint-freePoint" @click="addOrderPointFree = !addOrderPointFree">
              <span>
                <em v-show="addOrderPointFree" class="checkSign icon icon-duihao"></em>
                <!-- 只显示空闲客位 -->
              </span>{{ $t('Biz.Booking.OnlyFreeSeat') }}</p>
          </div>
          <!-- 客位列表 -->
          <div class="addBookingChoosePoint-list">
            <button
              type="button"
              class="list-item"
              :class="[
                { 'active': addChangeChosenPointClass(item) },
                bookingPointState(item, 'style', 'addChangePoint'),
              ]"
              v-for="(item ,index) in addBookingPointTable"
              v-show="addOrderTableFilteMethod(item, index)"
              @click="addChangeChosenPoint(item, index)"
              :key="index"
            >
              <em>{{ bookingPointState(item, 'content', 'addChangePoint') }}</em>
              <i v-show="addChangeChosenPointClass(item)" class="icon icon-duihao"></i>
              <b>{{ item.name }}</b>
              <!-- 人数显示判断: 最小值存在显示'min-max',最小值不存在只显示最大值, 最大值也不存在显示默认值(默认值必然存在) -->
              <span>{{
                $t('Dict.ManyPerson', [
                  item.min_capacity
                    ? item.min_capacity +'-'+ item.max_capacity
                    : item.max_capacity
                      ? item.max_capacity
                      : item.def_capacity
                ])
              }}</span>
            </button>
          </div>
          <!-- 页码,已选 -->
          <div class="addBookingChoosePoint-footer">
            <p class="item pageNum">{{ $t('Biz.Booking.Altogether01') +' '+ addBookTotalListNum +' '+ $t('Dict.Strip') }}</p>
            <div class="item pagerBox">
              <div class="orderTable-pagerBtn-box">
                <p class="pagerBtn-pageNum">{{
                  $t('Dict.PageStyle.Sim1', {
                    currentPage: addBookCurrentPageNum,
                    totalPage: addBookAllPageNum,
                  })
                }}</p>
                <p class="pagerBtn-btn">
                  <span class="pagerBtn-upBtn icon icon-pager-up" @click="addBookTurnPageUp"></span>
                  <span class="pagerBtn-downBtn icon icon-pager-down" @click="addBookTurnPageDown"></span>
                </p>
              </div>
            </div>
            <p class="item pointList">
              <!-- 已选： -->
              <em>{{ $t('Biz.Booking.Chosen') }}</em>
              <span
                class="selectedPoint"
                v-for="(item ,index) in currPointInBookingTable"
                @click="pointChosenItemDelete(item, index, currPointInBookingTable)"
                :key="index"
              >
                {{ item.name }}
                <i class="icon icon-close"></i>
              </span>
            </p>
          </div>
        </div>
      </Dialog>
    </template>
    <!-- 预订日历 已预订客位执行: 已预订信息列表 -->
    <el-dialog
      width="36%"
      height="400px"
      custom-class="bookedPointListDialog"
      :close-on-click-modal="false"
      :visible.sync="bookedPointListDialogVisible"
      @close="bookedPointListDialogClose"
    >
      <ul class="bookedPointInfoList-box">
        <li class="item"
          v-for="(item, index) in bookedPointInfoList"
          :key="index"
        >
          <span class="item-time">{{ item.expectArriveTime }}</span>
          <p class="item-content">
            <span>{{ item.bookPerson }}</span>
            <em>{{ item.contactTel }}</em>
          </p>
          <el-button
            class="item-button"
            type="primary"
            @click="bookedPointOpenModifyDialog(item)"
          >{{ $t('Dict.Modify') }}</el-button>
        </li>
      </ul>
      <span slot="footer" class="dialog-footer">
        <!-- 新建预订单 -->
        <el-button
          type="primary"
          @click="bookedPointOpenBookingDialog"
        >{{ $t('Biz.Booking.NewlyBooking') }}</el-button>
        <el-button
          @click="bookedPointListDialogClose"
        >{{ $t('Biz.Booking.Close01') }}</el-button>
      </span>
    </el-dialog>
    <!-- 预订单执行: 线上订单, 选客位弹窗 -->
    <ChoosePoint
      ref="choosePoint"
      :posBaseInfo="posBaseInfo"
      :savedOrderData="orderTable[orderTableItemActive] || {}"
      @doReserveOrder="doReserveOrder"></ChoosePoint>
    <!-- 预订单取消原因弹窗 -->
    <!-- 取消原因 -->
    <el-dialog
      width="40%"
      :title="$t('Dict.ReasonsForCancellation')"
      :visible.sync="orderCancelDialogVisible"
      @close="orderCancelDialogClear"
    >
      <div class="ordercancelReason-box">
        <p
          class="reasonList-item"
          v-for="(item, index) in cancelReasonList"
          @click="reasonListToggle(item, index)"
          :key="index"
        >
          <em class="reasonList-checkBox">
            <i v-show="reasonListActive == index"></i>
          </em>
          <span>{{ item.name }}</span>
        </p>
        <textarea
          v-show="otherReasonActive"
          v-model="otherReasonContent"
          :placeholder="$t('Dict.EnterSomething')"
          maxlength="220"
        ></textarea>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button
          @click="orderCancelDialogClose"
        >{{ $t('Biz.Booking.Cancel01') }}</el-button>
        <el-button
          type="primary"
          @click="sendSMsConfirm(orderCancelDialogSubmit)"
        >{{ $t('Biz.Booking.Confirm01') }}</el-button>
      </span>
    </el-dialog>
    <AndroidInput ref="AndroidInput"></AndroidInput>
    <SummaryOfBookedItems ref="sumOfBookedItems"></SummaryOfBookedItems>
  </div>
</template>

<script>

import Vue from 'vue';
import { mapGetters } from 'vuex';
import {
  each, find, includes, isEmpty, cloneDeep,
} from 'lodash';
import AndroidInput from '@/components/Pos/Common/AndroidInput';
import AndroidInputMixin from '@/components/Pos/Common/AndroidInputMixin';
import DialogMixin from '@/components/Pos/Common/DialogMixin';
import dateFormatMixin from '@/common/js/dateFormatMixin';
import Dialog from '@/components/Pos/Common/Dialog';
import Pager from '@/components/Pos/Common/Pager';
import ajax from '@/common/js/ajax';

/** 异步加载组件
   客位筛选功能综合组件 */
const PointFilterBox = (resolve) => {
  import('./PointFilterBoxItem').then((module) => {
    resolve(module);
  });
};
// 新建/修改 预订单弹窗input标题
const ItemTitle = (resolve) => {
  import('./AddOrderTitleItem').then((module) => {
    resolve(module);
  });
};
// 下拉列表组件
const SelectList = (resolve) => {
  import('./SelectListItem').then((module) => {
    resolve(module);
  });
};
// 线上预订单 执行开台客位选择页面
const ChoosePoint = (resolve) => {
  import('./ChoosePoint').then((module) => {
    resolve(module);
  });
};
// 预订品项汇总(预订品项: 排菜)
const SummaryOfBookedItems = (resolve) => {
  import('./SummaryOfBookedItems').then((module) => {
    resolve(module);
  });
};

export default {
  mixins: [
    DialogMixin, dateFormatMixin, AndroidInputMixin,
  ],
  components: {
    Dialog,
    Pager,
    PointFilterBox,
    ItemTitle,
    SelectList,
    ChoosePoint,
    AndroidInput,
    SummaryOfBookedItems,
  },

  data() {
    const that = this;
    return {
      /** ************************************************************************
       ** 静态数据 * */
      // 执行全局点击事件配置对象, 局部函数名添加于此
      globalClickData: [
        /** 全局点击执行关闭方法, 静态配置参数(预先写死), 格式固定
            id-组件的id(与组件ref同名), activeName-组件显示开关参数, state-关闭值, isComponent-当前配置项为组件
            来电预订记录列表-预订状态 */
        {
          id: 'bookingStatusBox',
          activeName: 'bookingStatusSwitch',
          state: false,
        },
        // 预订单-列表筛选器
        {
          id: 'orderFilterBox',
          activeName: 'orderFilterCheckActive',
          state: null,
        },
        // 新建预订单-到店时间隐藏列表
        {
          id: 'addOrderoreArrivalTime',
          activeName: 'arrivalTimeDropListActive',
          state: false,
        },
        // 预订日历-客位过滤(* 组件 *)
        {
          id: 'bookingFilterBox',
          activeName: 'dropDownActive',
          isComponent: true,
          state: null,
        },
        // 新建预订单-市别
        {
          id: 'addOrderShiftList',
          activeName: 'statusSwitch',
          isComponent: true,
          state: false,
        },
        // 新建预订单-营销员
        {
          id: 'addOrderEmpList',
          activeName: 'statusSwitch',
          isComponent: true,
          state: false,
        },
        // 新建预订单-预定类型
        {
          id: 'addOrderBookTypeList',
          activeName: 'statusSwitch',
          isComponent: true,
          state: false,
        },
        // 新建预订单-订金类型
        {
          id: 'addOrderDepositPaywayList',
          activeName: 'statusSwitch',
          isComponent: true,
          state: false,
        },
        // 新建预订单-预订人性别
        {
          id: 'bookPersonSexList',
          activeName: 'statusSwitch',
          isComponent: true,
          state: false,
        },
        // 新建预订单-自定义标签
        {
          id: 'customLabel',
          activeName: 'statusSwitch',
          isComponent: true,
          state: false,
        },
        // 新建预订单- 新增/修改客位- 客位过滤
        {
          id: 'addOrderFilterBox',
          activeName: 'dropDownActive',
          isComponent: true,
          state: null,
        },
      ],
      // 左侧区域整体开关
      leftAreaFold: true,
      // 左侧边侧栏折叠按钮显示参数
      isFoldBtn: true,

      // 会员和预订tabs
      memberCallBtn: [
        // 会员信息
        { name: this.$t('Biz.Booking.VipInfo'), code: 'vipInfo' },
        // 预订信息
        { name: this.$t('Biz.ArrangeMenu.BookedInfo'), code: 'bookInfo' },
      ],
      // 会员信息 & 预订信息 开关(初始显示-写死)
      memberCallBtnActive: { name: this.$t('Biz.Booking.VipInfo'), code: 'vipInfo' }, // 会员信息
      // 预订日历和预订单
      bookingTableBtn: [
        { name: this.$t('Biz.Booking.BookTable'), code: 'calendar' }, // 预订日历
        { name: this.$t('Biz.Booking.BookOrder'), code: 'bookList' }, // 预订单
      ],
      // 默认选中右侧table表-标签(写死)
      bookingTableBtnActive: { name: this.$t('Biz.Booking.BookTable'), code: 'calendar' }, // 预订日历

      // 会员信息无内容显示
      memberInfoNonContent: false,
      memberbookedNonContent: false,
      // 会员信息列表 & 预订记录列表开关
      memberInfoOrListActive: false,
      // 来电预订记录列表 日期选择绑定数据
      memberPicker: {
        // 预订列表 日期值: 初始值为当前日期
        callListDateVal: null,
        // 禁用当前之后日期
        pickerDateAfter: {
          disabledDate(time) {
            // +time-选择日期(Date格式)转时间戳
            return +time > Date.now();
          },
        },
      },
      // 新来电提醒 状态参数
      comingCallShow: false,
      // 来电提醒线路
      comingCallpaths: [],
      // 来电详情-来电提醒Tab
      comingCallPathsTabs: [],
      // 当前查看线路
      currentpath: 0,
      // 客位状态列表开关
      bookingStatusSwitch: false,
      // 客位状态按钮
      bookingStatusBtn: {
        // 初始显示(写死)
        title: { name: this.$t('Biz.Booking.BookedState'), code: 'init' }, // 预订状态
        item: [
          { name: this.$t('Dict.All'), code: 'all' }, // 全部
          { name: this.$t('Biz.Booking.UnBook'), code: 'unBooked' }, // 未预订
          { name: this.$t('Biz.Booking.BookedsL'), code: 'booked' }, // 预订
        ],
      },
      // 预订记录列表内容预定状态标识
      memberCallListState: [this.$t('Biz.Booking.UnBook'), this.$t('Biz.Booking.Bookeds')], // '未预订', '已预订'
      // 预订(来电)记录列表- 缓存当前激活项
      currCalledListItem: '',
      // 预订记录列表分页id
      bookingPagerId: 'bookingList',
      showInfo: true,
      // 预订日历日期选择绑定数据
      bookingChartPicker: {
        // 客位列表预订 日期值: 初始值为当前日期
        chartDateVal: null,
        // 禁用当前之前日期: 判断-小于判断时间点, 返回false禁用日期选择
        pickerDateBefore: {
          disabledDate(time) {
            // crossDayInLastShift-跨天且最后营业识别未结束: 当前时间 > 自然日0点 且 < 未结束营业日最后市别结束时间
            if (that.crossDayInLastShift) {
              // 返回 小于前一天(当前0点减一天)时间为false
              return +time < new Date(new Date().toLocaleDateString()) - 86400000;
            }
            // 当前时间超过0点, 且上营业日结束, 返回 小于今天0点时间为false
            return +time < new Date(new Date().toLocaleDateString());
          },
        },
      },
      // 当前营业日所属最后市别截止时间: 值类型-时间戳
      lastShiftEndTime: null,
      // 跨天时间状态: 当前为跨天的,处于未结束营业日最后市别以内
      crossDayInLastShift: false,

      // 预订单分页id
      bookingOrderPagerId: 'tableOrderPage',

      // 当前市别id(当前时间所处市别)
      currentShiftId: '',
      // 预订日历下拉列表筛选 // '区域', '客位类型', '客位标签', '人数'
      chartFilterBtn: [
        // '区域', '客位类型', '客位标签', '人数'
        this.$t('Biz.Booking.Area'),
        this.$t('Dict.SeatType'),
        this.$t('Biz.Booking.SeatLabel'),
        this.$t('Dict.NumberOfPeople'),
      ],
      chartFilterBtnActive: null,
      // 区域(area)
      chartFilterArea: [
        // {       "pinyin": null,
        //         "createTime": "2017-12-29T13:34:41.329",
        //         "creatorId": "9900000000000001",
        //         "creatorName": "000-管理员",
        //         "modifyTime": "2017-12-29T13:34:41.329",
        //         "modifierId": "9900000000000001",
        //         "modifierName": "000-管理员",
        //         "delflg": 0,
        //         "uploadFlg": null,
        //         "downloadFlg": null,
        //         "id": "9900000010005049",
        //         "code": "01",name: "大厅", check: 1 },
      ],
      // 客位类型(pointTypeList)
      chartFilterType: [
        // { name: "散台", check: 1 },
        // { name: "包间", check: 1 },
        // { name: "外卖", check: 1 }
      ],
      // 客位标签(pointLabelList)
      chartFilterRequest: [
        // { name: "可吸烟", check: 1 },
        // { name: "可唱歌", check: 1 },
        // { name: "靠窗", check: 1 },
        // { name: "单人", check: 1 }
      ],
      // 人数选择
      chartFilterRange: {
        val: 0, // 绑定当前选择人数
        max: 10, // 显示人数最大值
      },
      // 预订单 预定列表 日期查询器, 查询日期对象 (初始赋值格式:2018-5-15 月份没有补0, 留坑, 不知道接口传值是或否有效)
      orderChartPicker: {
        chartDateVal: +new Date(),
      },
      // 预订单table title
      orderTableTitle: [
        // '预订人', '联系电话', '到店时间', '市别', '已选客位', '就餐人数', '订单号',
        // '来源', '预订类型', '营销员', '操作员', '订金', '备注', '状态',
        this.$t('Biz.Booking.BookPerson'),
        this.$t('Dict.ContactNumber'),
        this.$t('Biz.Booking.Arrive'),
        this.$t('Dict.Shift'),
        this.$t('Biz.Booking.ChosenSeat'),
        this.$t('Dict.EatPersonNum'),
        this.$t('Dict.OrderNumber'),
        this.$t('Dict.Source'),
        this.$t('Biz.Booking.BookType'),
        this.$t('Dict.Salesman'),
        this.$t('Biz.Booking.Operator01'),
        this.$t('Biz.Booking.BookDeposit01'),
        this.$t('Dict.Remarks'),
        this.$t('Dict.State'),
      ],
      // 预订单列表Table
      orderTable: [
        // {
        //   id: '',
        //   orderNo: '',             // 订单编号 格式为YD-yyyyMMdd-四位递增数字
        //   orderSource: 0,          // 订单来源 1：线上 2：来电预订 3：到店预订 4: 食尚订
        //   bookPerson: '',          // 预订人
        //   contactTel: '',          // 联系电话
        //   expectArriveTimeStr: '', // 预计到达时间文字
        //   pointNameStr: '',        // 客位名
        //   peopleQty: 0,            // 就餐人数
        //   bookType: '',            // 预订类型
        //   marketEmpName: '',       // 营销员姓名
        //   operEmpName: '',         // 操作员姓名
        //   deposit: 0,              // 订金
        //   remark: null,            // 备注
        //   state: 0,                // 订单状态 0：未执行 1：已执行 2：取消 3：过期
        //   // 以下无用字段
        //   pointList: null,         // 客位列表
        //   action: null,
        //   bookPointList: null,
        //   bookTime: '',            // 预订日期
        //   bookTimeStr: '',         // 预订日期字符串
        //   bookTypeName: '',        // 就餐类型文字
        //   bsId: null,
        //   cancelEmpId: null,       // 取消预订操作员ID
        //   cancelEmpName: null,     // 取消预订操作员姓名
        //   cancelReason: null,      // 取消预订原因
        //   cancelTime: '',          // 取消预订日期时间
        //   code: null,
        //   createShopId: 0,         // 创建店ID
        //   createShopName: null,    // 创建店名称
        //   createTime: '',          // 创建时间
        //   creatorId: '',           // 创建人ID
        //   creatorName: '',         // 创建人姓名
        //   crmId: null,             // 会员ID
        //   delflg: 0,               // 删除标识 0：正常 1：回收站 2：删除
        //   downloadFlg: 1,          // 下载标识 0：未下载 1：已下载 2：下载中
        //   expectArriveTime: '',    // 预计到达时间 预订日期和到店时间
        //   marketEmpId: '',         // 营销员ID
        //   modifierId: '',          // 更改人ID
        //   modifierName: '',        // 更改人姓名
        //   modifyTime: '',          // 更改时间
        //   name: null,
        //   operEmpId: '',           // 操作员ID
        //   orderItemFlag: null,     // 预订时是否订餐
        //   payAmount: null,
        //   payBusNo: null,          // 支付号
        //   payFinishTime: null,     // 支付完成时间
        //   payState: null,          // 支付状态
        //   payType: null,           // 支付类型
        //   pinyin: null,
        //   pk: '',
        //   rvCheck: null,           // 是否需要确认
        //   shiftId: '',             // 预订市别ID
        //   shiftName: null,         // 预订市别名称
        //   uploadFlg: 1,            // 上传标识 0：上传 1：已上传 2：上传中
        //   wuuId: null,             // 线上订单编号
        //   wuuState: null,          // 线上状态
        //   pointIdStr:null          // 客位id信息
        // }
      ],
      // 预订单table 当前行选中样式绑定数据
      orderTableItemActive: null,

      // 预定日历和'新建/修改'预订单-客位筛选(人数)的最大值(显示用)
      pointMaxNum: 1,
      // 预订单Table客位过滤条件模型
      bookFilteConditions: {
        area_id: '', // 区域条件(同区域id字段名)
        type_id: '', // 类型条件(同类型id字段名)
        pointLabelIds: '', // 标签条件(同标签属性字段名)
        num: 0, // 人数范围
      },
      // 预订日历-分页数据
      bookTableDOM: null, // 预订日历列表DOM对象
      everyPageListNum: 8, // 列表每页条数
      totalListNum: 1, // 总条数
      allPageNum: 1, // 总页数
      currentPageNum: 1, // 当前页数
      // 预订日历和预订单的分页查询loading
      chartPageLoading: null,

      // 新建/修改预订单-新增修改客位-客位列表过滤条件模型
      addOrderFilteConditions: {
        area_id: '', // 区域条件(同区域id字段名)
        type_id: '', // 类型条件(同类型id字段名)
        pointLabelIds: '', // 标签条件(同标签属性字段名)
        num: 0, // 人数范围
      },
      // 新建/修改预订单-新增修改客位-客位列表-分页数据
      addBookEveryPageListNum: 42, // 列表每页条数
      addBookTotalListNum: 1, // 总条数
      addBookAllPageNum: 1, // 总页数
      addBookCurrentPageNum: 1, // 当前页数
      // 新建/修改预订单-新增修改客位-客位列表分页查询loading
      addBookPageLoading: null,

      // 新建/修改预订单
      addBookingPointFilterArea: [],
      addBookingPointFilterType: [],
      addBookingPointFilterRequest: [],
      // 人数选择
      addOrderFilterRange: {
        val: 0, // 绑定当前选择人数
        max: 10, // 显示人数最大值
      },
      // 预订单关联排菜单的数据对象
      bookOfArrangeMenuData: null,
      // 新建预订单-修改客位-客位过滤: '只显示空闲客位', 选中状态
      addOrderPointFree: false,

      // 订单所有类型静态数据, 区别于 当前业务的预订单来源ordersSource
      orderAllSource: [
        // { name: '线上预订', value: 1 },
        // { name: '来电预订', value: 2 },
        // { name: '到店预订', value: 3 },
        // { name: '食尚订', value: 4 },
        // { name: '新荣记', value: 5 },
        // { name: '客必得', value: 6 },
      ],
      // 自定义标签(开台时用)
      customLabelList: [],
      /** 预订单附属操作 * */
      // 预订单筛选器,按钮名称对象
      orderFilterBtns: [
        // '状态', '来源', '预定类型'
        this.$t('Dict.State'),
        this.$t('Dict.Source'),
        this.$t('Biz.Booking.BookType'),
      ],
      /** 预订单筛选器, 下拉列表对象
          订单状态 */
      orderState: [
        { name: this.$t('Biz.Booking.UnExecuteO'), check: 1 }, // 未执行
        { name: this.$t('Biz.Booking.ExecutedO'), check: 1 }, // 已执行
        { name: this.$t('Dict.Cancelled'), check: 1 }, // 已取消
        { name: this.$t('Biz.Booking.OverdueO'), check: 1 }, // 已过期
      ],
      // 订单来源
      ordersSource: [
        //  {name: '线上预订', check: 1},
        //  {name: '来电预订', check: 1},
        //  {name: '到店预订', check: 1},
        //  {name: '食尚订', check: 1},
      ],
      // 预定类型, 同新建预订单的预定类型对象数组, 使用后台原始数据, 深克隆为新数组并添加'check'属性, 获取后台数据时执行
      orderBookingTypeList: [],
      // 预订单 筛选器 子选项下拉checkbox显示开关参数
      orderFilterCheckActive: null,
      // 预订单筛选器: 列表过滤条件模型
      orderFilteConditions: {
        state: [], // 状态条件:4种, 0-未执行  1-已执行   2-已取消   3-已过期
        orderSource: [], // 来源条件:订单来源4种,  1-线上 2-来电预订 3-到店预订 4-食尚订
        bookTypeName: [], // 预定类型条件
      },
      // 预订单查询框绑定对象
      orderSearchTxt: '',

      // 全部打印/打印
      printBtnCurrent: 0,
      // 执行,修改,取消按钮的样式和状态参数
      btnDisalbed: true,
      // 是否是线上传来订单
      notIsO2O: false,
      // 新建/修改 预订单弹窗 '取消按钮' 状态参数: 只在'修改预订单'模式显示
      onlyChangeOrder: false,
      // 新建/修改 预订单弹窗 '确定按钮' 状态参数: 只在'查看预订单'模式下 不显示
      addAndChangOrder: true,
      // 预订单 取消原因列表
      cancelReasonList: [],
      // 预订单取消弹窗 状态参数
      orderCancelDialogVisible: false,
      // 预订单取消原因 列表选中 状态参数(默认第一个)
      reasonListActive: 0,
      // 其它原因 输入框 状态参数
      otherReasonActive: false,
      // 其他原因 输入内容绑定对象
      otherReasonContent: '',

      /** ***********************************************************************
       ** 动态数据 * */

      // 会员信息列表数据
      memberInfoList: {
        // name: "",
        // telNo: "13920172036",
        // sex: true,
        // birthday: null,
        // labelList: ["忠诚", "高品质", "正常", "特别辣"],
        // cardTypeName: "周培越会员卡",
        // totalConsumeMoney: 779.81,
        // note: "",
        // shopName: "吾享餐饮测试三店",
        // totalConsumeTimes: 46
      },
      // 会员预订信息列表数据
      bookedInfo: {
        // total: "1",
        // overduecount: "0",
        // cancelcount: "0",
        // percent: "100%",
        // executecount: "1",
        // favorLabels: "aa,112,34,ss",
        // favorPoints: [
        //   {
        //     point: "001-001-大厅",
        //     count: "1",
        //     point_id: "80700000000000112"
        //   }
        // ],
        // lastestbooktime: "2018.03.28",
        // notexecutecount: "1",
        // orderList: [
        //   {
        //     bookTimeStr: "2018-03-30",
        //     shiftName: "晚市",
        //     pointNameStr: "004-004-大厅"
        //   }
        // ]
      },
      // 预订记录列表数据
      memberCallList: [
        // {
        //   id: "123123123", // ID
        //   telNo: "13112345678", // 电话号码
        //   state: 0, // 状态 0：未预订 1：已预订
        //   telLineNo: null, // 线路号码
        //   callTimeLong: "1522400727361" // 来电时间（格式：时间戳 单位：毫秒）
        // }
      ],
      // 预订日历列表数据
      bookingTable: [],
      // 当前选中客位信息,并起调新建预订单弹窗
      currPointInBookingTable: [],
      // 存储选中项index
      currPointIndex: [],
      // 存储选中项 日期index
      currPointDateIndex: '',

      // 预订日历显示周期数据
      tableDateInCol: [7, 15, 20, 25, 30],
      // table的列数, 也是客位展示的天数
      tableDateInColActive: null,

      // 预订日历日期快速查询按钮数据(起始)
      tableDateIntervalStart: null,
      // 预订日历日期快速查询按钮数据(截止)
      tableDateIntervalEnd: null,

      // 市别列表数据(预订日历和预订单用)
      businessShift: [
        // {
        //   startTime: '06:30',
        //   id: '9900000000000004',
        //   isStartShift: true,
        //   name: '早市'
        // },
      ],
      // 预订日历市别选中项: 默认市别列表第一个选中(index=0)
      businessShiftActive: 0,
      // 预订日历 市别切换禁用状态参数
      businessShiftDisabled: false,
      // 赋值并添加 全部识别 数据的 预订单市别列表
      orderBusinessShift: [],
      // 预订单市别选中项
      orderTableShiftActive: 0,
      // 预订日历-已预订客位执行: 已预订信息列表
      bookedPointListDialogVisible: false,
      // 预订日历-已预订客位
      bookedPointInfoList: [
        // {
        //     "bookPerson": "123",
        //     "expectArriveTime": "12:30",
        //     "contactTel": "123",
        //     "orderId": "22500000000000050"
        // },
      ],
      // 预订日历-已预订客位的选择(点击)预订信息(等同预订单数据对象): 预订客位会绑定一个或多个的预订信息,缓存选中项
      bookedPointInfoListChosenItem: '',
      // 多预订提醒间隔时间
      multiBookTime: 30,
      // 多预订间隔时间提醒 状态参数
      multiBookTimeActive: false,
      /** 新建预订单 * */
      // 关闭弹窗自定义提示内容
      // closingMsg: '您未提交修改内容, 确定关闭吗?',
      closingMsg: this.$t('Biz.Booking.BookTip05'),
      /* 预订单弹窗:
          1.新建预订单
          2.修改预订单
          3.查看预订单
        同一个弹窗, 实现三种业务功能, 三种业务数据(静态数据)
       */
      dialogType: [
        { name: this.$t('Biz.Booking.NewlyBooking'), type: '1' }, // 新建预订单
        { name: this.$t('Biz.Booking.ModifyBooking'), type: '2' }, // 修改预订单
        { name: this.$t('Biz.Booking.CheckBooking'), type: '3' }, // 查看预订单
      ],
      // 弹窗标题
      dialogTitle: '',
      // 弹窗 禁用功能绑定参数
      orderDisabledState: false,
      // 订金列表 禁用功能绑定参数
      depositPaywayDisabledState: false,
      // 市别列表: 使用 businessShift市别列表
      // 市别组件首显内容
      addOrderShiftShowTitle: '',

      // 选择时间间隔(到店时间选择)
      timeSpan: 30,
      // 到店时间选择列表(总时间选项)
      arrivalTimeList: [
        // '06:00', // '06:30',
      ],
      // 到店时间直接显示部分 选中项(下标)
      arrivalTimeShowListSelected: 0,
      // 到店时间直接展示(首选时间) 数量: 小于部分-直接展示, 大于部分-隐藏列表展示
      arrivalTimeShowNumber: 5,
      // 到店时间菜单显部分(非首选时间)弹窗开关
      arrivalTimeDropListActive: false,
      // 新建预订单datePicker
      addOrderDate: {
        val: new Date(),
        // 禁用日期
        pickerDateBefor: {
          disabledDate(time) {
            return +time < +new Date(new Date().toLocaleDateString());
          },
        },
      },
      // 预订类型列表
      // 宽度 国际化适配英文版 zhCN enUS zhHK
      selectListWidth: (Vue.config.lang === 'zhCN' || Vue.config.lang === 'zhHK')
        ? '60%'
        : '66%',
      selectTypeWidth: (Vue.config.lang === 'zhCN' || Vue.config.lang === 'zhHK')
        ? '60%'
        : '75%',
      selectListDirection: 'up',
      // 预定类型列表数据
      diningTypeList: [
        // {
        //     "id": "1301",
        //     "name": "普通就餐"
        // },
      ],
      // 预定类型默认首显文字 this.$t('Biz.Booking.NewlyBooking')
      // diningTypeListShowTitle: '请选择预订类型',
      diningTypeListShowTitle: this.$t('Biz.Booking.BookTip06'),
      // 营销员列表
      empList: [
        // {
        //   "pinyin": "yj",
        //   "createTime": "2017-12-29T13:20:17.977",
        //   "creatorId": "9900000000000001",
        //   "creatorName": "000-管理员",
        //   "modifyTime": "2017-12-29T13:25:16.005",
        //   "modifierId": "9900000000000001",
        //   "modifierName": "000-管理员",
        //   "delflg": 0,
        //   "uploadFlg": 0,
        //   "downloadFlg": 1,
        //   "mid": "9900000010005041",
        //   "code": "001",
        //   "name": "yj",
        //   "password": null,
        //   "isAdmin": true,
        //   "isGroupEmp": false,
        //   "deptId": "9900000000005006",
        //   "deptName": "08-测试门店一级节点",
        //   "belongShopId": null,
        //   "belongShopName": "002223-分店",
        //   "createShopId": null,
        //   "createShopName": "1001-JT467-餐饮柒研发",
        //   "dutyId": "9900000000000001",
        //   "dutyName": "总经理",
        //   "address": "",
        //   "cellphone": "",
        //   "birthday": null,
        //   "idCard": "",
        //   "email": "",
        //   "married": 0,
        //   "sex": 0,
        //   "isEnable": true,
        //   "authCard": "",
        //   "authCode": "",
        //   "confirmPassword": null,
        //   "fingerprint": null,
        //   "id": "9900000010005041",
        //   "username": "yj",
        //   "pk": "9900000010005041"
        // },
      ],
      // 营销员列表默认首显文字
      // empListShowTitle: '请选择营销员',
      empListShowTitle: this.$t('Biz.Booking.BookTip07'),
      // 自定义标签: '请选择自定义标签'
      customLabelShowTitle: this.$t('Biz.Booking.BookTip40'),
      // 新建预订单-已选客位列表
      pointChosenList: [
        // {
        //   area_id: "9900000010005050",
        //   code: "001",
        //   def_capacity: 20,
        //   id: "9900000010005338",
        //   max_capacity: 0,
        //   min_capacity: 0,
        //   name: "包间1",
        //   state: 1
        // }
      ],
      // 新建预订单-新弹窗客位显示列表
      pointChosenListNewDailog: [
        // {
        //   area_id: "9900000010005050",
        //   code: "001",
        //   def_capacity: 20,
        //   id: "9900000010005338",
        //   max_capacity: 0,
        //   min_capacity: 0,
        //   name: "包间1",
        //   state: 1
        // }
      ],
      // 新建预订单-订金类型列表
      depositPaywayList: [
        // {
        //   id: '1',
        //   name: '人民币'
        // },
        // {
        //   id: '2',
        //   name: '银行卡'
        // },
        // {
        //   id: '3',
        //   name: '其他'
        // }
      ],
      // bookPersonSexShowTitle: '先生',
      bookPersonSexShowTitle: this.$t('Biz.Booking.Sir'),
      bookPersonSexList: [
        {
          id: 1,
          name: this.$t('Biz.Booking.Sir'),
        }, // 先生
        {
          id: 2,
          name: this.$t('Biz.Booking.Lady'),
        }, // 女士
      ],
      // 订单单(新建/修改), 用户输入数据
      addOrderInput: {
        bookPerson: '', // 预订人
        gender: 1,
        bookTimeStr: '', // 预定日期2018-05-09
        bookTypeStr: '', // 预订类型id
        depositPayway: '0', // 订金类型id
        contactTel: '', // 预订电话
        deposit: 0, // 订金
        expectArriveTimeStr: '', // 到店时间12:30
        idStr: '', // **未知
        marketEmpIdStr: '', // 营销员id
        orderNo: '', // ** 未知
        orderSource: 3, // 预订单来源:根据电话信息指定订单来源，有电话ID则为2（来电预订），否则为3（到店预订）
        peopleQty: 0, // 人数
        pointList: [], // 所选客位列表
        customTagId: '', // 自定义标签id
        remark: '', // 备注
        shiftIdStr: '', // 市别id
        needSms: 0, // 是否发送短信(修改和取消 预订单时): 0-不需要, 1-需要
        arrangeIdStr: '', // 关联排菜单的id
        arrangeName: '', // 关联排菜单的名称
        modifyTimeStr: '', // 修改时间(新建时传空)
      },
      arrangelist: [], // 关联排菜单的数组
      addBookingPointTable: [],

      /**
       * 当前预订业务对接平台 预置业务规则:
       *  1.自有业务(吾享线上+来电+到店线下): 参数 1 - 吾享线上订单来源, 不可修改, 其他正常
       *  2.食尚订(订多多平台): 参数 4 - 平台线上来源, 不可线下新建预订, 不可打印/修改/取消, 只能执行和查看
       *  3.新荣记: 参数 5 - 平台线上来源, 不可线下新建预订, 不可打印/执行/修改/取消, 只能查看
       *  4.客必得(西贝平台): 参数 6 - 平台线上来源, 同 食尚订.
       * 业务逻辑同上, 后台参数, 执行相应业务规则, 供交互流程判断
       */
      bookedLogicRule: {
        // 吾享线上
        1: {
          booking: true, // 能否 新建预订单
          print: true, // 能否 打印预订单
          execute: true, // 能否 执行预订单
          modify: false, // 能否 修改预订单
          cancel: true, // 能否 取消
        },
        // 来电
        2: {
          booking: true, // 能否 新建预订单
          print: true, // 能否 打印预订单
          execute: true, // 能否 执行预订单
          modify: true, // 能否 修改预订单
          cancel: true, // 能否 取消
        },
        // 到店
        3: {
          booking: true, // 能否 新建预订单
          print: true, // 能否 打印预订单
          execute: true, // 能否 执行预订单
          modify: true, // 能否 修改预订单
          cancel: true, // 能否 取消
        },
        // 食尚订
        4: {
          booking: false, // 能否 新建预订单
          print: false, // 能否 打印预订单
          execute: true, // 能否 执行预订单
          modify: false, // 能否 修改预订单
          cancel: false, // 能否 取消
        },
        // 新荣记
        5: {
          booking: false, // 能否 新建预订单
          print: false, // 能否 打印预订单
          execute: false, // 能否 执行预订单
          modify: false, // 能否 修改预订单
          cancel: false, // 能否 取消
        },
        // 客必得
        6: {
          booking: false, // 禁用 新建预订单
          print: false, // 禁用 打印预订单
          execute: true, // 禁用 执行预订单
          modify: false, // 禁用 修改预订单
          cancel: false, // 禁用 取消
        },
        // 新美大
        7: {
          booking: false, // 禁用 新建预订单
          print: false, // 禁用 打印预订单
          execute: true, // 禁用 执行预订单
          modify: false, // 禁用 修改预订单
          cancel: false, // 禁用 取消
        },
      },
      openBuffetDeposit: false, // 是否开启了自助餐押金  如果开启了 登记/退 按钮不可见
      isMultiBook: 0, // 是否开启同客位/同市别多预订功能---已占用客位预订时判断使用 -- CY7-2908
    };
  },

  created() {
    // 初始化调用接口,执行基本数据信息查询: 最早执行的接口, 使用同步方式(接口数据赋值完成), 再执行回调
    // 初始化调用, 在路有钩子(beforeRouteEnter),每次进入执行'基本信息'接口(getBasicInfo)数据查新
  },

  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.init();
    });
  },

  mounted() {
    // 渲染全局点击事件, 执行局部点击事件selectListStateToggle(集合,有多个执行全局事件)
    this.globalClick(this.selectListStateToggle);
    // 主页(或其他路由)激活时,触发本方法,执行来电后业务处理
    this.$von('bookingTelPush', (path) => {
      this.incomingTelOpt(path);
    });
    // 选择排菜单后(新建/修改)预订单的回显,(供 排菜单列表页选择后执行)
    this.$von('selectedArrangeMenuBus', (data) => {
      this.selectedArrangeMenu(data);
    });
    // 供 市别推送执行 本业务 软刷新页面
    this.$von('refreshBookPageBus', (data) => {
      this.$confirm(data, {
        confirmButtonText: this.$t('Dict.Sure'),
        showCancelButton: false,
        type: 'warning',
        showClose: false,
        closeOnClickModal: false,
        closeOnPressEscape: false,
      }).then(() => {
        // 跳路由,已达到接口全部重新请求,更新数据
        this.$router.push('/pos');
        setTimeout(() => {
          this.$router.push('/pos/booking');
        }, 40);
      });
    });
    // 供 客位变化推送 执行当前模块 更新数据
    this.$von('refreshBookBusinessBus', () => {
      this.refreshCurrBusinessData();
    });
    // 是否开启了自助押金
    this.initShowBuffetDeposit();

    // 初始化(重置)预定日历和'新建/修改'客位分页(当前页)
    this.currentPageNum = 1;
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
    // 预订单弹窗: 快捷键调用提交
    bookingDialog() {
      return {
        PgDn: () => {
          this.addBookingSubmit('');
        },
      };
    },
    // 预订单-客位弹窗: 快捷键调用提交
    AddBookingPointDialog() {
      return {
        PgDn: () => {
          this.addBookingPointClose();
        },
      };
    },
    // 获取store参数: 是否必填取消原因
    ...mapGetters(['posBaseInfo', 'posBooking', 'posSettings', 'ALL_POS_MODULE', 'posInfo']),
  },
  methods: {
    // 调路由 初始化基本数据
    init() {
      this.$hotKey.set('Pos.Booking', {});
      // 重置为预订日历激活状态
      this.leftAreaFold = true;
      // 激活显示 预订来电列表
      this.memberInfoOrListActive = false;
      // this.bookingTableBtnActive = {name: '预订日历', code: 'calendar'}; // 初始化-写死
      this.bookingTableBtnActive = { name: this.$t('Biz.Booking.BookTable'), code: 'calendar' }; // 初始化-写死
      // 加载(重载)基本数据
      this.getBasicInfo(
        // 传递 需执行的回调
        () => {
          // 初始化当前线路
          this.currentpath = 0;
          // 初始化: 预订(来电)记录列表 查询日期
          this.memberPicker.callListDateVal = +new Date();
          // 初始化: 预订日历 日期选择器, 日期初始赋值 为当前
          // 忽略原需求显示为下一市别功能。

          this.bookingChartPicker.chartDateVal = +new Date();
          // 匹配设置预订单初始显示为 当前市别
          this.businessShift.some((item, index) => {
            // 根据后台设定当前市别, 设置预订日历初始为'当前市别'下一市别, 设置预订单初始为当前是被
            if (item.id === this.currentShiftId) {
              // 因为预订单市别列表第一个是"全部", 故index+1
              this.orderTableShiftActive = index + 1;
              return true;
            }
            return false;
          });
          this.orderChartPicker.chartDateVal = +new Date();
          /**
           * 预订日历客位分页初始化
           */
          // 初始化预订日历列表行数-保存容器DOM对象
          this.bookTableDOM = document.querySelector('.booking-chartTable');
          // 初始化预订日历列表行数-执行列表行数计算
          this.computedBookTableROW('初始化加载');
          // 初始化(重置)预定日历和'新建/修改'客位分页(当前页)
          // this.currentPageNum = 1;
          this.addBookCurrentPageNum = 1;
        },
      );
      // window监听窗口变化,执行动态计算预订日历-客位列表行数
      window.addEventListener('resize', () => {
        this.bookTableROW(this.computedBookTableROW);
      });
    },
    // 实时刷新当前业务模块的最新数据
    refreshCurrBusinessData() {
      if (this.bookingTableBtnActive.code === 'calendar') {
        // 刷新预订日历 数据(当前过滤条件+分页+无loading)
        this.getBookingViewDetailsData(null, this.currentPageNum, null, true);
      } else {
        // 刷新预订单列表 数据
        this.getOrderList();
      }
    },
    /** ***************************************************
     * 静态方法 */
    // 预订日历-客位列表行数的计算方法
    computedBookTableROW(txt) {
      // 获取表格容器高度,动态计算
      this.everyPageListNum = parseInt(this.bookTableDOM.offsetHeight / 44, 10);
      // console.log(txt);
    },
    // 预订日历-客位列表行数-实时计算的节流
    bookTableROW(method, context) {
      clearTimeout(method.timer);
      method.timer = setTimeout(() => {
        method('resize加载');
        this.getBookingViewDetailsData(null);
      }, 200);
    },

    // 预订信息图表渲染方法(右半圆)
    bookingChartPieRightRender(data) {
      return parseInt(data, 10) < 50
        ? `rotate(${Number(data) * 3.6}deg)`
        : '';
    },

    // 预订信息图表渲染方法(左半圆)
    bookingChartPieLeftRender(data) {
      return parseInt(data, 10) > 50
        ? `rotate(${(parseInt(data, 10) - 50) * 3.6}deg)`
        : '';
    },

    // 预订日历table的列数根据数量计算显示样式
    tableColItemStyle(num) {
      return num <= 15 ? 'colItem15' : 'colItem25';
    },

    /* 全局点击事件回调函数
     * @param: id-执行回调对象HTML id
     * @desc: 判定执行: 绑定window点击事件回调本函数, 判定非本事件对象(判断依据: 预置全局点击配置参数的id == 触发事件传递id)执行关闭
     * - 弹出下拉列表切换方法:全局时(点击空白处)执行关闭, 作为回调传向globelClick()方法
     * - 各组件实现空白点击关闭, 需要添加配置参数到globalClickData对象(需要关闭的组件(容器)id, 关闭状态参数, 关闭设定值)
     * - ****  调用本方法的事件, 需在@click使用stop(@click.stop), 以阻止冒泡倒是更改模块开关参数的修改不生效  ****
    */
    selectListStateToggle(id) {
      // 调用需要参数: 循环全局点击事件对象,
      this.globalClickData.forEach((_) => {
        // 当前执行组件的id, 匹配当前触发组件的配置参数, 不是当前触发组件的id为undefined,则执行组件关闭
        if (_.isComponent) {
          // 当前操作为组件时, 设定其下拉列表的开关参数, 点击空白时为关闭
          if (this.$refs[_.id]) {
            this.$refs[_.id][_.activeName] = _.id === id ? this.$refs[_.id][_.activeName] : _.state;
          }
        } else {
          // 设定普通功能模块时,
          this[_.activeName] = _.id === id ? this[_.activeName] : _.state;
        }
      });
    },
    /* 新建/修改 预订单客位筛选器 ---------------------------------
       新建预订单-新增/修改客位-客位筛选器: **客位筛选显示方法**
    */
    addOrderTableFilteMethod(item) {
      // 声明临时变量, state-每个客位最终输出状态, tmpArr-临时数组, labelState-客位标签临时状态
      let state = true;
      /**
       * 废除代码说明-如下方法废除, 不再执行前台翻页和过滤客位, 由后台执行,实现数据实时刷新-184(20190926)
       * 只保留 客位筛选的是否'已预订'
       */
      // let tmpArr;
      // let labelState;

      // // 过滤条件对象发生变化时（非初始化时）
      // // 一：客位-区域条件，判断当前客位（item）没有被过滤条件找到，即隐藏
      // // if (state && this.addOrderFilteConditions.area_id.indexOf(item.area_id) !== -1) {
      // if (this.addOrderFilteConditions.area_id.indexOf(item.area_id) !== -1) {
      //   state = false;
      // }

      // // 二：客位-类型条件，判断当前客位（item）没有被过滤条件找到，即隐藏
      // if (state && this.addOrderFilteConditions.type_id.indexOf(item.type_id) !== -1) {
      //   state = false;
      // }

      // // 三：客位-标签条件不空时，(客位标签为默认不选中)
      // if (state && this.addOrderFilteConditions.pointLabelIds.length !== 0) {
      //   if (item.pointLabelIds) {
      //     // 将item中的标签参数转化为数组，便于查询
      //     tmpArr = item.pointLabelIds.split(',');
      //     // 循环判断， 当前客位是否含有 且 是否被标签条件全部包含时，返回过滤结果
      //     // labelState = this.addOrderFilteConditions.pointLabelIds.every(_ => tmpArr.includes(_))
      //     labelState = this.addOrderFilteConditions.pointLabelIds.every(_ => includes(tmpArr, _));
      //     // 只有当区域和类型过滤为true时, 才再执行标签过滤结果
      //     // FIXME: 杨杰 sonar规范认为state恒真
      //     // if (state) {
      //     //   state = labelState;
      //     // }
      //     state = labelState;
      //   } else {
      //     // 否则， 不含标签属性的item，不显示
      //     state = false;
      //   }
      // }

      // // 客位标签条件为空时，item显示，被监听的条件对象花生变化，DOM自动更新state默认为true
      // // else if(this.addOrderFilteConditions.pointLabelIds.length == 0) {...}

      // // 四：选择人数时，
      // if (state && +this.addOrderFilteConditions.num !== 0) {
      //   let tmpMaxCapacity = item.max_capacity;
      //   // 如果最大可容纳人数为0
      //   if (+item.max_capacity === 0) {
      //     // 设置最大可容纳人数为默认容纳人数
      //     tmpMaxCapacity = item.def_capacity;
      //   }
      //   state = this.addOrderFilteConditions.num >= item.min_capacity
      //     && this.addOrderFilteConditions.num <= tmpMaxCapacity;
      // }
      /**
       * 废除代码之注释-end
       */
      // '只显示空闲客位': 勾选时, 匹配选中日期时的 所有客位的 state值
      if (this.addOrderPointFree && +item.state !== 1) {
        state = false;
      }
      // 过滤结果 返回v-show的判断
      return state;
    },
    // 预订单列表标题-市别 显示内容
    orderListShfitName(item) {
      return find(this.orderBusinessShift, { id: item.shiftId }).name;
    },
    /* 预订单客位筛选器 -------------------------------------------------------------------  */
    // 预订单筛选器:(事件触发需阻止冒泡) 容器(各个列表功能总父元素)触发全局事件回调, 执行全局点击关闭
    orderTriggerOff(id) {
      // 调用全局关闭判定方法, 传入当前触发组件的 id
      this.selectListStateToggle(id);
    },

    // 预订单筛选器: 按钮触发列表开关
    orderFilterToggle(state) {
      // 按钮触发列表弹出并切换
      this.orderFilterCheckActive = this.orderFilterCheckActive === state ? null : state;
    },

    // 预订单筛选器: 下拉列表单选功能
    orderFilterItemCheck(item, type) {
      // 参数item-点击对象, type-筛选类型
      // 执行当前项, 选中与否
      /* eslint-disable no-param-reassign */
      item.check = +item.check === 1 ? 0 : 1;
      // 调用客位Table筛选条件添加方法: 传入当前操作类型
      this.orderFilterAddConditions(type);
    },
    // 预订单筛选器: 下拉列表'全选'/'反选'
    orderFilterIsAllCheck(obj, check, type) {
      // 传入obj为操作数据, check为操作方式, item.check为操作状态
      obj.forEach((item) => {
        // 全选即选中, 反选即反选中或不选中
        // item.check = check == 1 ? check : item.check == 0 ? 1 : 0;
        /* eslint-disable no-param-reassign */
        if (+check === 1) {
          item.check = check;
        } else if (+item.check === 0) {
          item.check = 1;
        } else {
          item.check = 0;
        }
      });
      // 调用客位Table筛选条件添加方法: 传入当前操作类型
      this.orderFilterAddConditions(type);
    },

    // 预订单筛选功能-筛选条件添加存储公共方法(单勾选和全选调用)
    orderFilterAddConditions(type) {
      /* 客位筛选功能-类型和条件存储 */
      // 声明命令对象: (结构序列与 this.conditions相同)筛选类型 对应 执行的条件查询数组
      const ary = {
        state: 'orderState',
        orderSource: 'ordersSource',
        bookTypeName: 'orderBookingTypeList',
      };
      // 每次执行清空条件数组: (预订单筛选器的条件对象)
      this.orderFilteConditions[type] = [];

      // 执行查询判定, 并存入条件数组(vue对象data设计的过滤条件存储对象数组)
      this[ary[type]].forEach((_) => {
        if (+_.check === 0) {
          this.orderFilteConditions[type].push(_.name);
        }
      });
    },

    // 预订单列表筛选器: **筛选显示方法**,
    orderTableFilteMethod(item) {
      // 声明变量参数tmpState- v-show返回状态临时boolean参数
      let tmpState = true;
      // 预订状态命令对象: item.state为0,1,2,3, 存储筛选条件为'未执行','已执行'.., 使用命令对象, 进行参数匹配判断
      const stateObj = {
        0: this.$t('Biz.Booking.UnExecuteO'), // 未执行
        1: this.$t('Biz.Booking.ExecutedO'), // 已执行
        2: this.$t('Dict.Cancelled'), // 已取消
        3: this.$t('Biz.Booking.OverdueO'), // 已过期
      };
      // 预订来源命令对象: item.orderSource为1,2,3 ,循环后台数据,编制命令对象; 存储的筛选条件为'线上预订','来电预订'...使用命令对象, 进行参数匹配判断
      const orderSourceObj = {
        // 1: '线上预订', 2: '来电预订', 3: '到店预订',4: '食尚订'
      };
      this.ordersSource.forEach((el) => {
        orderSourceObj[el.value] = el.name;
      });

      // 筛选判断: 订单状态-筛选条件数组中包含item(列表当前条数据)中的state参数, 判定被过滤, 不显示(tmpState=false)
      if (this.orderFilteConditions.state.indexOf(stateObj[item.state]) !== -1) {
        tmpState = false;
      } else if (
        this.orderFilteConditions.orderSource.indexOf(orderSourceObj[item.orderSource]) !== -1
      ) {
        // 订单来源-是否包含
        tmpState = false;
      } else if (this.orderFilteConditions.bookTypeName.indexOf(item.bookTypeName) !== -1) {
        // 预订类型-是否包含(筛选条件为中文字符串, item.bookTypeName既是预订类型中文名称)
        tmpState = false;
      } else if (this.orderSearchTxt) {
        // 输入框模糊查询, 对以显示的结果,进行再过滤(v-model='orderSearchTxt')
        // 搜索查询条件:判断item的订单编号, 客位名, 联系电话, 预订人, 营销员, 操作员等数据
        tmpState = item.orderNo.indexOf(this.orderSearchTxt) !== -1
          || item.pointNameStr.indexOf(this.orderSearchTxt) !== -1
          || item.contactTel.indexOf(this.orderSearchTxt) !== -1
          || item.bookPerson.indexOf(this.orderSearchTxt) !== -1
          || (item.marketEmpName && item.marketEmpName.indexOf(this.orderSearchTxt) !== -1)
          || item.operEmpName.indexOf(this.orderSearchTxt) !== -1;
      }
      // 返回最后状态
      return tmpState;
    },

    // 预订单列表项, 状态显示结果方法(样式和文本)
    orderTableItemStateShow(state, type) {
      const stateObj = {
        0: this.$t('Biz.Booking.UnExecuteO'), // 未执行
        1: this.$t('Biz.Booking.ExecutedO'), // 已执行
        2: this.$t('Dict.Cancelled'), // 已取消
        3: this.$t('Biz.Booking.OverdueO'), // 已过期
      };
      // 如果样式名或文本内容
      return type === 'txt' ? stateObj[state] : `state-${state}`;
    },

    // 时间格式(时间戳)转换为字符串'2000-01-01'(补0)
    dateFormatString(date, hasTime = false) {
      // 变量'日期'赋值
      const now = new Date(date);
      // 变量'年'赋值
      const y = now.getFullYear();
      // 变量'月'赋值并补'0'
      const m = now.getMonth() + 1 < 10
        ? `0${now.getMonth() + 1}`
        : now.getMonth() + 1;
      // 变量日赋值并补'0'
      const d = now.getDate() < 10
        ? `0${now.getDate()}`
        : now.getDate();
      const h = now.getHours() < 10
        ? `0${now.getHours()}`
        : now.getHours();
      const min = now.getMinutes() < 10
        ? `0${now.getMinutes()}`
        : now.getMinutes();
      const s = now.getSeconds() < 10
        ? `0${now.getSeconds()}`
        : now.getSeconds();
      if (!hasTime) {
        return `${y}-${m}-${d}`;
      }
      return `${y}-${m}-${d} ${h}:${min}:${s}`;
    },

    // 市别判断结果
    judgeBelongeShift(timeParams) {
      const time = (typeof timeParams === 'string') && timeParams.indexOf('T') > 0
        ? `${new Date(timeParams.replace('T', ' ')).getHours()}:${new Date(timeParams.replace('T', ' ')).getMinutes()}`
        : `${timeParams.getHours()}:${timeParams.getMinutes()}`;
      let shift = null;
      for (let i = 0; i < this.businessShift.length - 1; i += 1) {
        if (this.businessShift[i + 1]
          && this.timeStrToMinutes(time) > this.timeStrToMinutes(this.businessShift[i].startTime)
          && this.timeStrToMinutes(time) < this.timeStrToMinutes(this.businessShift[i + 1].startTime)
        ) {
          shift = this.businessShift[i];
          break;
        } else {
          shift = this.businessShift[this.businessShift.length - 1];
        }
      }
      return shift;
    },
    /** ***************************************************
     * 动态方法 */
    // 自助押金模块是否显示(后台是否开启了自助押金模块)
    initShowBuffetDeposit() {
      this.openBuffetDeposit = this.posSettings.isOpenBuffetDeposit;
    },
    // 查看来电会员详情前记录当前查看的来电线路
    memberInfoOrListToggleBefore(item) {
      // 记录当前选中的线路号
      this.currentpath = item.telLineNo;
      this.comingCallPathsTabs.forEach((pdata) => {
        if (item.telLineNo == pdata.no) {
          pdata.state = 1;
        }
      });
      this.memberInfoOrListToggle(item);
    },
    // 会员信息列表和预定信息列表切换方法: 传入数据item时(从预定列表=>会员信息), 无数据item时(会员=>预定列表)
    memberInfoOrListToggle(item) {
      // 缓存当前 点击的预订记录列表项: 预订列表->会员信息
      if (item) { this.currCalledListItem = item; }
      // 传入数据item时判断
      if (item && +item.state === 0) {
        // item = true: 预订记录列表跳转到会员信息
        // 读取接口, 执行会员信息查询(传参:telNo电话)
        this.getCrmInfo(item.telNo);
        // 切换 会员和来电
        this.memberInfoOrListActive = !this.memberInfoOrListActive;
      } else if (item && +item.state === 1) {
        // 初始化详情页的来电提醒状态
        this.comingCallPathsTabs.forEach((item) => {
          item.state = 0;
          item.tel = '';
        });
        // 阻止跳转 弹出提示框
        // this.$message.error('此号码已预订');
        this.$message.error(this.$t('Biz.Booking.BookTip08'));
      } else {
        // 初始化当前来电线路
        this.currentpath = 0;
        // 初始化详情页的来电提醒状态
        this.comingCallPathsTabs.forEach((item) => {
          item.state = 0;
          item.tel = '';
        });
        // 清空记录页面的来电提醒
        this.comingCallpaths = [];
        // item = false: 会员信息跳转到预订记录列表(来电列表)
        // 刷新接口数据(传入执行回调 刷新'预订日历客位'接口数据)
        this.getIncomingCallsList(
          () => {
            this.getBookingViewDetailsData(null, this.currentPageNum);
          },
          'bookedList',
        ); // 来电列表
        // 来电提醒隐藏: 因为刷新来电列表接口数据
        this.comingCallShow = false;
        // 切换 会员和来电
        this.memberInfoOrListActive = !this.memberInfoOrListActive;
        // 重置会员和预订信息(写死)
        this.memberCallBtnActive = { name: this.$t('Biz.Booking.VipInfo'), code: 'vipInfo' }; // 会员信息
        // 因为tabs非激活页面, 为隐藏无法获取DOM节点, 点击切换时Pager插件无法获取另一个tabs页面的DOM,且高度为0,
        // 所以执行Pager组件refresh()方法, 刷新重载组件计算
        this.$refs.leftPager.refresh();
      }
    },
    /* 新来电 点击处理事件
       执行逻辑: 之前--在模拟来电(设备管理器推动来电), 执行来电号码存入数据库
                 1.读取来电列表(预订记录列表)数据接口,并判断:接口返回新数据的第一条(最近的来电记录) 是否为 5分钟内 来电, 否:无处理
                 2.是: 自动触发, 列表项的点击事件, 重读'来电列表''会员信息''预订日历客位信息''预订统计信息'等接口,更新数据
                 3.后, 跳转->会员和统计信息tab
    */
    handleNewComingCall(pathno) {
      // 记录当前选中的线路号
      this.currentpath = pathno;
      this.comingCallPathsTabs.forEach((item) => {
        if (pathno == item.no) {
          item.state = 1;
        }
      });
      // 设置 提醒隐藏
      this.comingCallShow = false;
      // 执行来电列表数据刷新: 设置当前时间,自动接口调用, 刷新数据
      this.memberPicker.callListDateVal = new Date();
      // 刷新 客位数据
      this.getBookingViewDetailsData(null, this.currentPageNum);
    },
    // 客位状态触发当前对象执行全局click事件
    pointStateBtnToggle(id) {
      // 按钮弹出切换
      this.bookingStatusSwitch = !this.bookingStatusSwitch;
      // 调用全局关闭判定方法, 传入当前触发组件的 id
      this.selectListStateToggle(id);
    },
    // 客位状态按钮触发事件
    pointState(item) {
      // this.bookingStatusBtn.title = item != '全部' ? item : '预订状态'
      this.bookingStatusBtn.title = item;
      // 执行Pager组件refresh()方法, 刷新重载组件计算
      this.$refs.leftPager.refresh();
    },
    // 预订信息-未执行订单 执行修改预订单
    unExecuteOrderOpt(item) {
      this.getOrderDetailInfo(item.id, () => {
        // 1-'修改预订单'
        this.orderDialogOpenMethod(this.dialogType[1]);
      });
    },
    // 客位状态按钮过滤(根据条件)添加渲染数据
    memberCallListFilterMethod(state) {
      const index = state + 1; // 使用state(值为0/1)作为下标: '未预订'和'预订'下标为1和2, 故state+1
      // 过滤: 状态选中项与数据中state状态不同时, 不显示
      if (
        this.bookingStatusBtn.title.code === 'init'
        || this.bookingStatusBtn.title.code === 'all'
        || this.bookingStatusBtn.item[index].code === this.bookingStatusBtn.title.code
      ) {
        this.$refs.leftPager.refresh();
        return true;
      }
      return false;
    },

    // '预订日历'和'预订单'table - tabs按钮切换
    bookingTableBtnToggle(item) {
      if (this.bookingTableBtnActive.code === item.code) {
        return false;
      }
      /* 本功能执行操作, 顺序为业务流程顺序, 不可更改 */
      // 设置loading
      const loading = this.$loading({
        target: '.rightArea-table',
        text: '',
        background: 'rgba(0, 0, 0, .6)',
      });
      // loading关闭指令：loading.close()， 作为回调传入相关方法，即接口通讯完成，才关闭loading

      // 切换至预订单, 访问接口, 数据刷新
      if (this.bookingTableBtnActive.code === 'calendar' && item.code === 'bookList') {
        this.getOrderList('', () => {
          // 回调执行, 接口赋值完成再关闭loading
          loading.close();
        });
      }
      // 切换至预订日历, 访问接口, 数据刷新 (两个接口)
      if (this.bookingTableBtnActive.code === 'bookList' && item.code === 'calendar') {
        this.getIncomingCallsList(() => {
          this.getBookingViewDetailsData(
            null,
            this.currentPageNum,
            () => {
              // 回调执行, 接口赋值完成再关闭loading
              loading.close();
            },
            true,
          );
        });
      }
      // 激活 选中项
      this.bookingTableBtnActive = item;
      // 会员信息 激活时, 点击预订日历tab按钮, 切换为预订(来电)记录, 并刷新数据
      if (item.code === 'calendar' && this.memberInfoOrListActive) {
        this.getIncomingCallsList();
      }
      // 始终 让预订(来电)记录列表 处于激活状态
      this.memberInfoOrListActive = false;
      // 预订单激活, 左侧列表关闭 同时隐藏这边侧栏折叠按钮
      this.isFoldBtn = item.code !== 'bookList';
      this.leftAreaFold = item.code !== 'bookList';
      return true; // 纯esLint规则, 无实际意义
    },
    // 预订日历 datePicker触发: 更新当前日期, 判断当前是否为上一营业日最后市别时间内
    bookingPickDate() {
      const tmpDate = new Date();
      // this.businessShift.forEach( (item, index) => {
      //   // 匹配 当前自然日起始市别的起始时间, 作为还未结束的营业日最后市别的结束时间
      //   if(item.isStartShift){
      //     tmpDate.setHours(item.startTime.split(':')[0])
      //     tmpDate.setMinutes(item.startTime.split(':')[1])
      //     tmpDate.setSeconds(0)
      //     this.lastShiftEndTime = tmpDate - 1000
      //   }
      // })
      // 起始市别不在作为 营业起始的判断依据(起始市别设为午市时, 早市意义何在)
      // 当前执行: 市别列表第一个项, 作为营业起始时间!!!
      tmpDate.setHours(this.businessShift[0].startTime.split(':')[0]);
      tmpDate.setMinutes(this.businessShift[0].startTime.split(':')[1]);
      tmpDate.setSeconds(0);
      this.lastShiftEndTime = tmpDate - 1000;
      // 判断改变跨天状态参数--跨天且最后营业识别未结束: 当前时间 > 自然日0点 且 < 未结束营业日最后市别结束时间
      if (new Date() > new Date(new Date().toLocaleDateString())
            && new Date() < this.lastShiftEndTime
      ) {
        this.crossDayInLastShift = true; // 开启
      } else {
        this.crossDayInLastShift = false; // 关闭
      }
    },
    // 注释:不在使用
    // 查找默认起始市别: 传参-返回起始市别的传参属性值, 不传参-返回起始市别的对象
    // firstShift(attr) {
    //   let [ _first ] = this.businessShift.filter(_ => _.isStartShift)
    //   return attr ? _first[attr] : _first
    // },

    // 到店时间 数据实现方法: 后台传值 市别的起始时间, 截止时间使用下一市别的起始时间(若无, 使用默认开始市别的)
    arrivalTimeMethod(currShift, index) {
      // 参数: currShift-传入的市别对象, index-市别所在列表索引
      // 清空 到店时间列表
      this.arrivalTimeList.length = 0;
      let start;
      let end;
      // 实现方法: 从当前市别起始时间开始, 按照后台传值(this.timeSpan), 每个累加, 循环到下一市别起始时间截止
      // 循环起始量
      start = this.timeStrToMinutes(currShift.startTime);
      // 循环结束量
      end = this.businessShift[index + 1]
        ? this.timeStrToMinutes(this.businessShift[index + 1].startTime)
        // : this.timeStrToMinutes(this.firstShift('startTime'))
        // 下一市别不存在, 从下个营业日的第一个市别开始时间前, 起算为截止时间: 处理起始市别不是第一个市别时, 到店时间计算错误
        : this.timeStrToMinutes(this.businessShift[0].startTime);
      // 如果 截止时间(分钟数)跨天(后一市别开始时间, 小于, 前一市别开始时间),增加一天
      if (end <= start) {
        end += 24 * 60;
      }
      // 循环体
      while (start < end) {
        // 将累加并转换的'时间'存入'到店时间'渲染数据数组
        this.arrivalTimeList.push(
          this.minutesToTimeStr(start),
        );
        start += parseInt(this.timeSpan, 10);
      }
    },
    /* 市别时间格式化-公共处理方法
     * 参数: 时间格式-指'12:00'字符串,
     */
    // 方法1: 时间格式转->分钟数
    timeStrToMinutes(time) {
      return parseInt(time.split(':')[0], 10) * 60 + parseInt(time.split(':')[1], 10);
    },
    // 方法2: 分钟数转换->时间格式
    minutesToTimeStr(min) {
      // 计算 被一小时(60分钟)除以的结果转为时间格式时间, 排除超过一天(超过一天的分钟数: 减去一天的倍数,余数计算为有效分钟数)
      if (min >= 24 * 60) {
        min -= parseInt(min / 1440, 10) * 24 * 60;
      }

      const h = parseInt(min / 60, 10);
      const m = min % 60;
      return `${h < 10 ? (`0${h}`) : h}:${m < 10 ? (`0${m}`) : m}`;
    },
    // 方法3: '12:00'转换为标准时间格式
    shiftTimeFormat(data) {
      // 含有'-' 不含时间的日期
      if (data.indexOf('-') !== -1) {
        return new Date();
      }
      // 不含日期, 只有时间'06:00'
      return new Date(`${new Date(this.bookingChartPicker.chartDateVal).toLocaleDateString()} ${data}`);
    },

    /* 市别筛选按钮切换
     * "市别时间"业务天坑处理说明: 当前时间,处于前一天最后一个市别时间内(eg. 最后市别结束时间为凌晨4:00, 当前为凌晨2:00), 是
     */
    businessShiftToggle(activeName, item, index) {
      //   当前时间   当前市别
      let nowTime;
      let currShift;
      // 预订日历-市别切换: 执行市别时间判断,
      if (activeName === 'businessShiftActive') {
        // 判断, 禁止市别切换
        if (this.businessShiftDisabled) {
          // this.$message.warning('当前时间市别已过不可切换');
          this.$message.warning(this.$t('Biz.Booking.BookTip09'));
          return false;
        }
        // 市别切换操作
        nowTime = new Date();
        [currShift] = this.businessShift.filter(_ => _.id === this.currentShiftId);
        // 市别判断: 已过市别不可切换(startTime为'12:00'做字符串直接比较), item.startTime < currShift.startTime判断为前一市别
        // nowTime >= this.shiftTimeFormat(currShift.startTime)当前时间>=前一市别的截止时间(即当前市别的开始时间之前1秒)
        if (item.startTime < currShift.startTime
              && nowTime >= this.shiftTimeFormat(currShift.startTime)
        ) {
          // this.$message.warning('当前时间市别已过不可切换');
          this.$message.warning(this.$t('Biz.Booking.BookTip09'));
          return false;
        }
      }
      // 动态切换, 传入的市别类型, 执行激活
      this[activeName] = index;
      // 预订日历 市别切换 客位数据刷新, 显示客位不同日期下状态
      if (activeName === 'businessShiftActive') { this.getBookingViewDetailsData(null, this.currentPageNum); }
      // 向下联动 新建预订单市别显示(设置市别组件首显内容)
      if (isEmpty(this.$refs.addOrderShiftList)) {
        this.addOrderShiftShowTitle = item.name; // 首次
      } else {
        this.$refs.addOrderShiftList.title = item.name; // 多次
      }
      return true;
    },

    // 预订日历显示周期数据的切换(不可简化)
    tableDateInColToggle(item) {
      // element-Drop组件选中赋值
      this.tableDateInColActive = item;

      // 预订日历客位列表 数据刷新(执行改值后再执行)
      setTimeout(() => {
        // 保存 展示天数
        this.saveBookingViewSetting(item);
        // 刷新客位数据
        this.getBookingViewDetailsData(null, this.currentPageNum);
      }, 0);
    },

    // 预定日历客位筛选组件-手动触发客位筛选(刷新接口数据)
    executeBookFilte() {
      console.log('预订日历客位筛选');
      this.getBookingViewDetailsData(null, this.currentPageNum);
    },
    // 预定日历翻页-上翻页
    turnPageUp() {
      if (!(this.currentPageNum <= 1)) {
        // 减页码
        this.currentPageNum -= 1;
        // 加载列表数据
        this.getBookingViewDetailsData(null, this.currentPageNum);
      }
    },
    // 预定日历翻页-下翻页
    turnPageDown() {
      if (!(this.currentPageNum >= this.allPageNum)) {
        // 加页码
        this.currentPageNum += 1;
        // 加载列表数据
        this.getBookingViewDetailsData(null, this.currentPageNum);
      }
    },
    // 预定日历翻页-分页数据计算
    computeListPagerData(isTurnPage) {
      // 总页数
      this.allPageNum = Math.ceil(this.totalListNum / this.everyPageListNum);
      // 当前页数: 如果不是翻页, 重置页码
      if (!isTurnPage) {
        this.currentPageNum = 1;
      }
    },
    // 预订日历日期快速查询 操作方法:过去时间 和 未来时间(type:front/after)
    dateIntervalQuery(type) {
      console.log(type, 11111111);
      // 参数: mode- 命令对象,执行不同业务的逻辑计算, queryState- 可执行开关
      // const queryState = true;
      const beginToEndDate = parseInt(this.tableDateInColActive, 10) - 1;
      const nowDateTime = +new Date(new Date().toLocaleDateString());
      const mode = {
        front: () => {
          this.tableDateIntervalStart -= beginToEndDate * 86400000;
          this.tableDateIntervalEnd -= beginToEndDate * 86400000;
        },
        after: () => {
          this.tableDateIntervalStart += beginToEndDate * 86400000;
          this.tableDateIntervalEnd += beginToEndDate * 86400000;
        },
      };
      // 如果 快速查询 起始日期 已经小于 '今天' (小于一天的毫秒数), 执行提示
      if ((this.tableDateIntervalStart - nowDateTime) < 86400000 && type === 'front') {
        // this.$message.error('不可选择当前日期之前的日期时间,进行预订业务');
        this.$message.error(this.$t('Biz.Booking.BookTip10'));
      } else if ((this.tableDateIntervalStart - beginToEndDate * 86400000) < nowDateTime && type === 'front') {
        // 判断: 向前查询, 选择日期 小于, 当前日期(今天), 设置向前查询起始日期为当前, 截止时间为查询周期模式天数
        // 并将起始日期赋值给DatePicker
        this.bookingChartPicker.chartDateVal = nowDateTime;
        this.tableDateIntervalStart = nowDateTime;
        this.tableDateIntervalEnd = beginToEndDate * 86400000 + nowDateTime;
        //  执行预订日历客位接口数据重查, 在DatePicker的this.bookingChartPicker.chartDateVal 监听函数中执行
      } else {
        // 根据传入类型,执行判断方法
        mode[type](type);
        // 联动日期查询器datePicker, bookingChartPicker.chartDateVal
        this.bookingChartPicker.chartDateVal = this.tableDateIntervalStart;
        // 日期选择, 执行预订日历客位Table数据,向接口重新查询, 在DatePicker的this.bookingChartPicker.chartDateVal 监听函数中执行
      }
    },
    //-----------------------------
    // 非当前路由页面执行的回调: 刷新来电记录数据, 激活来电文字提醒
    incomingTelOpt(path) {
      // 当前来电线路号大于后台设置的来电线路的总数，忽略不予处理
      if (path > this.comingCallPathsTabs.length) {
        return;
      }
      // pathStatus判断是否已有未处理的该路来电
      let pathStatus = false;
      this.comingCallpaths.forEach((pathItem) => {
        if (pathItem === path) {
          pathStatus = true;
        }
      });
      if (pathStatus) {
        this.comingCallpaths.splice(this.comingCallpaths.indexOf(path), 1);
      }
      this.comingCallpaths.push(path);
      // 未处理的最新来电传给详情页的来电提醒标签
      this.comingCallPathsTabs.forEach((item) => {
        if (path == item.no && path != this.currentpath) {
          item.state = 2;
        }
      });
      // 预订(来电)信息激活
      this.comingCallShow = true;
      // '会员'页面激活
      if (this.memberInfoOrListActive) {
        this.getIncomingCallsList('', 'memberInfo');
      }
    },
    // 模拟来电: 模拟真实来电, 执行来电号码存入数据库, 本功能用于:  **到店预订**
    virtualTel() {
      // 测试阶段刷新按钮触发拨打电话 this.$t('Biz.Booking.BookTip10')
      // let tel = prompt('请输入要模拟呼入的电话号码', '13389080983');
      let tel = prompt(this.$t('Biz.Booking.BookTip10'), '13011112222');
      if (!tel) {
        return false; // 点击取消执行返回
      }
      // 模拟来电线路【默认1号线路】
      const path = 1;
      // pathStatus判断是否已有未处理的该路来电
      let pathStatus = false;
      this.comingCallpaths.forEach((pathItem) => {
        if (pathItem === path) {
          pathStatus = true;
        }
      });
      if (pathStatus) {
        this.comingCallpaths.splice(this.comingCallpaths.indexOf(path), 1);
      }
      this.comingCallpaths.push(path);
      // 未处理的最新来电传给详情页的来电提醒标签
      this.comingCallPathsTabs.forEach((item) => {
        if (path == item.no && path != this.currentpath) {
          item.state = 2;
          item.tel = tel;
        }
      });
      // 激活提醒
      this.comingCallShow = true;
      // 测试号码 过滤0138...来电显示号码(首位多0)
      if (tel.length === 12 && tel.indexOf('01') === 0) {
        const telArr = tel.split('');
        telArr.splice(0, 1);
        tel = telArr.join('');
      }
      // 测试号码 过滤86138...来电显示号码(首位多86)
      if (tel.length === 13 && tel.indexOf('861') === 0) {
        const telArr = tel.split('');
        telArr.splice(0, 2);
        tel = telArr.join('');
      }
      // 测试号码 过滤086138...或者+86138...来电显示号码(首位多086、+86)
      if (tel.length === 14 && (tel.indexOf('0861') === 0 || tel.indexOf('+861') === 0)) {
        const telArr = tel.split('');
        telArr.splice(0, 3);
        tel = telArr.join('');
      }

      // 模拟设备管理器推送数据, 只调用后台接口, 存入来电号码
      // 当激活会员信息页面时, '模拟来电'和'设备来电'执行: 保存来电信息, 再执行调用来电接口, 会员查询接口, 会员预订信息接口 和 刷新客位
      if (this.memberInfoOrListActive) {
        // 会员信息页面激活时, 新来电自动刷新当前展示会员信息, 先执行上传来电信息
        this.saveOrUpdateIncomingCallsInfo({ tel, telLineNo: path }, () => {
          // 再执行来电列表刷新
          this.getIncomingCallsList('', 'memberInfo');
          // 再刷新 预订图
          this.getBookingViewDetailsData(null, this.currentPageNum);
        });
      } else {
        this.saveOrUpdateIncomingCallsInfo({ tel, telLineNo: path });
      }
      return true;
    },
    // 手动刷新数据
    reloadBookingData() {
      // 重置预定日历分页
      // this.currentPageNum = 1;
      // 执行重载接口刷新预订日历数据
      this.getBookingViewDetailsData(null, this.currentPageNum);
    },

    /* 预订日历-客位状态-样式和内容显示功能(新增/修改客位同引用): 参数data-客位state
     * 客位状态类型: 1-空闲(白色) 2-占用(红色) 3-埋单(紫色) 5-锁台(灰色) 6-预付(黄色) 7-预订（直接显示预订人姓名）(蓝色)
     * 除空闲和已预订外, 不可点击; 空闲执行'新建'预订单, 已预订执行'修改'或新建  */
    bookingPointState(data, type) {
      // 命令对象: 数据匹配 样式(名) 模型
      const tmpStyle = {
        1: 'state-free', // 空闲
        2: this.isMultiBook === '1' ? 'state-used muitibook' : 'state-used', // 占用 ：当开启多预订时，占用客位可以预订 -- CY7-2908
        3: this.isMultiBook === '1' ? 'state-paying muitibook' : 'state-paying', // 埋单 ：当开启多预订时，占用客位可以预订 -- CY7-2908
        5: this.isMultiBook === '1' ? 'state-locked muitibook' : 'state-locked', // 锁台 ：当开启多预订时，占用客位可以预订 -- CY7-2908
        6: this.isMultiBook === '1' ? 'state-prepay muitibook' : 'state-prepay', // 预付 ：当开启多预订时，占用客位可以预订 -- CY7-2908
        7: 'state-booked', // 预订(已)
      };
      // 命令对象: 数据匹配 内容 模型
      const tmpContent = {
        1: '', // 空闲
        2: this.$t('Dict.OccupySate'), // '占用'
        3: this.$t('Dict.CheckBillSate'), // '埋单'
        5: this.$t('Dict.LockingSeat'), // '锁台'
        6: this.$t('Dict.PrepayState'), // '预付'
        // 7: '预订人姓名'
      };
      if (type === 'style') {
        // 修改和新建预订单,启调弹窗,当前已选(修改预订单已存)客位, 允许修改并呈现选中样式
        // data.id == true时,为新增/修改客位列表(调用本方法渲染): 判断 预订单弹窗 已选客位数组(currPointInBookingTable),是否包含当前渲染客位
        // this.bookedPointInfoListChosenItem
        // '2'-修改预订单
        // if (this.dialogTitle.type === '2' && this.bookedPointInfoListChosenItem.bookPointList.some(_ => _.pointId === data.pointId)) {
        //   // 判断为true, 当前客位已预订, 也可进行修改和取消
        //   return tmpStyle[1];
        // }
        return tmpStyle[data.state];
      }

      if (type === 'content' && +data.state !== 7) {
        return tmpContent[data.state];
      } if (type === 'content' && +data.state === 7) {
        // 已预订 返回显示文本为该客位在日期序列下的state数据: bookPeron
        return data.bookPerson;
      }
      return true;
    },

    /* 已预订客位触发功能: 允许客位多次(不同时间段)预订
     * 相关功能包含: 1.打开客位(当前日期)已预订信息列表弹窗; 2.已预订信息修改(修改预订单); 3.客位新建预订单 */
    // 已预订客位信息弹窗-新建预订单(打开预订单弹窗(新建模式))
    bookedPointOpenBookingDialog() {
      // 根据当前预订日历市别, 预先生成,到店时间列表
      this.arrivalTimeMethod(
        this.businessShift[this.businessShiftActive],
        this.businessShiftActive,
      );
      // 匹配 客位已预订列表 是否 占满所有到店时间
      const tmpState = this.arrivalTimeList.every((item, index) => {
        if (!this.bookedPointInfoList[index]) {
          return false;
        }
        return `${this.bookedPointInfoList[index].expectArriveTime}` === `${item}`;
      });

      if (tmpState) {
        // '预定满'提示
        // this.$message.error('此客位已订满，请换一个客位');
        this.$message.error(this.$t('Biz.Booking.BookTip12'));
      } else {
        // 打开 新建预订单-0
        this.orderDialogOpenMethod(this.dialogType[0]);
      }
      // 关闭预订客位信息弹窗
      this.bookedPointListDialogVisible = false;
    },
    // 已预订客位-客位信息列表-修改预订单
    bookedPointOpenModifyDialog(item) {
      // 调用接口, 查询 已预订的预订单信息, 传入预订单弹窗, 渲染'修改预订单'
      this.getOrderDetailInfo(item.orderId, () => {
        // 接口查询数据对象(bookedPointInfoListChosenItem)的orderSource(来源) 为1,执行线上订单直客查看,并取消
        if (+this.bookedPointInfoListChosenItem.orderSource === 1
          || +this.bookedPointInfoListChosenItem.orderSource === 4
        ) {
          // 2-'查看预订单'
          this.orderDialogOpenMethod(this.dialogType[2]);
        } else {
          // 非线上订单, 执行‘修改’功能
          // 等候接口返回数据，故延迟打开‘预订单弹窗’
          setTimeout(() => {
            // 1-'修改预订单'
            this.orderDialogOpenMethod(this.dialogType[1]);
          }, 200);
        }
      });
      // 关闭预订客位信息弹窗
      this.bookedPointListDialogVisible = false;
    },
    // 已预订客位-客位预订信息弹窗:关闭前
    bookedPointListDialogClose() {
      this.bookedPointListDialogVisible = false;
      // 清空 缓存客位信息
      // 注释掉是为了解决多预订时，新建预订单，已选客位丢失的问题 -- BUG-1782
      // this.currPointInBookingTable.length = 0
    },

    /* 打开新建预订单
     * 已预订客位: 根据后台传值类型不同,判断关键参数(是否含bookCount), 执行'修改'预订单,或者打开客位预订信息列表, 在选择修改或新建
     * 当前客位subIndex-客位日期索引: 客位数据含有最大周期(后台传值一般30天)的客位状态,30天对应30个state存于states属性中,所以日期匹配为subIndex */
    openBooking(item, index, sub, subIndex) {
      // 参数index-客位索引(行index), sub-客位状态(按日期,列内容), subIndex-客位日期索引(按日期列index)
      // 客位状态为3-埋单 5-锁台 6-预付 2-占用时：当开启了同客位/同市别多预订功能后，允许预订；若未开启，则不允许预订--CY7-2908
      if (+sub.state === 2
          || +sub.state === 3
          || +sub.state === 5
          || +sub.state === 6) {
        if (this.isMultiBook === '1') {
          // this.$confirm('客位正在就餐中，是否新建预订？', '提示', {
          this.$confirm(this.$t('Biz.Booking.BookTip13'), this.$t('Dict.Tips'), {
            confirmButtonText: this.$t('Dict.Sure'), // 确定
            cancelButtonText: this.$t('Dict.Cancel'), // 取消
            type: 'warning',
            closeOnClickModal: false,
          }).then(() => {
            // 先清空装载数据对象
            this.deleteAddOrderInput();
            // 存储 当前选中客位信息
            this.currPointInBookingTable.push(item);
            // 缓存 当前选中日期, 在新建订单弹窗显示(当前预订单DatePicker日期 + 列index*一天毫秒数)
            this.addOrderDate.val = this.bookingChartPicker.chartDateVal + subIndex * 86400000;
            // 缓存 当前选中客位的日期所在index
            this.currPointDateIndex = subIndex;
            // 允许客位 多预订
            if (sub.bookCount) {
              // 调用接口,获取已预订信息数据
              this.getBookingDetailInfoListByParam(item, this.addOrderDate.val, () => {
                // 传递回调: 打开 已预订信息列表弹窗
                this.bookedPointListDialogVisible = true;
              });
            } else {
              // 0-'新建预订单'
              this.orderDialogOpenMethod(this.dialogType[0]);
            }
          });
        }
        return false;
      }

      /**
       * 预订业务屏蔽多平台对接(食尚订/新荣记/客必得) 交互和写活功能,
       * */
      // 食尚订/新荣记/客必得 对接平台业务, 禁用新建
      if (this.posBooking.bookedPlatform
            && (this.posBooking.bookedPlatform > 3)
            && !this.bookedLogicRule[this.posBooking.bookedPlatform].booking
      ) {
        this.$alert(
          `${this.$t('Biz.Booking.BookTip14')}
            ${String(this.posBooking.bookedPlatform) === '7' ? '新美大' : this.orderAllSource.filter(_ => String(_.value) === String(this.posBooking.bookedPlatform)).shift().name}
            ${this.$t('Biz.Booking.BookTip15')}`,
          this.$t('Dict.Tips'), // 提示
          { confirmButtonText: this.$t('Dict.Sure') }, // 确定
        );
        return false;
      }
      // 先清空装载数据对象
      this.deleteAddOrderInput();
      // 存储 当前选中客位信息
      this.currPointInBookingTable.push(item);
      // 缓存 当前选中日期, 在新建订单弹窗显示(当前预订单DatePicker日期 + 列index*一天毫秒数)
      this.addOrderDate.val = this.bookingChartPicker.chartDateVal + subIndex * 86400000;
      // 缓存 当前选中客位的日期所在index
      this.currPointDateIndex = subIndex;
      // 允许客位 多预订
      if (sub.bookCount) {
        // 调用接口,获取已预订信息数据
        this.getBookingDetailInfoListByParam(item, this.addOrderDate.val, () => {
          // 传递回调: 打开 已预订信息列表弹窗
          this.bookedPointListDialogVisible = true;
        });
      } else {
        // 不允许多预订 和 空闲客位-'新建'
        // 打开时, 清空已预订客位数据对象, 在orderOpen方法中, 按需更新数据
        this.bookedPointInfoList.length = 0;
        // 空闲时, 启调'新建'
        if (+sub.state === 1) {
          // 传参, 启调新建预订单弹窗, 0-'新建预订单'
          this.orderDialogOpenMethod(this.dialogType[0]);
        } else if (+sub.state === 7) {
          // 已预订时, 启调'修改'
          this.getOrderDetailInfo(sub.orderId, (data) => {
            if (+data.orderSource !== 1) {
              // 执行 修改预订单-1
              this.orderDialogOpenMethod(this.dialogType[1]);
            } else {
              // 执行 查看预订单-2
              this.orderDialogOpenMethod(this.dialogType[2]);
            }
          });
        }
      }
      return true;
    },

    /* 新建预订单:到店时间选择执行
       说明:1.当前市别时间数组arrivalTimeList, 分两部分显示前5个, 后5个
           2.直接显示时间选项(首选时间:当前市别时间的前5个),弹出菜单中的时间选项(非首选时间:排除首选时间其余选项)
    */
    // 1.首选到点时间选项执行, 当前项选中,见DOM节点@click
    // 2.隐藏到店时间选项执行
    arrivalTimeDropItem(item) {
      // 弹出更多到店时间选择, 执行: this.arrivalTimeDropListActive = false, 改功能, 被全局点击事件包含执行
      // 点击为菜单选项, 数据交换到第一个, 执行选中
      this.arrivalTimeShowListSelected = 0;
      // 点击项判断, 并执行数据交换
      // 每次点击执行重新生成 时间列表
      this.businessShift.forEach((tmpItem, index) => {
        if (tmpItem.name === this.$refs.addOrderShiftList.title) {
          this.arrivalTimeMethod(tmpItem, index);
        }
      });
      // 将点击项(匹配在新生成列表数组中的index) 删除并添加到数组第一项, 确保选中
      this.arrivalTimeList.unshift(
        ...this.arrivalTimeList.splice(this.arrivalTimeList.indexOf(item), 1),
      );
      // 选中店时间: 已预订占用时间选项-间隔时间小于this.multiBookTime时, 提醒
      this.arrivalTimeItemOpt();
    },

    // 新建预订单-隐藏到店时间,菜单开关切换
    arrivalTimeDropListToggle(id) {
      this.arrivalTimeDropListActive = !this.arrivalTimeDropListActive;
      // 调用全局关闭判定方法, 传入当前触发组件的 id
      this.selectListStateToggle(id);
    },
    // 到店时间-列表项-禁用方法
    arrivalTimeItemDisabled(item) {
      // 设置默认 不禁用
      let tmp = false;
      const tmpItem = `${item}`;
      // 匹配 已预订时间 在 到店时间列表中时 为禁用项
      if (this.bookedPointInfoList.length > 0) {
        this.bookedPointInfoList.forEach((_) => {
          // 当已预订客位所占用时间 == 列表中时间时
          if (tmpItem === `${_.expectArriveTime}`) {
            // 新建预订单: 多个已预定时间项均 禁用
            // 或者 非新建时(修改) 选择的客位已有预订单的到店时间 == 列表中的时间时 禁用
            // '1'-新建预订单
            if (this.dialogTitle.type === '1'
              || tmpItem !== `${this.bookedPointInfoListChosenItem.expectArriveTimeStr}`
            ) {
              tmp = true;
            }
          }
        });
      }
      return tmp;
    },
    // 到店时间-列表项-点击执行检测方法: 条件(this.bookedPointInfoList.length > 0),排除不允许多预订
    arrivalTimeItemOpt() {
      // 当前选中'到店时间'的分钟数
      const optTime = this.timeStrToMinutes(this.arrivalTimeList[this.arrivalTimeShowListSelected]);
      // 匹配 已预订客位的预定时间的分钟数
      if (this.bookedPointInfoList.length > 0) {
        for (let i = 0; i < this.bookedPointInfoList.length; i += 1) {
          // 判定: 间隔this.multiBookTime时间内, 显示'与其他预订单到店时间间隔小于this.multiBookTime时间'
          // 新建预订单时, 所有已预订时间 均做匹配
          // '1'-'新建预订单'
          if (this.dialogTitle.type === '1') {
            if (
              Math.abs(
                optTime - this.timeStrToMinutes(this.bookedPointInfoList[i].expectArriveTime),
              ) < this.multiBookTime
            ) {
              this.multiBookTimeActive = true;
              // 循环到匹配项, 即跳出循环, 防止剩余项判断覆盖
              return false;
            }
            this.multiBookTimeActive = false;
          } else {
            // 修改预订单时, 排除当前预订单已预订时间(this.bookedPointInfoListChosenItem.expectArriveTimeStr)
            if (
              Math.abs(
                optTime - this.timeStrToMinutes(this.bookedPointInfoList[i].expectArriveTime),
              ) < this.multiBookTime
              && (this.bookedPointInfoListChosenItem.expectArriveTimeStr
                  !== this.bookedPointInfoList[i].expectArriveTime)
            ) {
              this.multiBookTimeActive = true;
              // 循环到匹配项, 即跳出循环, 防止剩余项判断覆盖
              return false;
            }
            this.multiBookTimeActive = false;
          }
        }
      }
      return true;
    },
    // 已选客位删除
    pointChosenItemDelete(item, index, list) {
      if (list.length > 1) {
        // 删除存储已选客位数组当前操作项
        list.splice(index, 1);
        /** 多预订需求改动, 不在使用this.currPointIndex做逻辑判断 */
        // 删除存储已选客位 匹配 所在总客位列表所在下标
        // this.bookingTable.forEach((point, pointIndex) => {
        //   if (point.id === item.id) {
        //     this.currPointIndex.some((sub, subIndex, subArr) => {
        //       if (sub === pointIndex) {
        //         subArr.splice(subIndex, 1);
        //       }
        //       return '';
        //     });
        //   }
        // });
      } else {
        // this.$message.error('至少保留一个客位');
        this.$message.error(this.$t('Biz.Booking.BookTip16'));
      }
    },
    // 新建/修改预订单, 打开新客位翻页-上翻页
    addBookTurnPageUp() {
      if (!(this.addBookCurrentPageNum <= 1)) {
        // 减页码
        this.addBookCurrentPageNum -= 1;
        // 加载列表数据
        this.openPointDetailDailog(this.addBookCurrentPageNum);
      }
    },
    // 新建/修改预订单, 打开新客位翻页-下翻页
    addBookTurnPageDown() {
      if (!(this.addBookCurrentPageNum >= this.addBookAllPageNum)) {
        // 加页码
        this.addBookCurrentPageNum += 1;
        // 加载列表数据
        this.openPointDetailDailog(this.addBookCurrentPageNum);
      }
    },
    // 新建/修改预订单, 打开新客位翻页-分页数据计算
    addBookComputeListPagerData(isTurnPage) {
      // 总页数
      this.addBookAllPageNum = Math.ceil(this.addBookTotalListNum / this.addBookEveryPageListNum);
      // 当前页数: 如果不是翻页, 重置页码
      if (!isTurnPage) {
        this.addBookCurrentPageNum = 1;
      }
    },
    // 新建修改预订单-客位筛选组件-触发数据刷新
    executeAddBookPointFilte() {
      console.log('新建预订单客位筛选');
      this.openPointDetailDailog(this.addBookCurrentPageNum);
    },
    // 新建/修改预订单, 打开新客位列表弹窗
    openPointDetailDailog(currentPageNum) {
      // 加载loading
      // 设置loading
      const pageLoading = this.$loading({
        target: '.addBookingChoosePoint-list',
        text: '',
        background: 'rgba(0, 0, 0, .6)',
      });
      // 调接口刷新数据: 传值-对象包含当前市别id,起止日期
      // 预订单弹窗选择市别,匹配(市别列表)项
      const [obj] = this.businessShift.filter(_ => _.name === this.$refs.addOrderShiftList.title);
      // 上传数据对象
      const tmpData = {
        // 上传查询客位状态的开始日期
        bookTimeStr: this.dateFormatString(this.addOrderDate.val),
        // 上传查询客位状态的截止日期
        bookTimeEndStr: this.dateFormatString(this.addOrderDate.val),
        // 上传查询客位状态的市别
        shiftIdStr: obj.id,
      };
      // 分页数据
      if (currentPageNum) {
        tmpData.pageSize = this.addBookEveryPageListNum; // 分页-条数
        tmpData.pageNum = currentPageNum; // 分页-页码
      } else {
        tmpData.pageSize = this.addBookEveryPageListNum;
        tmpData.pageNum = 1;
      }
      // 客位筛选条件数据-参数
      // 区域条件(同区域id字段名)(字符串拼接)
      tmpData.areaId = this.filterDataEndComma(this.addOrderFilteConditions.area_id);
      // 类型条件(同类型id字段名)(字符串拼接)
      tmpData.typeId = this.filterDataEndComma(this.addOrderFilteConditions.type_id);
      // 标签条件(同标签属性字段名)(字符串拼接)
      tmpData.pointLabelIds = this.filterDataEndComma(this.addOrderFilteConditions.pointLabelIds);
      // 人数范围(字符串拼接)
      tmpData.num = String(this.addOrderFilteConditions.num);
      // 调用接口
      ajax('canyin.pos.booking.getbookingviewdetailsdata', {
        contentType: 'json',
        data: tmpData,
      }).then((res) => {
        if (res.success) {
          // 如果传值, 调取的是新增/修改预订单弹窗客位列表数据
          this.addBookingPointTable = res.data.pointList;
          // 总条数计算
          this.addBookTotalListNum = res.data.total;
          // 分页计算
          this.addBookComputeListPagerData(true);
          // 人数选择
          // 查找客位最大人数-用于人数过滤使用-直接使用后台数据, 不在前台循环(下面代码废弃)
          // let max = 0; // 临时变量
          // // 循环客位table
          // this.addBookingPointTable.forEach((_) => {
          //   // 取max_capacity(可能为0)与 def_capacity的最大值, 存于max, 循环每一项, 存入比较后的最大值
          //   max = Math.max(_.max_capacity, _.def_capacity) > max
          //     ? Math.max(_.max_capacity, _.def_capacity)
          //     : max;
          // });

          // 赋值渲染数据
          this.addOrderFilterRange.max = this.pointMaxNum;

          // 过滤客位数量发生变化, 执行Pager组件refresh()方法, 刷新重载组件计算分页
          setTimeout(() => {
            pageLoading.close();
          }, 0);
        } else {
          this.$message({
            // message: '操作异常, 请刷新后重试',
            message: this.$t('Biz.Booking.BookTip17'),
            type: 'warning',
          });
          pageLoading.close();
        }
      });
      // 打开弹窗页面
      this.$refs.addBookingPointDetailList.open();
    },

    /** *********************************************************************
     ** 子组件传递调用方法 * */
    // 预订单弹窗组件 - 启调渲染方法(公共)
    orderDialogOpenMethod(type) {
      // type - 传入标题内容
      this.dialogTitle = type;
      // 打开弹窗
      this.$refs.addBooking.open();
    },
    // 修改/查看预订单: 预订单弹窗打开时, 子组件调用(每次打开, 根据类型, 渲染数据)
    orderOpen() {
      let tmpShiftObj;
      let tmpSshiftIndex;
      // 缓存 执行修改(或查看)订单的对象(预订日历已预订客位的预订信息,或者预订单列表选中项)
      const tmpObj = this.bookedPointInfoListChosenItem;
      // 设置 '取消预订'按钮 隐藏
      this.onlyChangeOrder = false;
      // 设置 '确定'按钮 显示
      this.addAndChangOrder = true;
      // 初始化订金类型 默认为第一个 列表按code排序
      if (this.depositPaywayList.length) {
        this.addOrderInput.depositPayway = this.depositPaywayList[0].id;
      }
      // 子组件启动展示时, 执行: 读取预订单列表的当前项(双击激活项), 当前项数据 填入 修改/查看预订单弹框 数据对象中
      // 再修改和查看'预订单'详情'生效, '1'-'新建预订单'
      if (this.dialogTitle.type !== '1') {
        // 1. 已选 预约日期
        this.addOrderDate.val = +new Date(tmpObj.bookTimeStr);

        // 已选 选择市别: 如果市别丢失,选择默认第一个(当前可选)市别; 存在, 正常匹配预订记录市别id
        if (!this.businessShift.some(_ => _.id === tmpObj.shiftId)) {
          // this.$message.error('预订记录市别未找到,已默认选择第一个市别!');
          this.$message.error(this.$t('Biz.Booking.BookTip18'));
          // 重置默认
          if (isEmpty(this.$refs.addOrderShiftList)) {
            this.addOrderShiftShowTitle = this.businessShift[this.businessShiftActive].name;
          } else {
            this.$refs.addOrderShiftList.title = this.businessShift[this.businessShiftActive].name;
          }
        } else {
          for (let i = 0; i < this.businessShift.length; i += 1) {
            if (this.businessShift[i].id === tmpObj.shiftId) {
              if (isEmpty(this.$refs.addOrderShiftList)) {
                this.addOrderShiftShowTitle = this.businessShift[i].name;
              } else {
                this.$refs.addOrderShiftList.title = this.businessShift[i].name;
              }
              break;
            }
          }
        }

        // 2. 到店时间 展示项目 重置为原有5项
        this.arrivalTimeShowNumber = 5;

        // 3. 已选 客位
        // 清空已选客位缓存对象: 从客位点击进入'预订单弹窗'缓存的当前客位, 使用'已预订客位详情'接口数据, 显示'修改预订单'客位信息
        this.currPointInBookingTable.length = 0;

        // 循环客位列表 和 '已预订'客位(或预订单激活项), 根据id匹配客位信息, 存入客位缓存对象
        /** 真分页优化后,使用下面代码 */
        tmpObj.bookPointList.forEach((item, index) => {
          // 匹配的客位对象, 存入 已选客位缓存对象
          this.currPointInBookingTable.push(item);
        });

        /** 原代码废除,真分页导致当前客位获取不全,匹配方法废弃 */
        // this.bookingTable.forEach((item, index) => {
        //   if (tmpObj.bookPointList.some(_ => item.id === _.pointId)) {
        //     // 匹配的客位对象, 存入 已选客位缓存对象
        //     this.currPointInBookingTable.push(item);
        //     // 匹配的客位对象, 匹配其所在预订日历客位Table中的下标:
        //     // ## '修改客位'显示的客位根据下标, 显示被选中
        //     this.currPointIndex.push(index);
        //   }
        // });

        // 4. 已存 预订人
        this.addOrderInput.bookPerson = tmpObj.bookPerson;

        // 预订人 性别
        const gender = tmpObj.gender ? tmpObj.gender : 1; // 默认
        this.addOrderInput.gender = gender;
        if (isEmpty(this.$refs.bookPersonSexList)) {
          // 数组里的id是String类型  gender类型有可能是int类型  所以这里用弱等
          this.bookPersonSexShowTitle = this.bookPersonSexList.filter(_ => _.id == gender).shift().name;
        } else {
          this.$refs.bookPersonSexList.title = this.bookPersonSexList.filter(_ => _.id == gender).shift().name;
        }
        // 5. 已存 联系电话
        this.addOrderInput.contactTel = tmpObj.contactTel;

        // 6. 已存 就餐人数
        this.addOrderInput.peopleQty = tmpObj.peopleQty;

        // 7. 已选 营销员: 修改/查看 初始化执行, 新建时需要重置(undefined判断: 排除首屏相关DOM未渲染)
        // 空值处理为默认内容
        if (tmpObj.marketEmpName) {
          if (isEmpty(this.$refs.addOrderEmpList)) {
            this.empListShowTitle = tmpObj.marketEmpName;
          } else {
            this.$refs.addOrderEmpList.title = tmpObj.marketEmpName;
          }
        } else {
          if (isEmpty(this.$refs.addOrderEmpList)) {
            this.empListShowTitle = this.$t('Biz.Booking.BookTip07');
          } else {
            this.$refs.addOrderEmpList.title = this.$t('Biz.Booking.BookTip07');
          }
        }

        // 8. 已选 预定类型 (undefined判断: 排除首屏相关DOM未渲染): 循环匹配 传入的bookType与预定类型各项id, 输出赋值name
        if (isEmpty(this.$refs.addOrderBookTypeList)) {
          this.diningTypeListShowTitle = this.diningTypeList.filter(
            _ => _.id === tmpObj.bookType,
          ).shift().name;
        } else {
          this.$refs.addOrderBookTypeList.title = this.diningTypeList.filter(
            _ => _.id === tmpObj.bookType,
          ).shift().name;
        }

        // 9. 已存 订金
        // 回显 订金金额
        this.addOrderInput.deposit = tmpObj.deposit;
        // 回显控制 订金类型是否可选
        this.depositPaywayDisabledState = this.addOrderInput.deposit > 0;
        // 回显 订金方式的空值处理: 改写后台返回'已建预订单'数据, 赋值为订金方式列表第一项的id
        if (isEmpty(tmpObj.depositPayway) && this.depositPaywayList.length > 0) {
          tmpObj.depositPayway = this.depositPaywayList[0].id;
        }
        // 10. 已存 订金类型
        if (this.depositPaywayList.length > 0) {
          if (!isEmpty(this.$refs.addOrderDepositPaywayList)) {
            this.$refs.addOrderDepositPaywayList.title = this.depositPaywayList.filter(
              _ => _.id === tmpObj.depositPayway,
            ).shift().name;
          }
        }
        // 11. 已存 备注
        this.addOrderInput.remark = tmpObj.remark;
        // 12. 已选排菜单
        this.arrangelist = [];
        if (tmpObj.bizMenuTempsDTOList) {
          // 测试多个排菜单的显示
          tmpObj.bizMenuTempsDTOList.forEach((_) => {
            this.arrangelist.push({ arrangeIdStr: _.id || '', arrangeName: _.name || '' });
          });
        }
        // 13. 修改时返回的预订单修改时间
        this.addOrderInput.modifyTimeStr = tmpObj.modifyTime;
        // 14. 自定义标签: 修改/查看 初始化执行, 新建时需要重置(undefined判断: 排除首屏相关DOM未渲染)
        // (判断: 排除传值为空)
        if (tmpObj.customTagId) {
          if (isEmpty(this.$refs.customLabel)) {
            this.customLabelShowTitle = find(this.customLabelList, ['id', tmpObj.customTagId]).name;
          } else {
            this.$refs.customLabel.title = find(this.customLabelList, ['id', tmpObj.customTagId]).name;
          }
        }
      }

      // 仅在'查看预订单'生效, '3'-查看预订单
      if (this.dialogTitle.type === '3') {
        // 设置 '确定'按钮 隐藏
        this.addAndChangOrder = false;
        // 如果订单来源为 '线上',显示'取消'按钮, 食尚订/新荣记/客必得等,不显示
        if (+tmpObj.orderSource === 1 && +tmpObj.state === 0) {
          this.onlyChangeOrder = true;
        } else {
          this.onlyChangeOrder = false;
        }
        // 到店时间 展示项目 设置仅选中一项
        this.arrivalTimeShowNumber = 1;
        // 时间列表 展示已存 到店时间
        this.arrivalTimeList.push(tmpObj.expectArriveTimeStr);
      } else if (this.dialogTitle.type === '2') { // 仅在'修改预订单生效', '2'-'修改预订单'
        // 设置显示'取消按钮'显示
        this.onlyChangeOrder = true;
        // 如果订单来源为 '线上' 和 '食尚订', 隐藏'提交'按钮    /* 代码废弃 */
        // if( this.bookedLogicRule[item.orderSource]['modify'] ) {
        //   this.addAndChangOrder = false
        // }
        // 1. 执行 市别匹配
        [tmpShiftObj] = this.businessShift.filter((item, index) => {
          if (item.id === tmpObj.shiftId) {
            tmpSshiftIndex = index;
          }
          return item.id === tmpObj.shiftId;
        });

        // 2. 生成该市别下的到店时间列表
        this.arrivalTimeMethod(tmpShiftObj, tmpSshiftIndex);

        // 3. 已选 到店时间: 根据市别, 到店时间数组内容, 选中已存值
        // 到店列表匹配到已预订时间, 设置显示
        if (this.arrivalTimeList.indexOf(tmpObj.expectArriveTimeStr) !== -1) {
          this.arrivalTimeList.forEach((item, index, arr) => {
            if (item === tmpObj.expectArriveTimeStr) {
              arr.unshift(...arr.splice(index, 1));
            }
          });
        } else {
          // 如果 匹配不到 或 已预订信息时间不存
          // this.$message.error('预订到店时间未找到,已默认选择第一个时间!');
          this.$message.error(this.$t('Biz.Booking.BookTip19'));
          this.arrivalTimeShowListSelected = 0;
        }

        // 4. 赋值 已存 订单idStr
        this.addOrderInput.idStr = tmpObj.id;
        // 5. 赋值 已存 订单orderNo
        this.addOrderInput.orderNo = tmpObj.orderNo;
        // 6. 到店时间-间隔时间提醒, 初始加载
        this.arrivalTimeItemOpt();
        // 7. 订单来源
        this.addOrderInput.orderSource = tmpObj.orderSource;
      } else if (this.dialogTitle.type === '1') { // 仅在'新建预订单'生效, '1'-'新建预订单'
        // 只在'新建预订单'
        // 1. 当左侧-会员信息tab激活时, 调用会员信息, (电话)填入新建预订单. 同时设定为为电话预订
        if (this.memberInfoOrListActive) {
          // 1.1 预订人姓名: 优先使用接口数据赋值(name-crm会员字段(优先), bookperson-预订会员字段)
          if (this.memberInfoList.name) {
            this.addOrderInput.bookPerson = this.memberInfoList.name;
          } else {
            this.addOrderInput.bookPerson = this.memberInfoList.bookperson
              ? this.memberInfoList.bookperson
              : '';
          }
          // 预订人性别
          const gender = this.memberInfoList.sex === false ? 2 : 1; // 默认
          this.addOrderInput.gender = gender;
          if (isEmpty(this.$refs.bookPersonSexList)) {
            this.bookPersonSexShowTitle = this.bookPersonSexList.filter(_ => _.id === gender).shift().name;
          } else {
            this.$refs.bookPersonSexList.title = this.bookPersonSexList.filter(_ => _.id === gender).shift().name;
          }
          // 1.2 联系电话: 优先使用接口数据赋值(mobile-crm会员字段(优先),
          // ## contacttel--预订会员字段, currCalledListItem.telNo-新来电用户字段)
          if (this.memberInfoList.mobile) {
            this.addOrderInput.contactTel = this.memberInfoList.mobile;
          } else {
            this.addOrderInput.contactTel = this.memberInfoList.contacttel
              ? this.memberInfoList.contacttel
              : this.currCalledListItem.telNo;
          }
          // 1.3 设置订单来源: 电话预订('会员'页面激活:电话始终存在,订单来源为2;)
          this.addOrderInput.orderSource = 2;
        } else {
          // 设置订单来源: 电话预订('预订(来电)记录'页面激活,订单来源为3 )
          this.addOrderInput.orderSource = 3;
        }

        // 3. 默认 就餐人数
        this.addOrderInput.peopleQty = this.currPointInBookingTable[0]
          ? this.currPointInBookingTable[0].def_capacity
          : '';

        // 4. 已选 选择市别
        if (isEmpty(this.$refs.addOrderShiftList)) {
          this.addOrderShiftShowTitle = this.businessShift[this.businessShiftActive].name;
        } else {
          this.$refs.addOrderShiftList.title = this.businessShift[this.businessShiftActive].name;
        }

        // 5. 生成该市别下的到店时间列表
        this.arrivalTimeMethod(
          this.businessShift[this.businessShiftActive],
          this.businessShiftActive,
        );

        // 6. 可选到店时间选项, 已禁用项, 不可设置默认选中(初始打开弹窗):执行默认选中下一个未预订的时间
        this.arrivalTimeList.forEach((item, index) => {
          if (
            this.bookedPointInfoList[index]
            && item === this.bookedPointInfoList[index].expectArriveTime
          ) {
            this.arrivalTimeShowListSelected = index + 1;
          }
        });

        // 7. 到店时间-间隔时间提醒, 初始加载: 已预订占用时间选项-间隔时间小于this.multiBookTime时, 提醒
        this.arrivalTimeItemOpt();
      }
    },
    // 预订单弹窗关闭时, 子组件调用(每次关闭, 根据类型, 执行清空)
    orderClose() {
      // 清空, 存储的选中项数组和选中项所在bookingTable的真实下标  (每次关闭,都清数据)
      this.currPointInBookingTable.length = 0;
      this.arrivalTimeList.length = 0;
      this.currPointDateIndex = '';
      // 清空 已预订客位信息 和 时间间隔提示状态参数
      this.bookedPointInfoList.length = 0;
      this.multiBookTimeActive = false;

      // 重置, 新增/修改客位的客位筛选组件(按钮)选中状态
      this.addBookingPointFilterArea.forEach((_) => {
        _.check = 1;
      });
      this.addBookingPointFilterType.forEach((_) => {
        _.check = 1;
      });
      this.addBookingPointFilterRequest.forEach((_) => {
        _.check = 0;
      });
      this.addOrderFilterRange.val = 0;
      Object.keys(this.addOrderFilteConditions).forEach((item) => {
        // 排除 人数（没有length，而人数被直接清0）
        if (this.addOrderFilteConditions[item].length) {
          this.addOrderFilteConditions[item] = '';
        }
      });
      // 到店时间 选中项 重置
      this.arrivalTimeShowListSelected = 0;

      // 执行关闭 预订单弹窗
      this.$refs.addBooking.close();
    },
    // 初始化提交预订所需要的数据
    initAddBookingSubmitData() {
      // 预订排菜
      const arrangeNameArr = [];
      const arrangeIdStrArr = [];
      this.arrangelist.forEach((_) => {
        arrangeNameArr.push(_.arrangeName);
        arrangeIdStrArr.push(_.arrangeIdStr);
      });
      this.addOrderInput.arrangeName = arrangeNameArr.join(',');
      this.addOrderInput.arrangeIdStr = arrangeIdStrArr.join(',');
      // 预订的日期
      this.addOrderInput.bookTimeStr = this.dateFormatString(this.addOrderDate.val);
      // 预订的市别: 读取市别子组件数据匹配选中市别id, 装载提交对象
      this.businessShift.forEach((_) => {
        if (_.name === this.$refs.addOrderShiftList.title) {
          this.addOrderInput.shiftIdStr = _.id;
        }
      });
      // 预订的到店时间
      this.addOrderInput.expectArriveTimeStr = this.arrivalTimeList[
        this.arrivalTimeShowListSelected
      ];
      // 预订的客位: 执行数据赋值给this.addOrderInput对象, 将对象提交后台(每次清空提交客位数组)
      this.addOrderInput.pointList.length = 0;
      this.currPointInBookingTable.forEach((_) => {
        this.addOrderInput.pointList.push(_.pointId);
      });

      // 以下变量单独定义是为了解决BUG-3675
      const addOrderEmpListTitle = this.$refs.addOrderEmpList.title;
      const customLabelTitle = this.$refs.customLabel.title;
      const addOrderBookTypeListTitle = this.$refs.addOrderBookTypeList.title;

      // 营销员 ref:addOrderEmpList
      this.empList.forEach((_) => {
        if (_.name === addOrderEmpListTitle) {
          this.addOrderInput.marketEmpIdStr = _.id;
        }
      });
      // 自定义标签 ref:customLabel
      this.customLabelList.forEach((_) => {
        if (_.name === customLabelTitle) {
          this.addOrderInput.customTagId = _.id;
        }
      });
      // 预订的类型: 读取预定类型子组件数据匹配选中市别id, 装载提交对象
      this.diningTypeList.forEach((_) => {
        if (_.name === addOrderBookTypeListTitle) {
          this.addOrderInput.bookTypeStr = _.id;
        }
      });
    },
    // 提交预订前校验必填项是否填了
    checkBeforeAddBookingSubmit() {
      let bool = true;
      // 预订人,联系电话,就餐人数,订金,备注等数据双向绑定于this.addOrderInput对象中相应属性
      // 非法到店时间 排除
      // 新建凌晨12点以后的预订单 会被阻止, 这是个变态而又无奈的bug
      // console.log(
      // this.addOrderInput.bookTimeStr == this.dateFormatString(new Date())
      // && this.currentShiftId == this.addOrderInput.shiftIdStr
      // )
      if (new Date(`${this.addOrderInput.bookTimeStr}  ${this.addOrderInput.expectArriveTimeStr}:00`) <= new Date()) {
        // this.$message.error('您选择的时间应晚于当前时间');
        this.$message.error(this.$t('Biz.Booking.BookTip20'));
        bool = false;
      }

      // 必填条件 数据排空
      // 排空检测提示的模型对象
      const tmp = {
        bookTimeStr: this.$t('Biz.Booking.OrderTime'), // '预约日期',
        bookTypeStr: this.$t('Biz.Booking.BookType'), // '预订类型',
        contactTel: this.$t('Dict.ContactNumber'), // '联系电话',
        bookPerson: this.$t('Biz.Booking.BookPerson'), // '预订人',
        peopleQty: this.$t('Dict.EatPersonNum'), // '就餐人数',
      };
      // 匹配 上传数据对象中为空项, 提示相应信息, 并阻止提交
      // eslint-disable-next-line no-restricted-syntax
      for (const i in tmp) {
        if (!this.addOrderInput[i]) {
          // this.$message.error(`请填写${tmp[i]}`);
          this.$message.error(`${this.$t('Biz.Booking.BookTip37')}${tmp[i]}`);
          bool = false;
        }
      }
      return bool;
    },
    // 装载赋值'新建/修改预订单'提交数据对象, 提交预订
    // 参数registerDeposit是为了区分确认和登记/退按钮的， true就是登记/退按钮  这是创建完预订单应该弹出登记押金页
    // 参数isNeedSms：新建预订成功，是否发送短信，true表示确认并发送短信
    addBookingSubmit(registerDeposit = false, isNeedSms = false) {
      this.initAddBookingSubmitData();
      const bool = this.checkBeforeAddBookingSubmit();
      if (!bool) return false;
      // 开启客位多预订, 预订间隔时间小于系统设置间隔时间, 提示选择
      if (this.multiBookTimeActive) {
        // 提示 进行执行操作
        // this.$confirm(`与其他预订单到店时间间隔少于【${this.multiBookTime}】分钟，是否确认预订？`, '提示', {
        this.$confirm(
          this.$t('Biz.Booking.BookTip03', [this.multiBookTime]),
          this.$t('Dict.Tips'),
          {
            confirmButtonText: this.$t('Dict.Sure'), // 确定
            cancelButtonText: this.$t('Dict.Cancel'), // 取消
            type: 'warning',
            closeOnClickModal: false,
          },
        )
          .then(() => {
            // this.addBookingSubmitCallback();
            // 新增需求, 先询问是否发送短信在执行接口, 不再直接挂壁dialog执行接口: 使用回调方式传递执行
            this.sendSMsConfirm(this.addBookingSubmitCallback, 'modify', registerDeposit);
          });
        // 否则, 直接执行开单
      } else {
        // this.addBookingSubmitCallback();
        // 新增需求, 先询问是否发送短信在执行接口, 不再直接挂壁dialog执行接口: 使用回调方式传递执行
        this.sendSMsConfirm(this.addBookingSubmitCallback, 'modify', registerDeposit, isNeedSms);
      }
      return true;
    },
    // 发送短信: '新建和修改'不提示, '修改'执行弹框确认.
    // 参数: callback-后续执行回调, type-允许生效的类型(限制'修改订单'生效, '关闭'和'取消订单'不生效)
    // 参数isNeedSms： 新建预订成功，是否发送短信
    sendSMsConfirm(callback, type, registerDeposit, isNeedSms) {
      // '2'-'修改预订单'
      if (this.dialogTitle.type === '2' && type === 'modify') {
        this.$confirm(
          // '是否发送预订短信?',
          this.$t('Biz.Booking.BookTip22'),
          this.$t('Dict.Tips'), // '提示',
          {
            confirmButtonText: this.$t('Dict.Sure'), // 确定
            cancelButtonText: this.$t('Dict.Cancel'), // 取消
            showClose: false,
            type: 'info',
          },
        ).then(() => {
          // 确认发送, 传参 1
          // callback && callback(1);
          if (callback) { callback(1, registerDeposit); }
        }).catch(() => {
          // 取消发送, 传参 0
          // callback && callback(0);
          if (callback) { callback(0, registerDeposit); }
        });
        // this. addOrderInput.needSms
      } else {
        // 新建时不弹框, 但写死传参 1
        // eslint-disable-next-line no-unused-expressions
        callback && (isNeedSms ? callback(1, registerDeposit) : callback(0, registerDeposit));
      }
    },
    // 新建预订单提交后(或提示后), 执行的接口回调
    addBookingSubmitCallback(data, registerDeposit) {
      this.addOrderInput.needSms = data;
      // 执行访问接口, 上传预订数据: 成功-执行关闭弹窗, 失败-提示刷新页面
      if (this.bookingTableBtnActive.code === 'calendar') {
        this.saveOrUpdateOrderInfo(() => {
          this.$refs.addBooking.close();
          // 刷新 预订日历 客位数据
          this.getBookingViewDetailsData(null, this.currentPageNum);
          // 刷新 预订(来电)记录列表 数据
          this.getIncomingCallsList();
        }, registerDeposit);
        // 上传 更新预订状态
        // 查询,当前预订记录列表中 激活的来电(预订会员)记录的id ,和设置state=1,传给saveOrUpdateIncomingCallsInfo接口
        // 使用来电记录列表匹配当前来电信息的id
        if (this.memberInfoOrListActive && this.currCalledListItem.id) {
          this.saveOrUpdateIncomingCallsInfo({ idStr: this.currCalledListItem.id, state: 1 });
        }
      } else {
        this.saveOrUpdateOrderInfo(() => {
          this.$refs.addBooking.close();
          // 刷新预订单列表 数据
          this.getOrderList();
        }, registerDeposit);
      }
    },
    // 清空数据装载对象方法(也重置 预订单弹窗(新建) 打开时渲染数据 ), 重点: 排序规则
    deleteAddOrderInput() {
      // 缓存已选客位数据 清空
      this.currPointInBookingTable.length = 0;
      // 用户输入 清空
      // for (const i in this.addOrderInput) {
      //   this.addOrderInput[i] = '';
      //   this.addOrderInput.pointList = [];
      // }
      Object.keys(this.addOrderInput).forEach((item) => {
        this.addOrderInput[item] = '';
        this.addOrderInput.pointList = [];
        this.arrangelist = [];
      });
      this.addOrderInput.deposit = 0;
      // 初始化订金类型 默认为第一个 列表按code排序
      if (this.depositPaywayList.length) {
        this.addOrderInput.depositPayway = this.depositPaywayList[0].id;
      }
      // 恢复订金下拉类型禁用
      this.depositPaywayDisabledState = false;
      // 下拉列表 重置(市别/ 营销员/ 预定类型/ 订金类型)
      // 预订单弹窗 重置(与 预订日历 市别联动, 重置为初始选择)
      // this.$refs.addOrderShiftList != undefined
      //   && (this.$refs.addOrderShiftList.title =
      //   this.businessShift[this.businessShiftActive].name);
      if (!isEmpty(this.$refs.addOrderShiftList)) {
        this.$refs.addOrderShiftList.title = this.businessShift[
          this.businessShiftActive].name;
      }
      // 预订人性别
      if (!isEmpty(this.$refs.bookPersonSexList)) {
        this.addOrderInput.gender = this.bookPersonSexList[0].id;
        this.$refs.bookPersonSexList.title = this.bookPersonSexList[0].name;
      }

      // 营销员 重置
      if (!isEmpty(this.$refs.addOrderEmpList)) {
        // this.$refs.addOrderEmpList.title = '请选择营销员';
        this.$refs.addOrderEmpList.title = this.$t('Biz.Booking.BookTip07');
      }
      // 预定类型重置
      if (!isEmpty(this.$refs.addOrderBookTypeList)) {
        // this.$refs.addOrderBookTypeList.title = '请选择预定类型';
        this.$refs.addOrderBookTypeList.title = this.$t('Biz.Booking.BookTip06');
      }
      // 自定义标签重置
      if (!isEmpty(this.$refs.customLabel)) {
        // this.$refs.customLabel.title = '请选择预定类型';
        this.$refs.customLabel.title = this.$t('Biz.Booking.BookTip40');
      }
      if (!isEmpty(this.$refs.addOrderDepositPaywayList)) {
        this.$refs.addOrderDepositPaywayList.title = this.depositPaywayList[0].name;
      }
      // 到店时间列表 显示项目数量 重置(新建和修改展示全部功能, 查看时不可选择, 且只展示选中项)
      this.arrivalTimeShowNumber = 5;
      /* 天坑*********chrome浏览器之坑
       * 到店时间列表排序 重置 */
      // this.arrivalTimeList.sort((a, b) => {
      //   /* 排序规则不能只是用'a>b'在数量大于10个时,排序失败: 因为当a<b时,位置不变动,会出错. chrome处理排序时,数量大于10时使用插入方式排
      //    * (ff不会出现), 所以处理这里需要传入a > b ? 1 : -1 均需变动位置的规则处理 */
      //   return a > b ? 1 : -1
      // })

      // 到店时间 选中项 重置
      this.arrivalTimeShowListSelected = 0;
    },

    // 新建/修改预订单-客位:选择打开时
    addBookingPointOpen() {
      // setTimeout(() => {
      //   this.$refs.addChangePointPager.refresh();
      // }, 100);
    },

    // 新建/修改预订单-新增/修改客位: 关闭时调用
    addBookingPointClose() {
      // 额外增加 弹窗关闭操作
      this.$refs.addBookingPointDetailList.close();
      // 只显示空闲客位
      this.addOrderPointFree = false;
    },

    //  新增/修改客位, 选中项, 样式激活
    addChangeChosenPointClass(item) {
      // 改为: '新建/修改预订单'打开时,在缓存的已选客位数据中匹配,新加客位列表,来显示选中客位
      // 解决用index判断时,翻页依然选中的错误逻辑(真分页优化导致).
      // item-客位列表, this.currPointInBookingTable-预订单缓存的客位列表
      return find(this.currPointInBookingTable, ['pointId', item.pointId]) || false;

      // return this.currPointIndex.indexOf(index) !== -1; // 代码废除不用
    },

    // 新增/修改客位-客位列表, 点击执行
    addChangeChosenPoint(item, index) {
      /** 多预订需求,不在限制为空闲客位预订, 代码废除 */
      // if (item.state !== 1) {
      //   // '1'-'新建预订单', '2'-'修改预订单'
      //   if (this.dialogTitle.type === '1') {
      //     // 新建预订单-正常阻拦非空闲客位点击
      //     return false;
      //   } if (
      //     this.dialogTitle.type === '2'
      //     && !this.bookedPointInfoListChosenItem.bookPointList.some(_ => _.pointId === item.pointId)
      //   ) {
      //     // 修改预订单-阻拦点击, 需排除当前预订单信息(允许订单的客位点击修改)
      //     return false;
      //   }
      // }
      /** end */

      // 客位操作
      if (!find(this.currPointInBookingTable, ['pointId', item.pointId])) {
        // 添加选择项
        this.currPointInBookingTable.push(item);
      } else {
        // 删除选中项, 存储数组
        if (this.currPointInBookingTable.length > 1) {
          this.currPointInBookingTable.some((sub, subIndex, arr) => {
            if (sub.pointId === item.pointId) {
              arr.splice(subIndex, 1);
            }
            return sub.pointId === item.pointId;
          });
        } else {
          // this.$message.error('至少保留一个客位');
          this.$message.error(this.$t('Biz.Booking.BookTip16'));
        }
      }
      return true;
    },
    // selectList子组件回传改变数值
    selectDone(res, type) {
      // 接收子组件执行后传递的数据, 并赋值给新订单绑定对象对应的属性值(属性键名以子组件ref值传递到子组件中, type即返回的ref值)
      this.addOrderInput[type] = res.id;
    },

    // 启调排菜单窗后
    openArrangeMenuListDailog() {
      // 传入三个参数 true-调用排菜单业务(指非排菜主页面打开), 'booking'-触发打开的业务类型, bookOrderData-当前操作的预订单信息
      let relatedOfArrangeMenu = null;
      // 当 修改预订单, 打开的预订单存在排菜信息(bizMenuTempsDTOList数据为true)时, (排除了新建和无关联排菜的预订单)
      if (!isEmpty(this.bookedPointInfoListChosenItem.bizMenuTempsDTOList)) {
        relatedOfArrangeMenu = this.bookedPointInfoListChosenItem;
      }
      // 使用排菜功能前校验默认模板, false-不可使用
      if (this.posInfo.putItemsMode === '1') {
        this.$vemit('openArrangeMenu', true, 'booking', relatedOfArrangeMenu);
      } else {
        ajax('canyin.pos.arrangemenubase.checkdefaulttemp').then((res) => {
          if (!isEmpty(res)) {
            // 启调 窗口
            this.$vemit('openArrangeMenu', true, 'booking', relatedOfArrangeMenu);
          }
        });
      }
    },
    // 选择排菜单后,(新建/修改)预订单的回显,(供 排菜单列表页选择后执行)
    selectedArrangeMenu(data) {
      if (!isEmpty(data)) {
        // 为了覆盖之前选择的排菜，后期若可以选择多个排菜，删除此行
        this.arrangelist = [];
        // 判断是否已选择该排菜单
        let isHaveArrange = false;
        for (let i = 0; i < this.arrangelist.length; i++) {
          if (this.arrangelist[i].arrangeIdStr === data.id) {
            isHaveArrange = true;
          }
        }
        if (!isHaveArrange) {
          this.arrangelist.push({ arrangeIdStr: data.id, arrangeName: data.name });
        }
      } else {
        this.relationArrangeMenuDelete();
      }
    },
    // 删除预订单已关联排菜单(从名称的'X'执行)
    relationArrangeMenuDelete(item) {
      if (item) {
        let deleteIndex = -1;
        for (let i = 0; i < this.arrangelist.length; i++) {
          if (item.arrangeIdStr === this.arrangelist[i].arrangeIdStr && item.arrangeName === this.arrangelist[i].arrangeName) {
            deleteIndex = i;
          }
        }
        if (deleteIndex >= 0) {
          this.arrangelist.splice(deleteIndex, 1);
        }
      } else {
        this.arrangelist = [];
      }
    },

    // 预订单查询按钮
    queryOrderTable() {
      // 订单列表选中项 重置
      this.orderTableItemActive = null;
      // 根据预订单的DatePicker和市别, 执行接口数据查新
      this.getOrderList();
    },

    // 预订品项汇总
    sumOfBookedItemsDialogOpen() {
      // 传参, 预订单选中日期, 预订单选中市别 和 市别列表
      this.$refs.sumOfBookedItems.open({
        bookTimeStr: this.dateFormatString(this.orderChartPicker.chartDateVal),
        orderShiftActive: this.orderTableShiftActive,
        orderShiftList: this.orderBusinessShift,
      });
    },
    // 预订单列表 双击起调, 修改预订单信息
    dblClickChangeAddOrder(item, index) {
      // 当前行双击, 默认选中当前
      this.orderTableItemActive = index;
      // 查新预订单选中项数据, 渲染'修改预订单'(查询参数-订单的id,不是orderID), 成功后回调: 打开预订单弹窗
      this.getOrderDetailInfo(item.id, () => {
        // 传参, 启调 修改预订单弹窗:
        // ## 预订单信息状态state为 0-未执行 && 订单来源orderSource,
        // #### 不是1/4/5/6-非线上预订(线上订单-吾享/食尚订/新荣记/客必得)来源时,
        // #### 执行修改预订单..其它只执行查看功能.
        // 1-'修改',2-'查看' 预订单
        if (+item.state === 0 && this.bookedLogicRule[item.orderSource].modify) {
          this.orderDialogOpenMethod(this.dialogType[1]);
        } else {
          this.orderDialogOpenMethod(this.dialogType[2]);
        }
      });
    },

    // 预订单-打印: 读取接口, 返回执行读取设备管理器,进行打印
    orderListPrint() {
      const orderLists = [];
      if (!this.orderTable.length) {
        this.$message({
          // message: '没有数据可以打印',
          message: this.$t('Biz.Booking.BookTip24'),
          type: 'warning',
        });
        return false;
      }
      // 有选中项
      if (this.orderTable[this.orderTableItemActive]) {
        // 且订单来源为 食尚订/新荣记/客必得 时, 禁用打印
        if (this.orderTableOperation('print')) {
          return false;
        }
        // orderLists.push(this.orderTable[this.orderTableItemActive].id);
        orderLists.push({
          id: this.orderTable[this.orderTableItemActive].id,
          modifyTimeStr: this.orderTable[this.orderTableItemActive].modifyTime,
        });
      } else {
        // 无选中项(全选时)
        // 全部订单 都是'食尚订 / 食尚订 / 客必得'时, 禁用
        if (this.orderTable.length === this.orderTable.filter(_ => +_.orderSource === 4).length
          || this.orderTable.length === this.orderTable.filter(_ => +_.orderSource === 5).length
          || this.orderTable.length === this.orderTable.filter(_ => +_.orderSource === 6).length
        ) {
          return false;
        }

        // 循环匹配订单 不是'食尚订 / 食尚订 / 客必得'时的订单时, id传入打印方法,执行打印
        this.orderTable.forEach((item) => {
          if (+item.orderSource !== 4
            && +item.orderSource !== 5
            && +item.orderSource !== 6
          ) {
            // this.orderTableFilteMethod(item);
            orderLists.push({ id: item.id, modifyTimeStr: item.modifyTime });
          }
        });
      }
      // 过滤结果,传值,执行打印
      this.printOrder(orderLists);
      return true;
    },

    // 预订单-执行
    orderExecute() {
      // 未选中不可操作 && 状态不是'未执行'不可在操作 && 选中项来源为 '新荣记' 不可执行
      if (this.orderTableOperation('execute')) {
        return false;
      }
      // orderTable[orderTableItemActive] 当前选择中的订单的数据对象
      let url;
      const upData = {};
      // 当前订单 对象
      const orderObj = this.orderTable[this.orderTableItemActive];
      // 订单 客位参数
      const pointNameStr = orderObj.pointIdStr;
      const pointNameStrs = pointNameStr.split(',');
      // 请求接口地址(单客位预订)
      url = 'canyin.pos.booking.doreserve';

      // 如果 含有关联排菜信息(bizMenuTempsDTOList), 则提示阻拦执行
      if (!isEmpty(orderObj.bizMenuTempsDTOList)) {
        this.$alert(this.$t('Biz.Booking.BookTip25'), this.$t('Dict.Tips'), {
          dangerouslyUseHTMLString: true,
        });
      }

      // 线上预订: 含有默认客位(后台设置),执行客位选择弹窗, 不可多客位选择
      if ((+orderObj.orderSource) === 1) {
        // 读取 客位列表接口数据
        this.findReservePoint(orderObj.id, (data) => {
          this.$refs.choosePoint.open(data);
        });
      } else {
        // 线下预订
        // 如果'pointIdStr'为多个值, 即为团队预订, 改变_url
        if (pointNameStrs.length > 1) {
          url = 'canyin.pos.booking.doreserveteam';
        }
        // 提交参数赋值:
        // eslint-disable-next-line prefer-destructuring
        upData.pointId = pointNameStrs[0]; // 主要应用普通客位 执行预订
        upData.reserveId = orderObj.id;
        upData.reserveListSource = 1;
        upData.modifyTimeStr = orderObj.modifyTime;
        upData.posIdStr = this.posBaseInfo.id;
        // 调用接口, 提交数据
        this.doReserveOrder(url, upData);
      }
      return true;
    },
    // 预订单-修改
    orderModify() {
      // 未选中不可操作  &&  状态不是'未执行'不可在操作   &&  线上订单不可操作
      if (this.orderTableOperation('modify')) {
        return false;
      }
      // 接口查询选中项数据, 再启调 预订单弹窗-修改模式
      this.getOrderDetailInfo(this.orderTable[this.orderTableItemActive].id, () => {
        // 1-'修改预订单'
        this.orderDialogOpenMethod(this.dialogType[1]);
      });
      return true;
    },
    // 预订单-取消
    orderCancel() {
      // 未选中不可操作  &&  状态不是'未执行'不可在操作
      if (this.orderTableOperation('cancel') && this.bookingTableBtnActive.code === 'bookList') {
        return false;
      }
      // 启调 弹窗
      this.orderCancelDialogVisible = true;
      // 如果 原因列表为空, 添加'其他'原因,并且选中和激活其他原因输入框
      this.cancelReasonList.push({ name: this.$t('Dict.Other'), id: 'other' }); // 其他
      return true;
    },
    reasonListToggle(item, index) {
      this.reasonListActive = index;
      this.otherReasonActive = item.id === 'other';
    },
    // 预订单-取消原因-弹窗关闭
    orderCancelDialogClose() {
      // 关闭状态参数
      this.orderCancelDialogVisible = false;
    },
    // 预订单-取消原因-弹窗关闭后 执行清空
    orderCancelDialogClear() {
      // 清空选择状态
      this.reasonListActive = 0;
      // 清楚 其他选项
      this.cancelReasonList.pop();
      // 清空 其他原因内容
      this.otherReasonContent = '';
    },
    // 预订单-取消原因-确认提交
    orderCancelDialogSubmit(data) {
      // 初始化时, 预订是否必填取消原因参数 posBooking.isOpenBookCancelReason
      if (this.posBooking.isOpenBookCancelReason
        && this.cancelReasonList[this.reasonListActive].id === 'other'
        // && this.otherReasonContent == ''
        && isEmpty(this.otherReasonContent)
      ) {
        this.$message({
          // message: '取消原因为空, 请输入',
          message: this.$t('Biz.Booking.BookTip26'),
          type: 'warning',
        });
        return false;
      }
      // 关闭状态参数
      this.orderCancelDialogVisible = false;
      /* 上传数据对象: id-订单id, cancelReason-原因(其他的内容). 预订日历可修改取消 / 预订单也可取消
       * 预订日历 this.bookedPointInfoListChosenItem (激活当前预订单对象)
       * 预订单 orderTable[orderTableItemActive] (当前选择中的订单的数据对象)
       * this.cancelReasonList[this.reasonListActive] 当前选中原因
      */
      const obj = {
        idStr: this.bookingTableBtnActive.code === 'bookList'
          ? this.orderTable[this.orderTableItemActive].id
          : this.bookedPointInfoListChosenItem.id,
        cancelReason: this.cancelReasonList[this.reasonListActive].id === 'other'
          ? this.otherReasonContent
          : this.cancelReasonList[this.reasonListActive].name,
        needSms: data,
        modifyTimeStr: this.bookingTableBtnActive.code === 'bookList'
          ? this.orderTable[this.orderTableItemActive].modifyTime
          : this.bookedPointInfoListChosenItem.modifyTime,
      };
      // 调用接口(POST)
      ajax('canyin.pos.booking.cancelorder', {
        contentType: 'json',
        data: obj,
      }).then((res) => {
        if (res.data.success) {
          this.$message.success(`${res.data.msg}`);
          // 关闭 预订单 弹窗
          this.$refs.addBooking.close();
          /* 取消预订单后, 只刷新预订单列表,无需执行预定日历列表刷新, 切换Tabs会执行刷新 */ // 刷新 预订日历客位数据
          // 刷新 预订单列表数据
          this.getOrderList();
          if (this.bookingTableBtnActive.code === 'calendar') {
            this.getBookingViewDetailsData(null, this.currentPageNum);
          }
        } else {
          this.$message({
            // message: '取消预订单出现错误，请刷新重试',
            message: this.$t('Biz.Booking.BookTip27'),
            type: 'warning',
          });
        }
      });
      return true;
    },

    /**
     * 预订单列表功能: 执行/修改/取消, 供 '按钮样式' 和 '按钮执行功能'的判定结果 调用
     * 参数: type-传入的执行类型(cancel-取消, modify-修改, execute-执行),
     * ## orderTable-预订单列表, orderTableItemActive-当前选中项.
     * 业务逻辑: 根据选中项的订单来源, 执行相应的业务判断;
     * orderSource => 1: 线上(吾享)订单, 不可修改, 其他功能正常
     * orderSource => 2 / 3: 到店/来电, 所有功能均可用
     * orderSource => 4: 线上(食尚订-订多多)来源, 不可 打印/修改/取消, 只能执行/查看
     * orderSource => 5: 线上(新荣记)来源,不可 打印/执行/修改/取消, 只能查看
     * orderSource => 6: 线上(客必得)来源,不可 打印/修改/取消, 只能执行/查看
     */
    orderTableOperation(type) {
      let item;
      // 暂存 选中对象
      if (this.orderTableItemActive != null) {
        item = this.orderTable[this.orderTableItemActive];
      } else {
        item = null;
      }
      // 根据订单源参数(orderSource) 匹配字典(bookedLogicRule),生成业务规则,在根据传入的type(执行/修改/取消)交互类型, 返回业务逻辑判断结果
      if (this.orderTableItemActive == null
        || (item && (+item.state !== 0
            || !this.bookedLogicRule[`${item.orderSource}`][type]))
      ) {
        return true;
      }
      return false;
    },

    // 预订单列表功能: 打印, 食尚订/新荣记/客必得, 均禁用按钮
    orderTableOperationPrint() {
      let item;
      const list = this.orderTable.filter(_ => this.orderTableFilteMethod(_));
      // 暂存 选中对象
      if (this.orderTableItemActive != null) {
        item = this.orderTable[this.orderTableItemActive];
      } else {
        item = null;
      }
      // 执行业务逻辑判断
      // 当 无数据是, 返回禁用
      // 当 有选中项时: 选中项执行状态为 已执行/已过期/已取消, 返回禁用
      // 当 有选中项时: 选中项的来源, 匹配字典的打印功能, 返回结果
      // 当 没有选中项时: 列表过滤的结果, 不含 食尚订/新荣记/客必得 的订单时 且 订单状态'未执行'时, 返回允许, 其他情况均禁用
      if (list.length < 1) {
        return true;
      }
      if ((item && +item.state !== 0)
        || (item && !this.bookedLogicRule[`${item.orderSource}`].print)
      ) {
        return true;
      }
      if (item == null) {
        // 预置允许打印, 且状态'未执行', 返回允许; 列表全为预置不可打印, 和 预置可打印且状态为不可执行的, 均返回禁用
        if (list.filter(_ => (this.bookedLogicRule[`${_.orderSource}`].print && +_.state === 0)).length) {
          return false;
        }
        return true;
      }
      return false;
    },

    /** *********************************************************************
     ** 读取接口调用方法 * */

    // 获取基本信息(加载执行)
    getBasicInfo(callback) {
      ajax('canyin.pos.booking.getbasicinfo')
        .then((res) => {
          if (!isEmpty(res)) {
            // 获取预订记录列表 赋值给渲染数据
            /** 部分数据初始化赋值 * */
            // bookingTable日期周期显示模式
            this.tableDateInColActive = parseInt(res.bookingViewShowDays, 10);
            // 营销员数据列表
            this.empList = res.empList;
            // 预定类型 (新建预订单)
            this.diningTypeList = res.diningTypeList;
            // 预定类型 (预订单),对象数组, 执行深度克隆
            this.orderBookingTypeList = cloneDeep(this.diningTypeList);
            // 添加'check' 属性
            this.orderBookingTypeList.forEach((_) => {
              Vue.set(_, 'check', 1);
            });
            // 客位区域
            this.chartFilterArea = res.areaList;
            // 客位区域列表每个对象添加选中属性(check并初始化为 1), 对象直接添加属性不能被Observer检测到,
            // ## Vue.set方法将新属性添加为被Observer并保持响应
            this.chartFilterArea.forEach((_) => {
              // _.check = 1
              Vue.set(_, 'check', 1);
              // this.$set(item, 'check', 1) 也可执行
              // item = Object.assign({}, item, { check1: 1 }) 也可,
              // ## 但是需要将扩展后的item重新替换添加进入当前循环数组, 以达到vue检测数据变化
            });
            // 客位类型
            this.chartFilterType = res.pointTypeList;
            // 客位类型, 每个对象添加选中属性
            this.chartFilterType.forEach((_) => {
              Vue.set(_, 'check', 1);
            });
            // 客位标签
            this.chartFilterRequest = res.pointLabelList;
            // 客位标签, 每个对象添加选中属性, 初始状态赋值 0, 默认不选中
            this.chartFilterRequest.forEach((_) => {
              Vue.set(_, 'check', 0);
            });
            // 自定义标签, 开台时用
            this.customLabelList = res.bookLabelList;

            /**
             * 预订业务屏蔽多平台对接(食尚订/新荣记/客必得) 交互和写活功能,
             * */
            // 订单所有类型的静态数据
            this.orderAllSource = res.orderAllSource;
            // 当前业务的订单来源
            this.ordersSource = res.ordersSource;
            // 订单来源, 每个对象添加选中属性, 初始状态1, 为默认选中
            this.ordersSource.forEach((_) => {
              Vue.set(_, 'check', 1);
            });
            // 到店时间-间隔时间
            this.timeSpan = res.timeInterval;
            // 当前市别id
            this.currentShiftId = res.currentShiftId;
            // 市别列表
            this.businessShift = res.shiftList;

            // 预定日历和'新建/修改'预订单-客位筛选(人数)的最大值(显示用)
            this.pointMaxNum = res.pointMaxNum;
            // 复制市别列表数据 供预订单列表 添加'全部市别'数据(静态数据), 单独使用
            this.orderBusinessShift = cloneDeep(this.businessShift);
            // 添加全部市别
            this.orderBusinessShift.unshift({
              // id: '-1', isStartShift: false, name: '全部', startTime: '00:00',
              id: '-1', isStartShift: false, name: this.$t('Dict.All'), startTime: '00:00',
            });
            // 设置 当前显示的市别(设置市别今天选中状态参数): 初始化调取本接口时,回调执行
            // 向下联动 新建预订单市别显示(设置市别组件首显内容): 首次, 且为切换预订日历市别
            if (isEmpty(this.$refs.addOrderShiftList)) {
              this.addOrderShiftShowTitle = this.businessShift[this.businessShiftActive].name;
            }
            // 多预订(预订日历-已预订客位多预订)提示间隔时间
            this.multiBookTime = res.multiBookTime;
            // 取消原因
            this.cancelReasonList = res.cancelReasonList;
            // 新建/修改预订单 客位筛选组件(按钮)数据对象-深度赋值, 避免干扰
            this.addBookingPointFilterArea = cloneDeep(this.chartFilterArea);
            this.addBookingPointFilterType = cloneDeep(this.chartFilterType);
            this.addBookingPointFilterRequest = cloneDeep(this.chartFilterRequest);
            // 订金支付方式
            this.depositPaywayList = res.paywayList;
            // 获取设备路数  no -- 线路号 ; tes -- 手机号 ； state -- 线路状态【0：没有最新来电提醒 1：正在访问的当前线路 2：有新来电提醒 3：没有新来电但是可以访问】
            // 没有新来电可以访问指的是线路A在详情页查看期间线路B来电，切换至线路B后还可以切换至线路A
            this.comingCallPathsTabs = [];
            // 初始化详情页显示多路Tab
            for (let i = 1; i <= res.devicePathNum; i++) {
              this.comingCallPathsTabs.push({ no: i, tel: '', state: 0 });
            }
            // 是否开启同客位/同市别多预订功能 1--开启
            this.isMultiBook = res.isMultiBook;
            // 执行回调
            setTimeout(() => {
              if (callback) {
                callback();
              }
              console.log(`进入预订-${+new Date()}`);
            }, 0);
          } else {
            this.$message({
              // message: '数据异常, 请刷新后重试',
              message: this.$t('Dict.AjaxMessage.Message9'),
              type: 'warning',
            });
          }
        });
    },
    // 预订记录列表
    getIncomingCallsList(callback, type) {
      // 传入参数: callback-执行的回调, type-判断条件, 执行相应操作
      ajax('canyin.pos.booking.getincomingcallslist', {
        // method: 'post',  请求方式, 被默认添加, 使用contentType时, 可不加post
        contentType: 'json',
        // 传参: 固定key
        data: {
          params: { queryCallsTime: this.dateFormatString(this.memberPicker.callListDateVal) },
        },
      }).then((res) => {
        if (res.success) {
          // 获取预订记录列表 赋值给渲染数据
          this.memberCallList = res.data;
          // 判断: 不是从会员->来点列表 && 会员列表第一项存在 && 该第一项为预订(state==0) && 该第一项来电时间(callTimeLong)小于当前10分钟
          // 包含, 手动触发 (会员信息激活时刷新为最新来电信息)来电列表 跳转 会员信息
          if (
            type !== 'bookedList'
            && this.memberCallList[0]
            && (+this.memberCallList[0].state) === 0
            && (+new Date() - parseInt(this.memberCallList[0].callTimeLong, 10) < 10 * 60 * 1000)
          ) {
            // 进页面就跳转到详情页的时候记录线路号
            if (this.currentpath == 0) {
              // 记录当前选中的线路号
              this.currentpath = this.memberCallList[0].telLineNo;
              this.comingCallPathsTabs.forEach((item) => {
                if (this.currentpath == item.no) {
                  item.state = 1;
                }
              });
            }
            // 执行, 自动'来电列表'跳转至'会员信息'tab
            for (let i = 0; i < this.memberCallList.length; i++) {
              if (this.memberCallList[i].state == 0 && this.memberCallList[i].telLineNo == this.currentpath) {
                this.memberInfoOrListToggle(this.memberCallList[i]);
                break;
              }
            }
          }
          // 判断: 会员信息激活时刷新为最新来电信息, 手动触发'来电列表'和'会员信息'切换事件执行(上个if判断执行了跳转并传值), 并设置会员信息页面 激活
          if (type === 'memberInfo' || type === 'stayMemberInfo') {
            this.memberInfoOrListActive = true;
          }
          // 执行传入回调
          if (callback) {
            callback();
          }
        } else {
          this.$message({
            // message: '数据异常, 请刷新后重试',
            message: this.$t('Dict.AjaxMessage.Message9'),
            type: 'warning',
          });
        }
      });
    },
    // 会员信息数据
    getCrmInfo(data, callback) {
      ajax('canyin.pos.booking.getcrminfo', {
        contentType: 'URIEncoded',
        // data: encodeURI('telNo=' + data)
        data: { telNo: data },
      }).then((res) => {
        if (res.success) {
          // 判断无数据时, 会员信息显示'无数据提示'
          this.memberInfoNonContent = isEmpty(res.data);
          this.memberInfoList = [];
          // 会员信息数据赋值
          this.memberInfoList = res.data;
          // 回调
          if (callback) {
            callback();
          }
        } else {
          this.$message({
            message: this.$t('Dict.AjaxMessage.Message9'),
            type: 'warning',
          });
        }
      });

      // 根据telNo,调会员预定信息接口
      this.getBookingStatistics(data);
    },
    // 会员预定信息数据
    getBookingStatistics(data) {
      // data为telNo 接口传参的电话
      ajax('canyin.pos.booking.getbookingstatistics', {
        contentType: 'URIEncoded',
        data: { telNo: data },
      }).then((res) => {
        if (res.success) {
          // 判断无数据时, 预定信息显示'无数据提示'
          this.memberbookedNonContent = isEmpty(res.data);
          // 返回结果 赋值
          this.bookedInfo = res.data;
        } else {
          this.$message({
            message: this.$t('Dict.AjaxMessage.Message9'),
            type: 'warning',
          });
        }
      });
    },
    // 预订日历客位列表翻页loading
    chartTableLoadingFun(isTurnOn) {
      if (isTurnOn) {
        // 设置loading
        this.chartPageLoading = this.$loading({
          target: '.rightArea-table',
          text: '',
          background: 'rgba(0, 0, 0, .6)',
        });
      } else {
        this.chartPageLoading.close();
      }
    },
    // 过滤预订客位筛选功能数据结构中多拼接了','号
    filterDataEndComma(data) {
      if (data) {
        return data.slice(0, data[data.length - 1] == ',' ? data.length - 1 : data.length);
      }
      return '';
    },
    // 预订日历客位列表数据: 参数queryData为接口查询参数, 默认为'预订日历快速查询'的起止日期, 如果传值则使用传入日期和市别
    getBookingViewDetailsData(queryData, currentPageNum, callback, tabsLoading) {
      let tmpQueryData;
      if (!queryData) {
        tmpQueryData = {
          // 上传查询客位状态的开始日期
          bookTimeStr: this.dateFormatString(this.tableDateIntervalStart),
          // 上传查询客位状态的截止日期
          bookTimeEndStr: this.dateFormatString(this.tableDateIntervalEnd),
          // 上传查询客位状态的市别(不存在时为初始查询，使用后台所给当前市别id)
          shiftIdStr: this.businessShift[this.businessShiftActive].id || this.currentShiftId,
        };
      } else {
        tmpQueryData = queryData;
      }
      if (currentPageNum) {
        tmpQueryData.pageSize = this.everyPageListNum; // 分页-条数
        tmpQueryData.pageNum = currentPageNum; // 分页-页码
      } else {
        tmpQueryData.pageSize = this.everyPageListNum;
        tmpQueryData.pageNum = 1;
      }
      // 当'预订日历和预订单'切换tabs时,不触发loading,
      if (!tabsLoading) {
        this.chartTableLoadingFun(true);
      }

      // 客位筛选条件数据-参数
      // 区域条件(同区域id字段名)(字符串拼接)
      tmpQueryData.areaId = this.filterDataEndComma(this.bookFilteConditions.area_id);
      // 类型条件(同类型id字段名)(字符串拼接)
      tmpQueryData.typeId = this.filterDataEndComma(this.bookFilteConditions.type_id);
      // 标签条件(同标签属性字段名)(字符串拼接)
      tmpQueryData.pointLabelIds = this.filterDataEndComma(this.bookFilteConditions.pointLabelIds);
      // 人数范围(字符串拼接)
      tmpQueryData.num = this.bookFilteConditions.num === 0 ? null : String(this.bookFilteConditions.num);

      // 调用接口
      ajax('canyin.pos.booking.getbookingviewdetailsdata', {
        contentType: 'json',
        data: tmpQueryData,
      }).then((res) => {
        if (res.success) {
          // 预订日历客位Table
          this.bookingTable = []; // 清空原有数据
          this.bookingTable = res.data.pointList; // 再刷新数据 赋值
          // 人数选择
          // 查找客位最大人数-用于人数过滤使用-直接使用后台数据, 不在前台循环(下面代码废弃)
          // let max = 0; // 临时变量
          // // 循环客位table 查找最大值
          // this.bookingTable.forEach((_) => {
          //   // 取max_capacity(可能为0)与 def_capacity的最大值, 存于max, 循环每一项, 存入比较后的最大值
          //   max = Math.max(_.max_capacity, _.def_capacity) > max
          //     ? Math.max(_.max_capacity, _.def_capacity)
          //     : max;
          // });

          // 赋值渲染数据
          this.chartFilterRange.max = this.pointMaxNum;

          // 数据总条数
          this.totalListNum = res.data.total;
          // 计算分页数据
          this.computeListPagerData(true);
          // 延迟执行传入的回调
          if (callback) {
            setTimeout(() => {
              callback();
            }, 0);
          }
          // 关闭分页loading
          if (!tabsLoading) {
            this.chartTableLoadingFun(false);
          }
        } else {
          console.log(res.data);
          this.$message({
            message: this.$t('Dict.AjaxMessage.Message9'),
            type: 'warning',
          });
          // 执行回调
          if (callback) {
            callback();
          }
          // 关闭分页loading
          if (!tabsLoading) {
            this.chartTableLoadingFun(false);
          }
        }
      });
    },
    // 预订单列表数据
    getOrderList(data, callback) {
      const tmpQueryData = {
        bookTimeStr: this.dateFormatString(this.orderChartPicker.chartDateVal),
        shiftIdStr: this.orderBusinessShift[this.orderTableShiftActive].id,
      };
      ajax('canyin.pos.booking.getorderlist', {
        contentType: 'json',
        data: { params: tmpQueryData },
      }).then((res) => {
        if (res.success) {
          this.orderTable = res.data;
          // this.$refs.orderPager.refresh();
          setTimeout(() => {
            if (callback) {
              callback();
            }
            // 因为tabs非激活页面, 为隐藏无法获取DOM节点, 点击切换时Pager插件无法获取另一个tabs页面的DOM,且高度为0,
            // 所以,等到新数据赋值,延迟执行Pager组件refresh()方法, 刷新重载组件计算
            this.$refs.orderPager.refresh();
          }, 100);
        } else {
          this.$message({
            message: this.$t('Dict.AjaxMessage.Message9'),
            type: 'warning',
          });
        }
      }).catch((res) => {
        console.log(res);
        if ((`${res}`).indexOf('timeout') !== -1) { // 超时error捕获
          // callback && callback()
        }
      });
    },
    // 模拟来电和更新预订状态 调用接口 传递数据
    saveOrUpdateIncomingCallsInfo(data, callback) {
      let tmp;
      if (data.state) {
        tmp = data;
      } else {
        tmp = { telNo: data.tel, telLineNo: data.telLineNo };
      }
      // POST data: 模拟来电, 调用接口, 上传数据, 推送 至设备管理器, 再读取来电列表接口,会员信息接口,预订日历客位信息接口, 预订统计信息接口,更新数据
      ajax('canyin.pos.booking.saveorupdateincomingcallsinfo', {
        contentType: 'json',
        data: tmp,
      }).then((res) => {
        if (res.success) {
          // 回调
          if (callback) {
            callback();
          }
        } else {
          console.log(res.date);
          this.$message({
            message: this.$t('Dict.AjaxMessage.Message9'),
            type: 'warning',
          });
        }
      });
    },
    // 预订日历 预览'天数'选择保存
    saveBookingViewSetting(data) {
      ajax('canyin.pos.booking.savebookingviewsetting', {
        contentType: 'URLEncoded',
        data: { days: data },
      }).then((res) => {
        if (res.success) {
          this.$message({
            // message: '展示天数已保存',
            message: this.$t('Biz.Booking.BookTip29'),
            type: 'success',
          });
        } else {
          console.log(res.data);
          this.$message({
            message: this.$t('Dict.AjaxMessage.Message9'),
            type: 'warning',
          });
        }
      });
    },
    // 已预订客位列表
    getBookingDetailInfoListByParam(point, date, callback) {
      const tmpQueryData = {
        bookTimeStr: this.dateFormatString(date),
        pointIdStr: point.id,
        shiftIdStr: this.businessShift[this.businessShiftActive].id,
      };
      ajax('canyin.pos.booking.getbookingdetailinfolistbyparam', {
        contentType: 'json',
        data: tmpQueryData,
      }).then((res) => {
        if (res.success) {
          if (!isEmpty(res.data)) {
            this.bookedPointInfoList = res.data;
            // 执行回调
            if (callback) { callback(); }
          } else {
            this.$confirm(this.$t('Biz.Booking.BookTip39'), {
              confirmButtonText: this.$t('Dict.Sure'),
              showCancelButton: false,
              type: 'warning',
              showClose: false,
              closeOnClickModal: false,
              closeOnPressEscape: false,
            }).then(() => {
              this.reloadBookingData();
            });
          }
        } else {
          console.log(res.data);
          this.$message({
            // message: `${res.data}数据异常, 请刷新后重试`,
            message: `${res.data}${this.$t('Dict.AjaxMessage.Message9')}`,
            type: 'warning',
          });
        }
      });
    },
    // 查询 预订单详情(和 预订日历-已预订客位详情)
    getOrderDetailInfo(data, callback) {
      // 接口调用
      ajax('canyin.pos.booking.getorderdetailinfo', {
        contentType: 'URIEncoded',
        data: { id: data },
      }).then((res) => {
        if (res.success) {
          // 数据对象赋值
          this.bookedPointInfoListChosenItem = res.data;
          // 执行回调
          if (callback) { callback(this.bookedPointInfoListChosenItem); }
        } else {
          console.log(res.data);
          this.$message({
            message: this.$t('Dict.AjaxMessage.Message9'),
            type: 'warning',
          });
        }
      });
    },
    // 是否开启了押金管理
    isOpenBuffetDepositManage() {
      const hasBuffetDepost = this.ALL_POS_MODULE.find(({ id }) => id === '1252');
      return hasBuffetDepost && hasBuffetDepost.checked;
    },
    // 保存 新建/修改预订单
    saveOrUpdateOrderInfo(callback, bool) {
      // 根据 当前预订单弹窗模式 匹配 相应提示语
      const tmpMsg = {
        1: this.$t('Biz.Booking.BookTip30'), // 新建预订单成功
        2: this.$t('Biz.Booking.BookTip31'), // 预订信息已成功修改
      };
      // 上传 装载'新建/修改'预订单数据对象
      ajax('canyin.pos.booking.saveorupdateorderinfo', {
        contentType: 'json',
        data: this.addOrderInput,
      }).then((res) => {
        if (res.data.success) {
          this.$message({
            message: res.data.msg
              ? `${tmpMsg[this.dialogTitle.type]},${res.data.msg}`
              : tmpMsg[this.dialogTitle.type],
            type: 'success',
          });
          // 以下为是否走押金管理的逻辑
          if (bool) {
            if (!this.isOpenBuffetDepositManage()) {
              // this.$message.error('该登录用户无【押金管理】的使用权限');
              this.$message.error(this.$t('Dict.UserNoPermissionOfDepositMsg'));
              return;
            }
            const tmp = this.currPointInBookingTable[0];
            this.$vemit('moreOperation', 'buffetDeposit', {
              source: 'booking',
              bookingData: {
                bookOrderId: res.data.data.id,
                areaName: tmp.area_name,
                pointName: tmp.name,
                ...this.addOrderInput,
              },
            });
          }
          // 执行回调
          setTimeout(() => {
            if (callback) { callback(); }
          }, 1000);
        } else {
          this.$message({
            message: res.msg,
            type: 'warning',
          });
        }
      });
    },
    // 打印 处理接口
    printOrder(queryData) {
      ajax('canyin.pos.booking.printorder', {
        contentType: 'json',
        data: {
          idList: JSON.stringify(queryData),
          posId: this.posBaseInfo.id,
        },
      }).then((res) => {
        if (res.success) {
          if (res.printType === 'PRINT_PARALLEL') {
            if (res.printD) {
              // 设备管理器无需初始化(全局已执行), 执行打印: printD-接口返回的打印数据
              // 传值设备管理器, 执行打印
              this.$devices.Printer.print(res.printD);
              // this.$message.success('打印已执行!');
              this.$message.success(this.$t('Biz.Booking.BookTip32'));
            } else {
              console.log(res);
              this.$message({
                // message: '打印设置不正确, 请刷新后重试',
                message: this.$t('Biz.Booking.BookTip33'),
                type: 'warning',
              });
            }
          }
          // else: res.printType == "PRINT_SERIAL" 为串口-后台打印
        } else {
          this.$message({
            // message: '打印预订单出现异常, 请刷新后重试',
            message: this.$t('Biz.Booking.BookTip34'),
            type: 'warning',
          });
        }
      });
    },
    // 执行-线上预订单-获取客位信息接口
    findReservePoint(queryDate, callback) {
      // 请求当前客位信息,并执行 供线上预订单选择客位的弹窗 启调(回调执行)
      ajax('canyin.pos.booking.findreservepoint', {
        contentType: 'URIEncoded',
        data: { reserveId: queryDate },
      }).then((res) => {
        if (!isEmpty(res)) {
          // 执行回调
          if (callback) { callback(res); }
        } else {
          this.$message({
            message: this.$t('Dict.AjaxMessage.Message9'),
            type: 'warning',
          });
        }
      });
    },
    // 预订单执行 接口
    doReserveOrder(url, queryData) {
      ajax(url, {
        contentType: 'URIEncodedToken',
        needToken: true,
        data: queryData,
      }).then((res) => {
        if (res.success) {
          // 提示
          this.$message({
            // message: '预订单执行成功',
            message: this.$t('Biz.Booking.BookTip35'),
            type: 'success',
          });
          // 订单列表选中项 重置
          this.orderTableItemActive = null;
          // 刷新 预订单列表
          this.getOrderList();
        } else {
          // 提示
          this.$message({
            // message: '预订单执行不成功, 请刷新后重试',
            message: this.$t('Biz.Booking.BookTip36'),
            type: 'warning',
          });
        }
      });
    },
    /** ********************************************* 多路来电处理 ************************************************ */
    // 来电详情页多路切换Tab
    checkPathTab(item) {
      const _this = this;
      // 其他线路没有最新来电提醒或者点击的试当前线束不允许点击
      if (item.state == 0 || item.state == 1) {
        return;
      }
      this.comingCallPathsTabs.forEach((data) => {
        // 将当前线路标记为可切换访问状态
        if (_this.currentpath == data.no) {
          data.state = 3;
        }
        // 将切换线路标记为当前线路状态
        if (data.no == item.no) {
          data.state = 1;
        }
      });
      // 记录切换后的当前线路
      _this.currentpath = item.no;
      // 再执行来电列表刷新
      this.getIncomingCallsList('', 'memberInfo');
      // 再刷新 预订图
      this.getBookingViewDetailsData(null, this.currentPageNum);
    },
  },

  filters: {
    // 预订客位筛选按钮名称筛选器
    chartFilterTxt(btnArr, index, dropdown) {
      const str = [];
      dropdown.forEach((item) => {
        if (item.check === 1) { str.push(item.name); }
      });
      // 全选或全部选, 均输出按钮原名称, 否则输出选择项
      return str.length === 0 || str.length === dropdown.length
        ? btnArr[index]
        : str.join(',');
    },
    // dateFormat(date) {
    //   return commonDateFormat(date);
    // }
  },

  watch: {
    // 来电记录列表: 查询日期改变, 更新数据
    'memberPicker.callListDateVal': {
      handler() {
        // 调用接口, 跟新来电列表及用户预订信息数据
        this.getIncomingCallsList();
      },
    },
    // 预订日历底部: 查询日期改变, 设置相应市别，并更新预订日历客位列表数据
    'bookingChartPicker.chartDateVal': {
      handler(val) {
        // 日期时间变量缓存
        const tmpDT = new Date();
        const chooseDT = new Date(val);
        // 所选日期信息中时间为0，不可使用，设置为当前系统时间
        chooseDT.setHours(tmpDT.getHours());
        chooseDT.setMinutes(tmpDT.getMinutes());
        chooseDT.setSeconds(tmpDT.getSeconds());
        chooseDT.setMilliseconds(tmpDT.getMilliseconds());
        // 更新'日期快速前后选择'的, 查询起始日期
        this.tableDateIntervalStart = this.bookingChartPicker.chartDateVal;
        // 更新'日期快速前后选择'的, 查询结束日期 (起始日期 + 当前显示日期天数 * 一天毫秒数)
        this.tableDateIntervalEnd = this.bookingChartPicker.chartDateVal
          + (this.tableDateInColActive - 1) * 86400000;

        //  选择今天之前(<今天的'00:00:00')日期, 则自动选中最后市别,且不可切换
        if (+chooseDT < +new Date(tmpDT.toLocaleDateString())) {
          // 设置为最后一个市别
          this.businessShiftActive = this.businessShift.length - 1;
          // 设置禁止市别切换
          this.businessShiftDisabled = true;
        }

        // 选择为今天
        if (+chooseDT === +tmpDT) {
          this.businessShift.some((item, index) => {
            // 未进入新的营业日
            if (this.timeStrToMinutes(`${tmpDT.getHours()}:${tmpDT.getMinutes()}`)
              < this.timeStrToMinutes(this.businessShift[0].startTime)
            ) {
              // 设置为第一个市别
              this.businessShiftActive = 0;
              this.businessShiftDisabled = false;
              return true;
            }
            // 进入了新的营业日
            if ((this.timeStrToMinutes(`${tmpDT.getHours()}:${tmpDT.getMinutes()}`)
                >= this.timeStrToMinutes(this.businessShift[0].startTime))
              && (`${item.id}` === `${this.currentShiftId}`)
            ) {
              // 设置为当前市别
              this.businessShiftActive = index;
              // 设置开启市别切换
              this.businessShiftDisabled = false;
              return true;
            }
            return false;
          });
        }

        // 选择今天之后(>'23:00')日期
        if (+chooseDT > +new Date(`${tmpDT.toLocaleDateString()} 23:59`)) {
          this.businessShiftActive = 0;
          this.businessShiftDisabled = false;
        }
        // 调用接口, 更新预订日历客位table数据, 并, 联动刷新预订日历table列表数据
        this.getBookingViewDetailsData(null, this.currentPageNum);
      },
    },
    // 预订日历 客位 日期显示天数模式, 变动: 执行'日期快速查询'的查询结束时间赋值
    tableDateInColActive() {
      // 更新'日期快速前后选择'的, 查询结束日期 (起始日期 + 当前显示日期天数 * 一天毫秒数)
      this.tableDateIntervalEnd = this.bookingChartPicker.chartDateVal
        + (this.tableDateInColActive - 1) * 86400000;
    },
    // 预订单 执行类型监听处理:dialogTitle为'查看'时, 禁用各项输入框
    dialogTitle(params) {
      // 设置 禁用状态参数, '3'-'查看预订单'
      this.orderDisabledState = params.type === '3';
    },
    // 新建/修改预订单-市别切换,生成相应的新的到店时间列表
    'addOrderInput.shiftIdStr': {
      handler(params) {
        this.businessShift.forEach((item, index) => {
          if (`${item.id}` === `${params}`) {
            this.arrivalTimeMethod(item, index);
          }
        });
        // 切换市别, 根据已预订时间, 执行重置选中到店时间选项
        this.arrivalTimeList.forEach((item, index) => {
          // 已有预订时间的, 选中下一个
          if (this.bookedPointInfoList[index]
            && `${item}` === `${this.bookedPointInfoList[index].expectArriveTime}`
          ) {
            this.arrivalTimeShowListSelected = index + 1;
          } else {
            // 未有选中的, 选中第一个
            this.arrivalTimeShowListSelected = 0;
          }
        });
      },
    },
    // 预订日历及预订单新增或修改或删除变化,推送信息vuex
    // 预订客位及预订单的变化由推送, 通过vuex数据进行分发到预订业务
    'posBooking.reservePointMap': {
      handler(params) {
        // 根据推送传递vuex数据传值, 整体刷新当前业务模块的实时数据
        this.refreshCurrBusinessData();
        /** 此部分代码注释不用.185多pos预订开发 */
        // 节流并判断当前显示日期 与 该显示的预订单的日期 是否一致
        // 推送只会推送当前日期,当前市别下的预订单;预订日历显示为非当前营业日期,责需要过滤推送来的预订单
        // if (!isEmpty(params)) {
        // 循环匹配 预订日历当前分页显示客位,是否替换为预订状态
        // this.bookingTable.forEach((item, index) => {
        //   // 当前日期
        //   if (params[item.id]
        //     && (new Date(params[item.id].reserveDate.replace('T', ' ')).getDate()
        //       == new Date(this.bookingChartPicker.chartDateVal).getDate())
        //     && (this.businessShift[this.businessShiftActive].id
        //       === this.judgeBelongeShift(params[item.id].reserveDate).id)
        //   ) {
        //     console.log('Newly bookorder, updated bookseat~~~');
        //     // 设置显示新的预订单, 当开启多预订时
        //     if (this.isMultiBook === '1') {
        //       // 预订单数量不存在(即为空闲,占用或其他),存在的(无论是预订的, 还是占用的), 均推送来的查库数据
        //       this.bookingTable[index].states[0].bookCount = params[item.id].bookingTimes;
        //     }
        //     // 只有客位为空闲时,才更改客位状态 (包含 或者非多预订)
        //     if (item.state === 1) {
        //       this.bookingTable[index].state = 7;
        //       this.bookingTable[index].states[0].state = 7;
        //     }
        //     this.bookingTable[index].states[0].bookPerson = params[item.id].bookPerson;
        //   }
        // });
        // }
      },
    },
    // 预订日历及预订单执行(开台): 推送的预订客位信息会减少, 匹配显示为占用
    'posBooking.executedPoints': {
      handler(params) {
        // 根据推送传递vuex数据传值, 整体刷新当前业务模块的实时数据
        // 数据不空时且无预订单时(有预订单时由reservePointMap监听执行)
        if (!isEmpty(params)
          && isEmpty(this.posBooking.reservePointMap)
        ) {
          this.refreshCurrBusinessData();
        /** 此部分代码注释不用.185多pos预订开发 */
        //   this.bookingTable.forEach((item, index) => {
        //     if (params.indexOf(String(item.id)) !== -1
        //       && (new Date().getDate()
        //         === new Date(this.bookingChartPicker.chartDateVal).getDate())
        //       && (this.businessShift[this.businessShiftActive].id === this.judgeBelongeShift(new Date()).id)
        //       // && (this.businessShift[this.businessShiftActive].id === this.currentShiftId)
        //     ) {
        //       console.log('Executing bookorder, updated bookseat~~~');
        //       // 多预订业务时
        //       if (this.isMultiBook === '1') {
        //         // 客位有多预订时(包含纯预订单, 和预订+占用),
        //         // 每一次预订单的执行,推动会更新剩余预订单数据,这里不做处理
        //         // 只有当一个预订单时(因为reservePointMap会响应执行一次,2变为1时, 这里不能再重复触发),执行后需要将预订单数量置空
        //         if (+this.bookingTable[index].states[0].bookCount === 1
        //           && !find(this.posBooking.reservePointMap, ['id', item.id])
        //         ) {
        //           this.bookingTable[index].states[0].bookCount = '';
        //         }
        //       }
        //       // 设置显示新的预订单
        //       this.bookingTable[index].state = 2;
        //       this.bookingTable[index].states[0].state = 2;
        //     }
        //   });
        }
      },
    },
    /**
     * 如下三个监听, 代码废除.由子组件进行数据更改, 不在由父组件处理
     */
    // 预订日历 人数筛选
    // chartFilterRange: {
    //   handler(params) {
    //     // 手动监测'num'人数属性,  执行DOM更新
    //     Vue.set(this.bookFilteConditions, 'num', params.val);
    //   },
    //   deep: true,
    // },

    // 新建预订单-修改客位-客位过滤:人数筛选, 监听
    // 'addOrderFilterRange.val': {
    //   handler(params) {
    //     // 手动监测'num'人数属性,  执行DOM更新
    //     Vue.set(this.addOrderFilteConditions, 'num', params);
    //   },
    // },
    // 监听 ‘新增/修改’客位的数组，实现实时刷新客位列表分页
    // addOrderFilteConditions: {
    // handler(val) {
    // this.$refs.addChangePointPager.refresh();
    // },
    // deep: true,
    // },
    /**
     * 废除代码-end
     */

  },

};
</script>

<style lang="less" scoped>
// @import "~@/common/less/variables.less"
@import "~@/common/less/mixins.less";
@import "./BookingCommon/common.less";

.booking-container {
  width: 100%;
  height: 100%;
  position: relative;
  padding-left: 306px;
}

.booking-container-fold {
  padding-left: 0;
}

.booking-leftArea {
  width: 306px;
  height: 100%;
  .positionTop;

  .foldBtn {
    width: 32px;
    height: 32px;
    .absolute;
    // top: 20px;
    left: 274px;
    z-index: 200;
    border: 1px solid #c7cccf;
    border-radius: 6px 0 0 6px;
    .bgc(#edf3f6);
    .setFont(20px, #999);

    &:active {
      border-width: 2px;
    }

    &.foldBtn-off {
      left: 0;
      border-radius: 0 6px 6px 0;
    }
  }

  .memberCallInfo {
    width: 100%;
    height: 100%;
    position: relative;
    padding-top: 241px;
    background: #fff;

    .memberCallInfo-title {
      width: 100%;
      height: 241px;
      .positionTop;
      padding-top: 79px;
      border-bottom: 1px solid #cfd7dd;
      .textCenter;
      background: linear-gradient(to bottom right, #e3e9ee, #cfd7dd);

      .phoneLogo {
        width: 42px;
        height: 42px;
        margin: 0 auto 20px;
        border-radius: 50%;
        line-height: 42px;
        .setFont(20px, #fff);
        .bgc(#11cbca);
        box-shadow: 0 0 0 4px #9ddde0, 0 0 0 5px #bee1e6;
      }

      .phoneNumber {
        .setFont(16px);
        .boldFont;
      }

      .memberName {
        margin: 10px;
        .setFont(18px);
        .boldFont;

        > em {
          .normalFont;
        }
      }
      .memberType {
        .setFont(14px);
        .boldFont;
      }
    }

    .multipathstabs{
      position:absolute;
      top: 0px;
      width:100%;
      .multipathstab{
        float: left;
        text-align: center;
        line-height: 35px;
        color:#999999;
        cursor: not-allowed;
        font-weight: bold;
        background-color: #C4cbce;
        > span{
          vertical-align: middle;
        }
      }
      .multipathstab.active{
        cursor: pointer;
        color:#11cbca;
        background-color:inherit;
        &:hover{
          font-size: 18px;
        }
      }
      .multipathstab.warn{
        cursor: pointer;
        color:#f00;
        animation: fade 1.2s infinite;
        &:hover{
          animation: none;
          font-size: 18px;
        }
      }
      .multipathstab.valibale{
        cursor: pointer;
        color:#999999;
        background-color: #C4cbce;
        &:hover{
          font-size: 18px;
        }
      }
    }

    .memberCallInfo-detail {
      height: 100%;
      position: relative;
      padding-top: 46px;

      .memberCallTabs {
        width: calc(100% - 24px);
        padding: 0 12px;
        .positionTop;
        right: 0;
        margin: auto;
        z-index: 200;
        border-bottom: 1px solid #e6e6e6;
        .bgc;
        .textCenter;
        .setFont(16px, #8e8e8e);

        > li {
          width: 80px;
          line-height: 16px;
          position: relative;
          .lineBolck;
          margin: 0 20px;
          padding: 16px 0 10px;
          border-bottom: 3px solid transparent;
          .textCenter;
          cursor: pointer;

          &.memberCallBtn-active {
            color: @activeColor;
            border-color: @activeColor;
          }
        }
      }
    }

    .allCalledBtn {
      width: 100%;
      height: 40px;
      line-height: 40px;
      .absolute;
      bottom: 0;
      .textCenter;
      text-decoration: underline;
      background: (linear-gradient(to bottom right, #e3e9ee, #cfd7dd));
      box-shadow: 0px 0px 6px #333;
      color: @activeColor;
      cursor: pointer;
    }
  }

  .memberCallList {
    // padding: 117px 0 68px;
    padding-bottom: 68px;

    .memberCallList-title {
      width: 100%;
      padding: 11px 10px 10px;
      .absolute;
      top: 0;
      .bgc(#ebf3f4);

      > .caption {
        margin: 16px 0 28px;
        line-height: 16px;
        .setFont(16px, #333);
        .boldFont;
      }

      > .datePicker-box {
        width: 142px;
        height: 36px;
        .lineBolck;
        vertical-align: middle;
      }

      > .bookingStatus-box {
        width: 110px;
        height: 34px;
        float: right;
        text-align: center;
        vertical-align: middle;
        border: 1px solid #dcdfe6;
        border-radius: 40px;
        cursor: pointer;
        .bgc;
        .setFont(14px, #333);

        &:hover {
          border-color: #c0c4cc;
        }

        > span {
          line-height: 34px;
        }

        > em {
          line-height: 34px;
          margin-right: 18px;
          float: right;
        }

        > .status-list {
          width: 90px;
          margin: 0 auto;
          position: relative;
          border: 1px solid #dcdfe6;
          text-align: center;
          .bgc(#fff);
          .boxShadow;
          z-index: 200;

          > .status-list-item {
            padding: 6px 0;
            border-bottom: 1px solid #dcdfe6;

            &:hover {
              .bgc(#0096a4);
            }

            &:last-child {
              border: none;
            }
          }
        }
      }
    }

    .memberCallList-bookingList {
      width: 100%;
      height: 100%;
      overflow-y: scroll;

      .listItem {
        width: 100%;
        padding: 16px 20px 14px;
        border-bottom: 1px solid #e6e6e6;
        cursor: pointer;

        &:hover {
          .bgc(#6fa8eb);
          > .leftInfo {
            > span,
            > em {
              color: #fff;
            }
          }
        }

        &:last-child {
          border: none;
        }

        > .leftInfo {
          width: 180px;
          display: inline-block;
          vertical-align: middle;

          > .pathNo {
            line-height: 15px;
            font-size: 12px;
            display: block;
            width: 35px;
            background-color: #83BBE6;
            border-radius: 15px;
            color: #ffffff;
            text-align: center;
            font-weight: 100;
            > .pathNo-icons{
              font-size: 12px;
            }
            > span{
              vertical-align: middle;
            }
          }

          > span {
            display: block;
            line-height: 18px;
            .setFont(14px, #000);
            .boldFont;
          }

          > em {
            .setFont(14px, #999);
            .normalFont;
          }
        }

        > .rightBtn {
          width: 66px;
          height: 24px;
          line-height: 24px;
          display: inline-block;
          border-radius: 20px;
          text-align: center;
          .bgc(#ff882e);
          .setFont(12px, #fff);
          .boldFont;
        }
      }
    }
  }

  .multipaths-panel {
    width: 100%;
    .multipaths {
      height: 35px;
      line-height: 35px;
      > .multipaths-tabs{
        font-weight: bold;
        > .multipaths-tab{
          width: 70px;
          float: left;
          > .warnInfo {
            display: inline;
            cursor: pointer;
            .setFont(14px, #f00);
            animation: fade 1.2s infinite;
            > span{
              vertical-align: middle;
            }
            &:hover {
              font-size: 18px;
              animation: none;
            }
          }
          > .multipaths-tab-break{
            margin-left: 15px;
            color: #c3c3c3;
          }
        }
      }
    }
  }

}

.memberCallListDatePopper {
  width: 100px;
}

.booking-leftArea-centent {
  height: 100%;
}

.memberInfoList.lackItemContent {
  text-align: center;
}
.memberInfoList {
  width: 100%;
  padding: 36px 28px 0;
  .setFont(15px, #909090);

  .memberInfoList-item {
    margin-bottom: 20px;

    em,
    i {
      .normalFont;
    }

    > em {
      .lineBolck;
      white-space: nowrap;
    }

    > span {
      .lineBolck;
      width: calc(100% - 90px);
      vertical-align: top;
      color: #333;
    }
  }

  .lackItemLogo {
    .setFont(120px, #ccc);
  }
}
.memberInfoListHeight {
  height: 100%;
  overflow: scroll;
  padding-bottom: 40px;
}

.memberInfoList-unExecuteOrder {
  .memberInfoList-unExecuteOrder-title {
    margin-bottom: 6px;

    .boldFont;
  }

  .memberInfoList-unExecuteOrder-col {
    width: 100%;
    display: table;
    padding: 6px 0;
    .textCenter;
    cursor: pointer;

    &.unExecuteOrder-list:hover {
      .bgc(#e1edff);
      color: #4281cb;
    }
    &:nth-child(2) {
      border-bottom: 1px solid #ddd;
    }

    > span {
      display: table-cell;

      &:nth-child(1) {
        width: 33%;
      }
      &:nth-child(2) {
        width: 18%;
      }
    }
  }

  em {
    .lineBolck;
    width: 16px;
    height: 16px;
    margin-left: 5px;
    .bgc(#f94b3b);
    line-height: 16px;
    text-align: center;
    border-radius: 9px;
    .setFont(12px, #fff);
    .normalFont;
    font-weight: normal;
  }
}

.unExecuteOrder-warn {
  width: 6px;
  height: 6px;
  .absolute;
  top: 10px;
  right: 0;
  border-radius: 50%;
  .bgc(#f94b3b);
}

.memberBookedInfo {
  height: 100%;
  padding: 0 28px 60px;
  overflow-y: auto;

  .memberInfoList {
    padding-left: 0;
    padding-right: 0;
  }
  .memberBookedInfo-chartList {
    padding: 38px 0 12px;
    .textCenter;
    .boldFont;
  }
}

.booking-chart-pie {
  width: 112px;
  height: 112px;
  .lineBolck;
  position: relative;

  .bgLayer {
    width: 110px;
    height: 110px;
    position: relative;
    border-radius: 50%;
    background: #0cc;
    top: 1px;
    left: 1px;
  }
  .pie-left,
  .pie-right {
    width: 112px;
    height: 112px;
    .absolute;
    border-radius: 50%;
    top: 0px;
    left: 0px;
    background: #ddd;
  }

  .pie-right {
    clip: rect(0, auto, auto, 56px);
    z-index: 99;
  }

  .pie-left {
    clip: rect(0, 56px, auto, 0);
    z-index: 9;
  }

  .pie-right.pie-right-per50 {
    width: 110px;
    height: 110px;
    top: 1px;
    transform: rotate(0deg);
    background: #0cc;
  }

  .blankArea {
    width: 80px;
    height: 80px;
    .absolute;
    left: 16px;
    top: 16px;
    z-index: 200;
    padding-top: 20px;
    background: #fff;
    border-radius: 50%;
    .textCenter;
    font-size: 16px;

    > p {
      font-size: 12px;
      font-weight: 100;
    }
  }
}

.booking-chart-list {
  .lineBolck;
  margin-left: 34px;
  line-height: 2;
  vertical-align: top;
}

.memberCallList-pagerBox {
  width: 100%;
  height: 68px;
  .absolute;
  bottom: 0;
  right: 0;
  .bgc(#ebf3f4);
  box-shadow: 0px 0px 6px #333;

  .pagerBox-tip {
    display: inline-block;
    margin-left: 12px;
    .ver-center;
    color: #666;

    > em {
      margin: 0 4px;
      .normalFont;
    }
  }

  .pager-btn {
    .bgc(#f0f2f3);
  }
}

.pos-booking-list-pager {
  margin-right: 12px;
  float: right;
  .ver-center;
}

.booking-rightArea {
  height: 100%;
  position: relative;
  padding: 12px 12px 68px;
}

.rightArea-content {
  height: 100%;
  position: relative;
  padding-top: 54px;
  border-radius: 6px;

  .rightArea-tabsBox {
    width: 100%;
    font-size: 0;
    .positionTop;

    .rightArea-tabsBox-item {
      width: calc(50% - 2px);
      display: inline-block;
      text-align: center;
      padding: 16px;
      border-radius: 7px 7px 0 0;
      .bgc(@rgba255-30);
      .setFont(16px, #344b5b);
      cursor: pointer;

      &:last-child {
        margin-left: 4px;
      }

      &.active {
        .bgc(white);
        .boldFont;
      }
    }
  }

  .rightArea-table {
    height: 100%;
    padding: 12px;
    .bgc(white);
    border-radius: 0 0 6px 6px;

    .table-fnBtn {
      height: 36px;
      float: right;
      line-height: 36px;
      text-align: center;
      border-radius: 20px;
      .btnPress(@toggleBtnBg);
      .setFont(14px, #fff);
      cursor: pointer;

      &.analogCall {
        width: 100px;
        margin-right: 8px;
        .bgc(#f7ad59);
      }

      &.refresh {
        width: 72px;
        .bgc(#4cb862);
      }

      > em {
        display: inline-block;
        margin-right: 3px;
      }
    }

    .table-chartBox {
      height: 100%;
      position: relative;
      padding-top: 159px;

      .table-fnBtn-box {
        width: 100%;
        height: 84px;
        .positionTop;
      }
    }
  }
}

.booking-dropdown-originBox {
  width: 66%;
}

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
      max-width: 200px;
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

.businessShift-btnBox {
  margin-top: 12px;
  .businessShift-btn {
    width: 110px;
    line-height: 36px;
    border-radius: 20px;
    border: none;
    color: #273844;

    &.active {
      border-radius: 20px;
      .bgc(@toggleBtnActive);
      color: #fff;
    }
  }
}

.booking-chartTable {
  height: 100%;
  border-top: none;
}

.chartTable-row {
  width: 100%;
  display: table;
  .tableBorder(@all);
  border-top: none;

  .chartTable-row-item {
    width: 12.5%;
    /* 宽度在30~25个数量时为3%, 15个时为6%, 7个时为12.5%  必须制定宽度*/
    display: table-cell;
    position: relative;
    padding: 6px 0 5px;
    line-height: 15px;
    text-align: center;
    vertical-align: middle;
    .tableBorder(@bR);
    .bgc(#65a4a9);
    .setFont(12px, white);
    word-break: break-word;

    &.colItem15 {
      width: 6%;
    }

    &.colItem25 {
      width: 3%;
    }

    &:last-child {
      border: none;
    }

    > p {
      .boldFont;
    }

    .chartTable-title-sign {
      display: inline-block;
      width: 16px;
      height: 16px;
      .positionTop;
      .bgc(#f94b3b);
      .setFont(12px, #fff);
    }
  }

  .chartTable-row-item.chartTable-row-itemFirst {
    width: 10%;
  }
}

// 客位状态 公共样式变量
.stateBox(@bgc, @color) {
  background-color: @bgc;
  color: @color;
}

.chartTable-content.chartTable-row {
  &:hover > .content-item:first-child {
    .bgc(#65a4a9);
  }

  .content-item {
    height: 41px;
    padding: 0;
    .bgc(transparent);
    color: #273844;
    font-weight: bold;

    &:not(:first-child) {
      cursor: pointer;
    }

    // &:hover {
    //   .bgc(#304e5d);
    // }
    > span {
      height: 41px;
      display: inline-block;
      line-height: 41px;
      border: 1px solid transparent;
      // position: relative;
      font-size: 14px;
      font-weight: bold;
      font-family: "宋体";
      overflow: hidden;

      > em {
        width: 14px;
        height: 14px;
        position: absolute;
        top: 0;
        right: 0;
        text-align: center;
        line-height: 14px;
        border-radius: 50%;
        background-color: #ea6262;
        font-style: normal;
        font-weight: bold;
        font-size: 12px;
        color: #fff;
        overflow: hidden;
      }
    }
  }

  .content-item.state-used,
  .content-item.state-paying,
  .content-item.state-locked,
  .content-item.state-prepay,
  .content-item.state-booked {
    cursor: not-allowed;
    box-shadow: 0px 0 2px #ddd;
  }
  .content-item.state-used.muitibook,
  .content-item.state-paying.muitibook,
  .content-item.state-locked.muitibook,
  .content-item.state-prepay.muitibook{
    cursor: pointer;
  }
  // 空闲
  .state-free {
    &:hover {
      .bgc(#65a4a9);
    }
  }
  // 占用
  .state-used {
    .stateBox(#f8d1d1, #fd2d2d);
  }
  // 埋单
  .state-paying {
    .stateBox(#d9abef, #8a4ebb);
  }
  // 锁台
  .state-locked {
    .stateBox(#ddd, #666);
  }
  // 预付
  .state-prepay {
    .stateBox(#ffe3a5, #ec8f2c);
  }
  // 预订(已)
  .content-item.state-booked {
    .stateBox(#82aff3, #4079ce);
    cursor: pointer;
  }
}

.booking-chartTable-positionTitle.chartTable-row {
  position: absolute;
  .tableBorder(@all);
  margin-top: 17px;
  height: 58px;
  top: 84px;
  left: 0;
  .bgc(#65a4a9);
  color: white;
}

// 客位-已预订信息列表弹窗
.bookedPointInfoList-box {
  padding: 6px;

  .item {
    width: 100%;
    height: 50px;
    margin-bottom: 6px;
    padding: 8px;
    border-radius: 6px;
    border: 1px solid #ddd;
    .setFont(14px, #000);
    font-weight: bold;

    .item-time {
      width: 20%;
      height: 36px;
      display: inline-block;
      padding-right: 8px;
      text-align: center;
      vertical-align: middle;
      line-height: 36px;
      border-right: 1px solid #ddd;
      font-weight: bold;
    }
    .item-content {
      width: 50%;
      height: 36px;
      display: inline-block;
      padding: 0 10px;
      vertical-align: middle;

      > span {
        display: block;
        line-height: 16px;
      }
      > em {
        .setFont(12px, #999);
        font-weight: normal;
        font-style: normal;
      }
    }
    .item-button {
      width: 54px;
      height: 34px;
      float: right;
      padding: 0;
    }
  }
}

.table-ordersBox {
  height: 100%;
  position: relative;
  padding-top: 135px;

  .table-order-queryBox {
    width: 100%;
    .positionTop;
  }

  .table-datePicker {
    float: left;
  }

  .booking-dropdown-group.businessShift-btnBox {
    float: left;
    margin: 0 12px;
  }

  .queryBtn {
    width: 72px;
    height: 36px;
    float: left;
    line-height: 36px;
    text-align: center;
    border-radius: 20px;
    .btnPress(@toggleBtnBg);
    cursor: pointer;
    .bgc(#4cb862);
    color: #fff;
  }

  .sumOfItemsBtn.queryBtn {
    width: 110px;
    margin-left: 12px;
  }

  .order-dropdown-group {
    width: 47%;
    clear: both;
  }
  .booking-dropdown-group {
    // width: 45%;
    float: left;
    margin-top: 12px;

    .dropdown-btnGroup.orderDropDown {
      width: 33.33%;

      .dropdown-btn-txt > em {
        right: 8%;
      }

      &:last-child {
        padding-right: 18px;

        .dropdown-btn-txt > em {
          right: calc(4% + 18px);
        }
      }
    }
  }

  .queryKeyWord {
    width: 36%;
    height: 36px;
    position: relative;
    line-height: 36px;
    margin-top: 12px;
    padding-left: 16px;
    border-radius: 20px;

    float: right;
    color: #344b5b;
    .bgc(@toggleBtnBg);

    > em {
      float: left;
      font-size: 24px;
    }

    > input {
      width: 90%;
      border: none;
      z-index: 3;
      position: relative;
      padding-left: 6px;
      .bgc(transparent);

      &::-webkit-input-placeholder {
        color: #344b5b;
      }

      &:focus + span {
        border-color: @activeColor;
      }
    }

    > span {
      width: 100%;
      height: 100%;
      .positionTop;
      z-index: 1;
      border-radius: 20px;
      border: 1px solid transparent;
    }
  }

  .orderTable-row {
    width: 100%;
    height: 39px;
    line-height: 39px;
    border: 1px solid #ccc;
    border-top: none;
    font-size: 0;

    .orderTable-row-item {
      height: 38px;
      display: inline-block;
      padding: 0 4px;
      overflow: hidden;
      border-right: 1px solid #ccc;
      word-break: break-word;
      text-align: center;
      .setFont(12px, #273844);

      &:last-child {
        border-right: none;
      }

      &:nth-child(1),
      &:nth-child(3),
      &:nth-child(4),
      &:nth-child(5),
      &:nth-child(9),
      &:nth-child(13) {
        width: 7%;
      }

      &:nth-child(6),
      &:nth-child(8),
      &:nth-child(10),
      &:nth-child(11),
      &:nth-child(14) {
        width: 6%;
      }

      &:nth-child(2) {
        width: 9.6%;
      }

      &:nth-child(7) {
        width: 13%;
      }

      &:nth-child(12) {
        width: 5%;
      }
    }

    .item-stateLogo {
      padding: 4px 8px;
      border-radius: 20px;
      text-align: center;
      &.state-0 {
        .bgc(#3e76cf);
        color: white;
      }
      &.state-1 {
        .bgc(#5ab95a);
        color: white;
      }
      &.state-2 {
        .bgc(#f9767c);
        color: white;
      }
      &.state-3 {
        .bgc(#ffa95a);
        color: white;
      }
    }
  }

  .orderTable-title {
    top: 96px;
    left: 0;
    position: absolute;
    .bgc(#65a4a9);
    border: 1px solid #ccc;

    .orderTable-title-item {
      border-right: 1px solid #ccc;
      color: white;
      &:last-child {
        border-right: none;
      }
    }
  }

  .orderTable-listBox {
    height: 100%;
    color: #273844;
    // border: 1px solid #29424f;
    // border-top: none;

    .orderTable-row {
      &.active {
        .bgc(#65a4a9);
      }
    }

    .orderTable-row-item {
      cursor: pointer;
    }
  }
}

.rightArea-footer {
  width: calc(100% - 24px);
  height: 36px;
  .absolute;
  bottom: 16px;
  left: 0;
  right: 0;
  margin: auto;

  .setFont(14px, #fff);

  .table-datePicker {
    float: left;
    margin-right: 8px;
  }

  .table-dateInCol-box {
    width: 82px;
    float: left;
  }

  .table-dateInterval-box {
    height: 36px;
    line-height: 36px;
    margin-left: 18px;
    float: left;
    color: #273844;
    > span {
      cursor: pointer;
      &:hover {
        text-decoration: underline;
        > em {
          text-decoration: underline;
          color: #273844;
        }
      }
      > em {
        .normalFont;
        color: #919799;
      }
    }
  }

  .table-pager-box {
    float: right;
  }

  .orderTable-listNum {
    float: left;
    line-height: 36px;
    .setFont(12px, #333);
  }

  .orderTable-option {
    float: right;

    .cancel {
      .bgc(@rgba255-20);
    }
    .modify {
      .bgc(#2e76cb);
    }

    .print {
      width: 96px;
    }
    .print,
    .execute {
      .bgc(#0babb9);
    }

    > li {
      width: 72px;
      height: 36px;
      float: right;
      margin-right: 8px;
      line-height: 36px;
      text-align: center;
      border-radius: 20px;
      .setFont(14px, #fff);
      .btnPress(#666);
      cursor: pointer;
    }

    > li.btnDisalbed {
      cursor: not-allowed;
      opacity: 0.5;
      &:active {
        border: none;
      }
    }
  }
  .orderTable-pagerNum {
    float: right;
    margin-right: 94px;
  }
}

// 新建预订单弹窗内部样式
.booking-addOrder-comfirm {
  // width: 82px;
  > i {
    display: inline-block;
    // width: 14px;
    font-style: normal;
  }
}
.booking-addOrder-container {
  height: 100%;
  padding: 15px;

  .addOrder-itemBox {
    width: 100%;

    .itemBox-title {
      margin-bottom: 10px;
      line-height: 30px;
      .setFont(16px, #333);
      .boldFont;
    }

    .itemBox-content {
      padding: 0 12px;

      .itemBox-row {
        clear:both;
        height: 36px;
        position: relative;
        margin-bottom: 16px;
        font-size: 12px;

        &.banOverflow {
          height: auto;
        }
      }

      .itemBox-sub {
        margin-right: 60px;
      }
    }

    .addOrder-arrivalTime {
      width: 50%;
      display: inline-block;
      vertical-align: middle;
    }

    .timeBtn {
      border: 1px solid #ddd;
      margin: 5px;
      .bgc(#f7f7f7);
      font-size: 12px;

      &:hover {
        .bgc(rgb(221, 221, 221));
      }

      &.active {
        .bgc(@activeColor);
        color: #fff;
      }
    }

    .moreTimeBtn {
      width: 100px;
      height: 31px;
      margin: 5px;
      line-height: 1.34;
      border: 1px solid #ddd;
      .bgc(#fff);
      .setFont(14px, #4281ca);
      font-weight: bold;
    }

    .intervalTimeWarn {
      width: 37%;
      margin-top: -6px;
      float: right;
      .setFont(12px, #f00);
    }

    .addOrder-moreArrivalTime {
      width: 50%;
      display: block;
      position: relative;
      border: 1px solid #ddd;
      margin-left: 84px;
      padding: 10px;
      .bgc(#fff);
      .boxShadow;
      z-index: 99;
    }

    .itemBox-pointChosen-box {
      width: 66%;
      display: inline-block;
      vertical-align: top;

      &.bookedOfArrangeMenu-box {
        // height: 26px;
        vertical-align: middle;
      }
    }

    .pointChosen-item {
      display: inline-block;
      position: relative;
      height: 26px;
      line-height: 26px;
      margin-bottom: 5px;
      margin-left: 3px;
      padding-left: 10px;
      padding-right: 25px;
      border-radius: 3px;
      vertical-align: middle;
      .bgc(@activeColor);
      .setFont(12px, #fff);

      &.bookedOfArrangeMenu-item {
        width: 100px;
        overflow: hidden;
        white-space: nowrap;
        // margin-bottom: 0;

        > em {
          right: 0;
          .bgc(@activeColor);
        }
      }

      > em {
        width: 18px;
        .absolute;
        top: 0;
        right: 2px;
        bottom: 0;
        margin: auto;
        .normalFont;
        .setFont(18px, #fff);
        cursor: pointer;

        &:hover {
          color: #666;
          font-weight: bold;
        }
      }
    }

    .pointAddBtn {
      &:extend(.booking-addOrder-container .addOrder-itemBox .moreTimeBtn);
      width: 130px;
      float: right;
      margin-top: -3px;
      margin-bottom: 0;
    }

    .itemBox-inputBox {
      width: 33%;
      max-width: 33%;
      // display: inline-block;
      // float: left;
      font-weight: normal;
      line-height: 28px;
      i {
        padding: 0 2px;
        .normalFont;
      }
      .width-auto {
        width: auto;
      }

      &.special-position {
        transform: translateX(-9px);
        .itemBox-item-normalTitle {
          padding-left: 0;;
        }
      }
    }

    .itemBox-item-normalTitle {
      padding-left: 15px;
    }
    .itemBox-item-normalTitle2 {
      padding-left: 40px;
    }
    .itemBox-item-normalTitle3 {
      padding-left: 28px;
    }
  }

  .addOrder-input {
    width: 59%;
    height: 34px;
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px solid #ccc;
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
    transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
    background-image: none;
    .setFont(12px, #666);
    &.sex-select {
      padding: 6px 58px 6px 12px;
    }
    &.specialWidth {
      width: 45%;
    }
    &.specialPadding {
      padding-left: 28%;
    }
    &:focus {
      border-color: @activeColor;
      outline: 0;
      box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
        0 0 8px rgba(102, 175, 233, 0.6);
    }
  }

  .addOrder-textArea {
    &:extend(.booking-addOrder-container .addOrder-input);
    width: 89.7%;
    height: 50px;
    vertical-align: top;
    resize: vertical;

    &:focus {
      border-color: @activeColor;
      outline: 0;
      box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
        0 0 8px rgba(102, 175, 233, 0.6);
    }
  }
}

.addOrder-pointDropDown-box {
  width: 66%;
  &.booking-dropdown-group {
    .bgc(#0096a4);
  }
}

.addOrder-newPoint-freePoint {
  width: 20%;
  .ver-center;
  position: absolute;
  right: 86px;
  text-align: center;
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

.booking-addOrderNewPoint {
  padding: 60px 0;
  position: relative;
}

.addBookingChoosePoint-header {
  width: 100%;
  height: 60px;
  .positionTop;
  padding: 12px;
  border-bottom: 1px solid #aaa;
}

.addBookingChoosePoint-list {
  height: 100%;
  padding: 0 15px;

  .list-item {
    width: 115px;
    height: 60px;
    margin: 4px;
    position: relative;
    border-width: 1px;
    border-radius: 3px;
    background-color: #c0e4c0;
    // border-color: #3C8F3C;
    color: #3c8f3c;

    &.active {
      .bgc(#6cb136);
      border-color: #479947;
      color: #fff;
    }

    > em {
      position: absolute;
      left: 1px;
      top: -1px;
      font-style: normal;
      font-size: 12px;
    }
    > i {
      width: 16px;
      height: 16px;
      display: inline-block;
      position: absolute;
      top: -4px;
      right: 2px;
    }

    > b {
      display: block;
      font-size: 16px;
    }

    // &.state-used,
    // &.state-paying,
    // &.state-locked,
    // &.state-prepay,
    // &.state-booked {
    //   cursor: not-allowed;
    // }
    &.muitibook{
      cursor: pointer;
    }
    // 空闲
    // .state-free {}
    // 占用
    &.state-used {
      .stateBox(#f8d1d1, #fd2d2d);
    }
    // 埋单
    &.state-paying {
      .stateBox(#d9abef, #8a4ebb);
    }
    // 锁台
    &.state-locked {
      .stateBox(#ddd, #666);
    }
    // 预付
    &.state-prepay {
      .stateBox(#ffe3a5, #ec8f2c);
    }
    // 预订(已)
    &.state-booked {
      .stateBox(#82aff3, #4079ce);
    }
  }
}

.addBookingChoosePoint-footer {
  width: 100%;
  height: 40px;
  position: absolute;
  bottom: 8px;
  left: 0;
  padding: 0 15px;
  display: flex;
  align-items: center;

  .item {
    display: inline-block;
  }
  .pageNum {
    /*width: 12%;*/
  }
  .pagerBox {
    margin: 0 10px;
    /*width: 20%;*/
    /*vertical-align: middle;*/
  }
  .pointList {
    /*width: 66%;*/
    /*margin-bottom: 10px;*/
    /*vertical-align: -webkit-baseline-middle;*/
    > em {
      font-style: normal;
    }
    .selectedPoint {
      display: inline-block;
      margin: 3px 4px 3px 0;
      padding: 0 4px;
      border-radius: 2px;
      white-space: nowrap;
      .bgc(rgba(12, 171, 185, 0.6));

      &:hover {
        .bgc(#0cabb9);
      }
      > i {
        vertical-align: unset;
        cursor: pointer;
      }
    }
  }
}

// 预订单取消原因弹窗
.ordercancelReason-box {
  .reasonList-item {
    margin: 5px;
    cursor: pointer;
  }
  .reasonList-checkBox {
    width: 14px;
    height: 14px;
    display: inline-block;
    margin-right: 6px;
    border: 1px solid #f00;
    border-radius: 50%;
    text-align: center;
    line-height: 10px;
    vertical-align: middle;

    > i {
      width: 8px;
      height: 8px;
      display: inline-block;
      border-radius: 50%;
      .bgc(#f00);
    }
  }

  > textarea {
    width: 308px;
    height: 100px;
    margin: 10px 28px 0;
    resize: vertical;
  }
}
// 预定日历分页按钮样式
.orderTable-pagerBtn-box {
  // width: 50%;
  height: 32px;
  // margin-top: 8px;
  line-height: 32px;
  // float: right;

  .pagerBtn-pageNum {
    float: left;
    color: #333;
  }

  .pagerBtn-btn {
    float: right;
    // margin-right: 16px;

    > span {
      display: inline-block;
      width: 50px;
      height: 36px;
      line-height: 36px;
      text-align: center;
      border-radius: 18px;
      background-color: #f1f6f9;
      border: 1px solid #b5b5b5;
      font-size: 20px;
      cursor: pointer;
      .setFont(20px, #273844);
    }
  }
}

.lang-enUS {
  // 左侧 【共XX条记录】
  .memberCallList-pagerBox .pagerBox-tip {
    font-size: 12px;
    line-height: 20px;
  }
  // 左侧 预定记录的状态按钮
  .booking-leftArea .memberCallList .memberCallList-bookingList .listItem > .rightBtn {
    width: 80px;
  }
  .memberInfoList .memberInfoList-item > span.lang-en-consume {
    width: calc(100% - 175px;)
  }
  .memberInfoList .memberInfoList-item > span.lang-en-userask {
    width: calc(100% - 145px;)
  }
  // 新增/修改预订页面
  .booking-addOrder-container .addOrder-input.specialWidth {
    width: 25%;
  }
  .booking-addOrder-container .addOrder-itemBox .itemBox-item-normalTitle2 {
    padding-left: 0px;
  }
  #bookPersonSexList {
    left: 22.8%;
    padding-left: 15px;
  }
  .booking-addOrder-container .addOrder-textArea {
    width: 85.7%;
  }
  .booking-addOrder-container .addOrder-itemBox .pointAddBtn {
    width: 292px;
    &.pointAddBtn-lang-en{
      width: 165px;
    }
  }
  .booking-addOrder-container .addOrder-itemBox .itemBox-pointChosen-box {
    width: 28%;
  }
  .booking-addOrder-container .addOrder-itemBox .itemBox-inputBox {
    &.itemBox-inputBox-lang-en-tel {
      width: 28%;
    }
    &.itemBox-inputBox-lang-en-deposit {
      width: 36%;
    }
  }
  .booking-addOrder-container .addOrder-input.addOrder-input-lang-en-tel {
    width: 80%;
  }
  .memberBookedInfo {
    padding: 0 20px 60px;
  }
  .booking-chart-list {
    margin-left: 5px;
    text-align: left;
  }
  .booking-addOrder-container .addOrder-input {
    width: 58%;
  }
  .table-ordersBox .orderTable-row .orderTable-row-item:nth-child(3){
    width: 5%;
  }
  .table-ordersBox .orderTable-row .orderTable-row-item:nth-child(4){
    width: 5%;
  }
  .table-ordersBox .orderTable-row .orderTable-row-item:nth-child(6){
    width: 4.5%;
  }
  .table-ordersBox .orderTable-row .orderTable-row-item:nth-child(8) {
    width: 6%;
  }
  .table-ordersBox .orderTable-row .orderTable-row-item:nth-child(10){
    width: 6.8%;
  }
  .table-ordersBox .orderTable-row .orderTable-row-item:nth-child(11){
    width: 7%;
  }
  .table-ordersBox .orderTable-row .orderTable-row-item:nth-child(12) {
    width: 6%;
  }
  .table-ordersBox .orderTable-row .orderTable-row-item:nth-child(13) {
    width: 5.5%;
  }
  .table-ordersBox .orderTable-row .orderTable-row-item:nth-child(14) {
    width: 9%;
  }
}
</style>

<style lang="less">
/* 覆盖element-ui dataPicker样式 */

.datePicker-box {
  > .el-date-editor {
    width: 142px;
    height: 36px;
  }
  .el-input__inner {
    width: 142px;
    height: 36px;
    border-radius: 40px;
  }
}
.pickerDatePopperClass {
  width: 280px;

  .el-date-table {
    width: 85%;
  }
  .el-date-table td {
    padding: 0;
  }
  .el-date-picker__header {
    margin-bottom: 0;
  }
  .el-picker-panel__content {
    margin-top: 0;
  }
}

.memberCallList-pagerBox .pos-booking-list-pager.pager {
  > span {
    margin-right: 14px;
    color: #666;
  }
  .pager-btn {
    background-color: #f0f2f3;
    color: #333;
  }
  .pager-btn[disabled] {
    color: #999;
  }
}

.table-datePicker .el-input__inner {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: transparent;
  color: #273844;
}
.table-ordersBox .table-datePicker .el-input__inner {
  background-color: #c0dae0;
}
.table-dateInCol-box .el-dropdown {
  width: 84px;
  height: 36px;
  line-height: 36px;
  text-align: center;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-color: transparent;
  color: #273844;
}
// 新建预订单
// 覆盖弹窗body样式
.booking-container .pos-dialog > .el-dialog__body {
  background-color: #eee;
}

.addOrder-dateBox .el-date-editor.el-input {
  width: 160px;
}
.pos-booking-chart-pager.pager,
.pos-booking-order-pager.pager {
  .pager-btn {
    background-color: rgba(255, 255, 255, 0.2);
    border: 1px solid transparent;
    font-weight: bold;
    color: #273844;
  }
}
.pos-booking-addChangePoint-pager.pager {
  .pager-btn {
    background-color: rgba(255, 255, 255, 0.2);
  }
}
.addBookingDialog {
  // width: 82px;
  margin-left: 10px;
  // font-weight: bold;
  > em {
    display: inline-block;
    // width: 14px;
    font-style: normal;
  }
}
// 客位已预订列表 弹窗
.bookedPointListDialog {
  max-height: 460px;
  overflow: scroll;
}
// 客位预订订金列表
#addOrderDepositPaywayList {
  position: absolute;
  top: 1px;
  right: 115px;
  border: none;
  text-align: left;
  padding-left: 6px;
}
#bookPersonSexList {
  position: absolute;
  top: 1px;
  left: 144px;
  border: none;
  text-align: left;
  padding-left: 6px;
}
</style>
