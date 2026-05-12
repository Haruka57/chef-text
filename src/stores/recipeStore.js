import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useRecipeStore = defineStore('recipe', () => {
  const favorites = ref(JSON.parse(localStorage.getItem('ai_chef_favorites') || '[]'))

  function addFavorite(recipeContent) {
    let title = '未命名菜谱'

    // 修复 Bug 3：智能提取菜谱标题 (优先提取 Markdown 一级/二级标题)
    const match = recipeContent.match(/(?:^|\n)#{1,2}\s*(.+)/)
    if (match && match[1]) {
      title = match[1].replace(/[*`]/g, '').trim()
    } else {
      // 兜底：取前 15 个字
      title = recipeContent.replace(/[#*`\n]/g, '').trim().slice(0, 15) + (recipeContent.length > 15 ? '...' : '')
    }

    favorites.value.unshift({
      id: Date.now(),
      title,
      content: recipeContent,
      date: new Date().toLocaleString()
    })
  }

  function removeFavorite(id) {
    favorites.value = favorites.value.filter(item => item.id !== id)
  }

  watch(favorites, (newVal) => {
    localStorage.setItem('ai_chef_favorites', JSON.stringify(newVal))
  }, { deep: true })

  return {
    favorites,
    addFavorite,
    removeFavorite
  }
})