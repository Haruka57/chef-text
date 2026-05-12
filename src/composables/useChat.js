import { ref, onMounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { api } from '../api/index'
import { useHealthStore } from '../stores/healthStore' // ?? 引入健康 Store

export function useChat() {
  const ingredients = ref('')
  const loading = ref(false)
  const isGenerating = ref(false)
  const rawRecipe = ref('')
  const chatHistory = ref([
    { role: "system", content: "你是一位资深大厨且懂营养学，请根据食材和健康目标给出建议。" }
  ])
  const chatWindow = ref(null)

  const healthStore = useHealthStore() // 实例化
  const isUserScrollingUp = ref(false)
  const lastSettingsFingerprint = ref('');
  const CURRENT_CHAT_KEY = 'ai_chef_current_chat'

  const loadCurrentChat = () => {
    const saved = localStorage.getItem(CURRENT_CHAT_KEY)
    if (saved) {
      chatHistory.value = JSON.parse(saved)
    }
  }

  const saveCurrentChat = () => {
    localStorage.setItem(CURRENT_CHAT_KEY, JSON.stringify(chatHistory.value))
  }

  watch(chatHistory, () => {
    saveCurrentChat()
    scrollToBottom()
  }, { deep: true })

  const scrollToBottom = async () => {
    await nextTick()
    if (chatWindow.value && !isUserScrollingUp.value) {
      chatWindow.value.scrollTop = chatWindow.value.scrollHeight
    }
  }

  const pauseGeneration = () => {
    isGenerating.value = false
    loading.value = false
    ElMessage.info('已停止输出')
  }

  const clearMemory = () => {
    const systemMsg = chatHistory.value.find(m => m && m.role === 'system') || {
      role: "system",
      content: "你是一位资深大厨且懂营养学，请根据食材和健康目标给出建议。"
    };
    chatHistory.value = [systemMsg];
    rawRecipe.value = '';
    localStorage.removeItem(CURRENT_CHAT_KEY);
    lastSettingsFingerprint.value = '';
  }

  const getRecipe = async (userInfo, aiInfo, selectedTags) => {
    if (!ingredients.value || loading.value) return
    const currentPrompt = ingredients.value

    chatHistory.value = chatHistory.value.filter(msg => msg && msg.role);

    const aiName = aiInfo?.name || "AI 营养大厨";
    const userName = (userInfo?.name && userInfo.name !== "我的名字" && userInfo.name.trim() !== "") ? userInfo.name : "老朋友";
    const persona = (aiInfo?.persona && aiInfo.persona.trim() !== "")
      ? aiInfo.persona
      : "一位精通临床营养学与中西烹饪的大厨，性格热心、严谨，擅长平衡美味与健康。";

    // 构建动态健康背景
    const healthContext = `
# 用户的健康档案 (核心参考数据)
- 当前体重: ${healthStore.weight}kg
- 目标体重: ${healthStore.targetWeight}kg
- 目标类型: ${healthStore.goalType === 'lose' ? '减脂/减重' : healthStore.goalType === 'gain' ? '增肌/增重' : '维持健康'}
- 建议每日摄入: ${healthStore.recommendedIntake} kcal
- TDEE: ${healthStore.tdee} kcal
- 个人偏好: ${healthStore.dietaryPreferences || '无特殊偏好'}
    `.trim();

    const systemContent = `
# Role & Persona
你现在的身份是“${aiName}”。你的核心人设是：${persona}

${healthContext}

# 对话目标
你正在为食客“${userName}”提供专属营养方案。

# 行为限制
1. 每次回复开头必须亲切地称呼“${userName}”。
2. 给出菜谱或建议时，必须结合其实阶健康参数（如“考虑到你正处于减脂期...”或“这道菜的热量约为...符合你每日${healthStore.recommendedIntake}大卡的要求”）。
3. 菜法名称使用一级标题 #。
4. 必须包含“营养点评”板块。
    `.trim();

    if (chatHistory.value.length === 0 || chatHistory.value[0].role !== 'system') {
      chatHistory.value.unshift({ role: 'system', content: systemContent });
    } else {
      chatHistory.value[0].content = systemContent;
    }

    chatHistory.value.push({ role: "user", content: currentPrompt })

    loading.value = true
    isGenerating.value = true
    rawRecipe.value = ''
    isUserScrollingUp.value = false
    ingredients.value = ''

    chatHistory.value.push({ role: "assistant", content: "" })
    const aiMsgIndex = chatHistory.value.length - 1

    try {
      const apiHistory = JSON.parse(JSON.stringify(chatHistory.value.slice(0, -1)));
      const response = await api.fetchChatStream(apiHistory);

      if (!response.ok) throw new Error('网络请求失败')

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let currentReply = ''

      while (isGenerating.value) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        currentReply += chunk
        chatHistory.value[aiMsgIndex].content = currentReply
        rawRecipe.value = currentReply
        scrollToBottom()
      }
    } catch (error) {
      console.error('获取失败:', error)
      ElMessage.error('服务连接异常')
    } finally {
      loading.value = false
      isGenerating.value = false
    }
  }

  onMounted(() => {
    loadCurrentChat()
  })

  return {
    ingredients,
    loading,
    isUserScrollingUp,
    isGenerating,
    rawRecipe,
    chatHistory,
    chatWindow,
    getRecipe,
    pauseGeneration,
    clearMemory,
    scrollToBottom
  }
}