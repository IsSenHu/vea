<template>
  <div class="components-container">
    <div class="editor-container">
      <el-tag class="tag-title">
        开始写文章
      </el-tag>
      <markdown-editor ref="markdownEditor" v-model="content" :options="{hideModeSwitch:true, previewStyle:'tab'}" height="200px" />
    </div>

    <el-button style="margin-top:80px;" type="primary" icon="el-icon-document" @click="getHtml">
      Get HTML
    </el-button>
    <div v-html="html" />
  </div>
</template>

<script>
import MarkdownEditor from '@/components/MarkdownEditor'

const content = `
**This is test**

* vue
* element
* webpack

`
export default {
  name: 'MarkdownDemo',
  components: { MarkdownEditor },
  data() {
    return {
      content: content,
      html: ''
    }
  },
  computed: {
  },
  methods: {
    getHtml() {
      this.html = this.$refs.markdownEditor.getHtml()
    }
  }
}
</script>

<style scoped>
.editor-container{
  margin-bottom: 30px;
}
.tag-title{
  margin-bottom: 5px;
}
</style>
