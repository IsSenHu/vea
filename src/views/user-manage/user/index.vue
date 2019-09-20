<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.customParams.userId" placeholder="ID" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.customParams.username" placeholder="用户名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.customParams.email" placeholder="电子邮箱" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" type="primary" @click="handleAddRole">创建新用户</el-button>
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
      <el-table-column label="用户名" prop="username" sortable="custom" align="center" :class-name="getSortClass('username')">
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="介绍" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.introduction }}</span>
        </template>
      </el-table-column>
      <el-table-column label="电子邮箱" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.email }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否启用" align="center">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.isEnabled"
            style="display: block"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-text="启用"
            inactive-text="禁用"
            @change="handleStatus(scope)"
          />
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

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑用户':'新用户'">
      <el-form :model="user" label-width="80px" label-position="left">
        <el-form-item label="用户名">
          <el-input v-model="user.username" :disabled="dialogType==='edit'" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item v-show="dialogType!=='edit'" label="密码">
          <el-input v-model="user.password" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-form-item v-show="dialogType!=='edit'" label="重复密码">
          <el-input v-model="user.rPassword" show-password placeholder="请重复输入密码" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="user.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="是否启用">
          <el-switch
            v-model="user.isEnabled"
            style="display: block"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
        <el-form-item label="说明">
          <el-input
            v-model="user.introduction"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="说明"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmData">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { request } from '@/utils/HttpUtils'
import { asyncRoutes } from '@/router'
import path from 'path'

const defaultUser = {
  id: '',
  username: '',
  password: '',
  rPassword: '',
  description: '',
  isEnabled: false,
  introduction: '',
  email: ''
}

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
  },
  data() {
    return {
      user: Object.assign({}, defaultUser),
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        number: 20,
        sort: 'username',
        asc: true,
        customParams: {
          userId: null,
          username: '',
          email: ''
        }
      },
      serviceRoutes: [],
      routes: [],
      permissions: [],
      apis: [],
      dialogType: 'new',
      dialogVisible: false,
      dialogFormVisible: false,
      checkStrictly: false,
      dialogStatus: '',
      dialogPvVisible: false,
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      defaultPropsForPermission: {
        children: 'children',
        label: 'name'
      }
    }
  },
  computed: {
    routesData() {
      return this.routes
    },
    permissionsData() {
      return this.permissions
    }
  },
  created() {
    this.getRoutes()
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      request('post', '/api/user/page', this.listQuery, resp => {
        const respJson = resp.data
        const { code } = respJson
        if (code === 0) {
          this.list = respJson.data.items
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
      if (prop === 'username') {
        this.sortByUsername(order)
      }
    },
    sortByUsername(order) {
      if (order === 'ascending') {
        this.listQuery.sort = 'username'
        this.listQuery.asc = true
      } else {
        this.listQuery.sort = 'username'
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
    async getRoutes() {
      // 从Mock加载
      this.serviceRoutes = asyncRoutes
      this.routes = this.generateRoutes(asyncRoutes)
    },
    // Reshape the routes structure so that it looks the same as the sidebar
    generateRoutes(routes) {
      const res = []

      for (let route of routes) {
        // skip some route
        if (route.hidden) { continue }

        const onlyOneShowingChild = this.onlyOneShowingChild(route.children, route)

        if (route.children && onlyOneShowingChild && !route.alwaysShow) {
          route = onlyOneShowingChild
        }

        const data = {
          description: route.meta && route.meta.title,
          title: route.meta && route.meta.title

        }

        // recursive child routes
        if (route.children) {
          data.children = this.generateRoutes(route.children, data.path)
        }
        res.push(data)
      }
      return res
    },
    generateArr(routes) {
      let data = []
      routes.forEach(route => {
        data.push(route)
        if (route.children) {
          const temp = this.generateArr(route.children)
          if (temp.length > 0) {
            data = [...data, ...temp]
          }
        }
      })
      return data
    },
    handleStatus(scope) {
      const { row } = scope
      request('post', '/api/user/changeUserStatus/' + row.id + '/ENABLED/' + row.isEnabled, null, resp => {
        const respJson = resp.data
        const { code } = respJson
        if (code === 0) {
          this.$notify({
            title: '成功',
            dangerouslyUseHTMLString: true,
            message: '修改用户状态成功',
            type: 'success'
          })
        }
      })
    },
    addShow() {
      this.user = Object.assign({}, defaultUser)
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedNodes([])
      }
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleAddRole() {
      this.addShow()
    },
    resolveCheckedMenu(checkedMenus, routes, menuPermission, parent) {
      let checkedParent = null
      routes.forEach(item => {
        if (item.children) {
          this.resolveCheckedMenu(checkedMenus, item.children, menuPermission, item)
        } else {
          if (menuPermission && menuPermission.includes(item.description)) {
            checkedMenus.push(item)
            if (!checkedParent) {
              checkedMenus.push(parent)
              checkedParent = parent
            }
          }
        }
      })
    },
    handleEdit(scope) {
      request('get', '/api/user/findById/' + scope.row.id, null, resp => {
        const respJson = resp.data
        const { code } = respJson
        if (code === 0) {
          this.user.id = respJson.data.id
          this.user.username = respJson.data.username
          this.user.introduction = respJson.data.introduction
          this.user.email = respJson.data.email
          this.user.isEnabled = respJson.data.isEnabled
          this.dialogType = 'edit'
          this.dialogVisible = true
        }
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('确认要删除该用户?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          request('delete', '/api/user/' + row.id, null, resp => {
            const respJson = resp.data
            const { code } = respJson
            if (code === 0) {
              const { username } = respJson.data
              this.$notify({
                title: '成功',
                dangerouslyUseHTMLString: true,
                message: `
            <div>用户名: ${username}</div>
          `,
                type: 'success'
              })
              this.getList()
            }
          })
        })
        .catch(err => { console.error(err) })
    },
    generateTree(routes, checkedKeys) {
      const res = []

      for (const route of routes) {
        const description = route.meta && route.meta.title

        // recursive child routes
        if (route.children) {
          route.children = this.generateTree(route.children, checkedKeys)
        }

        if (checkedKeys.includes(description) || (route.children && route.children.length >= 1)) {
          res.push(route)
        }
      }
      return res
    },
    resolveMenuPermission(arr, routes) {
      routes.forEach(item => {
        const roles = item.meta.roles
        if (!item.children && roles && roles.length > 0) {
          let mark
          for (let i = 0; i < roles.length; i++) {
            if (roles[i] !== 'adminExclusive') {
              mark = roles[i]
              break
            }
          }
          if (mark) {
            arr.push({
              mark: mark,
              name: item.meta.title
            })
          }
        } else if (item.children) {
          this.resolveMenuPermission(arr, item.children)
        }
      })
    },
    showSuccess() {
      const { username } = this.user
      this.dialogVisible = false
      this.$notify({
        title: '成功',
        dangerouslyUseHTMLString: true,
        message: `
            <div>用户名: ${username}</div>
          `,
        type: 'success'
      })
    },
    async confirmData() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        request('post', '/api/user/updateById', this.user, resp => {
          const respJson = resp.data
          const { code } = respJson
          if (code === 0) {
            this.showSuccess()
            this.getList()
          }
        })
      } else {
        request('put', '/api/user/create', this.user, resp => {
          const respJson = resp.data
          const { code } = respJson
          if (code === 0) {
            this.showSuccess()
            this.getList()
          }
        })
      }
    },
    // reference: src/view/layout/components/Sidebar/SidebarItem.vue
    onlyOneShowingChild(children = [], parent) {
      let onlyOneChild = null
      const showingChildren = children.filter(item => !item.hidden)

      // When there is only one child route, the child route is displayed by default
      if (showingChildren.length === 1) {
        onlyOneChild = showingChildren[0]
        onlyOneChild.path = path.resolve(parent.path, onlyOneChild.path)
        return onlyOneChild
      }

      // Show parent if there are no child route to display
      if (showingChildren.length === 0) {
        onlyOneChild = { ... parent, path: '', noShowingChildren: true }
        return onlyOneChild
      }

      return false
    }
  }
}
</script>
