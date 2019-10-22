import axios from 'axios'
import { getToken, removeToken } from '@/utils/auth'

export const Power = axios.create({
  baseURL: 'http://apollo.free.idcfengye.com',
  // baseURL: 'http://127.0.0.1:8080',
  withCredentials: false
})

export function request(method, url, data, then) {
  Power({
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
        Power({
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
