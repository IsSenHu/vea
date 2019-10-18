import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'
import { Power, request } from '@/utils/HttpUtils'
import { Connector } from '@/utils/WebSocketUtils'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  roles: [],
  selfSettings: {},
  justLogin: false
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_SELF_SETTINGS: (state, selfSettings) => {
    state.selfSettings = selfSettings
  },
  SET_JUST_LOGIN: (state, justLogin) => {
    state.justLogin = justLogin
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      Power({
        method: 'post',
        url: '/auth/login',
        data: {
          username: username,
          password: password
        }
      }).then(resp => {
        const respJson = resp.data
        const { code, data } = respJson
        if (code === 0) {
          commit('SET_TOKEN', data.token)
          commit('SET_JUST_LOGIN', true)
          setToken(data.token)
          localStorage.setItem('info', JSON.stringify(data.info))
          Connector.connect()
          resolve()
        } else {
          reject(respJson.error)
        }
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      const info = JSON.parse(localStorage.getItem('info'))
      if (info) {
        const { roles, name, avatar, introduction, selfConfig } = info
        // roles must be a non-empty array
        if (!roles) {
          reject('用户必须有角色')
        }
        commit('SET_ROLES', roles)
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_INTRODUCTION', introduction)
        commit('SET_SELF_SETTINGS', selfConfig)
        resolve(info)
      } else {
        reject('Verification failed, please Login again.')
      }
    })
  },

  // user logout
  logout({ commit }) {
    return new Promise((resolve, reject) => {
      request('post', '/auth/logout', null, resp => {
        const respJson = resp.data
        const { code } = respJson
        if (code === 0) {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          commit('SET_NAME', '')
          commit('SET_AVATAR', '')
          commit('SET_INTRODUCTION', '')
          commit('SET_JUST_LOGIN', false)
          commit('SET_SELF_SETTINGS', {})
          Connector.disconnect()
          removeToken()
          resetRouter()
          resolve()
        } else {
          reject(respJson.error)
        }
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  changeRoles({ commit, dispatch }, role) {
    return new Promise(async resolve => {
      const token = role + '-token'

      commit('SET_TOKEN', token)
      setToken(token)

      const { roles } = await dispatch('getInfo')

      resetRouter()

      // generate accessible routes map based on roles
      const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })

      // dynamically add accessible routes
      router.addRoutes(accessRoutes)

      // reset visited views and cached views
      dispatch('tagsView/delAllViews', null, { root: true })

      resolve()
    })
  },
  // justLogin
  justLogin({ commit }, justLogin) {
    commit('SET_JUST_LOGIN', justLogin)
  },
  // selfSettings
  selfSettings({ commit }, selfSettings) {
    commit('SET_SELF_SETTINGS', selfSettings)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
