<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" type="primary" @click="handleAdd">新增身体数据</el-button>
    </div>

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <el-card>
        <LineChart v-if="showLineChart" :chart-data="lineChartData" />
      </el-card>
    </el-row>

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
      <el-table-column label="身体得分" prop="bodyScore" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.bodyScore }}</span>
        </template>
      </el-table-column>
      <el-table-column label="检查时间" prop="checkTime" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.checkTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="体重(斤)" prop="weight" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.weight }}</span>
        </template>
      </el-table-column>
      <el-table-column label="体型" prop="bodyType" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.bodyType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="水分(%)" prop="moisture" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.moisture }}</span>
        </template>
      </el-table-column>
      <el-table-column label="内脏脂肪" prop="visceralFat" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.visceralFat }}</span>
        </template>
      </el-table-column>
      <el-table-column label="bmi" prop="bmi" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.bmi }}</span>
        </template>
      </el-table-column>
      <el-table-column label="体脂(%)" prop="bodyFat" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.bodyFat }}</span>
        </template>
      </el-table-column>
      <el-table-column label="肌肉(斤)" prop="muscle" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.muscle }}</span>
        </template>
      </el-table-column>
      <el-table-column label="蛋白质(%)" prop="protein" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.protein }}</span>
        </template>
      </el-table-column>
      <el-table-column label="基础代谢(千卡)" prop="basalMetabolism" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.basalMetabolism }}</span>
        </template>
      </el-table-column>
      <el-table-column label="骨量(斤)" prop="boneMass" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.boneMass }}</span>
        </template>
      </el-table-column>
      <el-table-column label="身体年龄(岁)" prop="bodyAge" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.bodyAge }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.number" @pagination="getList" />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑身体数据':'新增身体数据'">
      <el-form :model="bodyData" label-width="80px" label-position="left">
        <el-form-item label="身体得分">
          <el-input v-model="bodyData.bodyScore" type="number" placeholder="身体得分" />
        </el-form-item>
        <el-form-item label="体重">
          <el-input v-model="bodyData.weight" type="number" placeholder="体重(斤)" />
        </el-form-item>
        <el-form-item label="体型">
          <el-select v-model="bodyData.bodyType" placeholder="请选择">
            <el-option
              v-for="item in bodyTypes"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="水分">
          <el-input v-model="bodyData.moisture" type="number" placeholder="水分(%)" />
        </el-form-item>
        <el-form-item label="内脏脂肪">
          <el-input v-model="bodyData.visceralFat" type="number" placeholder="内脏脂肪" />
        </el-form-item>
        <el-form-item label="bmi">
          <el-input v-model="bodyData.bmi" type="number" placeholder="bmi" />
        </el-form-item>
        <el-form-item label="体脂">
          <el-input v-model="bodyData.bodyFat" type="number" placeholder="体脂(%)" />
        </el-form-item>
        <el-form-item label="肌肉">
          <el-input v-model="bodyData.muscle" type="number" placeholder="肌肉(斤)" />
        </el-form-item>
        <el-form-item label="蛋白质">
          <el-input v-model="bodyData.protein" type="number" placeholder="蛋白质(%)" />
        </el-form-item>
        <el-form-item label="基础代谢">
          <el-input v-model="bodyData.basalMetabolism" type="number" placeholder="基础代谢(千卡)" />
        </el-form-item>
        <el-form-item label="骨量">
          <el-input v-model="bodyData.boneMass" type="number" placeholder="骨量(斤)" />
        </el-form-item>
        <el-form-item label="身体年龄">
          <el-input v-model="bodyData.bodyAge" type="number" placeholder="身体年龄(岁)" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmBodyData">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import LineChart from './components/LineChart'
import { requestByClient } from '@/utils/HttpUtils'
import { Health } from '@/utils/HttpUtils'

const defaultBodyData = {
  id: null,
  bodyScore: null,
  checkTime: null,
  weight: null,
  bodyType: null,
  moisture: null,
  visceralFat: null,
  bmi: null,
  bodyFat: null,
  muscle: null,
  protein: null,
  basalMetabolism: null,
  boneMass: null,
  bodyAge: null
}

export default {
  name: 'ComplexTable',
  components: { Pagination, LineChart },
  directives: { waves },
  filters: {
  },
  data() {
    return {
      lineChartData: {},
      showLineChart: false,
      bodyTypes: [],
      bodyData: Object.assign({}, defaultBodyData),
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        number: 20,
        sort: 'checkTime',
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
    this.statistics()
  },
  methods: {
    getList() {
      this.listLoading = true
      requestByClient(Health, 'post', '/api/body/data/page', this.listQuery, resp => {
        const respJson = resp.data
        const { code } = respJson
        if (code === 0) {
          this.list = respJson.data.items
          this.total = respJson.data.total
        }
        this.statistics()
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      console.log(prop + order)
    },
    addShow() {
      this.sleep = Object.assign({}, defaultBodyData)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleAdd() {
      if (this.bodyTypes.length === 0) {
        requestByClient(Health, 'get', '/api/body/data/bodyTypes', null, resp => {
          const respJson = resp.data
          const { code, data } = respJson
          if (code === 0) {
            this.bodyTypes = data
            this.addShow()
          }
        })
      } else {
        this.addShow()
      }
    },
    statistics() {
      requestByClient(Health, 'get', '/api/body/data/statistics', null, resp => {
        const respJson = resp.data
        const { code, data } = respJson
        const lineChartData = {}
        lineChartData.x = []
        lineChartData.weight = []
        lineChartData.bmi = []
        lineChartData.visceralFat = []
        lineChartData.moisture = []
        lineChartData.bodyFat = []
        lineChartData.muscle = []
        lineChartData.protein = []
        lineChartData.basalMetabolism = []
        lineChartData.boneMass = []
        lineChartData.bodyAge = []
        lineChartData.bodyScore = []
        if (code === 0) {
          data.forEach(element => {
            lineChartData.x.push(element.checkTime)
            lineChartData.weight.push(element.weight)
            lineChartData.bmi.push(element.bmi)
            lineChartData.visceralFat.push(element.visceralFat)
            lineChartData.moisture.push(element.moisture)
            lineChartData.bodyFat.push(element.bodyFat)
            lineChartData.muscle.push(element.muscle)
            lineChartData.protein.push(element.protein)
            lineChartData.basalMetabolism.push(element.basalMetabolism)
            lineChartData.boneMass.push(element.boneMass)
            lineChartData.bodyAge.push(element.bodyAge)
            lineChartData.bodyScore.push(element.bodyScore)
          })
          this.lineChartData = lineChartData
          this.showLineChart = true
        }
      })
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
    async confirmBodyData() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        requestByClient(Health, 'post', '/api/body/data', this.bodyData, resp => {
          const respJson = resp.data
          const { code } = respJson
          if (code === 0) {
            this.showSuccess()
            this.getList()
          }
        })
      } else {
        requestByClient(Health, 'put', '/api/body/data', this.bodyData, resp => {
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
