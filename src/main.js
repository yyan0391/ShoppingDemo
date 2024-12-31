import { createApp } from 'vue'
import App from './App.vue'
import Vant from 'vant';
import {
    FloatingPanel,
    showSuccessToast, 
    Loading, 
    Uploader,
    AddressEdit,
    AddressList,
    ActionSheet,
    Divider,
    CouponCell, 
    CouponList,
    Dialog, 
    SwipeCell, 
    Toast,
    ActionBar, 
    ActionBarIcon, 
    ActionBarButton, 
    SubmitBar, 
    Swipe, 
    SwipeItem, 
    showToast,
    Checkbox, 
    CheckboxGroup,
    Tab, 
    Tabs,
    Picker,

 } from 'vant';
import router from './router'
import store from './store';
import {
    Skeleton,
    SkeletonTitle,
    SkeletonImage,
    SkeletonAvatar,
    SkeletonParagraph,
  } from 'vant';



import './assets/main.css'
import 'amfe-flexible';
import 'normalize.css';
import 'vant/lib/index.css';

// import axios from 'axios'
// import Antd from 'ant-design-vue'
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";


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
app.use(Divider);
app.use(ActionSheet);
app.use(AddressList);
app.use(AddressEdit);
app.use(Uploader);
app.use(Loading);
app.use(Skeleton);
app.use(SkeletonTitle);
app.use(SkeletonImage);
app.use(SkeletonAvatar);
app.use(SkeletonParagraph);
app.use(showSuccessToast);
app.use(FloatingPanel);
app.use(Tab);
app.use(Tabs);
app.use(Picker);

app.mount('#app');

