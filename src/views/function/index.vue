<template>
  <div class="app-container">
    <el-card>
      <br><br>
      <el-button type="primary" @click="createConsumption">
        新增消费记录
      </el-button>
    </el-card>
    <el-dialog :visible.sync="dialogVisible">
      <el-card class="box-card">
        <h4 style="color: red">提示:输入 (finish) 或者 (cancel) 结束此次会话流程</h4>
        <p v-for="{ id, message, self } in messages" :key="id" :class="self ? 'self' : 'system'">
          {{ message }}
        </p>
      </el-card>
      <el-input v-model="createConsumptionData" @keyup.enter.native="commitCreateConsumption" />
    </el-dialog>
  </div>
</template>
<script>
import { Connector } from '@/utils/WebSocketUtils'
export default {
  name: 'WebSocket',
  data() {
    return {
      createConsumptionData: '',
      dialogVisible: false,
      nextConsumptionCommand: 'SET_TIME',
      idGen: 0,
      messages: [
        {
          id: 0,
          message: '😊 请输入日期>>>>>>',
          self: false
        }
      ]
    }
  },
  created() {
    Connector.subscribes.createConsumption.realCallback = msg => {
      const { body } = msg
      const nextCommand = JSON.parse(body).data
      this.createConsumptionData = ''
      if (nextCommand === 'SET_CURRENCY') {
        this.messages.push({
          id: ++this.idGen,
          message: '😊 请选择货币类型 (1=人民币)>>>>>>',
          self: false
        })
        this.nextConsumptionCommand = nextCommand
      } else if (nextCommand === 'SET_MONEY') {
        this.messages.push({
          id: ++this.idGen,
          message: '😊 请输入消费金额>>>>>>',
          self: false
        })
        this.nextConsumptionCommand = nextCommand
      } else if (nextCommand === 'SET_DESC') {
        this.messages.push({
          id: ++this.idGen,
          message: '😊 请输入消费说明>>>>>>',
          self: false
        })
        this.nextConsumptionCommand = nextCommand
      } else if (nextCommand === 'SET_TYPE') {
        this.messages.push({
          id: ++this.idGen,
          message: '😊 请输入消费类型>>>>>> (1=食物、2=交通出行、3=虚拟充值、4=社交、5=旅行/娱乐、6=服装穿戴配饰箱包、7=治病医疗、8=还款、9=超时生活用品)',
          self: false
        })
        this.nextConsumptionCommand = nextCommand
      } else if (nextCommand === 'CANCEL') {
        console.log('cancel')
        this.messages.push({
          id: ++this.idGen,
          message: '😊 取消本次操作>>>>>>',
          self: false
        })
        this.messages.push({
          id: ++this.idGen,
          message: '😊 请输入日期>>>>>>',
          self: false
        })
        this.nextConsumptionCommand = 'SET_TIME'
      } else if (nextCommand === 'FINISH') {
        this.messages.push({
          id: ++this.idGen,
          message: '😊 新增消费请求已生成完毕>>>>>>',
          self: false
        })
        this.messages.push({
          id: ++this.idGen,
          message: '😊 请输入日期>>>>>>',
          self: false
        })
        this.nextConsumptionCommand = 'SET_TIME'
      }
    }
  },
  methods: {
    createConsumption() {
      this.dialogVisible = true
    },
    commitCreateConsumption() {
      this.messages.push({
        id: ++this.idGen,
        message: '<<<<<<' + this.createConsumptionData + ' ',
        self: true
      })
      if (this.createConsumptionData === 'cancel') {
        Connector.subscribes.createConsumption.send(JSON.stringify({
          command: 'CANCEL',
          param: null
        }))
      } else if (this.createConsumptionData === 'finish') {
        Connector.subscribes.createConsumption.send(JSON.stringify({
          command: 'FINISH',
          param: null
        }))
      } else if (this.nextConsumptionCommand === 'SET_CURRENCY') {
        if (this.createConsumptionData === '1') {
          this.createConsumptionData = 'REN_MIN_BI'
        }
        Connector.subscribes.createConsumption.send(JSON.stringify({
          command: this.nextConsumptionCommand,
          param: this.createConsumptionData
        }))
      } else {
        Connector.subscribes.createConsumption.send(JSON.stringify({
          command: this.nextConsumptionCommand,
          param: this.createConsumptionData
        }))
      }
    }
  }
}
</script>
<style>
  .box-card {
    height: 500px;
    overflow: scroll;
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

