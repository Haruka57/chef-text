<template>
  <div class="chef-layout">
    <Sidebar 
      v-model:isCollapsed="isCollapsed"
      v-model:showMobileSidebar="showMobileSidebar"
      :browsingHistory="browsingHistory"
      @start-new-chat="startNewChat"
      @view-detail="viewDetail"
      @delete-history="deleteHistory"
      @open-settings="showSettings = true"
      @open-favorites="drawerVisible = true"
      @clear-memory="clearMemory"
    />

    <main class="main-content">
      <div class="mobile-header">
        <el-icon class="mobile-menu-btn" @click="showMobileSidebar = true">
          <Expand />
        </el-icon>
        <h2 class="mobile-title"> AI 营养智厨</h2>
      </div>

      <!-- 核心仪表盘视图 -->
      <Dashboard />
      
    </main>

    <CommonDrawer 
      v-model:visible="drawerVisible" 
      title="⭐ 我的私人菜单" 
      emptyText="还没有收藏任何菜谱哦~"
      @view="viewFavorite" 
    />

    <SettingsDialog 
      v-model:visible="showSettings" 
      v-model:userInfo="userInfo" 
      @save="saveSettings" 
    />
  </div>
</template>

<script setup>
import { ref } from "vue"
import Sidebar from "./components/Sidebar.vue"
import Dashboard from "./views/Dashboard.vue"
import CommonDrawer from "./components/CommonDrawer.vue"
import SettingsDialog from "./components/SettingsDialog.vue"
import { Expand } from "@element-plus/icons-vue"
import { useHistory } from "./composables/useHistory"
import { useUserStore } from "./stores/userStore"
import { useRecipeStore } from "./stores/recipeStore"
import { ElMessage } from "element-plus"

const { 
  browsingHistory, 
  deleteHistory 
} = useHistory()

const userStore = useUserStore()
const recipeStore = useRecipeStore()
const isCollapsed = ref(false)
const showMobileSidebar = ref(false)
const drawerVisible = ref(false)
const showSettings = ref(false)

const userInfo = ref({
  name: userStore.name,
  avatar: userStore.avatar
})

const startNewChat = () => {
    ElMessage.info('请点击“问问 AI 大厨”开始咨询')
}

const saveSettings = () => {
  userStore.updateProfile(userInfo.value.name, userInfo.value.avatar)
  showSettings.value = false
  ElMessage.success("账户设置已保存")
}

const viewDetail = (item) => {
    // 历史查看逻辑
}

const viewFavorite = (item) => {
    // 收藏查看逻辑
}

const clearMemory = () => {
    // 清理逻辑
}
</script>

<style>
@import "./style.css";
@import "./assets/css/AppStyle.css";

.chef-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #f5f7fa;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  position: relative;
  display: flex;
  flex-direction: column;
}

.mobile-header {
  display: none;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  align-items: center;
}

@media (max-width: 768px) {
  .mobile-header {
    display: flex;
  }
}
</style>
