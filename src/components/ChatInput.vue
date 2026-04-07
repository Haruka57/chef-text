<template>
  <div class="input-area" ref="inputAreaRef">
    <div class="pause-btn-wrapper" v-if="isGenerating">
      <el-button type="info" round plain @click="emit('pause')" class="pause-btn">
        <el-icon><VideoPause /></el-icon> 停止输出
      </el-button>
    </div>

    <div class="input-container-group">
      <!-- 1. 常驻偏好区 (类似 Gemini 附件) -->
      <div class="selected-tags-preview" v-if="selectedTags.length > 0">
        <div class="preview-scroll">
          <span class="preview-tag" v-for="tag in selectedTags" :key="tag">
            {{ tag }}
            <el-icon class="remove-icon" @click="toggleTag(tag)"><Close /></el-icon>
          </span>
        </div>
        <el-button link type="info" size="small" class="clear-btn" @click="clearPreferences">清空</el-button>
      </div>

      <!-- 2. 核心大容器 (Gemini 风格) -->
      <div class="input-area-anchor">
        <!-- 3. 悬浮偏好面板 -->
        <transition name="popover">
          <div v-if="showPreferences" class="floating-preferences-panel">
            <div class="preferences-drawer">
              <div class="drawer-header">
                <span class="drawer-title">口味设置</span>
                <el-button 
                  link 
                  type="primary" 
                  size="small" 
                  @click="clearPreferences"
                  v-show="selectedTags.length > 0"
                >
                  恢复默认
                </el-button>
              </div>
              
              <div class="drawer-content">
                <div v-for="(category, index) in preferenceData" :key="index" class="category-group">
                  <span class="category-title">{{ category.title }}：</span>
                    <span
                      v-for="tag in category.tags"
                      :key="tag"
                      class="tag"
                      :class="{ active: selectedTags.includes(tag) }"
                      @click="toggleTag(tag)"
                    >
                      {{ tag }}
                    </span>
                </div>
              </div>
            </div>
          </div>
        </transition>

        <div class="gemini-input-wrapper">
          <div class="gemini-input-container">
            <el-button circle class="action-btn" @click.stop="showPreferences = !showPreferences">
              <el-icon class="toggle-icon" :class="{ 'rotate-close': showPreferences }"><Plus /></el-icon>
            </el-button>
            
            <el-input
              v-model="ingredients"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 6 }"
              placeholder="问点什么，或者输入你拥有的食材..."
              :disabled="isGenerating"
              @keydown.enter.exact.prevent="handleSubmit"
              class="gemini-textarea"
              @focus="showPreferences = false"
            />

            <div class="send-btn-wrapper">
              <el-button 
                circle 
                :icon="Promotion" 
                @click="handleSubmit" 
                :disabled="isGenerating || !ingredients.trim()" 
                class="send-btn" 
                :class="{ 'is-active': ingredients.trim() && !isGenerating }" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { VideoPause, Close, Plus, Promotion } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 使用 defineModel 实现双向绑定
const ingredients = defineModel('ingredients', { type: String, default: '' })
const selectedTags = defineModel('selectedTags', { type: Array, default: () => [] })

// 接收父组件的状态
const props = defineProps({
  isGenerating: {
    type: Boolean,
    default: false
  }
})

// 定义向父组件发射的动作事件
const emit = defineEmits(['submit', 'pause'])

// 偏好设置状态与数据 (从 App.vue 搬迁过来)
const showPreferences = ref(false);
const inputAreaRef = ref(null);

const handleClickOutside = (event) => {
  if (showPreferences.value && inputAreaRef.value && !inputAreaRef.value.contains(event.target)) {
    showPreferences.value = false;
  }
};

const preferenceData = ref([
  { title: '饮食目标', tags: ['减脂餐', '增肌餐', '营养均衡', '低碳水'] },
  { title: '口味偏好', tags: ['清淡', '无辣不欢', '少油少盐', '酸甜口'] },
  { title: '菜式风格', tags: ['快手菜', '家常小炒', '煲汤', '甜品'] }
]);

const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag);
  if (index === -1) {
    selectedTags.value.push(tag);
  } else {
    selectedTags.value.splice(index, 1);
  }
  localStorage.setItem('chefPreferences', JSON.stringify(selectedTags.value));
};

const clearPreferences = () => {
  selectedTags.value = [];
  localStorage.removeItem('chefPreferences');
  ElMessage.info('已恢复默认口味设置');
};

const handleSubmit = () => {
  if (ingredients.value.trim() && !props.isGenerating) {
    emit('submit')
  }
}

// 初始化时从本地加载口味设置
onMounted(() => {
  const savedTags = localStorage.getItem('chefPreferences');
  if (savedTags) {
    selectedTags.value = JSON.parse(savedTags);
  }
  document.addEventListener('click', handleClickOutside);
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
})
</script>
