import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/forYouDownload',
    component: () => import('@/views/forYouDownload/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: '仪表盘',
        meta: { title: '仪表盘', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/guide',
    component: Layout,
    redirect: '/guide/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/guide/index'),
        name: 'Guide',
        meta: { title: '导航', icon: 'guide', noCache: true }
      }
    ]
  },
  {
    path: '/health',
    component: Layout,
    redirect: '/health/index',
    alwaysShow: true, // will always show the root menu
    name: 'healthManage',
    meta: {
      title: '健康管理',
      icon: 'people'
    },
    children: [
      {
        path: 'sleepList',
        component: () => import('@/views/health/sleep/index'),
        name: 'pageSleep',
        meta: {
          title: '睡眠'
        }
      },
      {
        path: 'bodyDataList',
        component: () => import('@/views/health/body-data/index'),
        name: 'pageBodyData',
        meta: {
          title: '身体数据'
        }
      }
    ]
  },
  {
    path: '/config',
    component: Layout,
    redirect: '/config/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/config/index'),
        name: '设置中心',
        meta: { title: '设置中心', icon: 'example', noCache: true }
      }
    ]
  },
  {
    path: '/email',
    component: Layout,
    redirect: '/email/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/email/index'),
        name: '电子邮件',
        meta: { title: '电子邮件', icon: 'email', noCache: true }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: 'Profile', icon: 'user', noCache: true }
      }
    ]
  },
  {
    path: '/money',
    component: Layout,
    redirect: '/money/index',
    alwaysShow: true, // will always show the root menu
    name: 'moneyManage',
    meta: {
      title: '记账',
      icon: 'money'
    },
    children: [
      {
        path: 'incomeList',
        component: () => import('@/views/money/income/index'),
        name: 'pageIncome',
        meta: {
          title: '收入'
        }
      },
      {
        path: 'consumptionList',
        component: () => import('@/views/money/consumption/index'),
        name: 'pageConsumption',
        meta: {
          title: '消费'
        }
      }
    ]
  },
  {
    path: '/function',
    component: Layout,
    redirect: '/function/index',
    alwaysShow: true, // will always show the root menu
    name: 'function',
    meta: {
      title: '引导操作',
      icon: 'skill'
    },
    children: [
      {
        path: 'createConsumption',
        component: () => import('@/views/function/createConsumption'),
        name: 'CreateConsumption',
        meta: { title: '新增消费', noCache: true }
      },
      {
        path: 'createIncome',
        component: () => import('@/views/function/createIncome'),
        name: 'CreateIncome',
        meta: { title: '新增收入', noCache: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/userManage',
    component: Layout,
    redirect: '/user/manage',
    alwaysShow: true, // will always show the root menu
    name: 'userManage',
    meta: {
      title: '用户管理',
      icon: 'user',
      roles: ['adminExclusive', 'role:list', 'permission:list']
    },
    children: [
      {
        path: 'userList',
        component: () => import('@/views/user-manage/user/index'),
        name: 'PageUser',
        meta: {
          title: '用户列表',
          roles: ['adminExclusive', 'user:list']
        }
      },
      {
        path: 'permissionList',
        component: () => import('@/views/user-manage/permission/index'),
        name: 'PagePermission',
        meta: {
          title: '权限列表',
          roles: ['adminExclusive', 'permission:list']
        }
      },
      {
        path: 'role',
        component: () => import('@/views/user-manage/role/index'),
        name: 'RolePermission',
        meta: {
          title: '角色列表',
          roles: ['adminExclusive', 'role:list']
        }
      }
    ]
  },
  {
    path: '/article',
    component: Layout,
    redirect: '/article',
    children: [
      {
        path: 'index',
        component: () => import('@/views/article/index'),
        name: '文章列表',
        meta: {
          title: '文章列表',
          icon: 'documentation',
          roles: ['adminExclusive']
        }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
