import SockJS from 'sockjs-client'
import { getToken } from '@/utils/auth'
import Stomp from 'stompjs'

let stompClient = null
let socket = null
const headers = {
  authorization: ''
}

const subscribes = {
  test: {
    queue: '/user/queue/router',
    callback(msg) {
      if (msg.command === 'MESSAGE') {
        const { body } = msg
        console.log(body)
      }
    },
    send(message) {
      stompClient.send('/app/test', headers, message)
    }
  }
}

export const Connector = {
  connect() {
    // 设置头信息
    headers.authorization = getToken()
    // 建立连接对象
    socket = new SockJS('http://127.0.0.1:8101/pushServer')
    // 获取STOMP子协议的客户端对象
    stompClient = Stomp.over(socket)
    // 向服务器发起websocket连接
    stompClient.connect(headers, () => {
      for (const key in subscribes) {
        const subscribe = subscribes[key]
        stompClient.subscribe(subscribe.queue, subscribe.callback, headers)
      }
    }, err => {
      // 连接发生错误时的处理函数
      console.log('连接被远程终止')
      console.log(err)
    })
  },
  disconnect() {
    if (stompClient) {
      stompClient.disconnect(() => {
        console.log('断开连接')
        stompClient = null
        socket.close()
        socket = null
        headers.authorization = ''
      }, headers)
    }
  },
  subscribes: subscribes
}
