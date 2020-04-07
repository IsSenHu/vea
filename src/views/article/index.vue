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
      <el-table-column label="发布时间" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.publishTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分类" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.category }}</span>
        </template>
      </el-table-column>
      <el-table-column label="阅读数量" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.views }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.number"
      @pagination="getList"
    />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑博客':'新增博客'">
      <el-form :model="blog" label-width="80px" label-position="left">
        <el-form-item label="标题">
          <el-input v-model="blog.title" placeholder="标题" />
        </el-form-item>
        <el-form-item label="介绍">
          <el-input v-model="blog.introduction" type="textarea" :autosize="{ minRows: 2, maxRows: 4}" placeholder="介绍" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="category" filterable allow-create default-first-option placeholder="请选择">
            <el-option
              v-for="item in categories"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-tag
            v-for="tag in dynamicTags"
            :key="tag"
            closable
            :disable-transitions="false"
            @close="handleClose(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-select
            v-if="inputVisible"
            v-model="value"
            class="input-new-tag"
            placeholder="请选择"
            @change="handleInputConfirm"
          >
            <el-option-group
              v-for="group in options"
              :key="group.label"
              :label="group.label"
            >
              <el-option
                v-for="item in group.options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-option-group>
          </el-select>
          <el-button v-else class="button-new-tag" size="small" @click="showInput">新增</el-button>
        </el-form-item>
        <el-form-item label="上传博客">
          <el-upload action="" :show-file-list="false">
            <el-button icon="el-icon-upload" />
          </el-upload>
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
import waves from '../../directive/waves'
import Pagination from '../../components/Pagination'
import { Blog, requestByClient } from '../../utils/HttpUtils'

const defaultBlog = {
  id: null,
  title: '',
  introduction: '',
  publishTime: '',
  category: '',
  tags: [],
  views: 0
}

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {},
  data() {
    return {
      categories: [
        {
          value: 'Java',
          label: 'Java'
        }
      ],
      category: '',
      options: [{
        label: '语言',
        options: [{
          value: 'Java',
          label: 'Java'
        }]
      }, {
        label: '框架',
        options: [{
          value: 'Spring boot',
          label: 'Spring boot'
        }]
      }],
      value: '',
      blog: Object.assign({}, defaultBlog),
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
      types: [],
      dialogType: 'new',
      dialogVisible: false,
      dynamicTags: [],
      inputVisible: false,
      inputValue: ''
    }
  },
  computed: {},
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
      requestByClient(Blog, 'post', '/api/blog/page', this.listQuery, resp => {
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
      this.dialogType = 'new'
      this.dialogVisible = true
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
          requestByClient(Blog, 'delete', '/api/blog/' + row.id, null, resp => {
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
        .catch(err => {
          console.error(err)
        })
    },
    async confirm() {
      const isEdit = this.dialogType === 'edit'
      this.config.customInfo = JSON.parse(this.config.customInfo)
      if (isEdit) {
        requestByClient(Blog, 'post', '/api/blog', this.config, resp => {
          const respJson = resp.data
          const { code } = respJson
          if (code === 0) {
            this.showSuccess()
            this.getList()
          }
        })
      } else {
        requestByClient(Blog, 'put', '/api/blog', this.config, resp => {
          const respJson = resp.data
          const { code } = respJson
          if (code === 0) {
            this.showSuccess()
            this.getList()
          }
        })
      }
    },
    handleClose(tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1)
    },
    showInput() {
      this.inputVisible = true
    },
    handleInputConfirm() {
      const inputValue = this.value
      if (inputValue) {
        this.dynamicTags.push(inputValue)
      }
      this.inputVisible = false
      this.inputValue = ''
    }
  }
}
</script>

<style scoped>
  .el-tag + .el-tag {
    margin-left: 10px;
  }

  .button-new-tag {
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .input-new-tag {
    width: 90px;
    vertical-align: bottom;
  }
</style>
