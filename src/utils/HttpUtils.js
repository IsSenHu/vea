import axios from 'axios'
import { getToken } from '@/utils/auth'

export const Power = axios.create({
  baseURL: 'http://127.0.0.1:8080',
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
