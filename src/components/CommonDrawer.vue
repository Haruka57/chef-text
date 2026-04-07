<template>
  <el-drawer
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    :title="title"
    direction="rtl"
    size="300px"
  >
    <div v-if="items.length === 0" class="empty-state">
      <el-empty :description="emptyText" :image-size="100"></el-empty>
    </div>

    <div v-else class="drawer-list">
      <div v-for="(item, index) in items" :key="index" class="drawer-item" @click="$emit('view', item)">
        <div class="item-info" :title="item.title || item.prompt">
          <el-icon class="star-icon"><Star /></el-icon>
          <span class="text-truncate">{{ item.title || item.prompt || truncateText(item.content) }}</span>
        </div>
        
        <el-button 
          type="danger" 
          text 
          circle 
          size="small"
          class="delete-btn"
          @click.stop="$emit('delete', index)"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
// 🌟 引入垃圾桶图标 Delete
import { Star, Delete } from '@element-plus/icons-vue'

defineProps({
  visible: Boolean,
  title: String,
  items: { type: Array, default: () => [] },
  emptyText: String
})

defineEmits(['update:visible', 'view', 'delete'])

const truncateText = (text) => {
  if (!text) return '无内容';
  const cleanText = text.replace(/[#*]/g, '').trim();
  return cleanText.length > 20 ? cleanText.substring(0, 20) + '...' : cleanText;
}
</script>

<style scoped>
.empty-state { margin-top: 50px; }

.drawer-list {
  display: flex;
  flex-direction: column;
  padding: 0 12px;
  width: 100%; /* 🌟 强制列表占满全宽 */
  box-sizing: border-box;
}

.drawer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #606266;
  width: 100%; /* 🌟 强制这一行撑满全宽，绝不退缩！ */
  box-sizing: border-box;
}

.drawer-item:hover { 
  background-color: #f5f7fa; 
  color: #303133; 
}

.item-info { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  overflow: hidden; 
  flex: 1; 
  min-width: 0; 
}

.star-icon {
  color: #e6a23c; 
  flex-shrink: 0; 
}

.text-truncate { 
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis; 
  font-size: 14px; 
}

/* 🌟 垃圾桶按钮的专属特效 */
.delete-btn {
  flex-shrink: 0;
  margin-left: 8px;
  opacity: 0.4; /* 平时看起来淡一点，不抢戏 */
  transition: all 0.3s;
}

/* 只有当鼠标悬浮在这一行菜谱上时，垃圾桶才亮起 */
.drawer-item:hover .delete-btn {
  opacity: 1;
  background-color: #fef0f0;
}
</style>
