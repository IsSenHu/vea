<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.customParams.email" class="filter-item" placeholder="请选择">
        <el-option
          v-for="item in options"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" type="primary" @click="handleRefresh">更新邮箱</el-button>
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
      <el-table-column label="主题" prop="subject" sortable="custom" align="center" :class-name="getSortClass('subject')">
        <template slot-scope="{row}">
          <span class="link-type" @click="look(row)">{{ row.subject }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发送人" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.from }}</span>
        </template>
      </el-table-column>
      <el-table-column label="需要回执" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.replySign ? 'success' : 'info'"><svg-icon icon-class="star" class="meta-item__icon" /></el-tag>
        </template>
      </el-table-column>
      <el-table-column label="附件" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.containAttachment ? 'success' : 'info'"><svg-icon icon-class="star" class="meta-item__icon" /></el-tag>
        </template>
      </el-table-column>
      <el-table-column label="发送日期" prop="sentDate" sortable="custom" align="center" :class-name="getSortClass('sentDate')">
        <template slot-scope="scope">
          <span>{{ scope.row.sentDate }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.number" @pagination="getList" />

    <el-dialog :visible.sync="dialogVisible" :title="title">
      <el-button v-for="item in options" :key="item.id" v-loading.fullscreen.lock="fullscreenLoading" element-loading-text="拼命更新中" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)" type="primary" :value="item.id" @click="handleUpdate(item.id)">{{ item.name }}</el-button>
    </el-dialog>

    <el-dialog :visible.sync="dialogVisibleLook" width="80%" :title="titleLook">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <H2>
            {{ email.subject }}
          </H2>
          <p v-if="!isHtml">
            {{ email.from }}
          </p>
          <p v-if="!isHtml">
            {{ email.to }}
          </p>
          <p v-if="email.cc !== '' && !isHtml">
            {{ email.cc }}
          </p>
        </div>
        <div id="html" class="text item" v-html="email.content" />
      </el-card>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import { request } from '@/utils/HttpUtils'

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
  },
  data() {
    return {
      fullscreenLoading: false,
      title: '更新邮箱',
      titleLook: '邮件',
      options: this.$store.getters.selfSettings.EMAIL ? this.$store.getters.selfSettings.EMAIL : [],
      isHtml: false,
      email: {
        id: null,
        subject: '',
        from: '',
        sentDate: '',
        replySign: false,
        containAttachment: false,
        content: '',
        to: '',
        cc: '',
        bcc: '',
        attachments: []
      },
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        number: 20,
        sort: 'sentDate',
        asc: false,
        customParams: {
          email: null
        }
      },
      dialogVisible: false,
      dialogVisibleLook: false
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
      request('get', '/api/email/' + id, null, resp => {
        const respJson = resp.data
        this.email.content = respJson.data.content
        console.log(respJson.data.content)
        this.email.subject = respJson.data.subject
        this.email.from = '发件人: ' + respJson.data.from
        this.email.to = '收件人: ' + respJson.data.to
        if (respJson.data.cc && respJson.data.cc.length > 0) {
          this.email.cc = '抄送: ' + respJson.data.cc
        }
        this.isHtml = respJson.data.isHtml
        this.dialogVisibleLook = true
      })
    },
    getList() {
      this.listLoading = true
      request('post', '/api/email/page', this.listQuery, resp => {
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
      if (prop === 'subject') {
        this.sortBySubject(order)
      } else if (prop === 'sentDate') {
        this.sortBySentDate(order)
      }
    },
    sortBySentDate(order) {
      if (order === 'ascending') {
        this.listQuery.sort = 'sentDate'
        this.listQuery.asc = true
      } else {
        this.listQuery.sort = 'sentDate'
        this.listQuery.asc = false
      }
      this.handleFilter()
    },
    sortBySubject(order) {
      if (order === 'ascending') {
        this.listQuery.sort = 'subject'
        this.listQuery.asc = true
      } else {
        this.listQuery.sort = 'subject'
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
    handleRefresh() {
      this.dialogVisible = true
    },
    handleUpdate(id) {
      this.fullscreenLoading = true
      request('post', '/api/email/update', {
        configId: id
      }, resp => {
        const respJson = resp.data
        const { code } = respJson
        if (code === 0) {
          this.showSuccess()
        }
        this.fullscreenLoading = false
        this.dialogVisible = false
        this.getList()
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
    }
  }
}
</script>
