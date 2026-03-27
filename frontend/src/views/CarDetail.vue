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
              style="width: 80px; height: 80px; margin-right: 10px; cursor: pointer; border-radius: 8px;"
              @click="currentImage = index"
              :style="{ border: currentImage === index ? '3px solid #409eff' : '2px solid #ddd' }"
            />
          </div>
        </div>

        <div class="car-details">
          <h1 class="car-title">{{ car.brand }} {{ car.model }}</h1>
          <div class="car-price-large">
            <span class="price">￥{{ car.price }}万</span>
            <span class="price-original">原价：￥{{ car.original_price || Math.round(car.price * 1.2) }}万</span>
          </div>

          <div class="car-stats">
            <div class="stat-item">
              <span class="stat-label">年份</span>
              <span class="stat-value">{{ car.year }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">里程</span>
              <span class="stat-value">{{ (car.mileage / 10000).toFixed(1) }}万公里</span>
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
            <div class="stat-item">
              <span class="stat-label">颜色</span>
              <span class="stat-value">{{ car.color }}</span>
            </div>
          </div>

          <div class="car-description">
            <h3>📝 车辆描述</h3>
            <p>{{ car.description || '暂无描述' }}</p>
          </div>

          <div class="car-features">
            <h3>✅ 车况说明</h3>
            <p>{{ car.car_condition || '暂无说明' }}</p>
          </div>

          <div class="car-features">
            <h3>🔧 保养记录</h3>
            <p>{{ car.maintenance_record || '暂无记录' }}</p>
          </div>

          <div class="contact-section">
            <el-button type="primary" size="large" class="contact-btn" @click="contactSeller">
              <el-icon><Phone /></el-icon>
              联系卖家
            </el-button>
            <el-button type="success" size="large" class="favorite-btn" @click="addToFavorite">
              <el-icon><Star /></el-icon>
              收藏
            </el-button>
            <el-button type="warning" size="large" class="share-btn" @click="shareCar">
              <el-icon><Share /></el-icon>
              分享
            </el-button>
          </div>
        </div>
      </div>
      <div v-else class="loading">
        <el-icon :size="48" :style="{ color: '#409eff' }">
          <Loading />
        </el-icon>
        <p>加载中...</p>
      </div>

      <div class="similar-cars">
        <h2>🚗 相似车辆推荐</h2>
        <div class="filter-tabs">
          <el-button
            v-for="tab in filterTabs"
            :key="tab.key"
            :type="currentFilter === tab.key ? 'primary' : 'default'"
            @click="changeFilter(tab.key)"
            class="filter-tab"
          >
            <el-icon>
              <component :is="tab.icon" />
            </el-icon>
            {{ tab.label }}
            <span class="count">({{ getFilterCount(tab.key) }})</span>
          </el-button>
        </div>

        <div v-if="loadingSimilar" class="loading-similar">
          <el-icon :size="32" class="is-loading">
            <Loading />
          </el-icon>
          <p>正在筛选相似车辆...</p>
        </div>

        <div v-else-if="similarCars.length > 0" class="cars-grid">
          <CarCard
            v-for="similarCar in similarCars"
            :key="similarCar.id"
            :car="similarCar"
            @click="viewCar(similarCar.id)"
          />
        </div>

        <div v-else class="empty-similar">
          <el-icon :size="48" color="#ccc">
            <Document />
          </el-icon>
          <p>暂无{{ getFilterLabel(currentFilter) }}的相似车辆</p>
          <el-button type="primary" @click="viewAllCars">查看所有车辆</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading, Phone, Star, Share, Document, Van, Money, Calendar, PriceTag } from '@element-plus/icons-vue'
import CarCard from '../components/CarCard.vue'
import { carAPI } from '../utils/api'

const route = useRoute()
const router = useRouter()

const car = ref({})
const similarCars = ref([])
const currentImage = ref(0)
const currentFilter = ref('same-brand')
const loadingSimilar = ref(false)
const filterCounts = ref({})

const filterTabs = [
  { key: 'same-brand', label: '同品牌', icon: Van },
  { key: 'same-price', label: '同价位', icon: Money },
  { key: 'same-year', label: '同年款', icon: Calendar },
  { key: 'same-model', label: '同车型', icon: PriceTag },
  { key: 'all', label: '全部', icon: Document }
]

const getFilterLabel = (key) => {
  const tab = filterTabs.find(t => t.key === key)
  return tab ? tab.label : ''
}

const getFilterCount = (key) => {
  return filterCounts.value[key] || 0
}

const loadCar = async () => {
  try {
    const carId = route.params.id
    const data = await carAPI.getCar(carId)
    console.log('加载车辆信息:', data)
    car.value = data
    // 加载完车辆信息后，默认加载同品牌的相似车辆
    loadSimilarCars('same-brand')
  } catch (error) {
    console.error('加载车辆信息失败:', error)
    ElMessage.error('加载车辆信息失败')
  }
}

const loadSimilarCars = async (filterType) => {
  if (!car.value.id) return

  loadingSimilar.value = true
  try {
    let params = { page: 1, pageSize: 6 }

    switch (filterType) {
      case 'same-brand':
        params.brand = car.value.brand
        break
      case 'same-price':
        const price = parseFloat(car.value.price)
        const priceRange = price * 0.2 // 价位浮动20%
        params.minPrice = (price - priceRange).toFixed(2)
        params.maxPrice = (price + priceRange).toFixed(2)
        params.sort = 'price'
        params.order = 'asc'
        break
      case 'same-year':
        params.year = car.value.year
        break
      case 'same-model':
        params.brand = car.value.brand
        params.model = car.value.model
        break
      case 'all':
        // 不加筛选条件，获取所有车辆
        break
    }

    // 排除当前车辆
    params.excludeId = car.value.id

    const data = await carAPI.getCars(params)

    // 过滤掉当前车辆
    similarCars.value = (data.list || []).filter(item => item.id !== car.value.id).slice(0, 6)

    // 更新计数
    filterCounts.value[filterType] = similarCars.value.length
  } catch (error) {
    console.error('加载相似车辆失败:', error)
    ElMessage.error('加载相似车辆失败')
    similarCars.value = []
    filterCounts.value[filterType] = 0
  } finally {
    loadingSimilar.value = false
  }
}

const changeFilter = (filterType) => {
  if (currentFilter.value === filterType) return
  currentFilter.value = filterType
  loadSimilarCars(filterType)
}

const contactSeller = () => {
  ElMessage.success('请联系客服：400-888-8888')
}

const addToFavorite = () => {
  ElMessage.success('已添加到收藏')
}

const shareCar = () => {
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    ElMessage.success('链接已复制，可以分享给朋友')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制链接')
  })
}

const viewCar = (carId) => {
  router.push(`/cars/${carId}`)
}

const viewAllCars = () => {
  router.push('/cars')
}

// 组件挂载后预加载各个筛选的数量
onMounted(() => {
  loadCar()
})
</script>

<style scoped>
.car-detail {
  padding: 20px 0;
  background: #f5f7fa;
  min-height: 100vh;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.car-info {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 40px;
  margin-bottom: 60px;
}

.car-images {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.image-thumbnails {
  display: flex;
  margin-top: 20px;
  gap: 10px;
}

.car-details {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.car-title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #2c3e50;
}

.car-price-large {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
  border-radius: 12px;
}

.price {
  font-size: 42px;
  font-weight: bold;
  color: #d63031;
}

.price-original {
  font-size: 18px;
  color: #636e72;
  text-decoration: line-through;
}

.car-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s;
}

.stat-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.stat-label {
  color: #6c757d;
  font-size: 15px;
  font-weight: 500;
}

.stat-value {
  font-weight: bold;
  font-size: 18px;
  color: #2c3e50;
}

.car-description,
.car-features {
  margin-bottom: 25px;
}

.car-description h3,
.car-features h3 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #2c3e50;
}

.car-description p,
.car-features p {
  color: #555;
  line-height: 1.8;
  font-size: 15px;
}

.contact-section {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.contact-btn,
.favorite-btn,
.share-btn {
  flex: 1;
  min-width: 140px;
  font-size: 16px;
  padding: 14px 28px;
  border-radius: 8px;
  font-weight: bold;
}

.contact-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.contact-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.favorite-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
}

.favorite-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4);
}

.share-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: none;
}

.share-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
}

.similar-cars {
  margin-top: 60px;
}

.similar-cars h2 {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #2c3e50;
}

.filter-tabs {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s;
}

.count {
  background: rgba(255, 255, 255, 0.3);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
}

.loading-similar {
  text-align: center;
  padding: 60px 0;
  color: #999;
}

.loading-similar p {
  margin-top: 15px;
  font-size: 16px;
}

.cars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
}

.empty-similar {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.empty-similar .el-icon {
  margin-bottom: 20px;
}

.empty-similar p {
  color: #999;
  font-size: 18px;
  margin-bottom: 25px;
}

.loading {
  text-align: center;
  padding: 100px 0;
  color: #999;
}

.loading p {
  margin-top: 15px;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .car-info {
    grid-template-columns: 1fr;
  }

  .car-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .car-title {
    font-size: 28px;
  }

  .price {
    font-size: 32px;
  }

  .car-stats {
    grid-template-columns: 1fr;
  }

  .contact-section {
    flex-direction: column;
  }

  .contact-btn,
  .favorite-btn,
  .share-btn {
    width: 100%;
  }

  .filter-tabs {
    gap: 10px;
  }

  .filter-tab {
    padding: 10px 16px;
    font-size: 14px;
  }

  .cars-grid {
    grid-template-columns: 1fr;
  }
}
</style>
