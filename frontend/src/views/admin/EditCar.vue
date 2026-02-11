<template>
  <div class="edit-car">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>编辑车辆</span>
          <el-button type="primary" size="small" @click="saveCar">保存</el-button>
        </div>
      </template>

      <el-form ref="carFormRef" :model="carForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="品牌">
              <el-input v-model="carForm.brand" placeholder="请输入品牌" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="型号">
              <el-input v-model="carForm.model" placeholder="请输入型号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="价格">
              <el-input-number
                v-model="carForm.price"
                :min="0"
                :precision="0"
                :step="1000"
                placeholder="请输入价格"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年份">
              <el-input-number
                v-model="carForm.year"
                :min="2000"
                :max="2025"
                :precision="0"
                :step="1"
                placeholder="请输入年份"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="里程">
              <el-input-number
                v-model="carForm.mileage"
                :min="0"
                :precision="0"
                :step="100"
                placeholder="请输入里程"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="燃料类型">
              <el-select v-model="carForm.fuelType" placeholder="请选择燃料类型">
                <el-option label="汽油" value="汽油" />
                <el-option label="柴油" value="柴油" />
                <el-option label="混合动力" value="混合动力" />
                <el-option label="纯电动" value="纯电动" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="变速箱">
              <el-select v-model="carForm.transmission" placeholder="请选择变速箱">
                <el-option label="手动" value="手动" />
                <el-option label="自动" value="自动" />
                <el-option label="无级变速" value="无级变速" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排量">
              <el-input-number
                v-model="carForm.displacement"
                :min="0"
                :precision="1"
                :step="0.1"
                placeholder="请输入排量"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="颜色">
          <el-color-picker v-model="carForm.color" show-alpha />
          <el-input v-model="carForm.color" placeholder="请输入颜色代码" style="margin-left: 10px; width: 200px;" />
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="carForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入车辆描述"
          />
        </el-form-item>

        <el-form-item label="配置">
          <el-input
            v-model="carForm.features"
            type="textarea"
            :rows="3"
            placeholder="请输入配置，多个配置用逗号分隔"
          />
        </el-form-item>

        <el-form-item label="图片">
          <el-upload
            v-model:file-list="imageFileList"
            :auto-upload="false"
            :limit="5"
            accept="image/*"
            list-type="picture-card"
            action="#"
            style="width: 100%;"
            :on-change="handleImageChange"
            :on-remove="handleImageRemove"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveCar">保存</el-button>
          <el-button @click="cancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { carAPI } from '../../utils/api'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const carForm = ref({
  brand: '',
  model: '',
  price: 0,
  year: 2020,
  mileage: 0,
  fuelType: '',
  transmission: '',
  displacement: 0,
  color: '',
  description: '',
  features: '',
})

const imageFileList = ref([])

const loadCar = async () => {
  try {
    const carId = route.params.id
    const data = await carAPI.getCar(carId)
    carForm.value = {
      brand: data.brand,
      model: data.model,
      price: parseFloat(data.price),
      year: parseInt(data.year),
      mileage: parseFloat(data.mileage),
      fuelType: data.fuel_type,
      transmission: data.transmission,
      displacement: parseFloat(data.displacement),
      color: data.color,
      description: data.description,
      features: data.car_condition || ''
    }
    imageFileList.value = (data.images || []).map((url, index) => ({
      name: `image-${index}`,
      url: url
    }))
  } catch (error) {
    console.error('加载车辆信息失败:', error)
    ElMessage.error('加载车辆信息失败')
  }
}

const handleImageChange = async (file, fileList) => {
  if (file.raw) {
    const formData = new FormData()
    formData.append('images', file.raw)
    
    try {
      const result = await carAPI.uploadImage(formData)
      if (result.urls && result.urls.length > 0) {
        file.url = result.urls[0]
        ElMessage.success('图片上传成功')
      }
    } catch (error) {
      console.error('图片上传失败:', error)
      ElMessage.error('图片上传失败')
      fileList.pop()
    }
  }
}

const handleImageRemove = (file, fileList) => {
  console.log('移除图片:', file)
}

const saveCar = async () => {
  try {
    const carId = route.params.id
    const images = imageFileList.value.map(file => file.url).filter(url => url)
    
    await carAPI.updateCar(carId, {
      brand: carForm.value.brand,
      model: carForm.value.model,
      price: carForm.value.price,
      year: carForm.value.year,
      mileage: carForm.value.mileage,
      fuelType: carForm.value.fuelType,
      transmission: carForm.value.transmission,
      displacement: carForm.value.displacement,
      color: carForm.value.color,
      description: carForm.value.description,
      carCondition: carForm.value.features,
      images: images
    })
    ElMessage.success('保存成功')
    router.push('/admin/cars')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败: ' + (error.response?.data?.error || error.message))
  }
}

const cancel = () => {
  router.push('/admin/cars')
}

onMounted(() => {
  loadCar()
})
</script>

<style scoped>
.edit-car {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 20px;
  font-weight: bold;
}
</style>
