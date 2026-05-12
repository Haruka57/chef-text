import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useHealthStore = defineStore('health', () => {
  // ========== 原有状态 ==========
  const gender = ref(localStorage.getItem('health_gender') || 'male')
  const age = ref(Number(localStorage.getItem('health_age')) || 30)
  const height = ref(Number(localStorage.getItem('health_height')) || 170)
  const weight = ref(Number(localStorage.getItem('health_weight')) || 70)
  const targetWeight = ref(Number(localStorage.getItem('health_targetWeight')) || 65)
  const activityLevel = ref(localStorage.getItem('health_activityLevel') || 'moderate')
  const dietaryPreferences = ref(localStorage.getItem('health_dietaryPreferences') || '')
  const goalType = ref(localStorage.getItem('health_goalType') || 'lose')

  // ========== 新增热量记账状态 ==========
  const consumedCalories = ref(Number(localStorage.getItem('health_consumedCalories')) || 0)
  const foodLogs = ref(JSON.parse(localStorage.getItem('health_foodLogs') || '[]'))

  // 持久化
  watch([gender, age, height, weight, targetWeight, activityLevel, dietaryPreferences, goalType, consumedCalories, foodLogs], () => {
    localStorage.setItem('health_gender', gender.value)
    localStorage.setItem('health_age', age.value)
    localStorage.setItem('health_height', height.value)
    localStorage.setItem('health_weight', weight.value)
    localStorage.setItem('health_targetWeight', targetWeight.value)
    localStorage.setItem('health_activityLevel', activityLevel.value)
    localStorage.setItem('health_dietaryPreferences', dietaryPreferences.value)
    localStorage.setItem('health_goalType', goalType.value)
    localStorage.setItem('health_consumedCalories', consumedCalories.value)
    localStorage.setItem('health_foodLogs', JSON.stringify(foodLogs.value))
  }, { deep: true })

  // ========== 原有计算属性 (Mifflin-St Jeor 公式) ==========
  const bmr = computed(() => {
    if (gender.value === 'male') {
      return 10 * weight.value + 6.25 * height.value - 5 * age.value + 5
    } else {
      return 10 * weight.value + 6.25 * height.value - 5 * age.value - 161
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
    return Math.round(bmr.value * (multipliers[activityLevel.value] || 1.2))
  })

  const recommendedIntake = computed(() => {
    if (goalType.value === 'lose') return tdee.value - 500
    if (goalType.value === 'gain') return tdee.value + 400
    return tdee.value
  })

  // ========== 新增计算属性 ==========
  const remainingCalories = computed(() => {
    const remain = recommendedIntake.value - consumedCalories.value
    return {
      value: remain,
      isOver: remain < 0,
      text: remain >= 0 
        ? `还可以摄入 ${remain} kcal` 
        : `已超标 ${Math.abs(remain)} kcal`
    }
  })

  // ========== Action ==========
  function addFoodRecord(record) {
    const newRecord = {
      id: Date.now(),
      name: record.name,
      calories: record.calories,
      time: record.time || new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      type: record.type || 'text'
    }
    
    foodLogs.value.unshift(newRecord)
    consumedCalories.value += record.calories
  }

  function resetDailyLogs() {
    consumedCalories.value = 0
    foodLogs.value = []
  }

  function updateHealthData(newData) {
    if (newData.weight) weight.value = newData.weight
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
    consumedCalories.value = 0
    foodLogs.value = []
  }

  return {
    gender, age, height, weight, targetWeight, activityLevel, dietaryPreferences, goalType,
    bmr, tdee, recommendedIntake,
    consumedCalories, foodLogs, remainingCalories,
    addFoodRecord, resetDailyLogs, updateHealthData, resetToDefault,
    saveToLocalStorage: () => {}
  }
})