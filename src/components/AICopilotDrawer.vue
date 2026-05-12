<template>
  <el-drawer
    v-model="drawerVisible"
    title="👨‍🍳 AI 营养大厨"
    direction="rtl"
    size="480px"
  >
    <div class="chat-container">
      <!-- 聊天消息区 -->
      <div class="chat-messages" ref="chatWindow">
        <MessageList 
          :display-history="displayHistory" 
          :user-info="userInfo" 
          :ai-info="aiInfo" 
        />
        <div v-if="loading" class="loading">大厨正在思考...</div>
      </div>

      <!-- 输入区 -->
      <div class="chat-input-wrapper">
        <ChatInput
          v-model:ingredients="ingredients"
          v-model:selectedTags="selectedTags"
          :is-generating="isGenerating"
          @submit="handleSend"
          @pause="pauseGeneration"
        />
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useChat } from '../composables/useChat'
import { useHealthStore } from '../stores/healthStore'
import MessageList from './MessageList.vue'
import ChatInput from './ChatInput.vue'

const props = defineProps({
  visible: Boolean,
  userInfo: Object,
  aiInfo: Object
})

const emit = defineEmits(['update:visible'])

const healthStore = useHealthStore()
const { 
  ingredients, 
  isGenerating, 
  chatHistory, 
  chatWindow,
  getRecipe, 
  pauseGeneration 
} = useChat()

const drawerVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const selectedTags = ref([])
const loading = ref(false)

const displayHistory = computed(() => 
  chatHistory.value.filter(msg => msg && msg.role && msg.role !== 'system')
)

// 修复 Bug 2：正确处理发送事件
const handleSend = async () => {
  if (!ingredients.value.trim()) return
  
  loading.value = true
  await getRecipe(
    props.userInfo, 
    props.aiInfo, 
    selectedTags.value, 
    healthStore
  )
  loading.value = false
}

// 自动滚动到底部
watch(chatHistory, () => {
  setTimeout(() => {
    if (chatWindow.value) {
      chatWindow.value.scrollTop = chatWindow.value.scrollHeight
    }
  }, 50)
}, { deep: true })
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f8f9fa;
}
.chat-input-wrapper {
  padding: 16px;
  border-top: 1px solid #eee;
  background: white;
}
.loading {
  text-align: center;
  color: #909399;
  padding: 12px;
  font-size: 13px;
}
</style>