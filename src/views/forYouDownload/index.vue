<template>
  <div class="app-container">
    <el-card class="box-card">
      <aside style="margin-top:15px;">
        点击这里下载你的教学视频
      </aside>
      <el-button type="primary" icon="el-icon-download" @click="download">
        下载
      </el-button>
    </el-card>
  </div>
</template>
<script>
import { request } from '@/utils/HttpUtils'
export default {
  name: 'ForYouDownload',
  methods: {
    download() {
      request('get', 'api/oss/oss-cn-chengdu.aliyuncs.com/our-stories/86400/第一章到第八章.rar', null, resp => {
        const url = resp.data
        if (url) {
          location.href = url
        }
      })
    }
  }
}
</script>

