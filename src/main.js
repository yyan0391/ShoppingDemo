import './assets/main.css'
import 'amfe-flexible';
import 'normalize.css';
import 'vant/lib/index.css';

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Vant from 'vant';
// import axios from 'axios'
// import Antd from 'ant-design-vue'


const app = createApp(App);
app.use(router); 
app.mount('#app');
app.use(Vant);

