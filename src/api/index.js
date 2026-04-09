// ==========================================
// 🌐 全局网络请求统一管理中心 (src/api/index.js)
// ==========================================

// 1. 统一配置后端地址
const CHAT_API_BASE = 'http://8.130.81.209:8081/api';
const DAILY_API_BASE = 'http://8.130.81.209:3000/api';


// 2. 导出所有的请求方法
export const api = {

  /**
   * 获取每日推荐菜谱
   */
  async getDailyRecipe() {
    const response = await fetch(`${DAILY_API_BASE}/daily-recipe`);
    if (!response.ok) throw new Error(`后端响应错误: ${response.status}`);
    return await response.json();
  },

  /**
   * 发送对话并获取 AI 流式回复
   * @param {Array} messages - 历史对话数组
   */
  async fetchChatStream(messages) {
    return await fetch(`${CHAT_API_BASE}/recipe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });
  }
};
