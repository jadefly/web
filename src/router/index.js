import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

// 报表查询
const searchPrint = (resolve) => {
  import('@/components/Index/UserDesktop/SearchPrint/Index').then((module) => {
    resolve(module);
  });
};
const ReportBusinessBZHG = (resolve) => {
  import('@/components/Index/UserDesktop/SearchPrint/components/ReportBusinessBZHG').then((module) => {
    resolve(module);
  });
};
const ReportBusinessXGSJ = (resolve) => {
  import('@/components/Index/UserDesktop/SearchPrint/components/ReportBusinessXGSJ').then((module) => {
    resolve(module);
  });
};
const ReportTimeXGSJ = (resolve) => {
  import('@/components/Index/UserDesktop/SearchPrint/components/ReportTimeXGSJ').then((module) => {
    resolve(module);
  });
};

const ReportBusiness = (resolve) => {
  import('@/components/Index/UserDesktop/SearchPrint/components/ReportBusiness').then((module) => {
    resolve(module);
  });
};
const ReportSales = (resolve) => {
  import('@/components/Index/UserDesktop/SearchPrint/components/ReportSales').then((module) => {
    resolve(module);
  });
};
const ReportGift = (resolve) => {
  import('@/components/Index/UserDesktop/SearchPrint/components/ReportGift').then((module) => {
    resolve(module);
  });
};
const BusinessStatisticsReport = (resolve) => {
  import('@/components/Index/UserDesktop/SearchPrint/components/BusinessStatisticsReport').then((module) => {
    resolve(module);
  });
};
const SettleStatisticsReport = (resolve) => {
  import('@/components/Index/UserDesktop/SearchPrint/components/SettleStatisticsReport').then((module) => {
    resolve(module);
  });
};
const ReportMeal = (resolve) => {
  import('@/components/Index/UserDesktop/SearchPrint/components/ReportMeal').then((module) => {
    resolve(module);
  });
};
const ReportBusinessQFBZ = (resolve) => {
  import('@/components/Index/UserDesktop/SearchPrint/components/ReportBusinessQFBZ').then((module) => {
    resolve(module);
  });
};
const ReportBusinessYK = (resolve) => {
  import('@/components/Index/UserDesktop/SearchPrint/components/ReportBusinessYK').then((module) => {
    resolve(module);
  });
};
const ReportTimeQFBZ = (resolve) => {
  import('@/components/Index/UserDesktop/SearchPrint/components/ReportTimeQFBZ').then((module) => {
    resolve(module);
  });
};
const ReportDishInfoQFBZ = (resolve) => {
  import('@/components/Index/UserDesktop/SearchPrint/components/ReportDishInfoQFBZ').then((module) => {
    resolve(module);
  });
};
const AbandonReportQFBZ = (resolve) => {
  import('@/components/Index/UserDesktop/SearchPrint/components/AbandonReportQFBZ').then((module) => {
    resolve(module);
  });
};
const BilledStatement = (resolve) => {
  import('@/components/Index/UserDesktop/SearchPrint/components/BilledStatement').then((module) => {
    resolve(module);
  });
};
const BilledReport = (resolve) => {
  import('@/components/Index/UserDesktop/SearchPrint/components/BilledReport').then((module) => {
    resolve(module);
  });
};

const Index = (resolve) => {
  import('@/components/Index/Index').then((module) => {
    resolve(module);
  });
};

const Pos = (resolve) => {
  import('@/components/Pos/Index').then((module) => {
    resolve(module);
  });
};

const Order = (resolve) => {
  import('@/components/Pos/Order/Index').then((module) => {
    resolve(module);
  });
};

const Ordering = (resolve) => {
  import('@/components/Pos/Ordering/Index').then((module) => {
    resolve(module);
  });
};

const Reserve = (resolve) => {
  import('@/components/Pos/Reserve/Index').then((module) => {
    resolve(module);
  });
};

const Booking = (resolve) => {
  import('@/components/Pos/Booking/Index').then((module) => {
    resolve(module);
  });
};

const Takeout = (resolve) => {
  import('@/components/Pos/Takeout/Index').then((module) => {
    resolve(module);
  });
};

const TakeoutNew = (resolve) => {
  import('@/components/Pos/Takeout/New/Index').then((module) => {
    resolve(module);
  });
};

const TakeoutBack = (resolve) => {
  import('@/components/Pos/Takeout/Back/Index').then((module) => {
    resolve(module);
  });
};

const TakeoutHandling = (resolve) => {
  import('@/components/Pos/Takeout/Handling/Index').then((module) => {
    resolve(module);
  });
};

const TakeoutHistory = (resolve) => {
  import('@/components/Pos/Takeout/History/Index').then((module) => {
    resolve(module);
  });
};

const TakeoutAbnormal = (resolve) => {
  import('@/components/Pos/Takeout/Abnormal/Index').then((module) => {
    resolve(module);
  });
};

const Crm = (resolve) => {
  import('@/components/Pos/Crm/Index').then((module) => {
    resolve(module);
  });
};

const Crm7 = (resolve) => {
  import('@/components/Pos/Crm7/Index').then((module) => {
    resolve(module);
  });
};

const Supply = (resolve) => {
  import('@/components/Pos/Supply/Index').then((module) => {
    resolve(module);
  });
};

const PosViceScreen = (resolve) => {
  import('@/components/ViceScreen/Pos/Index').then((module) => {
    resolve(module);
  });
};

const FastFood = (resolve) => {
  import('@/components/Pos/FastFood/Index').then((module) => {
    resolve(module);
  });
};

const Member = (resolve) => {
  import('@/components/Pos/Member/Index').then((module) => {
    resolve(module);
  });
};

// 用户桌面主页面
const UserDesktopMain = (resolve) => {
  import('@/components/Index/UserDesktop/Main').then((module) => {
    resolve(module);
  });
};

// 用户桌面
const UserDesktop = (resolve) => {
  import('@/components/Index/UserDesktop/Index').then((module) => {
    resolve(module);
  });
};

// 吧台盘点
const BarCounter = (resolve) => {
  import('@/components/Index/UserDesktop/BarCounter/Index').then((module) => {
    resolve(module);
  });
};

const BarItemsSettingMoudle = (resolve) => {
  import('@/components/Index/UserDesktop/BarCounter/BarItemsSettingMoudle').then((module) => {
    resolve(module);
  });
};

const ChargeBillMoudle = (resolve) => {
  import('@/components/Index/UserDesktop/BarCounter/ChargeBillMoudle').then((module) => {
    resolve(module);
  });
};

const TarnsferBillMoudle = (resolve) => {
  import('@/components/Index/UserDesktop/BarCounter/TarnsferBillMoudle').then((module) => {
    resolve(module);
  });
};

const CheckBillMoudle = (resolve) => {
  import('@/components/Index/UserDesktop/BarCounter/CheckBillMoudle').then((module) => {
    resolve(module);
  });
};

const StoresStatusMoudle = (resolve) => {
  import('@/components/Index/UserDesktop/BarCounter/StoresStatusMoudle').then((module) => {
    resolve(module);
  });
};

// 营业管理
const BussinessManagement = (resolve) => {
  import('@/components/Index/UserDesktop/BussinessManagement/Index').then((module) => {
    resolve(module);
  });
};

const ManagerLogModule = (resolve) => {
  import('@/components/Index/UserDesktop/BussinessManagement/ManagerLogModule').then((module) => {
    resolve(module);
  });
};

const DailySettlementModule = (resolve) => {
  import('@/components/Index/UserDesktop/BussinessManagement/DailySettlementModule').then((module) => {
    resolve(module);
  });
};
const KitchenDataUploadModule = (resolve) => {
  import('@/components/Index/UserDesktop/BussinessManagement/KitchenDataUploadModule').then((module) => {
    resolve(module);
  });
};
const FishCoolUpdateModule = (resolve) => {
  import('@/components/Index/UserDesktop/BussinessManagement/FishCoolUpdateModule').then((module) => {
    resolve(module);
  });
};
const WasteFoodModule = (resolve) => {
  import('@/components/Index/UserDesktop/BussinessManagement/WasteFoodModule').then((module) => {
    resolve(module);
  });
};

const TempItemsModule = (resolve) => {
  import('@/components/Index/UserDesktop/BussinessManagement/TempItemsModule').then((module) => {
    resolve(module);
  });
};

const TempMethodsModule = (resolve) => {
  import('@/components/Index/UserDesktop/BussinessManagement/TempMethodsModule').then((module) => {
    resolve(module);
  });
};

// 财务管理
const FinancialManagement = (resolve) => {
  import('@/components/Index/UserDesktop/FinancialManagement/Index').then((module) => {
    resolve(module);
  });
};

const CreditAccountMoudle = (resolve) => {
  import('@/components/Index/UserDesktop/FinancialManagement/CreditAccountMoudle/Index').then((module) => {
    resolve(module);
  });
};

const CreditRepayMoudle = (resolve) => {
  import('@/components/Index/UserDesktop/FinancialManagement/CreditRepayMoudle/Index').then((module) => {
    resolve(module);
  });
};

const CommissionTableMoudle = (resolve) => {
  import('@/components/Index/UserDesktop/FinancialManagement/CommissionTableMoudle/Index').then((module) => {
    resolve(module);
  });
};

// 提成表--回收站
const RecycleBinModule = (resolve) => {
  import('@/components/Index/UserDesktop/FinancialManagement/CommissionTableMoudle/RecycleBinModule').then((module) => {
    resolve(module);
  });
};

// 挂账账户--回收站
const AccountRecycleBinModule = (resolve) => {
  import('@/components/Index/UserDesktop/FinancialManagement/CreditAccountMoudle/AccountRecycleBinModule').then((module) => {
    resolve(module);
  });
};

const CreateCommissionTableMoudle = (resolve) => {
  import('@/components/Index/UserDesktop/FinancialManagement/CommissionTableMoudle/CreateCommissionTableMoudle').then((module) => {
    resolve(module);
  });
};

// 系统工具
const SystemTools = (resolve) => {
  import('@/components/Index/UserDesktop/SystemTools/Index').then((module) => {
    resolve(module);
  });
};

const POSUnbind = (resolve) => {
  import('@/components/Index/UserDesktop/SystemTools/POSUnbind').then((module) => {
    resolve(module);
  });
};

const PosIpLogin = (resolve) => {
  import('@/components/Index/UserDesktop/SystemTools/PosIpLogin').then((module) => {
    resolve(module);
  });
};

const PhoneModule = (resolve) => {
  import('@/components/Index/UserDesktop/SystemTools/PhoneModule').then((module) => {
    resolve(module);
  });
};

const DataModule = (resolve) => {
  import('@/components/Index/UserDesktop/SystemTools/DataModule').then((module) => {
    resolve(module);
  });
};

// 移动银台解绑
const SmartposModule = (resolve) => {
  import('@/components/Index/UserDesktop/SystemTools/SmartposModule').then((module) => {
    resolve(module);
  });
};

// 系统参数
const ParameterSetting = (resolve) => {
  import('@/components/Index/UserDesktop/ParameterSetting/Index').then((module) => {
    resolve(module);
  });
};

const FashionBookMoudle = (resolve) => {
  import('@/components/Index/UserDesktop/ParameterSetting/FashionBookMoudle/Index').then((module) => {
    resolve(module);
  });
};

const ClientMustMoudle = (resolve) => {
  import('@/components/Index/UserDesktop/ParameterSetting/ClientMustMoudle').then((module) => {
    resolve(module);
  });
};


const CodePaymentMoudle = (resolve) => {
  import('@/components/Index/UserDesktop/ParameterSetting/CodePaymentMoudle').then((module) => {
    resolve(module);
  });
};

const HotelSystemModule = (resolve) => {
  import('@/components/Index/UserDesktop/ParameterSetting/HotelSystemModule').then((module) => {
    resolve(module);
  });
};

const DragonDecisionModule = (resolve) => {
  import('@/components/Index/UserDesktop/ParameterSetting/DragonDecisionModule').then((module) => {
    resolve(module);
  });
};

const FastLoginModule = (resolve) => {
  import('@/components/Index/UserDesktop/ParameterSetting/FastLoginModule/Index').then((module) => {
    resolve(module);
  });
};

const WuuConfigModule = (resolve) => {
  import('@/components/Index/UserDesktop/ParameterSetting/WuuConfigModule/Index').then((module) => {
    resolve(module);
  });
};

const ServiceAreaCashierModule = (resolve) => {
  import('@/components/Index/UserDesktop/ParameterSetting/ServiceAreaCashierModule').then((module) => {
    resolve(module);
  });
};

const ProxyOffWork = (resolve) => {
  import('@/components/Index/UserDesktop/BussinessManagement/ProxyOffWork').then((module) => {
    resolve(module);
  });
};

const router = new Router({
  routes: [{
    path: '/',
    component: Index,
  }, {
    path: '/pos',
    component: Pos,
    meta: { isposroot: true },
    children: [{
      path: 'order',
      component: Order,
      name: 'order',
    }, {
      path: 'order/:tableId',
      component: Ordering,
      name: 'ordering',
    }, {
      path: 'fastFood',
      component: FastFood,
    }, {
      path: 'reserve',
      component: Reserve,
    }, {
      path: 'booking',
      component: Booking,
      name: 'booking',
    }, {
      path: 'takeout',
      redirect: 'takeout/new',
      component: Takeout,
      children: [{
        path: 'new',
        name: 'takeout.new',
        component: TakeoutNew,
      }, {
        path: 'back',
        name: 'takeout.back',
        component: TakeoutBack,
      }, {
        path: 'handling',
        name: 'takeout.handling',
        component: TakeoutHandling,
      }, {
        path: 'history',
        name: 'takeout.history',
        component: TakeoutHistory,
      }, {
        path: 'abnormal',
        name: 'takeout.abnormal',
        component: TakeoutAbnormal,
      }],
    }, {
      path: 'crm',
      component: Crm,
    }, {
      path: 'crm7',
      component: Crm7,
    }, {
      path: 'supply',
      component: Supply,
    }, {
      path: 'member',
      component: Member,
    }],
  }, {
    path: '/viceScreen/pos',
    component: PosViceScreen,
  }, {
    path: '/desk',
    name: 'desk',
    component: UserDesktopMain,
    redirect: '/desk/index',
    children: [{
      path: 'index',
      name: 'deskIndex',
      component: UserDesktop,
    }, {
      path: 'searchPrint',
      name: 'searchPrint',
      component: searchPrint,
      children: [
        {
          path: 'reportBusinessBZHG',
          component: ReportBusinessBZHG,
          name: 'reportBusinessBZHG',
        }, {
          path: 'reportBusiness',
          component: ReportBusiness,
          name: 'reportBusiness',
        }, {
          path: 'reportSales',
          component: ReportSales,
          name: 'reportSales',
        }, {
          path: 'reportGift',
          component: ReportGift,
          name: 'reportGift',
        }, {
          path: 'businessStatisticsReport',
          component: BusinessStatisticsReport,
          name: 'businessStatisticsReport',
        }, {
          path: 'settleStatisticsReport',
          component: SettleStatisticsReport,
          name: 'settleStatisticsReport',
        }, {
          path: 'reportMeal',
          component: ReportMeal,
          name: 'reportMeal',
        }, {
          path: 'reportBusinessQFBZ',
          component: ReportBusinessQFBZ,
          name: 'reportBusinessQFBZ',
        }, {
          path: 'reportTimeQFBZ',
          component: ReportTimeQFBZ,
          name: 'reportTimeQFBZ',
        }, {
          path: 'reportDishInfoQFBZ',
          component: ReportDishInfoQFBZ,
          name: 'reportDishInfoQFBZ',
        }, {
          path: 'abandonReportQFBZ',
          component: AbandonReportQFBZ,
          name: 'abandonReportQFBZ',
        }, {
          path: 'billedStatement',
          component: BilledStatement,
          name: 'billedStatement',
        }, {
          path: 'billedReport',
          component: BilledReport,
          name: 'billedReport',
        }, {
          path: 'reportBusinessYK',
          component: ReportBusinessYK,
          name: 'reportBusinessYK',
        }, {
          path: 'reportBusinessXGSJ',
          component: ReportBusinessXGSJ,
          name: 'reportBusinessXGSJ',
        }, {
          path: 'reportTimeXGSJ',
          component: ReportTimeXGSJ,
          name: 'reportTimeXGSJ',
        },
      ],
    }, {
      path: 'barCounter',
      component: BarCounter,
      children: [{
        path: 'barItemsSettingMoudle',
        component: BarItemsSettingMoudle,
        name: 'barItemsSettingMoudle',
      }, {
        path: 'chargeBillMoudle',
        component: ChargeBillMoudle,
        name: 'chargeBillMoudle',
      }, {
        path: 'tarnsferBillMoudle',
        component: TarnsferBillMoudle,
        name: 'tarnsferBillMoudle',
      }, {
        path: 'checkBillMoudle',
        component: CheckBillMoudle,
        name: 'checkBillMoudle',
      }, {
        path: 'storesStatusMoudle',
        component: StoresStatusMoudle,
        name: 'storesStatusMoudle',
      }],
    }, {
      path: 'financialManagement',
      component: FinancialManagement,
      children: [{
        path: 'creditAccountMoudle',
        component: CreditAccountMoudle,
        name: 'creditAccountMoudle',
      }, {
        path: 'creditRepayMoudle',
        component: CreditRepayMoudle,
        name: 'creditRepayMoudle',
      }, {
        path: 'commissionTableMoudle',
        component: CommissionTableMoudle,
        name: 'commissionTableMoudle',
      }, {
        path: 'createCommissionTableMoudle',
        component: CreateCommissionTableMoudle,
        name: 'createCommissionTableMoudle',
      }, {
        path: 'recycleBinModule',
        component: RecycleBinModule,
        name: 'recycleBinModule',
      }, {
        path: 'accountRecycleBinModule',
        component: AccountRecycleBinModule,
        name: 'accountRecycleBinModule',
      }],
    }, {
      path: 'parameterSetting',
      component: ParameterSetting,
      children: [{
        path: 'fashionBookMoudle',
        component: FashionBookMoudle,
        name: 'fashionBookMoudle',
      }, {
        path: 'clientMustMoudle',
        component: ClientMustMoudle,
        name: 'clientMustMoudle',
      }, {
        path: 'codePaymentMoudle',
        component: CodePaymentMoudle,
        name: 'codePaymentMoudle',
      }, {
        path: 'hotelSystemModule',
        component: HotelSystemModule,
        name: 'hotelSystemModule',
      }, {
        path: 'dragonDecisionModule',
        component: DragonDecisionModule,
        name: 'dragonDecisionModule',
      }, {
        path: 'fastLoginModule',
        component: FastLoginModule,
        name: 'fastLoginModule',
      }, {
        path: 'wuuConfigModule',
        component: WuuConfigModule,
        name: 'wuuConfigModule',
      }, {
        path: 'serviceAreaCashierModule',
        component: ServiceAreaCashierModule,
        name: 'serviceAreaCashierModule',
      }],
    }, {
      path: 'bussinessManagement',
      component: BussinessManagement,
      children: [{
        path: 'managerLogModule',
        component: ManagerLogModule,
        name: 'managerLogModule',
      }, {
        path: 'dailySettlementModule',
        component: DailySettlementModule,
        name: 'dailySettlementModule',
      }, {
        path: 'kitchenDataUploadModule',
        component: KitchenDataUploadModule,
        name: 'kitchenDataUploadModule',
      }, {
        path: 'wasteFoodModule',
        component: WasteFoodModule,
        name: 'wasteFoodModule',
      }, {
        path: 'tempItemsModule',
        component: TempItemsModule,
        name: 'tempItemsModule',
      }, {
        path: 'tempMethodsModule',
        component: TempMethodsModule,
        name: 'tempMethodsModule',
      }, {
        path: 'proxyoffWork',
        component: ProxyOffWork,
        name: 'proxyoffWork',
      }],
    }, {
      path: 'systemTools',
      component: SystemTools,
      children: [{
        path: 'posModule',
        component: POSUnbind,
        name: 'posModule',
      }, {
        path: 'posIpLogin',
        component: PosIpLogin,
        name: 'posIpLogin',
      }, {
        path: 'phoneModule',
        component: PhoneModule,
        name: 'phoneModule',
      }, {
        path: 'dataModule',
        component: DataModule,
        name: 'dataModule',
      }, {
        path: 'smartposModule',
        component: SmartposModule,
        name: 'smartposModule',
      }, {
        path: 'fishCoolDataUploadModule',
        component: FishCoolUpdateModule,
        name: 'fishCoolDataUploadModule',
      }],
    }],
  }, {
    path: '/kds',
    name: 'kds',
    component: () => import('@/components/KDS/Index'),
  },{
    path: '/kds/seafood/loginMode/:loginMode/posid/:posid/filterid/:filterid',
    name: 'kds.seafood',
    component: () => import('@/components/KDS/Seafood/Index'),
  }, {
    path: '/kds/main',
    name: 'kds.main',
    redirect: '/kds/main/dishes',
    component: () => import('@/components/KDS/Main/Index'),
    children: [{
      name: 'kds.main.dishes',
      path: 'dishes',
      component: () => import('@/components/KDS/Main/Dishes/Index'),
    }, {
      name: 'kds.main.tables',
      path: 'tables',
      component: () => import('@/components/KDS/Main/Tables/Index'),
    }],
  }, {
    path: '/kds/fastFood/loginMode/:loginMode/posid/:posid/filterid/:filterid',
    name: 'kds.fastFood',
    component: () => import('@/components/KDS/Order'),
  }, {
    path: '/kds/dining/loginMode/:loginMode/posid/:posid/filterid/:filterid',
    name: 'kds.dining',
    component: () => import('@/components/KDS/Dining/Index'),
  }],
  // mode:'history'
});

router.beforeEach((to, from, next) => {
  if (from.path === '/pos' && to.path === '/pos/fastFood') {
    const { isRefresh } = sessionStorage;
    if (isRefresh === '0') { // 非第一次进入，强制刷新页面
      sessionStorage.setItem('isRefresh', null);
      window.location.reload();
    } else {
      sessionStorage.setItem('isRefresh', '0');
    }
  }
  next();
});

export default router;
