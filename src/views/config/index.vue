<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.customParams" class="filter-item" placeholder="请选择">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" type="primary" @click="handleAdd">新增配置</el-button>
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
      <el-table-column label="配置名称" prop="name" sortable="custom" align="center" :class-name="getSortClass('name')">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="配置类型" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.type }}</span>
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

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑配置':'新增配置'">
      <el-form :model="config" label-width="80px" label-position="left">
        <el-form-item label="配置名称">
          <el-input v-model="config.name" placeholder="配置名称" />
        </el-form-item>
        <el-form-item label="配置类型">
          <el-select v-model="config.type" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="自定义">
          <el-input
            v-model="config.customInfo"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 10}"
            placeholder="请输入内容"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirm">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import { request } from '@/utils/HttpUtils'

const defaultConfig = {
  id: null,
  name: '',
  type: null,
  customInfo: null
}

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
  },
  data() {
    return {
      options: [{
        value: 'ARTICLE',
        label: '文章类型'
      }, {
        value: 'EMAIL',
        label: '邮箱安全配置'
      }],
      config: Object.assign({}, defaultConfig),
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        number: 20,
        sort: 'name',
        asc: true,
        customParams: ''
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
      request('post', '/api/config/page', this.listQuery, resp => {
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
      if (prop === 'name') {
        this.sortByName(order)
      }
    },
    sortByName(order) {
      if (order === 'ascending') {
        this.listQuery.sort = 'name'
        this.listQuery.asc = true
      } else {
        this.listQuery.sort = 'name'
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
      this.config = Object.assign({}, defaultConfig)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleAdd() {
      this.addShow()
    },
    editShow(id) {
      request('get', '/api/config/' + id, null, resp => {
        const respJson = resp.data
        const { code } = respJson
        if (code === 0) {
          this.dialogType = 'edit'
          this.dialogVisible = true
          this.config.id = respJson.data.id
          this.config.name = respJson.data.name
          this.config.type = respJson.data.configType
          this.config.customInfo = JSON.stringify(respJson.data.customInfo)
        }
      })
    },
    handleEdit(scope) {
      this.editShow(scope.row.id)
    },
    handleDelete({ row }) {
      this.$confirm('确认要删除该配置?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          request('delete', '/api/config/' + row.id, null, resp => {
            const respJson = resp.data
            const { code } = respJson
            if (code === 0) {
              const { name, type } = respJson.data
              this.$notify({
                title: '成功',
                dangerouslyUseHTMLString: true,
                message: `
            <div>配置名称: ${name}</div>
            <div>配置类型: ${type}</div>
          `,
                type: 'success'
              })
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
    async confirm() {
      const isEdit = this.dialogType === 'edit'
      this.config.customInfo = JSON.parse(this.config.customInfo)
      if (isEdit) {
        request('post', '/api/config', this.config, resp => {
          const respJson = resp.data
          const { code } = respJson
          if (code === 0) {
            this.showSuccess()
            this.getList()
          }
        })
      } else {
        request('put', '/api/config', this.config, resp => {
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
