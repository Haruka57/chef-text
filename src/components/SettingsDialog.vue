<template>
  <el-dialog v-model="visible" title="个性化设置" width="450px" class="settings-dialog" style="max-width: 90%; border-radius: 12px;">
    <div class="settings-form">
      <div class="setting-section">
        <div class="section-label">我的资料</div>
        <div class="profile-editor">
          <div class="avatar-preview-wrapper">
            <div class="avatar-preview">
              <img v-if="isUrl(userInfo.avatar)" :src="userInfo.avatar" />
              <span v-else>{{ userInfo.avatar || '🧑' }}</span>
            </div>
            <div class="avatar-actions">
              <el-upload action="" :auto-upload="false" :show-file-list="false" :on-change="(file) => handleAvatarUpload(file, 'user')">
                <el-button size="small" type="primary" plain>上传图片</el-button>
              </el-upload>
              <el-button v-if="isUrl(userInfo.avatar)" size="small" type="info" plain @click="userInfo.avatar = '🧑'">恢复 Emoji</el-button>
            </div>
          </div>
          
          <div class="info-inputs">
            <el-input v-model="userInfo.name" placeholder="设置你的称呼"><template #prepend>称呼</template></el-input>
            <el-input :model-value="isUrl(userInfo.avatar) ? '已启用图片头像' : userInfo.avatar" @update:model-value="val => userInfo.avatar = val" :disabled="isUrl(userInfo.avatar)" placeholder="直接输入 Emoji 符号"><template #prepend>Emoji</template></el-input>
          </div>
        </div>
      </div>

      <el-divider />

      <div class="setting-section">
        <div class="section-label">助手设定</div>
        <div class="profile-editor">
          <div class="avatar-preview-wrapper">
            <div class="avatar-preview">
              <img v-if="isUrl(aiInfo.avatar)" :src="aiInfo.avatar" />
              <span v-else>{{ aiInfo.avatar || '👨‍🍳' }}</span>
            </div>
            <div class="avatar-actions">
              <el-upload action="" :auto-upload="false" :show-file-list="false" :on-change="(file) => handleAvatarUpload(file, 'ai')">
                <el-button size="small" type="primary" plain>更换图片</el-button>
              </el-upload>
              <el-button v-if="isUrl(aiInfo.avatar)" size="small" type="info" plain @click="aiInfo.avatar = '👨‍🍳'">恢复 Emoji</el-button>
            </div>
          </div>
          
          <div class="info-inputs">
            <el-input v-model="aiInfo.name" placeholder="设置大厨的名字"><template #prepend>名字</template></el-input>
            <el-input :model-value="isUrl(aiInfo.avatar) ? '已启用图片头像' : aiInfo.avatar" @update:model-value="val => aiInfo.avatar = val" :disabled="isUrl(aiInfo.avatar)" placeholder="在此输入 Emoji"><template #prepend>Emoji</template></el-input>
          </div>
        </div>

        <div class="persona-setting">
          <div class="persona-label">个性化人设与回复风格：</div>
          <el-input v-model="aiInfo.persona" type="textarea" :rows="3" placeholder="例如：你是一位性格火辣的川菜大师，说话干脆利落..." />
        </div>
      </div>

      <el-divider />

      <div class="setting-section">
        <div class="section-label">🏥 健康档案（私人营养师专用）</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px;">
          <el-select v-model="healthProfile.gender" placeholder="性别">
            <el-option label="男" value="male" />
            <el-option label="女" value="female" />
          </el-select>
          <el-input v-model.number="healthProfile.age" type="number" placeholder="年龄">
            <template #prepend>年龄</template>
          </el-input>
          <el-input v-model.number="healthProfile.height" type="number" placeholder="身高(cm)">
            <template #prepend>身高</template>
          </el-input>
          <el-input v-model.number="healthProfile.weight" type="number" placeholder="当前体重(kg)">
            <template #prepend>当前体重</template>
          </el-input>
          <el-input v-model.number="healthProfile.targetWeight" type="number" placeholder="目标体重(kg)">
            <template #prepend>目标体重</template>
          </el-input>
          <el-select v-model="healthProfile.activityLevel" placeholder="活动强度">
            <el-option label="久坐（几乎不运动）" value="sedentary" />
            <el-option label="轻度活动（每周1-3天）" value="light" />
            <el-option label="中度活动（每周3-5天）" value="moderate" />
            <el-option label="活跃（每周6-7天）" value="active" />
            <el-option label="非常活跃（重体力劳动）" value="very" />
          </el-select>
        </div>
        <el-input 
          v-model="healthProfile.dietaryPreferences" 
          type="textarea" 
          :rows="2" 
          placeholder="饮食偏好/禁忌（如：不吃辣、过敏花生、低碳水...）" 
          style="margin-top: 12px;"
        />
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="emit('save')">保存并生效</el-button>
      </span>
    </template>
  </el-dialog>

  <el-dialog v-model="showCropperDialog" title="调整头像位置" width="600px" style="max-width: 95%;" append-to-body>
    <div style="width: 100%; height: 400px; background: #f8f8f8; border-radius: 8px; overflow: hidden;">
      <VueCropper ref="cropperRef" :img="cropperOption.img" :autoCrop="true" :autoCropWidth="200" :autoCropHeight="200" :fixed="true" :fixedNumber="[1, 1]" :fixedBox="true" :centerBox="true" mode="cover" />
    </div>
    <div style="margin-top: 12px; text-align: center; color: #999; font-size: 12px;">提示：鼠标滚轮缩放，左键按住拖动</div>
    <template #footer>
      <el-button @click="showCropperDialog = false">取消</el-button>
      <el-button type="primary" @click="finishCropping">完成裁剪</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { VueCropper } from 'vue-cropper'

// 使用 Vue 3.4+ 的 defineModel 接收父组件传来的数据，并能自动双向绑定！
const visible = defineModel('visible', { type: Boolean, default: false })
const userInfo = defineModel('userInfo', { type: Object })
const aiInfo = defineModel('aiInfo', { type: Object })
const healthProfile = defineModel('healthProfile', { type: Object, default: () => ({}) });

// 定义向父组件发射的保存事件
const emit = defineEmits(['save'])

const isUrl = (str) => {
  return str && (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:image'));
};

// 头像裁剪相关状态 (把原本在 App.vue 里的全搬过来了)
const cropperRef = ref(null);
const showCropperDialog = ref(false);
const currentCroppingRole = ref(null);
const cropperOption = ref({ img: '' });

const handleAvatarUpload = (uploadFile, role) => {
  const file = uploadFile.raw;
  if (!file.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件哦！');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片太大了！请上传 5MB 以内的图片。');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    cropperOption.value.img = e.target.result;
    currentCroppingRole.value = role;
    showCropperDialog.value = true;
  };
  reader.readAsDataURL(file);
};

const finishCropping = () => {
  if (!cropperRef.value) {
    ElMessage.error('裁剪器加载失败，请尝试刷新。');
    return;
  }

  // console.log('🚀 准备完成裁剪，当前角色:', currentCroppingRole.value);

  // 调用 vue-cropper 获取 base64 数据
  cropperRef.value.getCropData((data) => {
    if (!data) {
      ElMessage.error('获取裁剪数据失败，请重试');
      return;
    }

    // console.log('💾 获取到裁剪数据，长度:', data.length);

    // 【修正核心】使用展开运算符，确保 defineModel 触发全新的对象引用，强制响应式更新
    if (currentCroppingRole.value === 'user') {
      userInfo.value = { ...userInfo.value, avatar: data };
    } else {
      aiInfo.value = { ...aiInfo.value, avatar: data };
    }

    // 关闭裁剪弹窗
    showCropperDialog.value = false;
    ElMessage.success('头像设置成功');
  });
};
</script>

<style scoped>
/* =========================================
   个性化设置弹窗内部响应式居中排版修复
========================================= */

/* 1. 确保弹窗内部边距更紧凑 */
:deep(.settings-dialog .el-dialog__body) {
  padding: 20px 24px !important;
}

/* 2. 左右分栏布局：左头像，右输入 */
.profile-editor {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  gap: 24px;
}

/* 3. 左侧头像区域包装器 */
.avatar-preview-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center; /* 【核心修复】水平居中区域内的子元素 */
  gap: 12px;
  width: 100px; /* 固定左侧宽度 */
  flex-shrink: 0;
}

/* 4. 头像预览圆形区域 */
.avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid #e4e7ed;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保证图片在圆形中不变形 */
}

/* 5. 头像下方按钮区域 */
.avatar-actions {
  display: flex;
  flex-direction: column;
  align-items: center; /* 【核心修复】居中对齐里面的按钮 */
  gap: 8px;
  width: 100%; /* 占满 wrapper 宽度 */
}

/* 6. 按钮专属样式：去除外边距，强制文字居中 */
.avatar-actions .el-button {
  margin: 0 !important; /* 清除 Element Plus 默认的外边距 */
  width: 90px; /* 设置稍微窄一点的固定宽度，看起来更居中 */
  justify-content: center; /* 居中按钮内文字 */
}

/* 7. 右侧输入框铺满剩余空间 */
.info-inputs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
