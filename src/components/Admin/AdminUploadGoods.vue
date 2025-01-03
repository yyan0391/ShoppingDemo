<template>
  <div style="background-color: beige; min-height: 100vh;">
    <van-nav-bar title="上传商品" left-arrow @click-left="$router.go(-1)" :border="false" />

    <div class="upload-page">
      <van-overlay v-model:show="isUploading" z-index="2000">
        <van-loading size="30px" type="spinner" vertical>上传中...</van-loading>
      </van-overlay>
      <van-form @submit="handleUpload">

        <!-- 商品名称 -->
        <van-field v-model="product.title" label="商品名称" placeholder="请输入商品名称" required />
        <!-- 商品描述 -->
        <van-field v-model="product.description" label="商品描述" placeholder="请输入商品描述" required rows="3" type="textarea" />
        <!-- 商品价格 -->
        <van-field v-model="product.price" label="商品价格（¥）" required>
          <template #input>
            <van-stepper v-model="product.price" />
          </template>
        </van-field>

        <van-field v-model="product.quantity" label="商品库存（个）" required>
          <template #input>
            <van-stepper v-model="product.quantity" />
          </template>
        </van-field>

        <van-field
          v-model="selectedCategoryText"
          is-link
          readonly
          required
          label="商品类别"
          placeholder="选择商品类别"
          @click="showPicker = true"
        />
        <van-popup v-model:show="showPicker" destroy-on-close round position="bottom">
          <van-picker
            title="选择商品类别"
            :columns="categories"
            @cancel="showPicker = false"
            @confirm="onConfirmCategory"
          />
        </van-popup>

        <!-- 商品标签 -->
        <van-field v-model="product.tag" label="标签" required>
          <template #input>
            <van-radio-group v-model="product.tag" direction="horizontal">
              <van-radio name="热销">热销</van-radio>
              <van-radio name="新品">新品</van-radio>
              <van-radio name="推荐">推荐</van-radio>
            </van-radio-group>
          </template>
        </van-field>

        <!-- 商品图片 -->
        <van-field label="商品图片" required>
          <template #input>
            <van-uploader 
              v-model="imageFiles" 
              multiple 
              max-count="5" 
              :after-read="handleImageRead"
              @oversize="handleOversize" />
          </template>
        </van-field>

        <!-- 商品详情图片 -->
        <van-field label="商品详情图片" required>
          <template #input>
            <van-uploader 
              v-model="detailImageFiles" 
              multiple 
              max-count="10" 
              :after-read="handleDetailImageRead"
              @oversize="handleDetailOversize" />
          </template>
        </van-field>

        <!-- 提交按钮 -->
        <div style="margin-top: 20px;">
          <van-button type="primary" block native-type="submit">上传商品</van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script>
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebaseConfig";
import { showToast, showSuccessToast } from "vant";
import { v4 as uuidv4 } from "uuid";

export default {
  name: "AdminUploadGoods",
  data() {
    return {
      product: {
        id: "", // 自动生成
        title: "",
        description: "",
        price: 0,
        quantity: 0,
        tag: "热销",
        images: [],
        category: "",
        productDetailImages: [], 
        isInCart: false,
        count: 0,
        isInCheck: false,
        isAvailable: true, // 商品默认上架
      },
      categories: [
        { text: "MUSIC", value: "MUSIC" },
        { text: "PHOTO", value: "PHOTO" },
        { text: "CONCERT", value: "CONCERT" },
        { text: "LIVING", value: "LIVING" },
        { text: "STATIONARY", value: "STATIONARY" },
        { text: "FASHION", value: "FASHION" },
      ],
      selectedCategoryText: "", // 用户选择的类别文本
      selectedCategoryValue: "", // 用户选择的类别值
      showPicker: false, // 是否显示 Picker 弹窗
      imageFiles: [], // 上传的图片文件数组
      detailImageFiles: [],
      isUploading: false,
    };
  },
  methods: {
    onConfirmCategory(option) {
      console.log("用户选择的类别：", option);
      this.selectedCategoryText = option.selectedOptions[0].text; // 显示的类别文本
      this.selectedCategoryValue = option.selectedOptions[0].value; // 存储的类别值
      this.showPicker = false; // 关闭弹窗
    },
    handleImageRead(file) {
      const allowedFormats = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedFormats.includes(file.type)) {
        showToast("只支持 JPG、PNG 或 GIF 格式的图片");
        return false;
      }
      if (file.size > 2 * 1024 * 1024) {
        showToast("文件大小不能超过 2MB");
        return false;
      }
      this.imageFiles.push(file.file);
    },
    handleDetailImageRead(file) {
      const allowedFormats = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedFormats.includes(file.type)) {
        showToast("只支持 JPG、PNG 或 GIF 格式的图片");
        return false;
      }
      if (file.size > 2 * 1024 * 1024) {
        showToast("文件大小不能超过 2MB");
        return false;
      }
      this.detailImageFiles.push(file.file); // 新增：处理详情图片
    },
    handleDetailOversize() {
      showToast("最多上传 10 张详情图片"); // 新增：处理详情图片超出数量
    },
    handleOversize() {
      showToast("最多上传 5 张图片");
    },
    
    async handleUpload() {
      if (!this.product.title || !this.product.description || !this.product.price || !this.product.quantity || this.imageFiles.length === 0 || this.detailImageFiles.length === 0) {
        showToast("请填写完整商品信息");
        return;
      }

      const productId = uuidv4(); // 自动生成商品 ID
      const imageUrls = [];
      const detailImageUrls = [];

      this.isUploading = true;

      try {
        // 遍历上传图片
        for (let i = 0; i < this.imageFiles.length; i++) {
          const file = this.imageFiles[i].file;
          const fileRef = ref(storage, `products/${productId}_${i}`); // 存储路径
          const metadata = {
            contentType: file.type, // 设置 MIME 类型
          };

          console.log("准备上传文件：", file);

          // 上传图片到 Firebase Storage
          await uploadBytesResumable(fileRef, file, metadata);
          const imageUrl = await getDownloadURL(fileRef);
          console.log("图片上传成功，下载链接：", imageUrl);
          imageUrls.push(imageUrl);
        }
        
         // 上传商品详情图片
         for (let i = 0; i < this.detailImageFiles.length; i++) {
          const file = this.detailImageFiles[i].file;
          const fileRef = ref(storage, `products/${productId}_detail_${i}`);
          // const metadata = {
          //   contentType: file.type, // 设置 MIME 类型
          // };
          await uploadBytesResumable(fileRef, file);
          const detailImageUrl = await getDownloadURL(fileRef);
          detailImageUrls.push(detailImageUrl);
        }

        // 保存商品信息到 Firestore
        const productData = {
          id: productId,
          title: this.product.title,
          description: this.product.description,
          price: parseFloat(this.product.price),
          quantity: parseInt(this.product.quantity),
          tag: this.product.tag,
          images: imageUrls,
          category: this.selectedCategoryValue,
          productDetailImages: detailImageUrls,
          isInCart: false,
          count: 0,
          isInCheck: false,
          createdAt: new Date(),
          isAvailable: true, // 商品默认上架
        };

        await setDoc(doc(db, "products", productId), productData);


        showSuccessToast("商品上传成功");
        this.$router.go(-1);
      } catch (error) {
        console.error("商品上传失败:", error);
        showToast("商品上传失败，请稍后重试");
      } finally {
        this.isUploading = false;
      }
    },
  },
};
</script>

<style scoped>
.upload-page {
  padding: 25px;
}
</style>