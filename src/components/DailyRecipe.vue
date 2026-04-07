<template>
  <div class="welcome-box">
    <!-- AI 今日灵感卡片 -->
    <div class="welcome-banner">
      <div v-if="isFetchingDaily" class="fetching-state">
        <div class="loader-spinner"></div>
        <p>AI 厨师正在为您构思今日专属菜单...</p>
      </div>

      <div v-else-if="dailyRecommendation" class="recommendation-content">
        <div class="banner-emoji">{{ dailyRecommendation.emoji }}</div>
        <div class="tag-ai-generated">✨ AI 今日灵感</div>
        <h2 class="banner-title">
          不如尝尝 <span class="highlight">{{ dailyRecommendation.name }}</span> 
        </h2>
        <p class="banner-desc">{{ dailyRecommendation.desc }}</p>
        <el-button 
          type="primary" 
          round 
          size="large" 
          class="try-btn" 
          @click="useRecommendation"
        >
          就吃这个！
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../api/index'; // 🌟 引入刚写好的统一 api

const emit = defineEmits(['use-recommendation']);

const dailyRecommendation = ref(null);
const isFetchingDaily = ref(false);

const checkAndGenerateDailyRecipe = async () => {
  isFetchingDaily.value = true;
  try {
    // 🌟 1. 直接呼叫统一 API，再也不用写长长的 http 地址了！
    const aiRecipe = await api.getDailyRecipe();
    dailyRecommendation.value = aiRecipe;

  } catch (error) {
    console.error('每日推荐请求失败:', error);
    // 兜底数据：只有后端真挂了才会显示这个
    dailyRecommendation.value = { 
      name: '美味盲盒', 
      desc: '今日菜单还在酝酿中，不如随便输入个食材试试？', 
      emoji: '🎁' 
    };
  } finally {
    isFetchingDaily.value = false;
  }
};

const useRecommendation = () => {
  if (!dailyRecommendation.value) return;
  emit('use-recommendation', dailyRecommendation.value.name);
};

onMounted(() => {
  checkAndGenerateDailyRecipe();
});
</script>
