<template>
  <el-card class="goal-card">
    <template #header>🔥 今日热量目标</template>
    
    <div class="goal-number">
      <span class="number">{{ healthStore.recommendedIntake }}</span>
      <span class="unit">kcal</span>
    </div>
    
    <div class="stats">
      <div class="stat-item">
        <span class="label">BMR (基础代谢)</span>
        <span class="value">{{ healthStore.bmr }} kcal</span>
      </div>
      <div class="stat-item">
        <span class="label">TDEE (总消耗)</span>
        <span class="value">{{ healthStore.tdee }} kcal</span>
      </div>
    </div>

    <div class="progress-section">
      <div class="progress-label">
        <span>体重管理进度</span>
        <span>目标: {{ healthStore.targetWeight }}kg</span>
      </div>
      <el-progress 
        :percentage="healthStore.weightProgress" 
        :color="healthStore.goalType === 'lose' ? '#67c23a' : '#409eff'"
        :stroke-width="12"
      />
    </div>
  </el-card>
</template>

<script setup>
import { useHealthStore } from '../stores/healthStore'
const healthStore = useHealthStore()
</script>

<style scoped>
.goal-card {
  height: 100%;
}
.goal-number { text-align: center; margin: 20px 0; }
.number { font-size: 64px; font-weight: 700; color: #303133; line-height: 1; }
.unit { font-size: 20px; color: #909399; margin-left: 4px; }

.stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 24px 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}
.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}
.stat-item .label { color: #606266; }
.stat-item .value { font-weight: 600; color: #303133; }

.progress-section {
  margin-top: 24px;
}
.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}
</style>