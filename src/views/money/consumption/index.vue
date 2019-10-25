<template>
  <div class="app-container">
    <div class="filter-container">
      <el-date-picker
        v-model="listQuery.customParams.start"
        type="datetime"
        placeholder="开始时间"
        class="filter-item"
        value-format="yyyy-MM-dd HH:mm:ss"
        @keyup.enter.native="handleFilter"
      />
      <el-date-picker
        v-model="listQuery.customParams.end"
        type="datetime"
        placeholder="结束时间"
        class="filter-item"
        value-format="yyyy-MM-dd HH:mm:ss"
        @keyup.enter.native="handleFilter"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" type="primary" @click="handleAddConsumption">新增消费</el-button>
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
      <el-table-column label="总消费" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="showItems(row)">{{ row.total }}</span>
        </template>
      </el-table-column>
      <el-table-column label="消费时间" prop="time" sortable="custom" align="center" :class-name="getSortClass('time')">
        <template slot-scope="scope">
          <span>{{ scope.row.time }}</span>
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
    <el-dialog :visible.sync="dialogVisibleForItems" title="消费明细" :before-close="handleClose">
      <div class="filter-container">
        <el-button class="filter-item" type="primary" @click="handleAddItem">新增明细</el-button>
      </div>
      <el-table
        :key="tableKeyForItems"
        v-loading="listLoadingForItems"
        :data="listForItems"
        border
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="消费金额" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.money }}</span>
          </template>
        </el-table-column>
        <el-table-column label="消费说明" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.description }}</span>
          </template>
        </el-table-column>
        <el-table-column label="货币单位" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.currency }}</span>
          </template>
        </el-table-column>
        <el-table-column label="消费类型" align="center">
          <template slot-scope="scope">
            <span>{{ showTypeName(scope.row.type) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleEditItem(scope)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDeleteItem(scope)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisibleForItem" :title="dialogTypeForItem==='edit'?'编辑明细':'新增明细'">
      <el-form :model="consumption" label-width="80px" label-position="left">
        <el-form-item label="金额">
          <el-input v-model="item.money" type="number" placeholder="收入" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input
            v-model="item.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="说明"
          />
        </el-form-item>
        <el-form-item label="消费类型">
          <el-select v-model="item.type" placeholder="请选择">
            <el-option
              v-for="i in consumptionTypes"
              :key="i.code"
              :label="i.name"
              :value="i.code"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisibleForItem=false">取消</el-button>
        <el-button type="primary" @click="confirmItem">提交</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑消费':'新增消费'">
      <el-form :model="consumption" label-width="80px" label-position="left">
        <el-form-item label="消费时间">
          <el-date-picker
            v-model="consumption.time"
            align="right"
            type="datetime"
            placeholder="选择时间"
            :picker-options="pickerOptions"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="货币类型">
          <el-select v-model="consumption.currency" placeholder="请选择">
            <el-option
              v-for="i in options"
              :key="i.value"
              :label="i.label"
              :value="i.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmConsumption">提交</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="simpleStatisticsDialogVisible" title="简单统计">
      <el-card class="box-card">
        <p class="text item">
          <el-tag>😚 总天数: {{ totalDay }}</el-tag>
        </p>
        <p class="text item">
          <el-tag>😊 合计: {{ totalByStatistics }}</el-tag>
        </p>
        <p class="text item">
          <el-tag>😨 平均每天: {{ avgPerDay }}</el-tag>
        </p>
        <p class="text item">
          <el-tag>👇 分类</el-tag>
        </p>
        <p v-for="o in byType" :key="o.type" class="text item">
          <el-tag type="info">{{ o.type + ": " + o.total }}</el-tag>
        </p>
      </el-card>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import { request } from '@/utils/HttpUtils'

const defaultConsumption = {
  id: '',
  time: null,
  currency: null,
  items: []
}

const defaultItem = {
  id: null,
  consumptionId: null,
  money: 0,
  description: '',
  type: null
}

const defaultItems = []

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
  },
  data() {
    return {
      simpleStatisticsDialogVisible: false,
      totalDay: null,
      totalByStatistics: '',
      avgPerDay: '',
      byType: {},
      options: [{
        value: 'REN_MIN_BI',
        label: '人民币'
      }],
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
      consumption: Object.assign({}, defaultConsumption),
      item: Object.assign({}, defaultItem),
      tableKey: 0,
      tableKeyForItems: 0,
      listForItems: null,
      list: null,
      total: 0,
      listLoading: true,
      listLoadingForItems: true,
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
      dialogTypeForItem: 'new',
      dialogVisible: false,
      dialogVisibleForItem: false,
      dialogVisibleForItems: false,
      dialogFormVisible: false,
      dialogStatus: '',
      dialogPvVisible: false,
      ifEdited: false,
      consumptionTypes: this.$store.getters.businessSettings.consumptionTypes ? this.$store.getters.businessSettings.consumptionTypes : []
    }
  },
  computed: {
  },
  created() {
    this.getList()
  },
  methods: {
    showTypeName(code) {
      const businessSettings = this.$store.getters.businessSettings
      if (businessSettings && code) {
        const { consumptionTypes } = businessSettings
        if (consumptionTypes) {
          for (let i = 0; i < consumptionTypes.length; i++) {
            const consumptionType = consumptionTypes[i]
            if (consumptionType.code === code) {
              return consumptionType.name
            }
          }
        }
      }
      return null
    },
    statistics() {
      request('post', '/api/consumption/statistics/REN_MIN_BI', this.listQuery.customParams, resp => {
        const respJson = resp.data
        const { code, data } = respJson
        if (code === 0) {
          const { totalDay, total, avgPerDay, byType } = data
          this.totalDay = totalDay
          this.totalByStatistics = total
          this.avgPerDay = avgPerDay
          this.byType = []
          this.$store.getters.businessSettings.consumptionTypes.forEach(type => {
            if (byType[type.code]) {
              this.byType.push({
                type: type.name,
                total: byType[type.code]
              })
            }
          })
          this.simpleStatisticsDialogVisible = true
        }
      })
    },
    handleClose() {
      this.dialogVisibleForItems = false
      if (this.ifEdited) {
        this.getList()
      }
      this.ifEdited = false
    },
    showItems(row) {
      this.listLoadingForItems = true
      this.listForItems = Object.assign({}, defaultItems)
      this.listForItems = row.items
      this.listLoadingForItems = false
      this.dialogVisibleForItems = true
      defaultItem.consumptionId = row.id
    },
    handleAddItem() {
      this.item = Object.assign({}, defaultItem)
      this.dialogTypeForItem = 'new'
      this.dialogVisibleForItem = true
    },
    getList() {
      this.listLoading = true
      request('post', '/api/consumption/page', this.listQuery, resp => {
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
      }
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
      this.consumption = Object.assign({}, defaultConsumption)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleAddConsumption() {
      this.addShow()
    },
    editShow(id) {
      request('get', '/api/consumption/' + id, null, resp => {
        const respJson = resp.data
        const { code } = respJson
        if (code === 0) {
          this.dialogType = 'edit'
          this.dialogVisible = true
          this.consumption.id = respJson.data.id
          this.consumption.currency = respJson.data.currency
          this.consumption.time = respJson.data.time
        }
      })
    },
    handleEdit(scope) {
      this.editShow(scope.row.id)
    },
    handleEditItem(scope) {
      request('get', '/api/consumption/item/' + scope.row.id, null, resp => {
        const respJson = resp.data
        const { code } = respJson
        if (code === 0) {
          this.item.id = respJson.data.id
          this.item.money = respJson.data.money
          this.item.description = respJson.data.description
          this.item.type = respJson.data.type
          this.dialogTypeForItem = 'edit'
          this.dialogVisibleForItem = true
        }
      })
    },
    handleDeleteItem({ row }) {
      this.$confirm('确认要删除该消费明细?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          request('delete', '/api/consumption/item/' + row.id, null, resp => {
            const respJson = resp.data
            const { code } = respJson
            if (code === 0) {
              this.showSuccessForItem(respJson.data)
              this.listLoadingForItems = true
              this.listForItems = this.listForItems.filter(item => item.id !== respJson.data.id)
              this.listLoadingForItems = false
              this.ifEdited = true
            }
          })
        })
    },
    handleDelete({ row }) {
      this.$confirm('确认要删除该消费?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          request('delete', '/api/consumption/' + row.id, null, resp => {
            const respJson = resp.data
            const { code } = respJson
            if (code === 0) {
              const { time } = respJson.data
              this.$notify({
                title: '成功',
                dangerouslyUseHTMLString: true,
                message: `
            <div>消费时间: ${time}</div>
          `,
                type: 'success'
              })
              this.getList()
            }
          })
        })
    },
    showSuccess() {
      this.dialogVisible = false
      const { time } = this.consumption
      this.$notify({
        title: '成功',
        dangerouslyUseHTMLString: true,
        message: `
            <div>消费时间: ${time}</div>
          `,
        type: 'success'
      })
    },
    showSuccessForItem(data) {
      this.dialogVisibleForItem = false
      const { money, description } = data
      this.$notify({
        title: '成功',
        dangerouslyUseHTMLString: true,
        message: `
            <div>消费金额: ${money}</div>
            <div>消费说明: ${description}</div>
          `,
        type: 'success'
      })
    },
    async confirmConsumption() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        request('post', '/api/consumption', this.consumption, resp => {
          const respJson = resp.data
          const { code } = respJson
          if (code === 0) {
            this.showSuccess()
            this.getList()
          }
        })
      } else {
        request('put', '/api/consumption', this.consumption, resp => {
          const respJson = resp.data
          const { code } = respJson
          if (code === 0) {
            this.showSuccess()
            this.getList()
          }
        })
      }
    },
    async confirmItem() {
      const isEdit = this.dialogTypeForItem === 'edit'
      if (isEdit) {
        request('post', '/api/consumption/item', this.item, resp => {
          const respJson = resp.data
          const { code } = respJson
          if (code === 0) {
            this.listLoadingForItems = true
            this.listForItems = this.listForItems.filter(item => item.id !== respJson.data.id)
            this.listForItems.push(respJson.data)
            this.listLoadingForItems = false
            this.showSuccessForItem(respJson.data)
            this.ifEdited = true
          }
        })
      } else {
        request('put', '/api/consumption/item', this.item, resp => {
          const respJson = resp.data
          const { code } = respJson
          if (code === 0) {
            this.listLoadingForItems = true
            this.listForItems.push(respJson.data)
            this.listLoadingForItems = false
            this.showSuccessForItem(respJson.data)
            this.ifEdited = true
          }
        })
      }
    }
  }
}
</script>
