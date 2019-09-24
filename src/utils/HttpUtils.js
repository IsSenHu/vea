import axios from 'axios'
import { getToken } from '@/utils/auth'

export const Power = axios.create({
  baseURL: 'http://127.0.0.1:8080',
  withCredentials: false
})

export function request(method, url, data, then, error) {
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
