<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.customParams.mark" placeholder="标识" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
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
      <el-table-column label="标识" prop="mark" sortable="custom" align="center" :class-name="getSortClass('mark')">
        <template slot-scope="scope">
          <span>{{ scope.row.mark }}</span>
        </template>
      </el-table-column>
      <el-table-column label="说明" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分组" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.classification }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.number" @pagination="getList" />
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { Power } from '@/utils/HttpUtils'
import { getToken } from '@/utils/auth'

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        number: 20,
        sort: 'mark',
        asc: true,
        customParams: {
          mark: ''
        }
      },
      dialogFormVisible: false,
      dialogStatus: '',
      dialogPvVisible: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      Power({
        headers: {
          'Authorization': getToken()
        },
        method: 'post',
        url: '/api/permission/page',
        data: this.listQuery
      }).then(resp => {
        const respJson = resp.data
        const { code } = respJson
        if (code === 0) {
          this.list = respJson.data.items
          this.total = respJson.data.total
        }
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      }).catch(error => {
        console.error(error)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'mark') {
        this.sortByMark(order)
      }
    },
    sortByMark(order) {
      if (order === 'ascending') {
        this.listQuery.sort = 'mark'
        this.listQuery.asc = true
      } else {
        this.listQuery.sort = 'mark'
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
    }
  }
}
</script>
