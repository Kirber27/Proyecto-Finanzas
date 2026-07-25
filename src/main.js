import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/theme.css'
import App from './App.vue'
import router from './router'
import './store/theme'

createApp(App).use(router).mount('#app')
