import SockJS from 'sockjs-client'
import { getToken } from '@/utils/auth'
import Stomp from 'stompjs'

let stompClient = null
let socket = null

const subscribes = {
  createConsumption: {
    queue: '/user/queue/router',
    callback(msg) {
      if (msg.command === 'MESSAGE') {
        const { body } = msg
        alert(body)
      }
    },
    send(message) {
      const headers = {
        authorization: getToken()
      }
      if (stompClient == null || socket == null) {
        Connector.connect(() => {
          stompClient.send('/app/consumption', headers, message)
        })
      } else {
        stompClient.send('/app/consumption', headers, message)
      }
    },
    subId: null
  }
}

export const Connector = {
  connect(callback) {
    // 建立连接对象
    socket = new SockJS('http://apollo.free.idcfengye.com/socket')
    // socket = new SockJS('http://127.0.0.1:8101/pushServer')

    // 获取STOMP子协议的客户端对象
    stompClient = Stomp.over(socket)
    // 向服务器发起websocket连接
    const headers = {
      authorization: getToken()
    }
    stompClient.connect(headers, () => {
      console.log('连接成功')
      for (const key in subscribes) {
        const subscribe = subscribes[key]
        stompClient.subscribe(subscribe.queue, subscribe.callback, headers)
        subscribe.subId = headers.id
        if (callback) {
          callback()
        }
      }
    }, err => {
      // 连接发生错误时的处理函数
      console.log('连接被远程终止，即将重试')
      console.log(err)
      setTimeout(() => {
        Connector.connect()
      }, 2000)
    })
  },
  disconnect() {
    if (stompClient) {
      const headers = {
        authorization: getToken()
      }
      console.log('取消订阅')
      for (const key in subscribes) {
        const subscribe = subscribes[key]
        stompClient.unsubscribe(subscribe.subId, headers)
      }
      console.log('断开连接')
      stompClient.disconnect(() => {
        socket.close()
        socket = null
        stompClient = null
      }, headers)
    }
  },
  subscribes: subscribes
}
