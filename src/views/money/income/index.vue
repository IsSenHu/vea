<template>
  <div class="app-container">
    <div class="filter-container">
      <el-date-picker
        v-model="listQuery.customParams.start"
        type="date"
        placeholder="开始日期"
        class="filter-item"
        value-format="yyyy-MM-dd"
        @keyup.enter.native="handleFilter"
      />
      <el-date-picker
        v-model="listQuery.customParams.end"
        type="date"
        placeholder="结束日期"
        class="filter-item"
        value-format="yyyy-MM-dd"
        @keyup.enter.native="handleFilter"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" type="primary" @click="handleAddIncome">新增收入</el-button>
      <el-button type="success" class="filter-item" @click="statistics">简单统计</el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" align="center" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="收入" prop="income" sortable="custom" align="center" :class-name="getSortClass('income')">
        <template slot-scope="scope">
          <span>{{ scope.row.income }}</span>
        </template>
      </el-table-column>
      <el-table-column label="收入时间" prop="time" sortable="custom" align="center" :class-name="getSortClass('time')">
        <template slot-scope="scope">
          <span>{{ scope.row.time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="说明" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column label="收入渠道" align="center">
        <template slot-scope="scope">
          <span>{{ showChannelName(scope.row.channel) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="货币单位" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.currency }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.number" @pagination="getList" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑收入':'新增收入'">
      <el-form :model="income" label-width="80px" label-position="left">
        <el-form-item label="收入">
          <el-input v-model="income.income" type="number" placeholder="收入" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input
            v-model="income.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="说明"
          />
        </el-form-item>
        <el-form-item label="收入时间">
          <el-date-picker
            v-model="income.time"
            align="right"
            type="date"
            placeholder="选择日期"
            :picker-options="pickerOptions"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item label="货币类型">
          <el-select v-model="income.currency" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="收入渠道">
          <el-select v-model="income.channel" placeholder="请选择">
            <el-option
              v-for="i in incomeChannels"
              :key="i.code"
              :label="i.name"
              :value="i.code"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmIncome">提交</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="simpleStatisticsDialogVisible" title="简单统计">
      <el-card class="box-card">
        <p class="text item">
          <el-tag>😊 合计: {{ totalByStatistics }}</el-tag>
        </p>
        <p class="text item">
          <el-tag>👇 分类</el-tag>
        </p>
        <p v-for="o in byChannel" :key="o.channel" class="text item">
          <el-tag type="info">{{ o.channel + ": " + o.total }}</el-tag>
        </p>
      </el-card>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import { request } from '@/utils/HttpUtils'

const defaultIncome = {
  id: '',
  income: 0,
  time: null,
  description: '',
  currency: null,
  channel: null
}

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
  },
  data() {
    return {
      simpleStatisticsDialogVisible: false,
      options: [{
        value: 'REN_MIN_BI',
        label: '人民币'
      }],
      incomeChannels: this.$store.getters.businessSettings.incomeChannels ? this.$store.getters.businessSettings.incomeChannels : [],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        },
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', new Date())
          }
        }, {
          text: '昨天',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }, {
          text: '一周前',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', date)
          }
        }]
      },
      income: Object.assign({}, defaultIncome),
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        number: 20,
        sort: 'time',
        asc: true,
        customParams: {
          start: null,
          end: null
        }
      },
      serviceRoutes: [],
      routes: [],
      permissions: [],
      apis: [],
      dialogType: 'new',
      dialogVisible: false,
      dialogFormVisible: false,
      dialogStatus: '',
      dialogPvVisible: false,
      totalByStatistics: '',
      byChannel: []
    }
  },
  computed: {
  },
  created() {
    this.getList()
  },
  methods: {
    showChannelName(code) {
      const businessSettings = this.$store.getters.businessSettings
      if (businessSettings && code) {
        const { incomeChannels } = businessSettings
        if (incomeChannels) {
          for (let i = 0; i < incomeChannels.length; i++) {
            const incomeChannel = incomeChannels[i]
            if (incomeChannel.code === code) {
              return incomeChannel.name
            }
          }
        }
      }
      return null
    },
    statistics() {
      request('post', '/api/income/statistics/REN_MIN_BI', this.listQuery.customParams, resp => {
        const respJson = resp.data
        const { code, data } = respJson
        if (code === 0) {
          const { total, byChannel } = data
          this.totalByStatistics = total
          this.byChannel = []
          this.$store.getters.businessSettings.incomeChannels.forEach(channel => {
            if (byChannel[channel.code]) {
              this.byChannel.push({
                channel: channel.name,
                total: byChannel[channel.code]
              })
            }
          })
          this.simpleStatisticsDialogVisible = true
        }
      })
    },
    getList() {
      this.listLoading = true
      request('post', '/api/income/page', this.listQuery, resp => {
        const respJson = resp.data
        const { code } = respJson
        if (code === 0) {
          this.list = respJson.data.items
          this.total = respJson.data.total
        }
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'time') {
        this.sortByTime(order)
      } else if (prop === 'income') {
        this.sortByIncome(order)
      }
    },
    sortByIncome(order) {
      if (order === 'ascending') {
        this.listQuery.sort = 'income'
        this.listQuery.asc = true
      } else {
        this.listQuery.sort = 'income'
        this.listQuery.asc = false
      }
      this.handleFilter()
    },
    sortByTime(order) {
      if (order === 'ascending') {
        this.listQuery.sort = 'time'
        this.listQuery.asc = true
      } else {
        this.listQuery.sort = 'time'
        this.listQuery.asc = false
      }
      this.handleFilter()
    },
    getSortClass: function(filed) {
      const asc = this.listQuery.asc
      const sort = this.listQuery.sort
      if (sort === filed) {
        return asc ? 'ascending' : 'descending'
      } else {
        return ''
      }
    },
    addShow() {
      this.income = Object.assign({}, defaultIncome)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleAddIncome() {
      this.addShow()
    },
    editShow(id) {
      request('get', '/api/income/' + id, null, resp => {
        const respJson = resp.data
        const { code } = respJson
        if (code === 0) {
          this.dialogType = 'edit'
          this.dialogVisible = true
          this.income.id = respJson.data.id
          this.income.description = respJson.data.description
          this.income.currency = respJson.data.currency
          this.income.time = respJson.data.time
          this.income.income = respJson.data.income
          this.income.channel = respJson.data.channel
        }
      })
    },
    handleEdit(scope) {
      this.editShow(scope.row.id)
    },
    handleDelete({ row }) {
      this.$confirm('确认要删除该收入?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          request('delete', '/api/income/' + row.id, null, resp => {
            const respJson = resp.data
            const { code } = respJson
            if (code === 0) {
              const { income, description, time } = respJson.data
              this.$notify({
                title: '成功',
                dangerouslyUseHTMLString: true,
                message: `
            <div>说明: ${description}</div>
            <div>收入: ${income}</div>
            <div>时间: ${time}</div>
          `,
                type: 'success'
              })
              this.getList()
            }
          })
        })
        .catch(err => { console.error(err) })
    },
    showSuccess(data) {
      this.dialogVisible = false
      const { income, description, time } = data
      this.$notify({
        title: '成功',
        dangerouslyUseHTMLString: true,
        message: `
            <div>说明: ${description}</div>
            <div>收入: ${income}</div>
            <div>时间: ${time}</div>
          `,
        type: 'success'
      })
    },
    async confirmIncome() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        request('post', '/api/income', this.income, resp => {
          const respJson = resp.data
          const { code } = respJson
          if (code === 0) {
            this.showSuccess(respJson.data)
            this.getList()
          }
        })
      } else {
        request('put', '/api/income', this.income, resp => {
          const respJson = resp.data
          const { code } = respJson
          if (code === 0) {
            this.showSuccess(respJson.data)
            this.getList()
          }
        })
      }
    }
  }
}
</script>
