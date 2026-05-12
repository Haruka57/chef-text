const CHAT_API_BASE = 'http://localhost:8081/api'

export const api = {
  async fetchChatStream(payload) {
    return await fetch(`${CHAT_API_BASE}/recipe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  }
}

