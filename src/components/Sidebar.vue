<template>
  <div class="mobile-overlay" v-show="showMobileSidebar" @click="showMobileSidebar = false"></div>
  <aside class="sidebar" :class="{ 'is-collapsed': isCollapsed, 'mobile-show': showMobileSidebar }">
    <div class="sidebar-header">
      <h2 v-show="!isCollapsed || showMobileSidebar" class="logo-text"> AI 智厨</h2>
      <el-icon 
        class="toggle-btn" 
        style="font-size: 24px !important; width: 32px !important; height: 32px !important; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: #303133; flex-shrink: 0; border-radius: 6px;" 
        @click="toggleSidebar"
      >
        <Expand v-if="isCollapsed" style="width: 24px !important; height: 24px !important;" />
        <Fold v-else style="width: 24px !important; height: 24px !important;" />
      </el-icon>
    </div>

    <div class="new-chat-area">
      <div class="new-chat-btn" @click="emit('start-new-chat'); showMobileSidebar = false" :class="{ 'btn-collapsed': isCollapsed }">
        <el-icon><Plus /></el-icon>
        <span v-show="!isCollapsed || showMobileSidebar">新对话</span>
      </div>
    </div>

    <div class="history-container">
      <div class="history-title" v-show="!isCollapsed || showMobileSidebar">近期尝试</div>
      <div class="history-list">
        <div class="history-item" v-for="(item, index) in browsingHistory" :key="index" @click="emit('view-detail', item); showMobileSidebar = false">
          <div class="history-item-info" :title="item.prompt">
            <el-icon><ChatDotRound /></el-icon>
            <span v-show="!isCollapsed || showMobileSidebar" class="text-truncate">{{ item.prompt }}</span>
          </div>
          <el-icon v-show="!isCollapsed || showMobileSidebar" class="delete-icon" @click.stop="emit('delete-history', index)"><Close /></el-icon>
        </div>
      </div>
    </div>

    <div class="sidebar-bottom">
      <div class="menu-item" @click="emit('open-settings')">
        <el-icon><Setting /></el-icon><span v-show="!isCollapsed || showMobileSidebar">个性化设置</span>
      </div>
      <div class="menu-item" @click="emit('open-favorites')">
        <el-icon><Star /></el-icon><span v-show="!isCollapsed || showMobileSidebar">我的收藏</span>
      </div>
      <div class="menu-item danger-item" @click="emit('clear-memory')">
        <el-icon><Delete /></el-icon><span v-show="!isCollapsed || showMobileSidebar">重置历史记录</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { Fold, Expand, ChatDotRound, Plus, Close, Setting, Star, Delete } from '@element-plus/icons-vue'
const isCollapsed = defineModel('isCollapsed', { type: Boolean })
const showMobileSidebar = defineModel('showMobileSidebar', { type: Boolean })
const toggleSidebar = () => { window.innerWidth <= 768 ? showMobileSidebar.value = false : isCollapsed.value = !isCollapsed.value; };
const props = defineProps({ browsingHistory: { type: Array, default: () => [] } })
const emit = defineEmits(['start-new-chat', 'view-detail', 'delete-history', 'open-settings', 'open-favorites', 'clear-memory'])
</script>

<style scoped>
.sidebar-header { display: flex !important; align-items: center; justify-content: space-between; height: 60px; padding: 0 16px; flex-shrink: 0; }
.logo-text { font-size: 20px; margin: 0; color: #303133; white-space: nowrap; }
.sidebar { width: 260px; transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), left 0.3s ease !important; overflow: hidden; flex-shrink: 0; display: flex; flex-direction: column; }
.sidebar.is-collapsed { width: 68px !important; }
.toggle-btn:hover { color: #1a73e8 !important; background-color: #f0f4f9 !important; }

.new-chat-area { padding: 16px; flex-shrink: 0; }
.new-chat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  background-color: #1a73e8;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}
.new-chat-btn:hover { background-color: #1557b0; }
.btn-collapsed { width: 36px; padding: 0; margin: 0 auto; }

.history-container { flex: 1; overflow-y: auto; padding: 0 12px; }
.history-title { font-size: 12px; color: #909399; padding: 8px 12px; margin-top: 8px; }
.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #606266;
}
.history-item:hover { background-color: #f5f7fa; color: #303133; }
.history-item-info { display: flex; align-items: center; gap: 10px; overflow: hidden; flex: 1; }
.text-truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 14px; }
/* ?? 极致美化：给叉叉穿上“精致皮肤”，杜绝廉价感！ */
.delete-icon { 
  font-size: 22px !important; 
  width: 32px !important;    
  height: 32px !important;   
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%; 
  flex-shrink: 0;
  margin-left: 4px;
  color: #909399 !important; 
  background-color: transparent !important;
  opacity: 0.3;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* ?? 3. 鼠标悬浮时的精致状态 (UI 的高光时刻) */
.delete-icon:hover { 
  opacity: 1;
  color: #f56c6c !important; 
  background-color: #fef0f0 !important; 
  transform: scale(1.2) rotate(90deg); 
  box-shadow: 0 2px 10px rgba(245, 108, 108, 0.2);
}

.sidebar-bottom { padding: 12px; border-top: 1px solid #f2f6fc; }
.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
  transition: all 0.2s;
}
.menu-item:hover { background-color: #f5f7fa; color: #303133; }
.danger-item:hover { color: #f56c6c; background-color: #fef0f0; }

@media screen and (max-width: 768px) {
  .sidebar { position: fixed; left: -260px; top: 0; bottom: 0; background: white; z-index: 1001; }
  .sidebar.mobile-show { left: 0 !important; width: 260px !important; }
  .mobile-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; }
}
</style>


