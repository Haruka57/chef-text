<template>
  <el-card class="health-card">
    <template #header>📋 我的身体数据</template>
    
    <el-form label-width="100px" label-position="left">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="性别">
            <el-select v-model="healthStore.gender" style="width: 100%">
              <el-option label="男" value="male"/>
              <el-option label="女" value="female"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="年龄">
            <el-input v-model.number="healthStore.age" type="number" style="width: 100%">
              <template #append>岁</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="身高">
            <el-input v-model.number="healthStore.height" type="number" style="width: 100%">
              <template #append>cm</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="体重">
            <el-input v-model.number="healthStore.weight" type="number" style="width: 100%">
              <template #append>kg</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="目标体重">
            <el-input v-model.number="healthStore.targetWeight" type="number" style="width: 100%">
              <template #append>kg</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="活动强度">
            <el-select v-model="healthStore.activityLevel" style="width: 100%">
              <el-option label="久坐" value="sedentary"/>
              <el-option label="轻度" value="light"/>
              <el-option label="中度" value="moderate"/>
              <el-option label="活跃" value="active"/>
              <el-option label="极强" value="very"/>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="我的目标">
        <el-radio-group v-model="healthStore.goalType" size="small">
          <el-radio-button value="lose">减重</el-radio-button>
          <el-radio-button value="maintain">维持</el-radio-button>
          <el-radio-button value="gain">增重</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="偏好/禁忌">
        <el-input v-model="healthStore.dietaryPreferences" type="textarea" :rows="2" placeholder="如：不吃辣、低碳水..."/>
      </el-form-item>

      <el-button type="primary" @click="saveHealthData" style="width: 100%; margin-top: 8px;">
        保存并更新目标
      </el-button>
    </el-form>
  </el-card>
</template>

<script setup>
import { useHealthStore } from '../stores/healthStore'
import { ElMessage } from 'element-plus'

const healthStore = useHealthStore()

const saveHealthData = () => {
  // 修复 Bug：healthStore 已经通过 watch 自动持久化，无需手动调用
  ElMessage.success('身体数据已更新，AI 将根据最新数据为您服务')
}
</script>

<style scoped>
.health-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

/* 兼容小屏幕 */
@media (max-width: 480px) {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>