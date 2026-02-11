<template>
  <div class="car-detail">
    <div class="container">
      <div class="car-info" v-if="car.id">
        <div class="car-images">
          <el-image
            v-if="car.images && car.images.length > 0"
            :src="car.images[0]"
            fit="cover"
            style="width: 100%; height: 400px;"
          />
          <div class="image-thumbnails" v-if="car.images && car.images.length > 1">
            <el-image
              v-for="(image, index) in car.images"
              :key="index"
              :src="image"
              fit="cover"
              style="width: 80px; height: 80px; margin-right: 10px;"
              @click="currentImage = index"
            />
          </div>
        </div>

        <div class="car-details">
          <h1 class="car-title">{{ car.brand }} {{ car.model }}</h1>
          <div class="car-stats">
            <div class="stat-item">
              <span class="stat-label">价格</span>
              <span class="stat-value price">¥{{ car.price.toLocaleString() }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">年份</span>
              <span class="stat-value">{{ car.year }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">里程</span>
              <span class="stat-value">{{ car.mileage }} 公里</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">燃料类型</span>
              <span class="stat-value">{{ car.fuel_type }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">变速箱</span>
              <span class="stat-value">{{ car.transmission }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">排量</span>
              <span class="stat-value">{{ car.displacement }}L</span>
            </div>
          </div>

          <div class="car-description">
            <h3>车辆描述</h3>
            <p>{{ car.description || '暂无描述' }}</p>
          </div>

          <div class="car-features">
            <h3>车况说明</h3>
            <p>{{ car.car_condition || '暂无说明' }}</p>
          </div>

          <div class="car-features">
            <h3>保养记录</h3>
            <p>{{ car.maintenance_record || '暂无记录' }}</p>
          </div>

          <div class="contact-section">
            <el-button type="primary" size="large" @click="contactSeller">
              联系卖家
            </el-button>
            <el-button type="success" size="large" @click="addToFavorite">
              收藏
            </el-button>
          </div>
        </div>
      </div>
      <div v-else class="loading">
        <el-icon :size="48" :style="{ color: '#409ef' }">
          <Loading />
        </el-icon>
        <p>加载中...</p>
      </div>

      <div class="similar-cars">
        <h2>相似车辆</h2>
        <div class="cars-grid">
          <CarCard
            v-for="similarCar in similarCars"
            :key="similarCar.id"
            :car="similarCar"
            @click="viewCar(similarCar.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import CarCard from '../components/CarCard.vue'
import { carAPI } from '../utils/api'

const route = useRoute()
const router = useRouter()

const car = ref({})
const similarCars = ref([])
const currentImage = ref(0)

const loadCar = async () => {
  try {
    const carId = route.params.id
    const data = await carAPI.getCar(carId)
    console.log('加载车辆信息:', data)
    car.value = data
  } catch (error) {
    console.error('加载车辆信息失败:', error)
    ElMessage.error('加载车辆信息失败')
  }
}

const loadSimilarCars = async () => {
  try {
    const data = await carAPI.getCars({
      brand: car.value.brand,
      page: 1,
      pageSize: 4,
      sort: 'price',
      order: 'asc'
    })
    similarCars.value = data.list || data
  } catch (error) {
    console.error('加载相似车辆失败:', error)
    ElMessage.error('加载相似车辆失败')
  }
}

const contactSeller = () => {
  ElMessage.success('联系功能开发中...')
}

const addToFavorite = () => {
  ElMessage.success('已添加到收藏')
}

const viewCar = (carId) => {
  router.push(`/car/${carId}`)
}

onMounted(() => {
  loadCar()
  loadSimilarCars()
})
</script>

<style scoped>
.car-detail {
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.car-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.car-images {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.image-thumbnails {
  display: flex;
  margin-top: 20px;
}

.car-details {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.car-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #2c3e50;
}

.car-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-label {
  color: #7f8c8d;
  font-size: 14px;
}

.stat-value {
  font-weight: bold;
  font-size: 16px;
}

.price {
  color: #e74c3c;
  font-size: 24px;
}

.car-description,
.car-features {
  margin-bottom: 30px;
}

.car-description h3,
.car-features h3 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #2c3e50;
}

.car-description p,
.car-features ul {
  color: #555;
  line-height: 1.6;
}

.car-features ul {
  list-style: none;
  padding: 0;
}

.car-features li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.contact-section {
  display: flex;
  gap: 15px;
}

.similar-cars {
  margin-top: 60px;
}

.similar-cars h2 {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #2c3e50;
}

.cars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
</style>
