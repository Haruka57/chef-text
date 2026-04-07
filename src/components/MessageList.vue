<template>
  <div class="chat-container">
    <div 
      v-for="(msg, index) in displayHistory" 
      :key="index"
      class="message-row"
      :class="msg.role === 'user' ? 'row-user' : 'row-ai'"
    >
      <div class="message-profile">
        <div class="avatar" :class="msg.role === 'user' ? 'user-avatar' : 'ai-avatar'">
          <template v-if="msg.role === 'user'">
            <img v-if="isUrl(userInfo.avatar)" :src="userInfo.avatar" />
            <span v-else>{{ userInfo.avatar || '🧑' }}</span>
          </template>
          <template v-else>
            <img v-if="isUrl(aiInfo.avatar)" :src="aiInfo.avatar" />
            <span v-else>{{ aiInfo.avatar || '👨‍🍳' }}</span>
          </template>
        </div>
      </div>
      
      <div v-if="msg.role === 'user'" class="user-message-group" style="display: flex; align-items: flex-end; gap: 8px; width: 100%; justify-content: flex-end;">
        <div v-if="editingIndex === index" class="inline-edit-box" style="width: 100%; max-width: 80%; background: #fff; padding: 16px; border-radius: 12px; border: 1px solid #409EFF; box-shadow: 0 4px 16px rgba(64,158,255,0.1); z-index: 10;">
          <el-input 
            type="textarea" 
            v-model="editContent" 
            :autosize="{ minRows: 2, maxRows: 6 }" 
            placeholder="修改你的需求..."
          />
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px;">
            <el-button size="small" round @click="cancelEdit">取消</el-button>
            <el-button size="small" round type="primary" @click="confirmEdit(msg.content)">更新并发送</el-button>
          </div>
        </div>

        <template v-else>
          <el-button 
            size="small" 
            circle 
            @click="startEdit(index, msg.content)" 
            style="opacity: 0.6; border: none; background: transparent; box-shadow: none; margin-bottom: 4px;" 
            title="修改这段话"
          >
            <el-icon size="16"><Edit /></el-icon>
          </el-button>
          <div class="message-bubble bubble-user">{{ msg.content }}</div>
        </template>
      </div>

      <div v-else class="message-bubble bubble-ai">
        <div class="markdown-body" v-html="renderMarkdown(msg.content)"></div>
        
        <div class="message-actions">
          <template v-if="msg.content.includes('服务器开小差') || msg.content.includes('出错了')">
            <el-button type="warning" size="small" round @click="emit('retry')">
              <el-icon><RefreshRight /></el-icon> 重新加载
            </el-button>
          </template>
          <template v-else>
            <el-button type="danger" size="small" round style="margin-right: 8px" @click="emit('search-video', msg.content)">
              视频教程
            </el-button>
            <el-button size="small" circle @click="emit('copy', msg.content)" title="复制菜谱">
              <el-icon><DocumentCopy /></el-icon>
            </el-button>
            <el-button size="small" circle @click="emit('save', msg.content)" title="加入收藏">
              <el-icon><Star /></el-icon>
            </el-button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue' // 🌟 必须引入 ref
import { DocumentCopy, Star, RefreshRight, Edit } from '@element-plus/icons-vue'
import { marked } from 'marked'

// 接收父组件传来的数据
const props = defineProps({
  displayHistory: {
    type: Array,
    required: true
  },
  userInfo: {
    type: Object,
    required: true
  },
  aiInfo: {
    type: Object,
    required: true
  }
})

// 向父组件派发事件
// 🌟 把原来的 'edit' 改成 'submit-edit'
const emit = defineEmits(['search-video', 'copy', 'save', 'retry', 'submit-edit'])

// 判断是否为图片链接
const isUrl = (str) => {
  return str && (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:image'));
};

// 解析 Markdown
const renderMarkdown = (text) => {
  if (!text) return ''
  return marked.parse(text)
}

// ================= 🌟 新增的内联编辑逻辑 =================
const editingIndex = ref(null) // 记录当前正在编辑哪一条消息
const editContent = ref('')    // 记录编辑框里的临时文字

// 开始编辑
const startEdit = (index, content) => {
  editingIndex.value = index
  editContent.value = content
}

// 取消编辑
const cancelEdit = () => {
  editingIndex.value = null
  editContent.value = ''
}

// 确认修改并发送
const confirmEdit = (originalContent) => {
  if (!editContent.value.trim()) return
  // 把原内容和新内容打包发给父组件
  emit('submit-edit', { originalContent, newContent: editContent.value })
  editingIndex.value = null // 退出编辑模式
}
</script>

<style scoped>
/* =========================================
   聊天气泡全新排版：头像在上，气泡在下
========================================= */
.message-row {
  display: flex;
  flex-direction: column !important; /* 🌟 强制改为上下纵向排列 */
  margin-bottom: 24px;
}

/* 用户消息：整体靠右对齐 */
.row-user {
  align-items: flex-end !important; 
}

/* AI 消息：整体靠左对齐 */
.row-ai {
  align-items: flex-start !important;
}

.message-profile {
  flex-shrink: 0;
  margin-bottom: 8px !important; /* 🌟 头像和气泡之间留点空隙 */
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  font-size: 24px;
  overflow: hidden;
  border: 1px solid #ebeef5;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-bubble {
  display: flex;
  flex-direction: column; /* 绝对核心：强制文字在上，按钮在下！ */
  text-align: left; /* 强制所有文字从左到右书写 */
  max-width: 90% !important; 
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  line-height: 1.6;
}

/* 🌟 文字区域：占满可用宽度，防止撑破 */
.markdown-body {
  width: 100%;
  word-break: break-word; /* 防止长串英文把框撑破 */
}

.bubble-user {
  background-color: #e6f2ff;
  border-top-right-radius: 2px;
  color: #333;
}

.bubble-ai {
  background-color: #ffffff;
  border-top-left-radius: 2px;
  width: 100%; /* 保持撑满宽度，稳如泰山 */
}

.message-actions {
  display: flex;
  justify-content: flex-end;
  width: 100%; /* 强制占据一整行 */
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #ebeef5;
}
</style>






