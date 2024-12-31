<template>
    <div>
        <van-nav-bar title="修改商品" left-arrow left-text="返回" @click-left="goBack" class="custom-title"></van-nav-bar>
        <div class="update-container">
            <van-overlay v-if="isUploading">
                <van-loading color="#1989fa" size="30px" type="spinner" vertical>修改中...</van-loading>
            </van-overlay>

            <van-form @submit="handleUpdate">

                <!-- 商品名称 -->
                <van-field v-model="product.title" label="商品名称" :placeholder="originalProduct.title" required />
                <!-- 商品描述 -->
                <van-field v-model="product.description" label="商品描述" :placeholder="originalProduct.description"
                    required rows="3" type="textarea" />
                <!-- 商品价格 -->
                <van-field v-model="product.price" label="商品价格（¥）" required>
                    <template #input>
                        <van-stepper v-model="product.price" />
                    </template>
                </van-field>

                <!-- 商品库存 -->
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
                :placeholder="originalCategory || '选择商品类别'"
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
                <van-field v-model="product.tag" label="标签">
                    <template #input>
                        <van-radio-group v-model="product.tag" direction="horizontal">
                            <van-radio name="热销">热销</van-radio>
                            <van-radio name="新品">新品</van-radio>
                            <van-radio name="推荐">推荐</van-radio>
                        </van-radio-group>
                    </template>
                </van-field>

                <!-- 商品图片 -->
                <van-field label="商品图片">
                    <template #input>
                        <van-uploader v-model="imageFiles" multiple max-count="5"
                            :file-list="originalProduct.images.map((url) => ({ url }))" :after-read="handleImageRead"
                            @oversize="handleOversize" />
                    </template>
                </van-field>

                <!-- 商品详情图片 -->
                <van-field label="商品详情图片">
                    <template #input>
                        <van-uploader v-model="detailImageFiles" multiple
                            :file-list="originalProduct.productDetailImages.map((url) => ({ url }))" max-count="5"
                            :after-read="handleDetailImageRead" @oversize="handleOversize" />
                    </template>
                </van-field>

                <!-- 提交按钮 -->
                <div style="margin-top: 20px;">
                    <van-button type="primary" block native-type="submit">更新商品</van-button>
                </div>
            </van-form>
        </div>
    </div>
</template>

<script>
import { doc, updateDoc, getDocs} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebaseConfig";
import { showToast, showSuccessToast } from "vant";
import { collection } from "firebase/firestore";

export default {
    data() {
        return {
            product: {
                title: "",
                description: "",
                price: 0,
                category: "",
                quantity: 0,
                tag: "热销",
                images: [],
                productDetailImages: [],
            },
            categories: [
                { text: "MUSIC", value: "MUSIC" },
                { text: "PHOTO", value: "PHOTO" },
                { text: "CONCERT", value: "CONCERT" },
                { text: "LIVING", value: "LIVING" },
                { text: "STATIONARY", value: "STATIONARY" },
                { text: "FASHION", value: "FASHION" },
            ],
            selectedCategoryText:  "", // 显示的类别文本
            selectedCategoryValue: "", // 存储的类别值
            originalCategory: "", // 修改前的类别值      
            originalProduct: {},
            imageFiles: [],
            detailImageFiles: [],
            isUploading: false,
            showPicker: false,
            


        };
    },
    created() {
        this.loadOriginalProductFromQuery();
        console.log(this.originalProduct);
    },
    methods: {
        onConfirmCategory(option) {
      console.log("用户选择的类别：", option);
      this.selectedCategoryText = option.selectedOptions[0].text; // 显示的类别文本
      this.selectedCategoryValue = option.selectedOptions[0].value; // 存储的类别值
      this.showPicker = false; // 关闭弹窗
    },
        loadOriginalProductFromQuery() {
            try {
                const productData = JSON.parse(this.$route.query.item);
                this.originalProduct = productData;
                this.originalCategory = productData.category || "";
                this.product = {
                    title: productData.title,
                    description: productData.description,
                    price: productData.price,
                    quantity: productData.quantity,
                    category: productData.category,
                    tag: productData.tag,
                    images: [productData.images],
                    productDetailImages: [productData.productDetailImages],
                }
            }
            catch (e) {
                console.log(e);
            }
        },
        handleOversize(file) {
            const allowedFormats = ["image/jpeg", "image/png", "image/gif"];
            if (!allowedFormats.includes(file.type)) {
                showToast("只支持 JPG、PNG 或 GIF 格式的图片");
                return false;
            }
            if (file.size > 2 * 1024 * 1024) {
                showToast("文件大小不能超过 2MB");
                return false;
            }
        },
        handleImageRead(file) {
            handleOversize(file)
            this.imageFiles.push(file.file);
        },
        handleDetailImageRead(file) {
            handleOversize(file)
            this.detailImageFiles.push(file.file);
        },
        async handleUpdate() {
            if (!this.product.title || !this.product.description || !this.product.price || !this.product.quantity) {
                showToast("请填写完整商品信息");
                return;
            }

            this.isUploading = true;
            const productId = this.originalProduct.id; // 获取商品 ID
            const newImageUrls = [];
            const newDetailImageUrls = [];

            try {
                // 上传新主图片
                for (let i = 0; i < this.imageFiles.length; i++) {
                    const file = this.imageFiles[i].file;
                    const fileRef = ref(storage, `products/${productId}_${i}`);
                    await uploadBytesResumable(fileRef, file);
                    const imageUrl = await getDownloadURL(fileRef);
                    newImageUrls.push(imageUrl);
                }

                // 上传新详情图片
                for (let i = 0; i < this.detailImageFiles.length; i++) {
                    const file = this.detailImageFiles[i].file;
                    const fileRef = ref(storage, `products/${productId}_detail_${i}`);
                    await uploadBytesResumable(fileRef, file);
                    const detailImageUrl = await getDownloadURL(fileRef);
                    newDetailImageUrls.push(detailImageUrl);
                }

                // 更新商品数据
                const updatedProduct = {
                    ...this.product,
                    category: this.selectedCategoryValue || this.originalCategory,
                    images: newImageUrls.length > 0 ? newImageUrls : this.originalProduct.images,
                    productDetailImages: newDetailImageUrls.length > 0 ? newDetailImageUrls : this.originalProduct.productDetailImages,
                };

                await updateDoc(doc(db, "products", productId), updatedProduct);

                // 更新所有用户的购物车
                await this.updateCarts(productId, updatedProduct);

                showSuccessToast("商品信息更新成功");
                this.$router.go(-1);
            } catch (error) {
                console.error("更新商品信息失败：", error);
                showToast("更新失败，请稍后重试");
            } finally {
                this.isUploading = false;
            }
        },

        async updateCarts(productId, updatedProduct) {
            try {
                // 获取所有用户购物车
                const cartSnapshot = await getDocs(collection(db, "cart"));
                for (const userCart of cartSnapshot.docs) {
                    const cartData = userCart.data();
                    const updatedItems = cartData.items.map((item) => {
                        if (item.id === productId) {
                            // 更新商品信息
                            return {
                                ...item,
                                title: updatedProduct.title,
                                description: updatedProduct.description,
                                price: updatedProduct.price,
                                category: updatedProduct.category,
                                images: updatedProduct.images,
                                productDetailImages: updatedProduct.productDetailImages,
                                tag: updatedProduct.tag,
                            };
                        }
                        return item;
                    });

                    // 更新购物车中的商品信息
                    await updateDoc(doc(db, "cart", userCart.id), { items: updatedItems });
                    console.log("购物车更新成功");
                }
            } catch (error) {
                console.error("更新购物车商品信息失败：", error);
            }
        },

        goBack() {
            this.$router.go(-1);
        },
    },
};

</script>

<style>
.update-container {
    padding: 15px;
    margin-top: 40px;
    background-color: aliceblue;
}
</style>