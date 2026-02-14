import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { piniaPersist } from './plugins/piniaPersist'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// 创建Pinia实例
const pinia = createPinia()
// 启用Pinia持久化插件
pinia.use(piniaPersist)

app.use(pinia)
app.use(router)

app.mount('#app')
