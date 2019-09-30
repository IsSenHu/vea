import axios from 'axios'
import { getToken, removeToken } from '@/utils/auth'

export const Power = axios.create({
  baseURL: 'http://118.24.38.46:8080',
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
        request('post', '/auth/check', null, resp => {
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
              if (code === 0 && !data) {
                removeToken()
                location.href = '/login'
              }
            })
            .catch(error => {
              console.error(error)
              removeToken()
              location.href = '/login'
            })
        })
      }
    })
}

export function refreshSettings(time) {
  console.log(time)
  request('get', '/api/config/findAll', null, resp => {
    const respJson = resp.data
    const { code } = respJson
    const { data } = respJson
    if (code === 0) {
      localStorage.setItem('settings', JSON.stringify(data))
    }
  })
}

export function getSettings() {
  return JSON.parse(localStorage.getItem('settings'))
}
