<template>
  <div class="components-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <H2 v-html="title" />
        <p v-html="time" />
      </div>
      <div id="html" class="text item" v-html="html" />
    </el-card>
  </div>
</template>

<script>
import { request } from '@/utils/HttpUtils'
import hljs from 'highlight.js'
import 'highlight.js/styles/qtcreator_dark.css'
// qtcreator_dark.css
// xcode.css
export default {
  name: 'MarkdownLook',
  data() {
    return {
      title: '',
      html: '',
      time: ''
    }
  },
  created() {
    this.show()
  },
  methods: {
    show() {
      const id = localStorage.getItem('currentArticleId')
      if (id) {
        request('get', '/api/article/html/' + id, null, resp => {
          const respJson = resp.data
          const { code, data } = respJson
          if (code === 0) {
            this.html = data.html
            this.title = data.title
            this.time = data.time
            this.$nextTick(() => {
              const blocks = document.querySelectorAll('pre code')
              blocks.forEach((block) => {
                block.style.fontWeight = 'bold'
                hljs.highlightBlock(block)
              })
            })
          }
        })
      }
    }
  }
}
</script>
