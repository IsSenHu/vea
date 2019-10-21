<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-input v-model="createConsumptionData" />
      <br><br>
      <el-button type="primary" @click="createConsumption">
        新增消费记录
      </el-button>
    </el-card>
  </div>
</template>
<script>
import { Connector } from '@/utils/WebSocketUtils'
export default {
  name: 'WebSocket',
  data() {
    return {
      createConsumptionData: ''
    }
  },
  methods: {
    createConsumption() {
      // 时间|货币|花费|描述......
      const fields = this.createConsumptionData.split('|')
      const items = []
      for (let i = 2; i < fields.length;) {
        if (i % 2 === 0) {
          items[i / 2 - 1] = {
            money: fields[i],
            description: fields[i + 1]
          }
          i += 2
          console.log(items)
        }
      }
      const data = {
        time: fields[0],
        currency: fields[1],
        items: items
      }
      Connector.subscribes.createConsumption.send(JSON.stringify(data))
    }
  }
}
</script>

