import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useHealthStore = defineStore('health', () => {
  // 状态
  const gender = ref(localStorage.getItem('health_gender') || 'male')
  const age = ref(Number(localStorage.getItem('health_age')) || 30)
  const height = ref(Number(localStorage.getItem('health_height')) || 170)
  const weight = ref(Number(localStorage.getItem('health_weight')) || 70)
  const targetWeight = ref(Number(localStorage.getItem('health_targetWeight')) || 65)
  const activityLevel = ref(localStorage.getItem('health_activityLevel') || 'moderate')
  const dietaryPreferences = ref(localStorage.getItem('health_dietaryPreferences') || '')
  const goalType = ref(localStorage.getItem('health_goalType') || 'lose') // lose / maintain / gain

  // 持久化
  watch([gender, age, height, weight, targetWeight, activityLevel, dietaryPreferences, goalType], () => {
    localStorage.setItem('health_gender', gender.value)
    localStorage.setItem('health_age', age.value.toString())
    localStorage.setItem('health_height', height.value.toString())
    localStorage.setItem('health_weight', weight.value.toString())
    localStorage.setItem('health_targetWeight', targetWeight.value.toString())
    localStorage.setItem('health_activityLevel', activityLevel.value)
    localStorage.setItem('health_dietaryPreferences', dietaryPreferences.value)
    localStorage.setItem('health_goalType', goalType.value)
  }, { deep: true })

  // ==================== 核心计算（Mifflin-St Jeor） ====================
  const bmr = computed(() => {
    const w = weight.value
    const h = height.value
    const a = age.value
    if (gender.value === 'male') {
      return Math.round(10 * w + 6.25 * h - 5 * a + 5)
    } else {
      return Math.round(10 * w + 6.25 * h - 5 * a - 161)
    }
  })

  const tdee = computed(() => {
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very: 1.9
    }
    return Math.round(bmr.value * (multipliers[activityLevel.value] || 1.55))
  })

  const recommendedIntake = computed(() => {
    let base = tdee.value
    if (goalType.value === 'lose') base -= 500
    else if (goalType.value === 'gain') base += 300
    return Math.max(1200, Math.round(base)) // 安全下限
  })

  // 进度（距离目标）
  const weightProgress = computed(() => {
    if (!targetWeight.value || weight.value === targetWeight.value) return 100
    const diff = Math.abs(weight.value - targetWeight.value)
    // 假设20kg是一个较大的差距衡量区间
    return Math.min(100, Math.max(0, Math.round(100 - (diff / 20) * 100)))
  })

  // Actions
  function updateHealthData(data) {
    Object.keys(data).forEach(key => {
      if (this[key] !== undefined) this[key].value = data[key]
    })
  }

  function resetToDefault() {
    gender.value = 'male'
    age.value = 30
    height.value = 170
    weight.value = 70
    targetWeight.value = 65
    activityLevel.value = 'moderate'
    goalType.value = 'lose'
    dietaryPreferences.value = ''
  }

  return {
    gender, age, height, weight, targetWeight, activityLevel,
    dietaryPreferences, goalType,
    bmr, tdee, recommendedIntake, weightProgress,
    updateHealthData, resetToDefault,
    saveToLocalStorage: () => {}   // 修复：兼容旧调用
  }
})