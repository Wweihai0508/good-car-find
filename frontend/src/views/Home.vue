<template>
  <div class="home">
    <div class="banner" v-if="recommendations.length > 0">
      <el-carousel height="500px" :interval="5000" arrow="always">
        <el-carousel-item v-for="(item, index) in recommendations" :key="index">
          <div class="carousel-item" :style="{ backgroundImage: `url(${item.images[0]})` }">
            <div class="carousel-overlay">
              <div class="carousel-content">
                <h2>推荐好车</h2>
                <h3>{{ item.brand }} {{ item.model }}</h3>
                <p class="car-info">
                  <span>{{ item.year }}年 | {{ item.mileage }}万公里</span>
                  <span>{{ item.fuel_type }} | {{ item.transmission }}</span>
                </p>
                <div class="car-price">
                  <span class="price">￥{{ item.price.toLocaleString() }}</span>
                </div>
                <el-button type="primary" size="large" @click="viewCar(item.id)">
                  查看详情
                </el-button>
              </div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <div class="banner-empty" v-else>
      <div class="empty-content">
        <h2>欢迎来到二手车展厅</h2>
        <p>专业二手车销售平台，为您提供优质二手车</p>
      </div>
    </div>

    <div class="container">
      <div class="section">
        <h2 class="section-title">热门车型</h2>
        <div class="cars-grid">
          <CarCard 
            v-for="car in popularCars" 
            :key="car.id" 
            :car="car"
            @click="viewCar(car.id)"
          />
        </div>
      </div>

      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon">🚗</div>
          <div class="stat-content">
            <div class="stat-number">{{ totalCars }}</div>
            <div class="stat-label">在售车辆</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <div class="stat-number">{{ totalRevenue }}</div>
            <div class="stat-label">本月销售额</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <div class="stat-number">{{ satisfiedCustomers }}</div>
            <div class="stat-label">满意客户</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import CarCard from '../components/CarCard.vue'
import { carAPI, recommendationAPI, popularAPI } from '../utils/api'

const router = useRouter()

const recommendations = ref([])
const popularCars = ref([])
const totalCars = ref(156)
const totalRevenue = ref('￥128万')
const satisfiedCustomers = ref(389)

const loadRecommendations = async () => {
  try {
    const data = await recommendationAPI.getRecommendations()
    recommendations.value = data.list || []
  } catch (error) {
    console.error('加载推荐车辆失败:', error)
    ElMessage.error('加载推荐车辆失败')
  }
}

const loadPopularCars = async () => {
  try {
    const data = await popularAPI.getPopularCars({ page: 1, pageSize: 8 })
    popularCars.value = data.list || []
  } catch (error) {
    console.error('加载热门车型失败:', error)
    ElMessage.error('加载热门车型失败')
  }
}

const viewCar = (carId) => {
  router.push(`/cars/${carId}`)
}
onMounted(() => {
  loadRecommendations()
  loadPopularCars()
})
</script>

<style scoped>
.banner {
  margin-bottom: 40px;
}

.banner-empty {
  height: 500px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
}

.empty-content {
  text-align: center;
  color: white;
  padding: 0 40px;
}

.empty-content h2 {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 20px;
}

.empty-content p {
  font-size: 24px;
  opacity: 0.9;
}

.carousel-item {
  height: 100%;
  width: 100%;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.carousel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%);
  display: flex;
  align-items: center;
}

.carousel-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  color: white;
}

.carousel-content h2 {
  margin: 0 0 15px 0;
  font-size: 18px;
  opacity: 0.9;
}

.carousel-content h3 {
  margin: 0 0 20px 0;
  font-size: 42px;
  font-weight: bold;
}

.car-info {
  margin: 20px 0;
  font-size: 16px;
  opacity: 0.9;
}

.car-info span {
  margin-right: 20px;
}

.car-price {
  margin: 30px 0;
}

.price {
  font-size: 45px;
  font-weight: bold;
  color: #ffd700;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 28px;
  margin-bottom: 30px;
  color: #2c3e50;
}

.cars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 40px;
}

.stat-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.stat-icon {
  font-size: 40px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
}
</style>
