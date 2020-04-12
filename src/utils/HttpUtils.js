import axios from 'axios'
import { getToken, removeToken } from '@/utils/auth'

export const Auth = axios.create({
  // baseURL: 'http://apollo.free.idcfengye.com',
  baseURL: 'http://118.24.38.46:7777/gateway/auth',
  withCredentials: false
})

export const Blog = axios.create({
  baseURL: 'http://118.24.38.46:7777/gateway/blog-admin',
  withCredentials: false
})

export function requestByClient(client, method, url, data, then) {
  client({
    headers: {
      'Authorization': getToken()
    },
    method: method,
    url: url,
    data: data
  })
    .then(then)
    .catch(error => {
      console.error(error)
    })
}

export function request(method, url, data, then) {
  Auth({
    headers: {
      'Authorization': getToken()
    },
    method: method,
    url: url,
    data: data
  })
    .then(then)
    .catch(error => {
      console.error(error)
      if (error.toString() === 'Error: Network Error') {
        Auth({
          headers: {
            'Authorization': getToken()
          },
          method: 'post',
          url: '/auth/check'
        })
          .then(resp => {
            const respJson = resp.data
            const { code, data } = respJson
            if (code === 0 && data) {
              removeToken()
              location.href = '/#/login'
            }
          })
          .catch(error => {
            console.error(error)
            removeToken()
            location.href = '/#/login'
          })
      }
    })
}
// this.$store.getters
