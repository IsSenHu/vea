import axios from 'axios'

export const Power = axios.create({
  baseURL: 'http://10.10.10.158:8080',
  withCredentials: false
})
