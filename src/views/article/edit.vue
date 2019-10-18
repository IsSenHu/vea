<template>
  <div class="components-container">
    <div class="editor-container">
      <div class="filter-container">
        <el-select v-model="type" class="filter-item" placeholder="请选择文章类型">
          <el-option
            v-for="item in types"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </div>
      <div class="filter-container">
        <el-input v-model="title" placeholder="请输入文章标题" />
      </div>
      <markdown-editor ref="markdownEditor" v-model="content" :options="{hideModeSwitch:true, previewStyle:'tab'}" height="500px" />
    </div>

    <el-button style="margin-top:80px;" type="primary" icon="el-icon-check" @click="save(null)">
      保存
    </el-button>
    <el-button style="margin-top:80px;" type="success" icon="el-icon-document" @click="finish">
      编辑完成
    </el-button>
    <el-button v-if="dialogVisible" style="margin-top:80px;" type="danger" icon="el-icon-close" @click="close">
      取消
    </el-button>
  </div>
</template>

<script>
import MarkdownEditor from '@/components/MarkdownEditor'
import { request } from '@/utils/HttpUtils'

export default {
  name: 'MarkdownDemo',
  components: { MarkdownEditor },
  data() {
    return {
      id: null,
      title: '',
      content: '',
      html: '',
      type: null,
      dialogVisible: true,
      types: []
    }
  },
  computed: {
  },
  created() {
    this.showEdit()
  },
  methods: {
    showEdit() {
      const id = localStorage.getItem('currentEditArticleId')
      if (id) {
        request('get', '/api/article/content/' + id, null, resp => {
          const respJson = resp.data
          const { code, data } = respJson
          if (code === 0) {
            this.id = data.id
            this.content = data.content
            this.title = data.title
            this.type = data.type
            this.dialogVisible = false
          }
        })
      }
    },
    showSaveSuccess(data) {
      const { id } = data
      this.id = id
      this.$notify({
        title: '已保存',
        dangerouslyUseHTMLString: true,
        message: `
          `,
        type: 'success'
      })
    },
    finish() {
      this.save(code => {
        if (code === 0) {
          this.currentEditArticleId = null
          localStorage.removeItem('currentEditArticleId')
          this.$router.push({ path: '/article/index' || '/', query: this.otherQuery })
        }
      })
    },
    close() {
      this.$confirm('确认要取消本次编辑?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const id = localStorage.getItem('currentEditArticleId')
          if (!id) {
            if (this.id) {
              request('delete', '/api/article/' + this.id, null, resp => {
                const respJson = resp.data
                console.log(respJson)
                localStorage.removeItem('currentEditArticleId')
                this.$router.push({ path: '/article/index' || '/', query: this.otherQuery })
              })
            } else {
              this.$router.push({ path: '/article/index' || '/', query: this.otherQuery })
            }
          } else {
            this.$router.push({ path: '/article/index' || '/', query: this.otherQuery })
          }
        })
        .catch(err => { console.error(err) })
    },
    save(func) {
      if (this.id) {
        this.html = this.$refs.markdownEditor.getHtml()
        request('post', '/api/article', {
          id: this.id,
          title: this.title,
          content: this.content,
          html: this.html,
          type: this.type
        }, resp => {
          const respJson = resp.data
          const { code, data } = respJson
          if (code === 0) {
            this.showSaveSuccess(data)
            if (func) {
              func(code)
            }
          }
        })
      } else {
        this.html = this.$refs.markdownEditor.getHtml()
        request('put', '/api/article', {
          title: this.title,
          content: this.content,
          html: this.html,
          type: this.type
        }, resp => {
          const respJson = resp.data
          const { code, data } = respJson
          if (code === 0) {
            this.showSaveSuccess(data)
            if (func) {
              func(code)
            }
          }
        })
      }
    }
  }
}
</script>

<style scoped>
.editor-container{
  margin-bottom: 30px;
}
</style>
