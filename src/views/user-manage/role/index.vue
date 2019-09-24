<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.customParams.name" placeholder="名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" type="primary" @click="handleAddRole">创建新角色</el-button>
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
      <el-table-column label="名称" prop="name" sortable="custom" align="center" :class-name="getSortClass('name')">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="说明" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
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

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑角色':'新角色'">
      <el-form :model="role" label-width="80px" label-position="left">
        <el-form-item label="名称">
          <el-input v-model="role.name" placeholder="名称" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input
            v-model="role.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="说明"
          />
        </el-form-item>
        <el-form-item label="菜单">
          <el-tree
            ref="menu"
            :check-strictly="checkStrictly"
            :data="routesData"
            :props="defaultProps"
            show-checkbox
            node-key="description"
            class="permission-tree"
          />
        </el-form-item>
        <el-form-item label="接口">
          <el-tree
            ref="permission"
            :check-strictly="checkStrictly"
            :data="permissionsData"
            :props="defaultPropsForPermission"
            show-checkbox
            node-key="name"
            class="permission-tree"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmRole">提交</el-button>
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
import { deepClone } from '@/utils'

const defaultRole = {
  id: '',
  name: '',
  description: '',
  routes: [],
  menuPermission: [],
  apiPermission: []
}

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
  },
  data() {
    return {
      role: Object.assign({}, defaultRole),
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        number: 20,
        sort: 'name',
        asc: true,
        customParams: {
          name: ''
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
      request('post', '/api/role/page', this.listQuery, resp => {
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
    addShow() {
      this.role = Object.assign({}, defaultRole)
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedNodes([])
      }
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleAddRole() {
      if (this.permissions.length === 0) {
        request('get', '/api/permission/permissionTreeView', null, resp => {
          const respJson = resp.data
          const { code } = respJson
          if (code === 0) {
            this.permissions = respJson.data
            this.addShow()
          }
        })
      } else {
        this.addShow()
      }
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
    editShow(id) {
      request('get', '/api/role/' + id, null, resp => {
        const respJson = resp.data
        const { code } = respJson
        if (code === 0) {
          this.dialogType = 'edit'
          this.dialogVisible = true
          this.checkStrictly = true
          this.role.id = respJson.data.id
          this.role.name = respJson.data.name
          this.role.description = respJson.data.description
          this.$nextTick(() => {
            const { menuPermission } = respJson.data
            const checkedMenus = []
            this.resolveCheckedMenu(checkedMenus, this.routes, menuPermission)
            this.$refs.menu.setCheckedNodes(checkedMenus)
            if (respJson.data.apiPermission) {
              this.$refs.permission.setCheckedNodes(respJson.data.apiPermission)
            }
            // set checked state of a node not affects its father and child nodes
            this.checkStrictly = false
          })
        }
      })
    },
    handleEdit(scope) {
      if (this.permissions.length === 0) {
        request('get', '/api/permission/permissionTreeView', null, resp => {
          const respJson = resp.data
          const { code } = respJson
          if (code === 0) {
            this.permissions = respJson.data
            this.editShow(scope.row.id)
          }
        })
      } else {
        this.editShow(scope.row.id)
      }
    },
    handleDelete({ $index, row }) {
      this.$confirm('确认要删除该角色?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          request('delete', '/api/role/' + row.id, null, resp => {
            const respJson = resp.data
            const { code } = respJson
            if (code === 0) {
              const { name, description } = respJson.data
              this.$notify({
                title: '成功',
                dangerouslyUseHTMLString: true,
                message: `
            <div>角色名称: ${name}</div>
            <div>角色说明: ${description}</div>
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
      const { description, name } = this.role
      this.dialogVisible = false
      this.$notify({
        title: '成功',
        dangerouslyUseHTMLString: true,
        message: `
            <div>角色名称: ${name}</div>
            <div>角色说明: ${description}</div>
          `,
        type: 'success'
      })
    },
    async confirmRole() {
      this.role.apiPermission = []
      this.role.menuPermission = []
      const isEdit = this.dialogType === 'edit'
      const checkedKeys = this.$refs.menu.getCheckedKeys()
      const thisRoutes = this.generateTree(deepClone(this.serviceRoutes), checkedKeys)
      this.resolveMenuPermission(this.role.menuPermission, thisRoutes)
      const checkedApi = this.$refs.permission.getCheckedNodes()
      this.role.apiPermission = []
      checkedApi.forEach(item => {
        if (!item.children) {
          this.role.apiPermission.push(item.id)
        }
      })
      if (isEdit) {
        request('post', '/api/role', this.role, resp => {
          const respJson = resp.data
          const { code } = respJson
          if (code === 0) {
            this.showSuccess()
            this.getList()
          }
        })
      } else {
        request('put', '/api/role', this.role, resp => {
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
