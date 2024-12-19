import { createApp } from 'vue'
import App from './App.vue'
import Vant from 'vant';
import {CouponCell, CouponList,Dialog, SwipeCell, Toast,ActionBar, ActionBarIcon, ActionBarButton, SubmitBar, Swipe, SwipeItem, showToast,Checkbox, CheckboxGroup } from 'vant';
import router from './router'
import store from './store';


import './assets/main.css'
import 'amfe-flexible';
import 'normalize.css';
import 'vant/lib/index.css';

// import axios from 'axios'
// import Antd from 'ant-design-vue'


const app = createApp(App);
app.use(router); 
app.use(store);
app.use(Vant);
app.use(SubmitBar);
app.use(ActionBar);
app.use(ActionBarIcon);
app.use(ActionBarButton);
app.use(Swipe);
app.use(SwipeItem);
app.use(showToast);
app.use(Checkbox);
app.use(CheckboxGroup);
app.use(Toast);
app.use(SwipeCell);
app.use(Dialog);
app.use(CouponList);
app.use(CouponCell);

app.mount('#app');

