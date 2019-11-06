<template>
  <div class="app-container">
    <el-card class="box-card-function">
      <h4 style="color: red">提示:输入 (finish) 或者 (cancel) 结束此次会话流程</h4>
      <p v-for="{ id, message, self } in messages" :key="id" :class="self ? 'self' : 'system'">
        {{ message }}
      </p>
    </el-card>
    <el-input v-model="param" @keyup.enter.native="commitParam" />
  </div>
</template>
<script>
import { Connector } from '@/utils/WebSocketUtils'
export default {
  name: 'CreateIncome',
  data() {
    return {
      param: '',
      dialogVisible: false,
      nextCommand: 'SET_INCOME',
      idGen: 0,
      messages: [
        {
          id: 0,
          message: '😊 请输入金额 >>>',
          self: false
        }
      ]
    }
  },
  created() {
    Connector.subscribes.createIncome.realCallback = msg => {
      const { body } = msg
      const nextCommand = JSON.parse(body).data
      this.param = ''
      if (nextCommand === 'SET_CURRENCY') {
        this.messages.push({
          id: ++this.idGen,
          message: '😊 请选择货币类型 (1=人民币) >>>',
          self: false
        })
        this.nextCommand = nextCommand
      } else if (nextCommand === 'SET_INCOME') {
        this.messages.push({
          id: ++this.idGen,
          message: '😊 请输入金额 >>>',
          self: false
        })
        this.nextCommand = nextCommand
      } else if (nextCommand === 'SET_DESC') {
        this.messages.push({
          id: ++this.idGen,
          message: '😊 请输入收入说明 >>>',
          self: false
        })
        this.nextCommand = nextCommand
      } else if (nextCommand === 'SET_TIME') {
        this.messages.push({
          id: ++this.idGen,
          message: '😊 请输入收入日期 >>>',
          self: false
        })
        this.nextCommand = nextCommand
      } else if (nextCommand === 'SET_CHANNEL') {
        this.messages.push({
          id: ++this.idGen,
          message: '😊 请输入收入渠道(1=工资、2=手机、3=其他、4=理财，5=红包) >>>',
          self: false
        })
        this.nextCommand = nextCommand
      } else if (nextCommand === 'CANCEL') {
        console.log('cancel')
        this.messages.push({
          id: ++this.idGen,
          message: '😊 取消本次操作 >>>',
          self: false
        })
        this.messages.push({
          id: ++this.idGen,
          message: '😊 请输入金额 >>>',
          self: false
        })
        this.nextCommand = 'SET_INCOME'
      } else if (nextCommand === 'FINISH') {
        this.messages.push({
          id: ++this.idGen,
          message: '😊 新增收入请求已生成完毕，输入finish确认 >>>',
          self: false
        })
        this.nextCommand = 'SET_INCOME'
      }
    }
  },
  methods: {
    commitParam() {
      this.messages.push({
        id: ++this.idGen,
        message: '<<< ' + this.param + ' ',
        self: true
      })
      if (this.param === 'cancel') {
        Connector.subscribes.createIncome.send(JSON.stringify({
          command: 'CANCEL',
          param: null
        }))
      } else if (this.param === 'finish') {
        Connector.subscribes.createIncome.send(JSON.stringify({
          command: 'FINISH',
          param: null
        }))
      } else if (this.nextCommand === 'SET_CURRENCY') {
        if (this.param === '1') {
          this.param = 'REN_MIN_BI'
        }
        Connector.subscribes.createIncome.send(JSON.stringify({
          command: this.nextCommand,
          param: this.param
        }))
      } else {
        Connector.subscribes.createIncome.send(JSON.stringify({
          command: this.nextCommand,
          param: this.param
        }))
      }
    }
  }
}
</script>
<style>
  .box-card-function {
    height: 500px;
    overflow-y: scroll;
  }
  .self {
    text-align: right;
    color: red;
  }
  .system {
    text-align: left;
    color: blue;
  }
</style>

