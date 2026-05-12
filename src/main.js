import { createApp } from 'vue'
import App from './App.vue'
// 引入 Element Plus 和它的样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'

// 强制全局引入裁剪器样式
import 'vue-cropper/dist/index.css'

const app = createApp(App)
app.use(ElementPlus)
app.use(createPinia())
app.mount('#app')