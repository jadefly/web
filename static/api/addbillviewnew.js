
export default {
    //http://localhost:8080/canyin7/canyin/pos/addbill/addbillviewnew?pointId=9900000000000241&loadmodule=1&_t=1521090847465							
    "msg": "canyin/pos/bill/addBillView",							
    "code": "1",							
    "data": {							
        "dinnerMode": 2,							//就餐模式
        "dinnerTypeName": "普通就餐",							//就餐类型名称
        "pointName": "02-厅-02",							//客位名称
        "salesmanCode": "",							//营销员代码
        "waiterName": "",							//服务员名称
        "addItemList": [							//开单自动增加品项
            {							
                "itemId": "9900000000000030",							//品项id
                "itemQty": 1,							//品项数量
                "code": "001002",							//code
                "unitName": "只",							//单位名称
                "pkgType": 0,							//套餐类型
                "itemServiceType": 0,							//品项开单类型
                "pointMngId": "9900000000005031",							//客位管理id
                "name": "品项2",							//名称
                "isPackage": false,							//是否为套餐
                "itemSizeId": "-1"							//品项规格ID
            }							
        ],							
        "title": "开单",							//标题
        "orderOriginId": "1201",							//订单来源id
        "orderOriginList": [							//订单来源信息
            {							
                "name": "CRM移动收银外卖",							//名称
                "id": "1252"							//id
            }							
        ],							
        "waiterCode": "",							//服务员代码
        "pointId": "9900000000000239",							//客位id
        "waiters": [],							
        "minCapacity": 1,							//客位最小容纳人数
        "controlMode": "1",							//操作模式
        "salesmanName": "",							//营销员名称
        "salesmanId": "",							//营销员id
        "isOpenSelf": false,							//是否开通自助功能
        "priLocalEnableMember": false,							//是否启用销售方案会员价
        "pointCode": "02",							//客位code
        "isDepositEnable": false,							//是否允许登记押金
        "maxCapacity": 6,							//客位最大容纳人数
        "salesmans": [],							
        "deposit": 0,							//押金
        "isNeedWater": false,							//是否必须录入服务员
        "waiterId": "",							//服务员id
        "defCapacity": 4,							//客位默认人数
        "orderOriginName": "自来客",							//订单来源名称
        "dinnerTypeList": [							//就餐类型信息
            {							
                "name": "商务宴请",							//名称
                "id": "1307"							//id
            }							
        ],							
        "isUpdate": 0,							//是否为修改状态
        "dinnerTypeId": "1301"							//默认就餐类型
    },							
    "errCode": null							
}							
