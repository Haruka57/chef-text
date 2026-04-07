import { ref, onMounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { api } from '../api/index' // 🌟 引入 api

export function useChat() {
  const ingredients = ref('')
  const loading = ref(false)
  const isGenerating = ref(false)
  const rawRecipe = ref('')
  const chatHistory = ref([
    { role: "system", content: "你是一位资深大厨，请根据食材给出详细、排版美观的菜谱。如果用户提出修改意见，请结合之前的对话进行调整。" }
  ])
  const chatWindow = ref(null)

  // 🌟 核心修复 1：定义这个判断用户是否在滑动的变量
  const isUserScrollingUp = ref(false)

  // 🌟 修复滞后性：新增一个指纹探测器，用来感知设置是否在中途发生了改变
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

  // 🌟 修复 1：安全的清空记忆逻辑，再也不会出现 undefined
  const clearMemory = () => {
    // 找出原来的系统人设，如果找不到就生成一个默认的
    const systemMsg = chatHistory.value.find(m => m && m.role === 'system') || {
      role: "system",
      content: "你是一位资深大厨，请根据食材给出详细、排版美观的菜谱。"
    };
    // 只保留人设这一条消息
    chatHistory.value = [systemMsg];
    rawRecipe.value = '';
    localStorage.removeItem(CURRENT_CHAT_KEY);
    lastSettingsFingerprint.value = ''; // 🌟 清空记忆时，同步清空指纹
    // 这里不用重复弹窗，App.vue 里已经有弹窗了
  }

  // 🌟 修复 2：带有人设注入和偏好标签拼接的安全请求逻辑
  const getRecipe = async (userInfo, aiInfo, selectedTags) => {
    if (!ingredients.value || loading.value) return
    const currentPrompt = ingredients.value

    // 1. 清洗数据
    chatHistory.value = chatHistory.value.filter(msg => msg && msg.role);

    // 🌟 核心重构：将用户的自定义风格与身份完美融合
    const aiName = aiInfo?.name || "大厨";
    const userName = (userInfo?.name && userInfo.name !== "我的名字" && userInfo.name.trim() !== "") ? userInfo.name : "老朋友";

    // 基础身份设定
    let baseIdentity = `你现在的身份是“${aiName}”，正在和你的食客“${userName}”聊天。\n`;

    // 🌟 核心修复：把用户在“个性化设置”里填写的风格加回来！
    if (aiInfo?.persona && aiInfo.persona.trim() !== "") {
      baseIdentity += `【你的性格与厨艺设定】：${aiInfo.persona}\n`;
    } else {
      // 如果用户没填，才使用默认的中国大厨设定
      baseIdentity += `【你的性格与厨艺设定】：你是一位地道的中国大厨，对八大菜系了如指掌，性格亲切且专业。\n`;
    }

    // 行为准则：强制约束排版，防止前端解析出错
    const behaviorRules = `
【必须严格遵守的指令】：
1. 以${aiName}的身份，用符合上述性格的口吻，亲切地称呼“${userName}”。
2. 请跳过无意义的食材科普和历史背景，直接切入正题给出菜谱。
3. 推荐1-2道菜即可。每道菜的开头必须是单行的 Markdown 一级标题（例如：“# 剁椒鱼头”）。
4. 每道菜必须包含“食材清单”和“制作步骤”，排版精美。`;

    const systemContent = baseIdentity + behaviorRules;

    // 注入系统人设
    if (chatHistory.value.length === 0 || chatHistory.value[0].role !== 'system') {
      chatHistory.value.unshift({ role: 'system', content: systemContent });
    } else {
      chatHistory.value[0].content = systemContent;
    }

    // 🌟 核心修复 1：页面上只存入用户干干净净的原话，绝不显示系统指令！
    chatHistory.value.push({ role: "user", content: currentPrompt })

    // 探测指纹是否改变，判断是否需要强制切号
    const currentFingerprint = `${aiName}-${userName}-${aiInfo?.persona}`;
    const needEmergencyOverride = lastSettingsFingerprint.value && lastSettingsFingerprint.value !== currentFingerprint && chatHistory.value.length > 2;

    // 更新最新指纹
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
      // 🌟 🌟 🌟 核心修复 2：打造发送给 API 的专属“暗地账本” 🌟 🌟 🌟
      // 克隆一份历史记录给大模型看（不包含最后那条空的 assistant）
      const apiHistory = JSON.parse(JSON.stringify(chatHistory.value.slice(0, -1)));
      const lastUserMsg = apiHistory[apiHistory.length - 1];

      if (lastUserMsg && lastUserMsg.role === 'user') {
        let hiddenPrompt = currentPrompt;

        // 1. 在暗地账本里偷偷拼接口味偏好
        if (selectedTags && selectedTags.length > 0) {
          hiddenPrompt += `\n（另外，${userName}今天想吃得符合这些口味：${selectedTags.join('、')}，请根据你的厨艺设定帮他安排。）`;
        }

        // 2. 在暗地账本里偷偷塞入强制切号指令！
        if (needEmergencyOverride) {
          hiddenPrompt += `\n\n【系统紧急覆盖指令】：用户的个性化设置刚刚已刷新！请你立刻抛弃上文中的历史聊天语气和习惯，强制切换为新设定：“${aiInfo?.persona || '专业厨师'}”！\n记住，你的新名字是“${aiName}”，你要服务的食客叫“${userName}”。\n接下来的回复，第一句话必须用新的人设口吻主动叫出“${userName}”！`;
        }

        // 把包装好的刺客长文本塞给它
        lastUserMsg.content = hiddenPrompt;
      }

      // 🌟 确保使用的是“暗地账本” (apiHistory) 发送请求！
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
      ElMessage.ElMessage.error('大厨开小差了，请重试！')
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
    isUserScrollingUp, // 🌟 核心修复 3：把它导出，这样 App.vue 才能获取到！
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
