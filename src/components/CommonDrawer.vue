<template>
  <div>
    <el-drawer
      v-model="internalVisible"
      title="⭐ 我的私人菜单"
      direction="rtl"
      size="320px"
      @closed="$emit('close')"
    >
      <div v-if="recipeStore.favorites.length === 0" class="empty-tip">
        尚未收藏任何菜谱
      </div>
      <div 
        v-for="item in recipeStore.favorites" 
        :key="item.id" 
        class="drawer-item"
        @click="viewFavorite(item)"
      >
        <div class="item-header">
          <span class="item-title">{{ item.title }}</span>
          <el-button type="danger" icon="Delete" circle size="small" @click.stop="recipeStore.removeFavorite(item.id)"/>
        </div>
        <div class="item-date">{{ item.date }}</div>
      </div>
    </el-drawer>

    <!-- 修复 Bug 3：详情弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="currentItem.title" 
      width="90%" 
      class="recipe-dialog"
      append-to-body
    >
      <div class="recipe-content-wrapper">
        <div class="markdown-body" v-html="renderPopupMarkdown(currentItem.content)"></div>
      </div>
      <template #footer>
        <el-button type="danger" plain @click="deleteAndClose">取消收藏</el-button>
        <el-button type="primary" @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRecipeStore } from '../stores/recipeStore'

// 修复：改成正确的导出名
import { renderPopupMarkdown } from '../utils/tools'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['update:visible', 'close'])

const recipeStore = useRecipeStore()
const internalVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const dialogVisible = ref(false)
const currentItem = ref({})

const viewFavorite = (item) => {
  currentItem.value = item
  dialogVisible.value = true
}

const deleteAndClose = () => {
  recipeStore.removeFavorite(currentItem.value.id)
  dialogVisible.value = false
}
</script>

<style scoped>
.empty-tip {
  text-align: center;
  color: #999;
  padding: 40px 0;
}
.drawer-item {
  padding: 16px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background 0.2s;
}
.drawer-item:hover {
  background: #f9f9f9;
}
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.item-title {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}
.item-date {
  font-size: 12px;
  color: #999;
}
.recipe-content-wrapper {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 10px;
}
:deep(.recipe-dialog) {
  border-radius: 12px;
}
</style>