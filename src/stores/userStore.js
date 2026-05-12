import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useUserStore = defineStore('user', () => {
  const name = ref(localStorage.getItem('chef_name') || '我的名字')
  const avatar = ref(localStorage.getItem('chef_avatar') || '🧑')

  // 自动持久化
  watch([name, avatar], () => {
    localStorage.setItem('chef_name', name.value)
    localStorage.setItem('chef_avatar', avatar.value)
  }, { deep: true })

  function updateProfile(newName, newAvatar) {
    if (newName !== undefined) name.value = newName
    if (newAvatar !== undefined) avatar.value = newAvatar
  }

  return { name, avatar, updateProfile }
})