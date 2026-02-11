<template>
  <div class="add-car">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      style="max-width: 800px; margin: 0 auto"
    >
      <div class="form-section">
        <h3>车辆图片</h3>
        <el-upload
          class="upload-demo"
          drag
          :action="uploadUrl"
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
          multiple
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 jpg/png 文件，且不超过 5MB
            </div>
          </template>
        </el-upload>

        <div class="upload-actions">
          <el-button type="primary" @click="triggerFileInput">
            <el-icon><Picture /></el-icon> 从相册选择
          </el-button>
          <el-button type="success" @click="triggerCameraInput">
            <el-icon><VideoCamera /></el-icon> 拍照上传
          </el-button>
          <el-button type="info" @click="recognizeImage" :disabled="fileList.length === 0 && imageUrls.length === 0 && previewImages.length === 0" class="recognize-btn">
            <el-icon><MagicStick /></el-icon> AI智能识别
          </el-button>
        </div>

        <div class="image-preview" v-if="previewImages.length > 0">
          <div class="preview-item" v-for="(img, index) in previewImages" :key="index">
            <img :src="img" alt="预览图片" />
            <el-button type="danger" size="small" icon="Delete" @click="removePreview(index)" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3>基本信息</h3>
        <el-form-item label="品牌" prop="brand">
          <el-input v-model="form.brand" placeholder="请输入品牌" />
        </el-form-item>
        <el-form-item label="型号" prop="model">
          <el-input v-model="form.model" placeholder="请输入型号" />
        </el-form-item>
        <el-form-item label="年份" prop="year">
          <el-date-picker
            v-model="form.year"
            type="year"
            placeholder="选择年份"
            format="YYYY"
            value-format="YYYY"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="里程" prop="mileage">
          <el-input-number
            v-model="form.mileage"
            :min="0"
            :max="100"
            :precision="1"
            :step="0.1"
            placeholder="单位：万公里"
            style="width: 100%"
          />
        </el-form-item>
      </div>

      <div class="form-section">
        <h3>车辆配置</h3>
        <el-form-item label="燃料类型" prop="fuelType">
          <el-select v-model="form.fuelType" placeholder="选择燃料类型" style="width: 100%">
            <el-option label="汽油" value="汽油" />
            <el-option label="柴油" value="柴油" />
            <el-option label="混合动力" value="混合动力" />
            <el-option label="纯电动" value="纯电动" />
          </el-select>
        </el-form-item>
        <el-form-item label="变速箱" prop="transmission">
          <el-select v-model="form.transmission" placeholder="选择变速箱" style="width: 100%">
            <el-option label="自动" value="自动" />
            <el-option label="手动" value="手动" />
            <el-option label="手自一体" value="手自一体" />
          </el-select>
        </el-form-item>
        <el-form-item label="排量" prop="displacement">
          <el-input-number
            v-model="form.displacement"
            :min="0.5"
            :max="6.0"
            :precision="1"
            :step="0.1"
            placeholder="单位：L"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="颜色" prop="color">
          <el-color-picker v-model="form.color" style="width: 100%" />
        </el-form-item>
      </div>

      <div class="form-section">
        <h3>价格信息</h3>
        <el-form-item label="销售价" prop="price">
          <div style="display: flex; align-items: center;">
            <span style="margin-right: 10px;">￥</span>
            <el-input-number
              v-model="form.price"
              :min="0"
              :precision="2"
              :step="0.01"
              placeholder="单位：万元"
              style="flex: 1"
            />
          </div>
        </el-form-item>
        <el-form-item label="收购价" prop="acquisitionPrice">
          <div style="display: flex; align-items: center;">
            <span style="margin-right: 10px;">￥</span>
            <el-input-number
              v-model="form.acquisitionPrice"
              :min="0"
              :precision="2"
              :step="0.01"
              placeholder="单位：万元"
              style="flex: 1"
            />
          </div>
        </el-form-item>
        <el-form-item label="原价" prop="originalPrice">
          <div style="display: flex; align-items: center;">
            <span style="margin-right: 10px;">￥</span>
            <el-input-number
              v-model="form.originalPrice"
              :min="0"
              :precision="2"
              :step="0.01"
              placeholder="单位：万元"
              style="flex: 1"
            />
          </div>
        </el-form-item>
      </div>

      <div class="form-section">
        <h3>补充信息</h3>
        <el-form-item label="车辆描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入车辆描述"
          />
        </el-form-item>
        <el-form-item label="车况说明" prop="carCondition">
          <el-input
            v-model="form.carCondition"
            type="textarea"
            :rows="3"
            placeholder="请输入车况说明"
          />
        </el-form-item>
        <el-form-item label="维修记录" prop="maintenanceRecord">
          <el-input
            v-model="form.maintenanceRecord"
            type="textarea"
            :rows="3"
            placeholder="请输入维修记录"
          />
        </el-form-item>
      </div>

      <div class="form-actions">
        <el-button type="primary" @click="submitForm" :loading="submitting">
          保存车辆信息
        </el-button>
        <el-button @click="resetForm">重置</el-button>
        <el-button @click="goBack">返回</el-button>
      </div>
    </el-form>

    <!-- 隐藏的文件输入元素 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      style="display: none"
      @change="handleFileSelect"
    />
    <input
      ref="cameraInput"
      type="file"
      accept="image/*"
      capture="camera"
      style="display: none"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { carAPI } from '../../utils/api'

const router = useRouter()

const formRef = ref()
const submitting = ref(false)
const fileList = ref([])
const previewImages = ref([])
const imageUrls = ref([])
const uploadUrl = ref('')
const fileInput = ref(null)
const cameraInput = ref(null)

const form = reactive({
  brand: '',
  model: '',
  year: '',
  mileage: null,
  fuelType: '',
  transmission: '',
  displacement: null,
  color: '#409EFF',
  price: null,
  acquisitionPrice: null,
  originalPrice: null,
  description: '',
  carCondition: '',
  maintenanceRecord: '',
  images: []
})

const rules = {
  brand: [{ required: true, message: '请输入品牌', trigger: 'blur' }],
  model: [{ required: true, message: '请输入型号', trigger: 'blur' }],
  year: [{ required: true, message: '请选择年份', trigger: 'change' }],
  price: [{ required: true, message: '请输入销售价', trigger: 'blur' }]
}

const handleFileChange = (file) => {
  let fileToAdd, fileToRead
  
  if (file.raw) {
    // 从 handleFileSelect 调用的情况
    fileToAdd = file
    fileToRead = file.raw
  } else if (file instanceof File) {
    // 直接是 File 对象的情况
    fileToAdd = { raw: file }
    fileToRead = file
  } else {
    // 从 el-upload 组件调用的情况
    fileToAdd = file
    fileToRead = file.raw
  }
  
  // 确保 fileList 被正确更新
  if (fileToAdd) {
    fileList.value.push(fileToAdd)
  }
  
  // 生成预览图
  if (fileToRead) {
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImages.value.push(e.target.result)
    }
    reader.readAsDataURL(fileToRead)
  }
}

const removePreview = (index) => {
  previewImages.value.splice(index, 1)
  fileList.value.splice(index, 1)
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const triggerCameraInput = () => {
  cameraInput.value.click()
}

const handleFileSelect = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      handleFileChange({ raw: file })
    }
  }
  // 重置输入，以便可以重复选择相同的文件
  event.target.value = ''
}

const uploadImages = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择图片')
    return
  }

  const formData = new FormData()
  fileList.value.forEach(file => {
    formData.append('images', file.raw)
  })

  try {
    const data = await carAPI.uploadImage(formData)
    imageUrls.value.push(...data.urls)
    form.images = imageUrls.value
    ElMessage.success('图片上传成功')
    fileList.value = []
    previewImages.value = []
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片上传失败')
  }
}

const recognizeImage = async () => {
  try {
    let imageUrlToRecognize
    
    // 优先使用已上传的图片URL
    if (imageUrls.value.length > 0) {
      imageUrlToRecognize = imageUrls.value[0]
    } 
    // 否则使用本地预览图片（base64）
    else if (previewImages.value.length > 0) {
      imageUrlToRecognize = previewImages.value[0]
    }
    
    if (!imageUrlToRecognize) {
      ElMessage.warning('请先选择或拍摄图片')
      return
    }
    
    const data = await carAPI.aiRecognizeImage(imageUrlToRecognize)
    if (data.brand) form.brand = data.brand
    if (data.model) form.model = data.model
    if (data.year) form.year = data.year
    if (data.fuelType) form.fuelType = data.fuelType
    if (data.transmission) form.transmission = data.transmission
    if (data.displacement) form.displacement = data.displacement
    if (data.color) form.color = data.color
    ElMessage.success('AI识别成功，已自动填充信息')
  } catch (error) {
    console.error('AI识别失败:', error)
    ElMessage.error('AI识别失败')
  }
}

const submitForm = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true
    
    // 如果有选择的图片，先上传到服务器
    if (fileList.value.length > 0) {
      const formData = new FormData()
      
      // 使用fileList中的原始文件上传
      fileList.value.forEach((file, index) => {
        if (file.raw) {
          formData.append('images', file.raw, `car_image_${index}.jpg`)
        }
      })
      
      // 上传图片到服务器
      const uploadResult = await carAPI.uploadImage(formData)
      form.images = uploadResult.urls
    }
    
    await carAPI.addCar(form)
    ElMessage.success('车辆添加成功')
    router.push('/admin/cars')
  } catch (error) {
    if (error !== false) {
      console.error('保存失败:', error)
      ElMessage.error('保存失败')
    }
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
  fileList.value = []
  previewImages.value = []
  imageUrls.value = []
  form.images = []
}

const goBack = () => {
  router.push('/admin/cars')
}
</script>

<style scoped>
.add-car {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.form-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.form-section h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
}

.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 15px;
}

.preview-item {
  position: relative;
}

.preview-item img {
  width: 150px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.preview-item .el-button {
  position: absolute;
  top: -10px;
  right: -10px;
}

.upload-actions {
  display: flex;
  gap: 10px;
  margin: 15px 0;
  flex-wrap: wrap;
}

.upload-actions .el-button {
  flex: 1;
  min-width: 120px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}
</style>
