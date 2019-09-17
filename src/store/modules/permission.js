import { Power } from '@/utils/HttpUtils'
import { getToken } from '@/utils/auth'
import Layout from '@/layout'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = routes
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      let accessedRoutes = []
      let constantRoutes = []
      Power({
        headers: {
          'Authorization': getToken()
        },
        method: 'get',
        url: '/api/route'
      }).then(resp => {
        const respData = resp.data
        if (respData.code === 0) {
          const data = respData.data
          const asyncRoutes = data.asyncRoutes
          constantRoutes = data.constantRoutes
          asyncRoutes.forEach(function(item, index) {
            if (item.component === 'Layout') {
              item.component = Layout
            }
          })
          constantRoutes.forEach(function(item, index) {
            if (item.component === 'Layout') {
              item.component = Layout
            }
          })
          accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
          commit('SET_ROUTES', constantRoutes.concat(accessedRoutes))
        }
      }).catch(error => {
        console.error(error)
      })
      resolve(accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
