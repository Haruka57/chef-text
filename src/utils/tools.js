// ==========================================
// 🛠️ 全局通用工具箱 (src/utils/tools.js)
// ==========================================
import { ElMessage } from 'element-plus'
import { marked } from 'marked'

/**
 * 1. 无敌兼容版：复制文本到剪贴板
 */
export const copyToClipboard = (textToCopy) => {
  if (!textToCopy) return;

  // 现代浏览器支持的复制 API
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(textToCopy).then(() => ElMessage.success("复制成功！"));
    return;
  }

  // 兼容老旧浏览器和移动端浏览器的兜底方案
  const textArea = document.createElement("textarea");
  textArea.value = textToCopy;
  textArea.style.position = "fixed";
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    const successful = document.execCommand('copy');
    successful ? ElMessage.success("复制成功！(兼容模式)") : ElMessage.warning("请手动复制");
  } catch (err) {
    ElMessage.error("浏览器不支持复制");
  } finally {
    document.body.removeChild(textArea);
  }
};

/**
 * 2. 终极菜名提取器：从 AI 的大段 Markdown 回复中精准抠出菜名
 */
export const extractRecipeTitle = (aiText, userText) => {
  if (!aiText) return userText || '美味菜谱';
  // 匹配 Markdown 标题 (# 菜名)
  const hashMatch = aiText.match(/(?:^|\n)#+\s*([^\n(\[（]+)/);
  if (hashMatch) {
    let title = hashMatch[1].replace(/[*#-\s]/g, '').trim();
    if (title.length > 1) return title;
  }
  // 匹配加粗文字 (**菜名**)
  const boldMatch = aiText.match(/\*\*([^*]+)\*\*/);
  if (boldMatch) return boldMatch[1].trim();

  // 如果都没匹配到，就用用户发送的食材名字兜底
  return userText ? userText.replace(/[。，！!？?]/g, '').trim() : '美味菜谱';
};

/**
 * 3. 抖音搜索直达器：一键跳转到抖音搜索菜谱视频
 */
export const jumpToDouyinSearch = (keyword) => {
  if (!keyword) return;
  const cleanKeyword = keyword.replace(/[。，！!？?]/g, '').trim();
  const douyinSearchUrl = "https://www.douyin.com/search/" + encodeURIComponent(cleanKeyword + " 做法");
  window.open(douyinSearchUrl, '_blank');
};

/**
 * 4. 小纸条专属 Markdown 解析器
 */
export const renderPopupMarkdown = (text) => {
  if (!text) return '';
  return marked.parse(text);
};
