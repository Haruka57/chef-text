import { ref, onMounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { api } from '../api/index' // 🌟 引入 api

export function useChat() {
  const ingredients = ref('')
  const loading = ref(false)
  const isGenerating = ref(false)
  const rawRecipe = ref('')
  const chatHistory = ref([
    { role: "system", content: "你是一位资深大厨，请根据食材给出详细、排版美观的菜谱。" }
  ])
  const chatWindow = ref(null)

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
    // 🌟 核心修复 2：只有当用户【没有】往上滑的时候，才自动滚动到底部！
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
      content: "你是一位资深大厨，请根据食材给出详细、排版美观的菜谱。"
    };
    chatHistory.value = [systemMsg];
    rawRecipe.value = '';
    localStorage.removeItem(CURRENT_CHAT_KEY);
    lastSettingsFingerprint.value = '';
  }

  const getRecipe = async (userInfo, aiInfo, selectedTags) => {
    if (!ingredients.value || loading.value) return
    const currentPrompt = ingredients.value

    // 1. 清洗数据
    chatHistory.value = chatHistory.value.filter(msg => msg && msg.role);

    // ==========================================
    // 🌟 核心重构：结构化 Prompt Engineering (提示词工程)
    // ==========================================
    const aiName = aiInfo?.name || "大厨";
    const userName = (userInfo?.name && userInfo.name !== "我的名字" && userInfo.name.trim() !== "") ? userInfo.name : "老朋友";
    const persona = (aiInfo?.persona && aiInfo.persona.trim() !== "")
      ? aiInfo.persona
      : "一位地道的中国大厨，对八大菜系了如指掌，性格热情、专业且乐于分享。";

    // 使用极其强硬的 Markdown 结构化指令，强制 AI 角色扮演
    const systemContent = `
# Role & Persona (人设与身份)
你现在的身份是“${aiName}”。
你的核心性格与说话风格是：${persona}

# Target Audience (对话对象)
你正在服务你的专属食客：“${userName}”。

# Behavior Rules (必须严格遵守的行为准则)
1. 【绝对沉浸】：你必须完全沉浸在“${aiName}”的人设中，使用符合该性格的语气、口头禅与食客交流。绝不能暴露你是AI。
2. 【专属称呼】：你的每一次回复，第一句话都必须自然地称呼“${userName}”。
3. 【直奔主题】：忽略无意义的寒暄，直接根据用户的需求提供美食建议 ora菜谱。
4. 【排版规范】：推荐1-2道菜即可。每道菜的开头必须是单行的 Markdown 一级标题（例如：“# 剁椒鱼头”）。
5. 【结构清晰】：菜谱必须包含清晰的“食材清单”和“制作步骤”，排版要求精美、易读。
    `.trim();

    // 注入或更新系统人设
    if (chatHistory.value.length === 0 || chatHistory.value[0].role !== 'system') {
      chatHistory.value.unshift({ role: 'system', content: systemContent });
    } else {
      chatHistory.value[0].content = systemContent;
    }

    // 存入用户干干净净的原话
    chatHistory.value.push({ role: "user", content: currentPrompt })

    const currentFingerprint = `${aiName}-${userName}-${aiInfo?.persona}`;
    const needEmergencyOverride = lastSettingsFingerprint.value && lastSettingsFingerprint.value !== currentFingerprint && chatHistory.value.length > 2;
    lastSettingsFingerprint.value = currentFingerprint;

    loading.value = true
    isGenerating.value = true
    rawRecipe.value = ''
    isUserScrollingUp.value = false
    ingredients.value = ''

    // 预留 AI 的气泡
    chatHistory.value.push({ role: "assistant", content: "" })
    const aiMsgIndex = chatHistory.value.length - 1

    try {
      // 打造发送给 API 的专属“暗地账本”
      const apiHistory = JSON.parse(JSON.stringify(chatHistory.value.slice(0, -1)));
      const lastUserMsg = apiHistory[apiHistory.length - 1];

      if (lastUserMsg && lastUserMsg.role === 'user') {
        let hiddenPrompt = currentPrompt;

        // 💡 强力口味注入：让大厨觉得是自己特意安排的
        if (selectedTags && selectedTags.length > 0) {
          hiddenPrompt += `\n\n（💡 旁白提示：食客 ${userName} 今天特别想吃符合以下口味/目标的菜：【${selectedTags.join('、')}】。请你务必在推荐时满足这些要求，并在对话中自然地提到你是为了照顾这些口味而特意准备的。）`;
        }

        // 🚨 强制切号指令：应对中途改人设的情况
        if (needEmergencyOverride) {
          hiddenPrompt += `\n\n（🚨 系统紧急指令：你的人设刚刚发生了突变！请立刻彻底抛弃你之前的性格和语气，强制切换为全新人设：“${persona}”。你的新名字是“${aiName}”。接下来的回复请立刻用新的人设口吻跟顾客打招呼！）`;
        }

        lastUserMsg.content = hiddenPrompt;
      }

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

      if (!isGenerating.value) {
        chatHistory.value[aiMsgIndex].content += " ...[已停止]"
      }
    } catch (error) {
      console.error('获取失败:', error)
      ElMessage.error('大厨开小差了，请重试！') // 🌟 修复了这里多写一个 ElMessage 的报错
      if (chatHistory.value[aiMsgIndex]) {
        chatHistory.value[aiMsgIndex].content = "出错了，请检查网络连接或后端服务。"
      }
    } finally {
      loading.value = false
      isGenerating.value = false
      rawRecipe.value = ''
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
