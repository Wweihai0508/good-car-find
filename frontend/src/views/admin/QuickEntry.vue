<template>
  <div class="quick-entry">
    <div class="header">
      <h2>📱 快速录入</h2>
      <p class="subtitle">录入其他车行的车辆信息</p>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="entry-form"
    >
      <!-- 车行信息 -->
      <div class="form-section">
        <h3>🏪 车行信息</h3>
        <el-form-item label="车行名称 *" prop="dealershipName">
          <el-input
            v-model="form.dealershipName"
            placeholder="输入车行名称"
            show-word-limit
            maxlength="50"
          />
        </el-form-item>

        <el-form-item label="联系电话 *" prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="输入联系电话"
            type="tel"
          >
            <template #prefix>
              <el-icon><Phone /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="联系人" prop="contactPerson">
          <el-input
            v-model="form.contactPerson"
            placeholder="输入联系人姓名"
          />
        </el-form-item>

        <el-form-item label="详细地址" prop="address">
          <el-input
            v-model="form.address"
            type="textarea"
            :rows="2"
            placeholder="输入车行详细地址"
            show-word-limit
            maxlength="200"
          />
        </el-form-item>
      </div>

      <!-- 车辆基本信息 -->
      <div class="form-section">
        <h3>🚗 车辆信息</h3>
        <el-form-item label="品牌 *" prop="brand">
          <el-select
            v-model="form.brand"
            placeholder="选择品牌"
            filterable
            allow-create
            style="width: 100%"
          >
            <el-option
              v-for="brand in brands"
              :key="brand"
              :label="brand"
              :value="brand"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="型号 *" prop="model">
          <el-input
            v-model="form.model"
            placeholder="输入车型号"
            show-word-limit
            maxlength="100"
          />
        </el-form-item>

        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="年份 *" prop="year">
              <el-select v-model="form.year" placeholder="选择年份" style="width: 100%">
                <el-option
                  v-for="year in years"
                  :key="year"
                  :label="year + '年'"
                  :value="year.toString()"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="里程" prop="mileage">
              <el-input-number
                v-model="form.mileage"
                :min="0"
                :max="100"
                :precision="1"
                :step="0.1"
                placeholder="里程"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="价格（万元） *" prop="price">
          <el-input-number
            v-model="form.price"
            :min="0"
            :max="1000"
            :precision="2"
            :step="0.5"
            placeholder="价格"
            style="width: 100%"
          />
          <div class="price-hint">请输入车辆价格（单位：万元）</div>
        </el-form-item>
      </div>

      <!-- 车辆图片 -->
      <div class="form-section">
        <h3>📸 车辆图片</h3>
        <el-upload
          v-model:file-list="fileList"
          :action="uploadUrl"
          list-type="picture-card"
          :limit="9"
          :on-success="handleImageSuccess"
          :on-remove="handleImageRemove"
          :before-upload="beforeUpload"
          accept="image/*"
          :auto-upload="true"
          class="image-upload"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
        <div class="upload-tip">最多上传9张图片，支持jpg、png格式</div>
      </div>

      <!-- 备注信息 -->
      <div class="form-section">
        <h3>📝 备注信息</h3>
        <el-form-item label="备注">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="4"
            placeholder="输入车辆备注信息，如车况、配置等"
            show-word-limit
            maxlength="500"
          />
        </el-form-item>
      </div>

      <!-- 提交按钮 -->
      <div class="form-actions">
        <el-button
          type="primary"
          size="large"
          :loading="submitting"
          @click="handleSubmit"
          class="submit-btn"
        >
          {{ submitting ? '提交中...' : '📤 提交录入' }}
        </el-button>
        <el-button size="large" @click="handleReset" class="reset-btn">
          🔄 重置
        </el-button>
      </div>
    </el-form>

    <!-- 成功提示 -->
    <el-dialog
      v-model="showSuccessDialog"
      title="✅ 录入成功"
      width="90%"
      center
    >
      <div class="success-content">
        <div class="success-icon">🎉</div>
        <h3>车辆信息录入成功！</h3>
        <p>车行：{{ form.dealershipName }}</p>
        <p>车辆：{{ form.brand }} {{ form.model }} ({{ form.year }}年)</p>
        <p>价格：{{ form.price }}万元</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="handleContinue">继续录入</el-button>
        <el-button @click="handleViewList">查看列表</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Phone, Plus } from '@element-plus/icons-vue'
import { enhancedCarAPI } from '../utils/api'

const router = useRouter()

// 表单数据
const form = ref({
  dealershipName: '',
  phone: '',
  contactPerson: '',
  address: '',
  brand: '',
  model: '',
  year: '',
  mileage: 0,
  price: 0,
  notes: '',
  images: []
})

// 表单验证规则
const rules = {
  dealershipName: [
    { required: true, message: '请输入车行名称', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
  ],
  brand: [
    { required: true, message: '请选择品牌', trigger: 'change' }
  ],
  model: [
    { required: true, message: '请输入车型号', trigger: 'blur' }
  ],
  year: [
    { required: true, message: '请选择年份', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '价格必须大于0', trigger: 'blur' }
  ]
}

// 常用品牌
const brands = [
  '奔驰', '宝马', '奥迪', '大众', '丰田', '本田', '日产', '马自达',
  '福特', '雪佛兰', '别克', '现代', '起亚', '斯柯达', '标致',
  '保时捷', '路虎', '捷豹', '沃尔沃', '凯迪拉克', '雷克萨斯',
  '特斯拉', '比亚迪', '吉利', '长城', '长安', '奇瑞'
]

// 年份选项（最近15年）
const years = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear; i >= currentYear - 15; i--) {
    years.push(i)
  }
  return years
})

// 图片上传
const fileList = ref([])
const uploadUrl = computed(() => {
  return '/api/cars/upload'
})

const submitting = ref(false)
const showSuccessDialog = ref(false)

// 图片上传成功
const handleImageSuccess = (response) => {
  if (response.urls && response.urls.length > 0) {
    form.value.images.push(...response.urls)
    ElMessage.success('图片上传成功')
  }
}

// 图片移除
const handleImageRemove = (file) => {
  const url = file.response?.urls?.[0] || file.url
  form.value.images = form.value.images.filter(img => img !== url)
}

// 上传前验证
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB!')
    return false
  }
  return true
}

// 提交表单
const handleSubmit = async () => {
  try {
    await validateForm()
    submitting.value = true

    await enhancedCarAPI.quickEntry({
      ...form.value,
      images: form.value.images
    })

    submitting.value = false
    showSuccessDialog.value = true
  } catch (error) {
    submitting.value = false
    if (error.errors) {
      // 表单验证错误，不显示消息
      return
    }
    ElMessage.error(error.message || '录入失败')
  }
}

// 表单验证
const validateForm = () => {
  return new Promise((resolve, reject) => {
    formRef.value.validate((valid, errors) => {
      if (valid) {
        resolve()
      } else {
        reject({ errors })
      }
    })
  })
}

// 重置表单
const handleReset = () => {
  formRef.value.resetFields()
  form.value.images = []
  fileList.value = []
}

// 继续录入
const handleContinue = () => {
  showSuccessDialog.value = false
  handleReset()
}

// 查看列表
const handleViewList = () => {
  showSuccessDialog.value = false
  router.push('/admin/cars')
}

const formRef = ref(null)

// 加载历史车行
const loadRecentDealerships = async () => {
  try {
    // 这里可以加载最近录入的车行数据
    // 暂时从本地存储读取
    const recent = localStorage.getItem('recent_dealerships')
    if (recent) {
      const dealerships = JSON.parse(recent)
      if (dealerships.length > 0) {
        form.value.dealershipName = dealerships[0].name
      }
    }
  } catch (error) {
    console.error('加载历史车行失败:', error)
  }
}

onMounted(() => {
  loadRecentDealerships()
})
</script>

<style scoped>
.quick-entry {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.header h2 {
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: bold;
}

.subtitle {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.entry-form {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.form-section h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-hint {
  margin-top: 5px;
  font-size: 12px;
  color: #999;
}

.image-upload {
  margin-bottom: 10px;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  text-align: center;
}

.form-actions {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.submit-btn,
.reset-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
}

.success-content {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.success-content h3 {
  margin: 0 0 15px 0;
  color: #67c23a;
}

.success-content p {
  margin: 8px 0;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .quick-entry {
    padding: 15px;
  }

  .header h2 {
    font-size: 24px;
  }

  .subtitle {
    font-size: 14px;
  }

  .entry-form {
    padding: 15px;
  }

  .form-section h3 {
    font-size: 16px;
  }
}

/* 针对手机竖屏优化 */
@media (max-width: 480px) {
  .quick-entry {
    padding: 10px;
  }

  .header {
    padding: 15px;
    margin-bottom: 20px;
  }

  .header h2 {
    font-size: 20px;
  }

  .entry-form {
    padding: 12px;
  }
}
</style>
