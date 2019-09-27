<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.customParams.type" class="filter-item" placeholder="请选择类型">
        <el-option
          v-for="item in types"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" type="primary" @click="handleAdd">新增文章</el-button>
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
      <el-table-column label="文章标题" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="look(row)">{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="时间" prop="time" sortable="custom" align="center" :class-name="getSortClass('time')">
        <template slot-scope="scope">
          <span>{{ scope.row.time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" sortable="custom" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.typeName }}</span>
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
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import { request, getSettings } from '@/utils/HttpUtils'

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
      }],
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
          type: null
        }
      },
      types: getSettings().ARTICLE
    }
  },
  computed: {
  },
  created() {
    this.getList()
  },
  methods: {
    look(row) {
      const { id } = row
      localStorage.setItem('currentArticleId', id)
      this.$router.push({ path: '/article/look' || '/', query: this.otherQuery })
    },
    getList() {
      this.listLoading = true
      request('post', '/api/article/page', this.listQuery, resp => {
        const respJson = resp.data
        const { code } = respJson
        if (code === 0) {
          this.list = respJson.data.items
          const typeMap = new Map()
          this.types.forEach(item => {
            typeMap.set(item.id, item.name)
          })
          this.list.forEach(item => {
            item.typeName = typeMap.get(item.type)
          })
          this.total = respJson.data.total
        }
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
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
      localStorage.removeItem('currentEditArticleId')
      this.$router.push({ path: '/article/edit' || '/', query: this.otherQuery })
    },
    handleAdd() {
      this.addShow()
    },
    editShow(id) {
      localStorage.setItem('currentEditArticleId', id)
      this.$router.push({ path: '/article/edit' || '/', query: this.otherQuery })
    },
    handleEdit(scope) {
      this.editShow(scope.row.id)
    },
    handleDelete({ row }) {
      this.$confirm('确认要删除该文章?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          request('delete', '/api/article/' + row.id, null, resp => {
            const respJson = resp.data
            const { code } = respJson
            if (code === 0) {
              this.$notify({
                title: '成功',
                dangerouslyUseHTMLString: true,
                message: `
          `,
                type: 'success'
              })
              this.getList()
            }
          })
        })
        .catch(err => { console.error(err) })
    }
  }
}
</script>
