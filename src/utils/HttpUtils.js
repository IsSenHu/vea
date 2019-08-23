import axios from 'axios'

export const OperationManageInstance = axios.create({
  baseURL: '',
  withCredentials: false
})
