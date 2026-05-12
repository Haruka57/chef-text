<template>
  <div class="dashboard">
    <!-- 顶部欢迎 + 快速操作 -->
    <div class="dashboard-header">
      <div>
        <h1>欢迎回来，{{ userStore.name }} 👋</h1>
        <p class="subtitle">今天的目标：健康变强壮</p>
      </div>
      <el-button type="primary" @click="showAICopilot = true">
        <el-icon><ChatDotRound /></el-icon> 问问 AI 大厨
      </el-button>
    </div>

    <el-row :gutter="24">
      <!-- 身体数据输入卡片 -->
      <el-col :xs="24" :sm="14">
        <HealthInputCard />
      </el-col>

      <!-- 今日热量目标卡片 -->
      <el-col :xs="24" :sm="10">
        <CalorieGoalCard />
      </el-col>
    </el-row>

    <!-- 其他模块（可后续扩展） -->
    <el-row :gutter="24" style="margin-top: 24px;">
      <el-col :span="24">
        <el-card>
          <template #header>本周饮食趋势（预留）</template>
          <div style="height: 200px; display: flex; align-items: center; justify-content: center; color: #999;">
            接入饮食记录后显示图表
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>

  <!-- AI 助手抽屉 -->
  <!-- 修复：必须传入 aiInfo 和 userInfo -->
  <AICopilotDrawer 
    v-model:visible="showAICopilot" 
    :ai-info="aiInfo"
    :user-info="userInfo"
  />
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../stores/userStore'
import { useHealthStore } from '../stores/healthStore'
import HealthInputCard from '../components/HealthInputCard.vue'
import CalorieGoalCard from '../components/CalorieGoalCard.vue'
import AICopilotDrawer from '../components/AICopilotDrawer.vue'
import { ChatDotRound } from '@element-plus/icons-vue'

const userStore = useUserStore()
const healthStore = useHealthStore()
const showAICopilot = ref(false)

// 新增这两个响应式对象，用于传递给 AI 助手
const userInfo = ref({
  name: userStore.name || "老朋友",
  avatar: userStore.avatar || ""
})

const aiInfo = ref({
  name: "AI 营养大厨",
  avatar: "👨‍🍳",
  persona: "你是一位精通临床营养学与中西烹饪的大厨，性格热心、严谨，擅长平衡美味与健康。"
})
</script>

<style scoped>
.dashboard { padding: 24px; max-width: 1400px; margin: 0 auto; }
.dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
.subtitle { color: #909399; margin: 4px 0 0; }

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>