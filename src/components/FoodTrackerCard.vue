<template>
  <el-card class="food-tracker-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span>🍽️ 今日热量记账</span>
        <el-button size="small" type="danger" plain @click="resetDaily">重置今日</el-button>
      </div>
    </template>

    <!-- 热量进度 -->
    <div class="progress-wrapper">
      <div class="progress-info">
        <span>已摄入 <strong>{{ healthStore.consumedCalories }}</strong> kcal</span>
        <span class="target">目标 {{ healthStore.recommendedIntake }} kcal</span>
      </div>
      <el-progress 
        :percentage="progressPercent" 
        :color="healthStore.remainingCalories.isOver ? '#f56c6c' : '#67c23a'"
        :stroke-width="14"
      />
      <div class="remain-text" :class="{ over: healthStore.remainingCalories.isOver }">
        {{ healthStore.remainingCalories.text }}
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <el-input 
        v-model="inputText" 
        placeholder="我刚吃了 200g 水煮鸡胸肉..." 
        @keyup.enter="handleSubmit"
        :disabled="isAnalyzing"
      >
        <template #suffix>
          <el-icon class="camera-btn" @click="triggerFileUpload">
            <Camera />
          </el-icon>
        </template>
      </el-input>

      <!-- 图片预览 -->
      <div v-if="previewImage" class="image-preview">
        <img :src="previewImage" alt="预览" />
        <el-icon class="delete-preview" @click="clearPreview"><Close /></el-icon>
      </div>

      <el-button 
        type="primary" 
        :loading="isAnalyzing" 
        @click="handleSubmit" 
        style="margin-top: 12px; width: 100%"
      >
        {{ previewImage ? '识别并记录' : '记录饮食' }}
      </el-button>
    </div>

    <!-- 今日记录列表 -->
    <div class="log-section" v-if="healthStore.foodLogs.length > 0">
      <div class="log-title">今日记录</div>
      <div class="log-list">
        <div 
          v-for="log in healthStore.foodLogs" 
          :key="log.id" 
          class="log-item"
        >
          <div class="log-main">
            <span class="log-name">{{ log.name }}</span>
            <span class="log-time">{{ log.time }}</span>
          </div>
          <span class="log-calories">+{{ log.calories }} kcal</span>
        </div>
      </div>
    </div>
    <div v-else class="empty-tip">还没有饮食记录</div>

    <!-- 隐藏的文件选择 -->
    <input 
      ref="fileInput" 
      type="file" 
      accept="image/*" 
      style="display: none" 
      @change="onFileChange"
    />
  </el-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useHealthStore } from '../stores/healthStore'
import { Camera, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { api } from '../api/index'

const healthStore = useHealthStore()

const inputText = ref('')
const previewImage = ref(null)
const selectedFile = ref(null)
const isAnalyzing = ref(false)
const fileInput = ref(null)

const progressPercent = computed(() => {
  const target = healthStore.recommendedIntake || 2000
  return Math.min(Math.round((healthStore.consumedCalories / target) * 100), 100)
})

// 触发文件选择
const triggerFileUpload = () => {
  fileInput.value.click()
}

// 文件选择处理
const onFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  selectedFile.value = file
  const reader = new FileReader()
  reader.onload = (ev) => {
    previewImage.value = ev.target.result
  }
  reader.readAsDataURL(file)
  inputText.value = '' // 清空文字输入
}

// 清除图片预览
const clearPreview = () => {
  previewImage.value = null
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

// 提交逻辑（打通后端 + Store）
const handleSubmit = async () => {
  if (!inputText.value.trim() && !selectedFile.value) {
    ElMessage.warning('请输入文字或选择图片')
    return
  }

  isAnalyzing.value = true

  try {
    let result

    if (selectedFile.value && previewImage.value) {
      // ==================== 修复：图片识别调用 ====================
      result = await api.analyzeFood({ 
        image: previewImage.value   // Base64
      })
    } else {
      // 文字识别
      result = await api.analyzeFood({ 
        text: inputText.value 
      })
    }

    // 更新全局热量记录
    healthStore.addFoodRecord({
      name: result.foodName,
      calories: result.calories || result.estimatedCalories || 300,
      type: selectedFile.value ? 'image' : 'text'
    })

    ElMessage.success(`已记录：${result.foodName}（${result.calories || result.estimatedCalories} kcal）`)

    // 清空表单
    inputText.value = ''
    clearPreview()

  } catch (error) {
    console.error(error)
    ElMessage.error('识别失败，请检查网络或稍后重试')
  } finally {
    isAnalyzing.value = false
  }
}

const resetDaily = () => {
  healthStore.resetDailyLogs()
  ElMessage.success('今日记录已重置')
}
</script>

<style scoped>
.food-tracker-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.progress-wrapper {
  margin: 16px 0 24px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 8px;
}

.remain-text {
  text-align: center;
  margin-top: 8px;
  font-size: 14px;
  font-weight: 500;
}
.remain-text.over {
  color: #f56c6c;
}

.input-area {
  margin-bottom: 20px;
}

.camera-btn {
  font-size: 20px;
  color: #409eff;
  cursor: pointer;
}

.image-preview {
  position: relative;
  margin-top: 12px;
  display: inline-block;
}
.image-preview img {
  max-width: 120px;
  max-height: 80px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
}
.delete-preview {
  position: absolute;
  top: -6px;
  right: -6px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
}

.log-section {
  margin-top: 16px;
}
.log-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #606266;
}
.log-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}
.log-main {
  display: flex;
  align-items: center;
  gap: 8px;
}
.log-name {
  font-weight: 500;
}
.log-time {
  font-size: 12px;
  color: #909399;
}
.log-calories {
  color: #f56c6c;
  font-weight: 600;
}
.empty-tip {
  text-align: center;
  color: #909399;
  padding: 20px 0;
  font-size: 14px;
}
</style>