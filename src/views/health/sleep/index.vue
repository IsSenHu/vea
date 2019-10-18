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
      <el-button class="filter-item" type="primary" @click="handleAddIncome">新增睡眠</el-button>
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
      <el-table-column label="入睡时间" prop="sleepTime" sortable="custom" align="center" :class-name="getSortClass('sleepTime')">
        <template slot-scope="scope">
          <span>{{ scope.row.sleepTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="入睡时长" prop="sleepingTime" sortable="custom" align="center" :class-name="getSortClass('sleepingTime')">
        <template slot-scope="scope">
          <span>{{ scope.row.sleepingTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="睡眠时长" prop="sleepingTotalTime" sortable="custom" align="center" :class-name="getSortClass('sleepingTotalTime')">
        <template slot-scope="scope">
          <span>{{ scope.row.sleepingTotalTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="睡眠年龄" prop="sleepAge" sortable="custom" align="center" :class-name="getSortClass('sleepAge')">
        <template slot-scope="scope">
          <span>{{ scope.row.sleepAge }}</span>
        </template>
      </el-table-column>
      <el-table-column label="睡眠评分" prop="sleepScore" sortable="custom" align="center" :class-name="getSortClass('sleepScore')">
        <template slot-scope="scope">
          <span>{{ scope.row.sleepScore }}</span>
        </template>
      </el-table-column>
      <el-table-column label="环境噪音" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.ambientNoise }}</span>
        </template>
      </el-table-column>
      <el-table-column label="睡前状态" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.bedtimeState }}</span>
        </template>
      </el-table-column>
      <el-table-column label="梦境状态" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.dreamState }}</span>
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

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑睡眠':'新增睡眠'">
      <el-form :model="sleep" label-width="80px" label-position="left">
        <el-form-item label="入睡时间">
          <el-date-picker
            v-model="sleep.sleepTime"
            align="right"
            type="datetime"
            placeholder="入睡时间"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="入睡时长">
          <el-time-picker v-model="sleep.sleepingTime" value-format="HH:mm" placeholder="入睡时长" />
        </el-form-item>
        <el-form-item label="睡眠时长">
          <el-time-picker v-model="sleep.sleepingTotalTime" value-format="HH:mm" placeholder="睡眠时长" />
        </el-form-item>
        <el-form-item label="环境噪音">
          <el-input v-model="sleep.ambientNoise" type="number" placeholder="环境噪音(分贝)" />
        </el-form-item>
        <el-form-item label="睡眠年龄">
          <el-input v-model="sleep.sleepAge" type="number" placeholder="睡眠年龄" />
        </el-form-item>
        <el-form-item label="睡眠评分">
          <el-input v-model="sleep.sleepScore" type="number" placeholder="睡眠评分" />
        </el-form-item>
        <el-form-item label="睡前状态">
          <el-select v-model="sleep.bedtimeState" placeholder="请选择">
            <el-option
              v-for="item in bedtimeStates"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="梦境状态">
          <el-select v-model="sleep.dreamState" placeholder="请选择">
            <el-option
              v-for="item in dreamStates"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmSleep">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import { request } from '@/utils/HttpUtils'

const defaultSleep = {
  id: null,
  sleepTime: null,
  sleepingTime: '00:00',
  sleepingTotalTime: '00:00',
  ambientNoise: null,
  sleepAge: null,
  sleepScore: null,
  bedtimeState: '',
  dreamState: ''
}

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
  },
  data() {
    return {
      bedtimeStates: [],
      dreamStates: [],
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
      sleep: Object.assign({}, defaultSleep),
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        number: 20,
        sort: 'sleepTime',
        asc: true,
        customParams: {
          start: null,
          end: null
        }
      },
      dialogType: 'new',
      dialogVisible: false,
      dialogFormVisible: false,
      dialogStatus: '',
      dialogPvVisible: false
    }
  },
  computed: {
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      request('post', '/api/sleep/page', this.listQuery, resp => {
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
      if (prop === 'sleepTime') {
        this.sortBySleepTime(order)
      } else if (prop === 'sleepingTime') {
        this.sortBySleepingTime(order)
      } else if (prop === 'sleepingTotalTime') {
        this.sortBySleepingTotalTime(order)
      } else if (prop === 'sleepAge') {
        this.sortBySleepAge(order)
      } else if (prop === 'sleepScore') {
        this.sortBySleepScore(order)
      }
    },
    sortBySleepScore(order) {
      if (order === 'ascending') {
        this.listQuery.sort = 'sleepScore'
        this.listQuery.asc = true
      } else {
        this.listQuery.sort = 'sleepScore'
        this.listQuery.asc = false
      }
      this.handleFilter()
    },
    sortBySleepAge(order) {
      if (order === 'ascending') {
        this.listQuery.sort = 'sleepAge'
        this.listQuery.asc = true
      } else {
        this.listQuery.sort = 'sleepAge'
        this.listQuery.asc = false
      }
      this.handleFilter()
    },
    sortBySleepingTotalTime(order) {
      if (order === 'ascending') {
        this.listQuery.sort = 'sleepingTotalTime'
        this.listQuery.asc = true
      } else {
        this.listQuery.sort = 'sleepingTotalTime'
        this.listQuery.asc = false
      }
      this.handleFilter()
    },
    sortBySleepingTime(order) {
      if (order === 'ascending') {
        this.listQuery.sort = 'sleepingTime'
        this.listQuery.asc = true
      } else {
        this.listQuery.sort = 'sleepingTime'
        this.listQuery.asc = false
      }
      this.handleFilter()
    },
    sortBySleepTime(order) {
      if (order === 'ascending') {
        this.listQuery.sort = 'sleepTime'
        this.listQuery.asc = true
      } else {
        this.listQuery.sort = 'sleepTime'
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
      this.sleep = Object.assign({}, defaultSleep)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleAddIncome() {
      this.addShow()
    },
    editShow(id) {
      request('get', '/api/sleep/' + id, null, resp => {
        const respJson = resp.data
        const { code } = respJson
        if (code === 0) {
          this.dialogType = 'edit'
          this.dialogVisible = true
          this.sleep.id = respJson.data.id
          this.sleep.sleepTime = respJson.data.sleepTime
          this.sleep.sleepAge = respJson.data.sleepAge
          this.sleep.sleepScore = respJson.data.sleepScore
          this.sleep.ambientNoise = respJson.data.ambientNoise
          this.sleep.bedtimeState = respJson.data.bedtimeState
          this.sleep.dreamState = respJson.data.dreamState
          this.sleep.sleepingTime = respJson.data.sleepingTime
          this.sleep.sleepingTotalTime = respJson.data.sleepingTotalTime
        }
      })
    },
    handleEdit(scope) {
      this.editShow(scope.row.id)
    },
    handleDelete({ row }) {
      this.$confirm('确认要删除该条信息?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          request('delete', '/api/sleep/' + row.id, null, resp => {
            const respJson = resp.data
            const { code } = respJson
            if (code === 0) {
              this.showSuccess()
              this.getList()
            }
          })
        })
        .catch(err => { console.error(err) })
    },
    showSuccess() {
      this.dialogVisible = false
      this.$notify({
        title: '成功',
        dangerouslyUseHTMLString: true,
        message: `
          `,
        type: 'success'
      })
    },
    async confirmSleep() {
      const isEdit = this.dialogType === 'edit'
      const sleepingTotalTimeArr = this.sleep.sleepingTotalTime.split(':')
      this.sleep.sleepingTotalTime = parseInt(sleepingTotalTimeArr[0]) * 3600 + parseInt(sleepingTotalTimeArr[1]) * 60

      const sleepingTimeArr = this.sleep.sleepingTime.split(':')
      this.sleep.sleepingTime = parseInt(sleepingTimeArr[0]) * 3600 + parseInt(sleepingTimeArr[1]) * 60
      if (isEdit) {
        request('post', '/api/sleep', this.sleep, resp => {
          const respJson = resp.data
          const { code } = respJson
          if (code === 0) {
            this.showSuccess()
            this.getList()
          }
        })
      } else {
        request('put', '/api/sleep', this.sleep, resp => {
          const respJson = resp.data
          const { code } = respJson
          if (code === 0) {
            this.showSuccess()
            this.getList()
          }
        })
      }
    }
  }
}
</script>
