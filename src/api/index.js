const CHAT_API_BASE = '/api'   // 必须使用相对路径 + 代理

export const api = {
  async fetchChatStream(payload) {
    return await fetch(`${CHAT_API_BASE}/recipe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  },

  // ==================== 修复：图片识别接口 ====================
  async analyzeFood(data) {
    const res = await fetch(`${CHAT_API_BASE}/analyze-food`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!res.ok) {
      throw new Error('识别接口异常')
    }
    return await res.json()
  }
}