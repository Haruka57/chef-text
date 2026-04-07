import { ref, watch, onMounted } from "vue"
import { ElMessage } from "element-plus"

export function useHistory() {
  const savedRecipes = ref([]);
  const browsingHistory = ref([]);
  
  const FAVORITES_KEY = "chef_favorites";
  const HISTORY_KEY = "chef_browsing_history";

  // 1. 初始化读取本地缓存
  onMounted(() => {
    const localData = localStorage.getItem(FAVORITES_KEY);
    if (localData) savedRecipes.value = JSON.parse(localData);
    
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) browsingHistory.value = JSON.parse(savedHistory);
  });

  // 2. 自动监听浏览记录变化并保存
  watch(browsingHistory, (newVal) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newVal));
  }, { deep: true });

  // 3. 归档当前对话
  const archiveCurrentChat = (chatToArchive) => {
    // 🌟 核心防撞墙：严防 null.role
    if (!chatToArchive || !Array.isArray(chatToArchive) || chatToArchive.length <= 1) return;
    const displayMsgs = chatToArchive.filter(msg => msg && msg.role && msg.role !== "system");
    if (displayMsgs.length === 0) return;

    let finalTitle = "新对话";
    const aiMsgs = displayMsgs.filter(msg => msg.role === "assistant");
    if (aiMsgs.length > 0) {
      // 🌟 修复 Bug 3：更智能地从 AI 回复中提取标题（优先找带 # 的标题）
      const lastAiMsg = aiMsgs[aiMsgs.length - 1];
      const match = lastAiMsg.content.match(/(?:^|\n)#+\s*(.+)/);
      if (match && match[1]) {
        finalTitle = match[1].replace(/[#*`]/g, "").trim();
      } else {
        // 如果没有 # 标题，则提取第一行
        const firstLine = lastAiMsg.content.split("\n").find(l => l.trim() !== "");
        if (firstLine) finalTitle = firstLine.replace(/[#*`]/g, "").trim();
      }
    } else {
      const firstUserMsg = displayMsgs.find(msg => msg.role === "user");
      if (firstUserMsg) finalTitle = firstUserMsg.content;
    }

    if (finalTitle.length > 20) finalTitle = finalTitle.substring(0, 20) + "...";

    browsingHistory.value.unshift({
      id: Date.now(),
      time: new Date().toLocaleString(),
      prompt: finalTitle,
      messages: JSON.parse(JSON.stringify(chatToArchive))
    });

    if (browsingHistory.value.length > 30) {
      browsingHistory.value = browsingHistory.value.slice(0, 30);
    }
  };

  // 4. 删除浏览记录
  const deleteHistory = (index) => {
    browsingHistory.value.splice(index, 1);
  };

  // 5. 核心逻辑：收藏菜谱
  const saveRecipe = (content, extractedTitle) => {
    const textToSave = content;
    
    if (!textToSave) {
      ElMessage.warning("内容还在生成中或为空，无法收藏哦！");
      return;
    }

    // 小优化：查重，防止手抖连续点击重复收藏
    const isExist = savedRecipes.value.some(item => (item.content) === textToSave);
    if (isExist) {
      ElMessage.info("这篇菜谱已经收藏过啦！");
      return;
    }

    // 添加到数组头部
    savedRecipes.value.unshift({
      date: new Date().toLocaleString(),
      content: textToSave,
      title: extractedTitle || "收藏菜谱"
    });
    // 持久化到本地
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(savedRecipes.value));
  };

  // 6. 删除收藏
  const deleteRecipe = (index) => {
    savedRecipes.value.splice(index, 1);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(savedRecipes.value));
    ElMessage.success("已取消收藏");
  };

  // 🌟 核心中的核心：必须要全部 return 出去，App.vue 才能使用！！！
  return {
    savedRecipes,
    browsingHistory,
    archiveCurrentChat,
    deleteHistory,
    saveRecipe,
    deleteRecipe
  }
}
