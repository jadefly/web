import config from '@/pages/config'
import layout from '@/layout'
import tasks from '@/pages/tasks/taskList' // 几个组件公用

export default [{
  path: '/',
  name: 'layout',
  component: layout,
  props: true,
  meta: {
    role: ['销售经理', '销售总监', '技术总监', '总经理', '安服经理', '安服组长', '项目经理/组员', '项目助理', '管理员']
  }, // 页面需要的权限
  children: [{
    path: '/home',
    name: 'home',
    label: '首页',
    meta: {
      role: ['销售经理', '销售总监', '技术总监', '总经理', '安服经理', '安服组长', '项目经理/组员', '项目助理', '管理员']
    }, // 页面需要的权限
    component: () => import('@/pages/home')
  }, {
    path: '/taskIndex',
    name: 'taskIndex',
    label: '项目管理',
    meta: {
      role: ['安服经理'] // 一级目录，只有查看
    },
    component: tasks
  }, {
    path: '/tasks',
    name: 'tasks',
    // redirect: '/tasks/taskList',
    label: '项目管理',
    meta: {
      role: ['安服组长', '项目经理/组员', '项目助理', '管理员']
    }, // 页面需要的权限
    component: () => import('@/pages/tasks'),
    children: [
      // {
      //   path: 'taskList',
      //   name: 'taskList',
      //   label: '项目管理',
      //   meta: {
      //     role: ['安服组长', '项目经理/组员', '项目助理']
      //   },
      //   component: () => import('@/pages/tasks/taskList.vue')
      // },
      {
        path: 'enterTime',
        name: 'enterTime',
        label: '安排入场时间',
        meta: {
          role: ['安服组长', '项目经理/组员']
        },
        component: tasks
      },
      {
        path: 'Schedule',
        name: 'Schedule',
        label: '日程安排',
        meta: {
          role: ['安服组长', '项目经理/组员']
        },
        component: tasks
      },
      {
        path: 'AssignPersonnel',
        name: 'AssignPersonnel',
        label: '分配组员',
        meta: {
          role: ['安服组长']
        },
        component: tasks
      },
      {
        path: 'Progress',
        name: 'Progress',
        label: '进度管理',
        meta: {
          role: ['安服组长', '项目经理/组员', '管理员']
        },
        component: tasks
      },
      {
        path: 'Review',
        name: 'Review',
        label: '规范性复核',
        meta: {
          role: ['项目助理']
        }, // 页面需要的权限
        component: tasks
      },
      {
        path: 'report',
        name: 'report',
        label: '测评项目报备',
        meta: {
          role: ['项目经理/组员', '项目助理']
        }, // 页面需要的权限
        component: () => import('@/pages/report')
      }
    ]
  }, {
    path: '/personnelSchedule',
    name: 'personnelSchedule',
    label: '人员工作安排',
    meta: {
      role: ['项目经理/组员', '安服组长', '管理员']
    }, // 页面需要的权限
    component: () => import('@/pages/tasks/personnelSchedule'),
    hide: true // 不在导航中显示
  }, {
    path: '/ProgressAdjustment',
    name: 'ProgressAdjustment',
    label: '项目进度调整',
    meta: {
      role: ['项目经理/组员', '安服组长', '管理员']
    }, // 页面需要的权限
    component: () => import('@/pages/tasks/progressAdjustment'),
    hide: true // 不在导航中显示
  }, {
    path: '/ProgressConfirm',
    name: 'ProgressConfirm',
    label: '项目进度确认',
    meta: {
      role: ['销售经理', '销售总监', '技术总监', '总经理', '安服经理', '安服组长', '项目经理/组员', '项目助理', '管理员']
    }, // 页面需要的权限
    component: () => import('@/pages/tasks/progressConfirm'),
    hide: true // 不在导航中显示
  }, {
    path: '/projectDetail',
    name: 'projectDetail',
    label: '项目管理详情',
    meta: {
      role: ['项目经理', '销售经理', '服务经理', '交付经理', '总经理', '技术总监', '销售总监', '管理员']
    }, // 页面需要的权限
    component: () => import('@/pages/tasks/projectDetail'),
    hide: true // 不在导航中显示
  }, {
    path: '/handoverIndex',
    name: 'handoverIndex',
    label: '交接单管理',
    meta: {
      role: ['销售经理', '安服经理', '安服组长', '管理员']
    }, // 页面需要的权限
    component: () => import('@/pages/loophole/list')
  }, {
    path: '/handover',
    redirect: '/handover/list',
    name: 'handover',
    label: '交接单管理',
    meta: {
      role: ['销售总监', '技术总监', '总经理', '管理员']
    }, // 页面需要的权限
    component: () => import('@/pages/loophole'),
    children: [{
      path: 'list',
      name: 'handoverList',
      label: '交接单管理',
      meta: {
        role: ['销售总监', '管理员']
      },
      component: () => import('@/pages/loophole/list')
    }, {
      path: 'approvalList',
      name: 'handoverApproval',
      label: '待审批交接单',
      meta: {
        role: ['销售总监', '技术总监', '总经理', '管理员']
      },
      component: () => import('@/pages/loophole/approvalList')
    }, {
      path: 'look',
      name: 'handoverLook',
      label: '交接单查询',
      meta: {
        role: ['销售总监', '技术总监', '总经理', '管理员']
      },
      component: () => import('@/pages/loophole/look')
    }]
  }, {
    path: '/config',
    name: 'config',
    label: '合同管理',
    meta: {
      role: ['销售经理', '销售总监', '技术总监', '总经理', '管理员']
    }, // 页面需要的权限
    component: config
  }, {
    path: '/detail',
    name: 'detail',
    label: '合同详情',
    meta: {
      role: ['销售经理', '销售总监', '技术总监', '总经理', '管理员']
    }, // 页面需要的权限
    component: () => import('@/pages/config/detail.vue'),
    hide: true // 不在导航中显示
  }, {
    path: '/userSet',
    name: 'userSet',
    label: '周报',
    meta: {
      // role: ['项目经理', '销售经理', '服务经理', '交付经理', '总经理', '技术总监', '销售总监', '管理员']
    }, // 页面需要的权限
    component: () => import('@/pages/userSet')
  }, {
    path: '/add',
    name: 'add',
    label: '创建交接单',
    meta: {
      role: ['销售经理', '交付经理', '总经理', '技术总监', '销售总监', '管理员']
    }, // 页面需要的权限
    component: () => import('@/pages/loophole/add.vue'),
    hide: true // 不在导航中显示
  }, {
    path: '/approval',
    name: 'approval',
    label: '交接单审批',
    meta: {
      role: ['销售经理', '交付经理', '总经理', '技术总监', '销售总监', '管理员']
    }, // 页面需要的权限
    component: () => import('@/pages/loophole/approval.vue'),
    hide: true // 不在导航中显示
  }, {
    path: '/approvalDetails',
    name: 'approvalDetails',
    label: '交接单详情',
    meta: {
      role: ['销售经理', '销售总监', '技术总监', '总经理', '安服经理', '安服组长', '项目经理/组员', '项目助理', '管理员']
    }, // 页面需要的权限
    component: () => import('@/pages/loophole/approvalDetails.vue'),
    hide: true // 不在导航中显示
  }, { // 交接单-指派给组长
    path: '/toAssign',
    name: 'toAssign',
    label: '指派组长',
    meta: {
      role: ['安服经理', '管理员']
    },
    component: () => import('@/pages/loophole/toAssign'),
    hide: true // 不在导航中显示
  }, { // 工单管理列表
    path: '/workOrderList',
    name: 'workOrderList',
    label: '工单管理',
    meta: {
      role: ['安服组长', '管理员']
    },
    component: () => import('@/pages/workOrder/workOrderList'),
    hide: true // 不在导航中显示
  }, { // 工单管理-项目工单派发给项目经理
    path: '/addOrder',
    name: 'addOrder',
    label: '项目工单派发',
    meta: {
      role: ['安服组长', '管理员']
    },
    component: () => import('@/pages/workOrder/addOrder'),
    hide: true // 不在导航中显示
  }, { // 工单管理-查看
    path: '/lookAtOrder',
    name: 'lookAtOrder',
    label: '项目工单查看',
    meta: {
      role: ['安服组长', '管理员']
    },
    component: () => import('@/pages/workOrder/lookAtOrder'),
    hide: true // 不在导航中显示
  }]
}]
