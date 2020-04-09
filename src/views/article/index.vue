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
        <template slot-scope="scope">
          <span>{{ scope.row.title }}</span>
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
          <el-select v-model="blog.category" filterable allow-create default-first-option placeholder="请选择" @change="newCategory">
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
            v-for="tag in blog.tags"
            :key="tag"
            closable
            :disable-transitions="false"
            @close="handleClose(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-select
            v-if="inputVisible"
            v-model="addTag"
            class="input-new-tag"
            filterable
            allow-create
            default-first-option
            placeholder="请选择"
            @change="handleInputConfirm"
          >
            <el-option
              v-for="item in tags"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-button v-else class="button-new-tag" size="small" @click="showInput">新增</el-button>
        </el-form-item>
        <el-form-item label="上传博客">
          <el-upload
            ref="upload"
            class="upload-demo"
            action=""
            :http-request="uploadFileMethod"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :file-list="fileList"
            :auto-upload="false"
            :multiple="false"
          >
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <div slot="tip" class="el-upload__tip">只能上传html文件</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="submitUpload">提交</el-button>
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
      fileList: [],
      categories: [
        {
          value: 'Java',
          label: 'Java'
        }
      ],
      tags: [{
        value: 'Java',
        label: 'Java'
      }, {
        value: 'Spring boot',
        label: 'Spring boot'
      }],
      addTag: '',
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
      this.$confirm('确认要删除该博客?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          requestByClient(Blog, 'delete', '/api/blog/' + row.id, null, resp => {
            const respJson = resp.data
            const { code, data } = respJson
            if (code === 0 && data) {
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
      this.blog.tags.splice(this.blog.tags.indexOf(tag), 1)
      this.tags.push({ 'value': tag, 'label': tag })
    },
    showInput() {
      this.addTag = ''
      this.inputVisible = true
    },
    handleInputConfirm() {
      const inputValue = this.addTag
      console.log(inputValue)
      if (inputValue) {
        this.blog.tags.push(inputValue)
        const n = this.tags.length
        const newTags = []
        for (let i = 0; i < n; i++) {
          const item = this.tags[i]
          if (item.value !== inputValue) {
            newTags.push({ 'value': item.value, 'label': item.value })
          }
        }
        this.tags = newTags
        console.log(this.tags)
        this.inputVisible = false
        this.inputValue = ''
      }
    },
    submitUpload() {
      this.$refs.upload.submit()
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
    },
    handlePreview(file) {
      console.log(file)
    },
    newCategory() {
      const category = this.blog.category
      const length = this.categories.length
      for (let i = 0; i < length; i++) {
        const item = this.categories[i]
        if (item.value === category) {
          return
        }
      }
      this.categories.push({ 'value': category, 'label': category })
    },
    uploadFileMethod(param) {
      this.dialogVisible = false
      const fileObject = param.file
      const formData = new FormData()
      formData.append('file', fileObject)
      formData.append('title', this.blog.title)
      formData.append('introduction', this.blog.introduction)
      formData.append('category', this.blog.category)
      formData.append('tags', this.blog.tags.join(','))
      requestByClient(Blog, 'put', '/api/blog', formData, resp => {
        const respJson = resp.data
        const { code } = respJson
        if (code === 0) {
          this.$message({
            message: '发布成功',
            type: 'success'
          })
          this.getList()
        } else {
          this.$notify({
            title: '发布失败',
            dangerouslyUseHTMLString: true,
            message: `
          `,
            type: 'warning'
          })
        }
      })
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
    vertical-align: bottom;
  }
</style>
