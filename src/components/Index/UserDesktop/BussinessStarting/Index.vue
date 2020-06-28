<template>
  <div class="postype-wrapper" v-if="isshowKaiban">
    <div class="content">
      <div class="kaiban">
        <div class="kaiban-hearder">
          <div class="kaiban-left">
            <span class="line"></span>
            <span class="title" >{{ kaibantitle }}</span>
          </div>
          <button class="enter btn btn-default" :disabled="kaibanBtnIsEditor" @click="confirmkaiban()" v-autotest>{{ kaibanBtnText }}</button>
          <button class="back btn btn-default" @click="closeKaiBan()" v-autotest>{{$t('Dict.Close')}}(Esc)</button>
        </div>
        <div class="kaiban-content">
          <form action="" v-keyboard:keyboard>
            <div class="pos-content current-pos">
              <p class="pos-left ">{{$t('Dict.CurrentPOS')}}</p>
              <div class="pos-right">
                <span class="demonstrate-pos">{{posCode }} - {{posName}}</span>
              </div>
            </div>
            <div class="pos-content nearLeft"
              v-if="isEnableOpeningTestPrint">
              <span>{{ $t('Dict.TestKitchenPrint') }}</span>
              <el-switch
                v-model="isOpenSerialTestPrint"
                class="content-switch"></el-switch>
            </div>
            <div class="pos-content">
              <p class="pos-left">{{$t('Dict.ReserveFund01')}}</p>
              <div class="pos-right">
                <input type="text" name="" value="" @click="pettyCashClick()"
                 @keydown.enter.prevent v-model="spareMoneyValue"
                  :disabled="spareMoneyIsEditor" class="spare-money" ref="spareMoney" v-judge>
              </div>
            </div>
            <!-- 和产品确认暂时屏蔽pos模式切换功能  所以注释该行 暂时注释掉 -->
            <!-- <div class="pos-content" v-if="isAllowUpdatePosModeWhenOpening == 1 ">  -->
            <!-- 是否显示pos模式切换 如果是录单就强制不显示 -->
            <div class="pos-content" v-if="isAllowUpdatePosModeWhenOpening && posMode != '2'  && !lockLoad">
              <p class="pos-left">{{$t('Dict.ChoiceMode')}}</p>
              <div class="pos-right" id="selectPosMode">
                <div  v-for=" (item, index) in selectposmode"
                      :class="{activeposmode:item.posMode == activepos}"
                      class="btn btn-default select-pos"
                      @click="activeMode(item.posMode)" :key="index" >
                  {{item.posMode==1?$t('Dict.CashRegisterMode'):$t('Dict.FastFoodMode')}}
                </div>
              </div>
            </div>
            <KeyBoard ref="keyboard" :isDisabled="spareMoneyIsEditor"></KeyBoard>
          </form>
        </div>
      </div>
    </div>
    <div class="postype-content" v-if="isShowPos">
      <div class="kaiban-hearder">
        <div class="kaiban-left">
          <span class="line"></span>
          <span class="title">{{$t('Dict.SelectPOS')}}</span>
        </div>
        <button
          class="enter btn btn-default"
          :disabled="!posId"
          @keyup.enter="confirmPos()"
          @click="confirmPos()"
          id="confirmPos"
          v-autotest>{{$t('Dict.Sure')}}(Enter)</button>
        <button
          class="back btn btn-default"
          @click="closeKaiBan()"
          v-autotest>{{$t('Dict.Close')}}(Esc)</button>
      </div>

      <div class="postype" >
        <!-- pos标签说明 -->
        <div class="postype-describe">
          <div v-for="(item, index) in [1,2,3]" :key="'posmod'+index">
            <div class="postype-describe-bgcolor"
              :style="{borderColor: showPosModeColor(item)+' '+ showPosModeColor(item)+' #fff #fff'}"></div>
            <span>{{ showPosMode(item) }}</span>
          </div>
        </div>
        <div class="postype-total" id = "selectPosModeId" >
          <!-- 和产品确认暂时屏蔽快餐模式Pos v-if="item.mode!=3" 暂时注释掉 -->
          <button
            v-autotest
            :disabled="!!item.ipaddress"
            class="btn btn-default posmode-btn"
            v-for="(item, index) in posinfo"
            :data-id="item.id" :key="index"
            @click="posActiveStatus(index, item)"
            :class="{'posSelectActive': posId == item.id, 'ludanposSelectActive': ludanActive == index}"
          >
            <span class="pos-district" >{{ item.code + " - " + item.name }}</span>
            <span class="jiao" :style="{backgroundColor:showPosModeColor(item.mode)}"></span>
          </button>

          <!-- <button class="btn btn-default posmode-btn">
            <span class="pos-district">40-天津分公司天津</span>
            <span class="pos-status">(管理员 使用中)</span>
            <span class="jiao">收银</span>
          </button> -->
        </div>
        <div class="pos-pager">
          <Pager
            pagerId="selectPosModeId"
            itemTag="button"
            :animate="200"
            :showInfo = "true"
            arrowDirection="up-down"
            ref="pager">
          </Pager>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { find } from 'lodash';
import { mapActions } from 'vuex';
import KeyBoard from '@/components/Pos/Common/KeyBoard';
import Pager from '@/components/Pos/Common/Pager';
import ajax from '@/common/js/ajax';
import checkSystemTime from '@/common/js/checkSystemTime';

export default {
  name: 'BussinessStarting',
  components: { KeyBoard, Pager },
  props: {
    isGroupEmp: {
      type: Boolean,
      default: false,
    },
    lockLoad: { // 判断是否是锁屏登录时开班弹出
      type: Boolean,
      default: false,
    },
    unLockLoadFun: { // 锁屏登录，补开班时处理函数
      type: Function,
    },
  },
  data() {
    return {
      isshowKaiban: false, // 是否显示开班页
      kaibantitle: this.$t('Dict.offerCourse'), // 开班标题信息
      kaibanBtnIsEditor: false, //  开班按钮是否可点 默认可以
      kaibanBtnText: this.$t('Dict.GetInto'),
      posCode: null, // 当前Poscode
      posName: null, // 当前PosName
      spareMoneyValue: '', // 备用金输入框的值
      spareMoneyIsEditor: false, // 备用金是否可以编辑 默认可以
      pettyCash: null, // 备用金
      isAllowUpdatePosModeWhenOpening: false, // 登录系统时是否允许对收银和快餐模式进行切换 1允许 0不允许
      posMode: null, // POS模式
      selectposmode: [
        {
          posMode: '1',
        },
        {
          posMode: '3',
        },
      ],
      activepos: '1',
      isShowPos: false, // 是否显示选择Pos页
      posinfo: null,
      posId: '', // 记录选中的POS
      ludanActive: null, // 录单pos 是否选中的状态
      isIgnoreIp: false, // 开班时是否忽略IP（不需要进行POS解绑） true：不需要解绑 false：需要解绑
      reqPath: '/canyin/pos/opening/dobizv2', // 快餐收银模式下的开班进入路径
      posActive: null, // pos 是否选中的状态 默认不选中
      selectedPosId: null, // 是否存在上次选择过的pos
      posState: null,
      // 开班的时候是否要进行测试打印 true-是, false否 (原来王爱彬的判断逻辑用的都是错的)
      // isEnableOpeningTestPrint: false, // 开班的时候是否开启打印测试功能 IsEnableOpeningTestPrint
      // 是否启用开班时厨打测试(显示不显示)
      isEnableOpeningTestPrint: false,
      // 是否执行厨打测试(开关默认状态)
      isOpenSerialTestPrint: false,
    };
  },
  methods: {
    // 开班页打开后请求开班接口 ma 2018/9/17修改
    renderOpeningPage() {
      ajax('canyin.pos.opening.page').then((data) => {
        if (data.redirect === 'opening') {
          if (data.data.posList && data.data.posList.length) {
            // 判断如果没有上次的登录记录,并且在可选择的poslist里面的话就直接显示直接调到选择pos界面
            let isShowkaiBanMoudel = false;
            data.data.posList.forEach((posData) => {
              if (data.data.posName && posData.name === data.data.posName) {
                isShowkaiBanMoudel = true;
              }
            });
            this.posState = data.data.posStatus;
            this.showKaiBan(data.data, isShowkaiBanMoudel);
            if (isShowkaiBanMoudel) {
              this.isshowKaiban = true;
            } else {
              this.isShowPos = true;
            }
            this.isShowLogin = false;
          } else {
            this.$message.warning(this.$t('Biz.UserDesktop.UserDesktopMsg032'));
          }
        } else {
          // 跳转快餐模式暂时注释掉
          this.$router.push('/pos');
        }
      });
    },
    closeKaiBan() {
      this.isShowPos = false;// 是否显示选择Pos页
      this.isshowKaiban = false;// 是否显示开班页
      this.posId = '';
    },
    showKaiBan(data, isShowkaiBanMoudel) {
      // 显示产品名称
      // this.title = data.title;
      // 登录系统时是否允许对收银快餐切换 true false
      // 176 屏蔽快餐 暂时注释掉
      this.isAllowUpdatePosModeWhenOpening = data.isAllowUpdatePosModeWhenOpening;
      // this.isAllowUpdatePosModeWhenOpening = false;
      // 获取pos列表
      this.posinfo = data.posList;
      // 判断如果没有上次的登录记录,并且在可选择的poslist里面的没有话 就直接显示直接调到选择pos界面
      isShowkaiBanMoudel = false;
      this.posinfo.forEach((posData) => {
        if (posData.id === data.selectedPosId) {
          isShowkaiBanMoudel = true;
        }
      });
      // 获取上次选择的POS信息
      this.selectedPosId = isShowkaiBanMoudel ? data.selectedPosId : null;
      // 获取备用金信息
      if (this.selectedPosId) {
        // 如果不为空代表存在上次选择过的pos记录默认显示上次pos
        this.getShowPos({ list: false });
        this.getShowKaiban({ list: true });
        this.isShowPos = false;// 是否显示选择Pos页
        this.isshowKaiban = true;// 是否显示开班页
        this.posMode = data.posMode;// 登录后如果有上次选中POS记录上次POS模式
        this.posId = this.selectedPosId;// 当前选中PosId
        this.kaibantitle = this.$t('Dict.OpeningBusiness');
        this.spareMoneyIsEditor = false;// 可编辑备用金输入框
        // 获取当前选中posCode和posName显示当前POS 根据posId获取当前选中的pos信息
        let slectedPosData = null;
        if (data.posList) {
          slectedPosData = data.posList.filter(list => list.id == this.selectedPosId)[0];
        }
        this.posCode = (slectedPosData && slectedPosData.code) || (isShowkaiBanMoudel ? data.posCode : null);
        this.posName = (slectedPosData && slectedPosData.name) || (isShowkaiBanMoudel ? data.posName : null);
        this.pettyCash = (slectedPosData && slectedPosData.pettyCash) || (isShowkaiBanMoudel ? data.pettyCash : '');// 备用金
        this.kaibanBtnIsEditor = false;// 开班确定按钮可点
        if (data.posStatus == 0) { // 0空闲,1占用
          this.kaibanBtnText = this.$t('Dict.offerCourse');
          // 只有是开班进入时, 才执行赋值并判断后台设置是否启用厨打测试
          this.isEnableOpeningTestPrint = data.isEnableOpeningTestPrint;
          // 是否执行厨打测试(开关默认状态)
          this.isOpenSerialTestPrint = data.isOpenSerialTestPrint;
          this.spareMoneyValue = 0;
        } else {
          this.kaibanBtnText = this.$t('Dict.GetInto');
          this.spareMoneyValue = this.pettyCash;
        }

        if (data.posMode == '2') { // 录单模式
          this.kaibanBtnText = this.$t('Dict.GetInto');
          this.spareMoneyIsEditor = true;// 禁用备用金输入框
          this.kaibanBtnIsEditor = false;// 开班确定按钮可点
          this.spareMoneyValue = 0;
        } else {
          // 默认选中上次模式
          this.activepos = data.posMode;
        }
      } else {
        // 如果没有上次选中的POS直接弹出选择POS页
        this.getShowPos({ list: true });
        this.getShowKaiban({ list: true });

        this.isShowPos = true;// 是否显示选择Pos页
        this.isShowLogin = false;// 是否显示登录页
        this.isshowKaiban = true;// 是否显示开班页
      }
    },
    openCashBox() {
      ajax('canyin.pos.reception.receptionbusiness.all').then((res) => {
        const setting = res.data;
        // 如果开班启动钱箱条件
        const openCashBox = setting.sys && setting.sys.outDeviceSetting && setting.sys.outDeviceSetting.IsStartOpenCashbox === '1';
        // 如果没有钱箱操作, 直接返回
        if (openCashBox) {
          if (setting.pos.enableCashbox === 'true') {
            if (setting.pos.cashboxStyle === '1') {
              this.$devices.Cashbox.init({
                mode: 7,
                cmd: setting.pos.cashboxStartCommand,
                print_name: setting.pos.cashboxPrint,
              });
            }
            if (setting.pos.cashboxStyle === '2') {
              this.$devices.Cashbox.init({
                mode: 1,
                cmd: setting.pos.cashboxStartCommand,
                print_name: setting.pos.cashboxPrint,
                wbid: setting.pos.cashboxBrand,
                wbnum: setting.pos.cashboxBrand == '1005004' ? 'LJRB_001' : setting.pos.cashboxBrandType,
              });
            }
            this.$devices.Cashbox.open(() => {
              this.$devices.close();
            });
          }
          this.openingInitFn();
        } else {
          this.openingInitFn();
        }
      }).catch(() => {
        this.openingInitFn();
      });
    },
    confirmkaiban() {
      // 调用开班方法
      this.opening();
      // 开班进入点餐页面
    },
    opening() { // 点击开班页面开班按钮方法
      if (this.isGroupEmp) {
        this.$message.error(this.$t('Biz.UserDesktop.UserDesktopMsg033'));
        return false;
      }
      // 开班/进入按钮不可用时，return
      if (this.kaibanBtnIsEditor === true) {
        return false;
      }
      // 校验系统时间
      checkSystemTime().then(() => {
        // isIgnoreIp 如果为true,后台不再校验ip冲突
        ajax(this.posMode == '2' ? 'canyin.pos.inputBillOpening.doBiz' : 'canyin.pos.opening.doBiz', {
          contentType: 'URLEncoded',
          data: {
            bizParams: JSON.stringify({
              posId: this.posId,
              pettyCash: this.spareMoneyValue,
              isIgnoreIp: this.isIgnoreIp,
            }),
          },
        }).then((data) => {
          if (data.success) {
            if (this.posState == 0 && this.posMode !== '2') {
              this.kaibanBtnText = `${this.$t('Dict.StartWork')}...`;
              this.openCashBox();
            } else {
              this.kaibanBtnText = `${this.$t('Dict.Enter')}...`;
              this.gotoPos();
            }
          } else {
            this.$message.warning(data.message);
          }
        });
      });
      return true;
    },
    gotoPos() {
      if (this.lockLoad) {
        this.unLockLoadFun();
      } else {
        this.$router.push('/pos');
      }
    },
    // 开班的操作要执行的东西
    openingInitFn() {
      this.openPosExtension();
      // 是否要进行打印测试
      if (this.isEnableOpeningTestPrint && this.isOpenSerialTestPrint) {
        this.printTest();
      } else {
        this.gotoPos();
      }
    },
    pettyCashClick() { // 备用金输入框点击输入焦点
      this.$refs.spareMoney.select();
    },
    activeMode(index) { // 快餐收银模式切换按钮
      this.activepos = index; // 此处index 代表 快餐 收银模式
      ajax('canyin.pos.opening.updatePosSet', {
        contentType: 'json',
        data: {
          posId: this.posId,
          controlMode: index,
        },
      }).then((data) => {
        if (data.success) {
          // 改变 Pos 按钮中的三角模式值
          this.posMode = index;
          const finded = find(this.posInfo, { id: this.posId });
          if (finded) {
            finded.mode = index;
          }
        }
      });
    },
    confirmPos() {
      if (!this.posId) {
        return;
      }
      // 选择Pos页点击确认关闭选择Pos页
      ajax('canyin.desktop.systemtools.bind', {
        contentType: 'URLEncoded',
        data: {
          posId: this.posId,
        },
      }).then((res) => {
        this.isShowPos = false;
        this.$refs.spareMoney.focus();
        this.renderOpeningPage();
      });
    },
    posActiveStatus(index, item) {
      this.posActive = index;
      this.posId = item.id;

      const PosData = item;
      // 设定当前选中POS
      this.posCode = item.code;
      this.posName = item.name;
      if (item.mode == '2') {
        this.kaibanBtnText = this.$t('Dict.GetInto');
        this.kaibanBtnIsEditor = false;// 开班确定按钮可点
        this.spareMoneyIsEditor = true;// 禁用备用金输入框
        this.spareMoneyValue = 0;
      } else {
        this.kaibanBtnText = `${PosData.isOpening ? this.$t('Dict.GetInto') : this.$t('Dict.offerCourse')}(PgDn)`;
        this.kaibanBtnIsEditor = !PosData.enableEdit;// 开班确定按钮
        this.spareMoneyIsEditor = !PosData.enableEdit;// 备用金输入框
        this.spareMoneyValue = PosData.pettyCash;
        if (this.$refs.spareMoney) {
          this.$refs.spareMoney.focus();
        }
      }
      // 记录当前选中模式
      this.posMode = item.mode;
      // 选中当前模式
      this.activepos = item.mode;
    },
    showPosMode(mode) {
      if (mode == '1') {
        return this.$t('Dict.CashRegister');
      } if (mode == '2') {
        return this.$t('Dict.RecordSheet');
      } if (mode == '3') {
        return this.$t('Dict.FastFood');
      }
      return '';
    },
    showPosModeColor(mode) {
      let color = '#fff';
      if (mode === 1) {
        color = '#70D9B8';
      } if (mode === 2) {
        color = '#ffc600';
      } if (mode === 3) {
        color = '#8dd5fe';
      }
      return color;
    },
    // 绑定开班页快捷键
    bindStartWorkHotkeys() {
      this.$hotKey.removeCurrentModule('Opening.SelectPos');
      this.$hotKey.set('Opening.StartWork', {
        PgDn: () => {
          this.confirmkaiban();
        },
        Enter: () => {
          this.confirmkaiban();
        },
        Esc: () => {
          this.closeKaiBan();
        },
      });
    },
    /**
       * @函数说明 开班扩展操作
       * 这是后台做的一些操作不需要前端处理,直接读取接口
       * @修改历史
       */
    openPosExtension() {
      ajax('canyin.pos.openingextension.dobiz').then((res) => {});
    },
    /**
       * @函数说明 后厨打印测试
       */
    printTest() {
      ajax('canyin.pos.openingprinttest.dobiz',{
        contentType: 'URLEncoded',
        data: {
          params: JSON.stringify({
            isCurrentTestPrint: this.isOpenSerialTestPrint,
          }),
        },
      }).then((res) => {
        if (res.success) {
          this.$message.success(res.msg);
        } else {
          this.$message.error(res.msg);
        }
        setTimeout(() => {
          this.gotoPos();
        }, 3000);
      }).catch(() => {
        this.gotoPos();
      });
    },
    getCookie(name) { // 获得cookie值
      const reg = new RegExp(`(^| )${name}=([^;]*)(;|$)`);
      const arr = document.cookie.match(reg);
      if (arr) {
        return unescape(arr[2]);
      }
      return null;
    },
    ...mapActions([
      'getShowPos',
      'getShowLogin',
      'getShowKaiban',
    ]),
  },
  watch: {
    isShowPos(val) {
      if (val) {
        this.$hotKey.removeCurrentModule('Opening.StartWork');
        this.$hotKey.set('Opening.SelectPos', {
          Enter: () => {
            this.confirmPos();
          },
          Esc: () => {
            this.closeKaiBan();
          },
        });
      } else {
        this.bindStartWorkHotkeys();
      }
    },
    isshowKaiban(val) {
      if (val) {
        this.bindStartWorkHotkeys();
      } else {
        this.$hotKey.removeCurrentModule('Opening.StartWork');
      }
    },
  },
};
</script>

<style lang="less" scoped>
  .back {
    width: 96px;
    height: 40px;
    font-size: 14px;
    float: right;
    margin-top: 7px;
    margin-right: 12px;
  }
  .postype-wrapper {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    > .content {
      > .kaiban {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 330px;
        // height:510px;
        margin-top: -268px;
        margin-left: -165px;
        border-radius: 5px;
        background-color: #e4e4e4;
        > .kaiban-hearder::after {
          content: "";
          display: block;
          clear: both;
        }

        > .kaiban-hearder {
          width: 100%;
          height: 55px;
          padding-left: 12px;
          border-radius: 5px 5px 0 0;
          box-shadow: 0 0 5px 0 #c2c2c2;
          background-color: #fff;

          > .kaiban-left {
            line-height: 55px;
            display: inline-block;

            > .line {
              width: 4px;
              height: 18px;
              background-color: #10c7bd;
              display: inline-block;
              vertical-align: sub;
            }
            > .title {
              margin-left: 6px;
              font-size: 16px;
              font-size: 400;
              font-weight: 400;
              color: #000;
            }
          }
          > .enter {
            width: 96px;
            height: 40px;
            font-size: 14px;
            background-color: #0babb9;
            color: #fff;
            float: right;
            margin-top: 7px;
            margin-right: 12px;
          }
        }

        > .kaiban-content {
          margin: 13px;
          width: 305px;
          background-color: #fff;
          border-radius: 5px;
          padding: 16px 20px 20px 20px;

          > form {
            > .current-pos {
              height: 24px !important;
              line-height: 24px !important;
            }
            > .keyboard-static {
              margin-top: 28px;
              margin-left: 10px;
            }

            > .pos-content {
              position: relative;
              height: 40px;
              margin-bottom: 10px;
              padding-left: 68px;
              line-height: 40px;

              > .pos-left {
                width: 60px;
                position: absolute;
                left: 0;
                top: 0;
                font-size: 14px;
                font-weight: 400;
                color: #333;
              }
              > .pos-right::after {
                content: "";
                display: block;
                clear: both;
              }

              > .pos-right {
                width: 199px;

                > .demonstrate-pos {
                  display: inline-block;
                  font-size: 16px;
                  font-weight: bolder;
                  width: 124px;
                  line-height: 18px;
                  color: #0babb9;
                }

                > .switch-posmode {
                  float: right;
                  font-size: 13px;
                  line-height: 17px;
                  font-weight: 400;
                  border-bottom: 1px solid #333;
                  cursor: pointer;
                }

                > .spare-money {
                  border: 1px solid #b5b5b5;
                  width: 100%;
                  height: 38px;
                  padding-right: 10px;
                  border-radius: 5px;
                  text-align: right;
                  font-weight: 600;
                }
                > .activeposmode {
                  background-color: #0babb9;
                  color: #fff;
                }

                > .select-pos {
                  padding: 0;
                  width: 98px;
                  height: 38px;
                  line-height: 38px;
                }
              }
            }

            .nearLeft {
              padding: 0;
            }

            // .content-switch {
            //   display: inline-block;
            //   vertical-align: middle;
            // }
          }
        }
      }
      > .pounch-clock {
        position: absolute;
        top: 78%;
        right: 65px;
        cursor: pointer;
        text-align: center;
        background-color: #dde6f7;
        height: 36px;
        line-height: 36px;
        width: 285px;
        border-radius: 5px;
      }
    }

    > .postype-content {
      position: absolute;
      top: 50%;
      left: 50%;
      margin-top: -269px;
      margin-left: -225px;
      width: 450px;
      height: 560px;
      border-radius: 7px;
      background-color: #e4e4e4;
      z-index: 100;
      box-shadow: 0 0 10px 0 #c2c2c2;

      > .kaiban-hearder::after {
        content: "";
        display: block;
        clear: both;
      }
      > .kaiban-hearder {
        width: 100%;
        height: 55px;
        padding-left: 12px;
        border-radius: 5px 5px 0 0;
        box-shadow: 0 0 5px 0 #c2c2c2;
        background-color: #fff;

        > .kaiban-left {
          line-height: 55px;
          margin-right: 130px;
          display: inline-block;

          > .line {
            width: 4px;
            height: 18px;
            background-color: #10c7bd;
            display: inline-block;
            vertical-align: sub;
          }
          > .title {
            margin-left: 6px;
            font-size: 16px;
            font-size: 400;
            font-weight: 400;
            color: #000;
          }
        }
        > .enter {
          width: 96px;
          height: 40px;
          font-size: 14px;
          background-color: #0babb9;
          color: #fff;
          float: right;
          margin-top: 7px;
          margin-right: 12px;
        }
      }

      > .postype {
        margin: 12px;
        width: 426px;
        background-color: #fff;
        border-radius: 5px;
        padding: 21px 13px 19px 23px;

        > .postype-describe {
          height: 35px;
          position: relative;
          overflow: hidden;
          font-size: 12px;

          > div {
            float: left;
            margin-right: 10px;

            > .postype-describe-bgcolor{
              width: 20px;
              height: 20px;
              border-width: 10px;
              border-style: solid;
              float: left;
              margin-right: 5px;
            }
          }
        }

        > .postype-total {
          margin-left: 5px;
          height: 354px !important;
          overflow: hidden;

          > .posSelectActive {
            border: 2px solid #0babb9;
            color: #0babb9;
          }
          > .ludanposSelectActive {
            border: 2px solid #fff1b9;
            color: #fff1b9;
          }
          > button {
            position: relative;
            width: 120px;
            height: 108px;
            padding: 10px;
            margin-right: 6px;
            margin-bottom: 10px;
            background-color: #fff;
            white-space: normal !important;
            overflow: hidden;
            &:disabled {
              cursor: not-allowed;
              color: #ccc !important;
              border-color: #ccc !important;
              > .jiao{
                background: #ccc !important;
              }
            }
            > .pos-district {
              width: 97px;
              line-height: 24px;
              font-size: 16px;
              text-align: left;
              font-weight: bolder;
              display: block;
            }
            > .pos-status {
              margin-top: 7px;
              width: 97px;
              font-size: 12px;
              display: block;
            }
            > .jiao {
              position: absolute;
              top: -19px;
              right: -19px;
              width: 38px;
              height: 38px;
              font-size: 13px;
              font-weight: 400;
              display: block;
              color: #fff;
              transform: rotate(45deg);
              line-height: 95px;
              text-align: center;
            }
            // > .jiao-disabled{
            //   background: #ccc !important;
            // }
          }
        }
        > .pos-pager:after {
          content: "";
          display: block;
          clear: both;
        }
        > .pos-pager {
          margin-top: 10px;
          margin-bottom: 5px;

          > .pos-pager {
            float: right;
          }
        }
      }
    }
  }
  .lang-enUS {
    .postype-wrapper > .postype-content > .kaiban-hearder > .kaiban-left {
      margin-right: 120px;
    }
    .postype-wrapper > .content > .kaiban > .kaiban-hearder > .enter {
      width: 88px;
      padding-left: 0px;
      padding-right: 0px;
      margin-right: 10px;
      font-size: 12px;
      text-align: center;
    }
    .postype-wrapper > .content > .kaiban > .kaiban-hearder > .kaiban-left > .title {
      font-size: 14px;
      margin-left: 0px;
    }
    .back {
      width: 64px;
      padding-left: 0px;
      padding-right: 0px;
      margin-right: 5px;
      font-size: 12px;
      text-align: center;
    }
  }
</style>
