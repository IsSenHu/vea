<template>
  <div>
    nihao
  </div>
</template>
<script>
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
export default {
  name: 'WebSocket',
  data() {
    return {
      stompClient: null,
      timer: null
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
      const that = this
      // 断开重连机制,尝试发送消息,捕获异常发生时重连
      this.timer = setInterval(() => {
        try {
          that.stompClient.send('/app/hello', {}, JSON.stringify({
            name: '胡森',
            content: '你好'
          }))
        } catch (err) {
          console.log('断线了: ' + err)
          that.connection()
        }
      }, 5000)
    },
    connection() {
      // 建立连接对象
      const socket = new SockJS('http://127.0.0.1:8081/pushServer')
      // 获取STOMP子协议的客户端对象
      this.stompClient = Stomp.over(socket)
      // 定义客户端的认证信息,按需求配置
      const headers = {
      }
      // 向服务器发起websocket连接
      this.stompClient.connect(headers, () => {
        this.stompClient.subscribe('/topic/greetings', msg => {
          console.log('广播成功')
          // msg.body存放的是服务端发送给我们的信息
          console.log(msg)
        }, headers)
        this.stompClient.send('/app/hello', headers, JSON.stringify({
          name: '胡森1',
          content: '你好'
        }))
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
