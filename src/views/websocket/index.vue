<template>
  <div>
    nihao
  </div>
</template>
<script>
import SockJS from 'sockjs-client'
import { getToken } from '@/utils/auth'
import Stomp from 'stompjs'
export default {
  name: 'WebSocket',
  data() {
    return {
      stompClient: null,
      timer: null,
      socket: null,
      headers: {
        authorization: getToken()
      }
    }
  },
  mounted() {
    this.initWebSocket()
  },
  beforeDestroy: function() {
    // 页面离开时断开连接,清除定时器
    this.disconnect()
    clearInterval(this.timer)
  },
  methods: {
    initWebSocket() {
      this.connection()
      setTimeout(() => {
        // this.stompClient.disconnect(() => {
        //   console.log('断开连接')
        // }, this.headers)
        // this.socket.close()
      }, 2000)
    },
    connection() {
      // 建立连接对象
      this.socket = new SockJS('http://127.0.0.1:8081/pushServer')
      // 获取STOMP子协议的客户端对象
      this.stompClient = Stomp.over(this.socket)
      // 向服务器发起websocket连接
      this.stompClient.connect(this.headers, () => {
        this.stompClient.subscribe('/topic/connected', msg => {}, this.headers)
        this.stompClient.subscribe('/user/queue/position-updates', msg => {}, this.headers)
        this.stompClient.subscribe('/user/queue/errors', msg => {}, this.headers)
        this.stompClient.send('/app/test', this.headers, JSON.stringify({}))
      }, err => {
        // 连接发生错误时的处理函数
        console.log('失败')
        console.log(err)
      })
    },
    disconnect() {
      if (this.stompClient) {
        this.stompClient.disconnect()
      }
    }
  }
}
</script>
