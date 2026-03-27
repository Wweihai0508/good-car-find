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
                  <span class="price">￥{{ item.price }}万</span>
                </div>
                <div class="carousel-buttons">
                  <el-button type="primary" size="large" @click="viewCar(item.carId)">
                    查看详情
                  </el-button>
                  <el-button type="warning" size="large" @click="enterExhibitionMode" v-if="recommendations.length > 0">
                    <el-icon><FullScreen /></el-icon>
                    展览模式
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <Teleport to="body">
      <Transition name="exhibition-fade">
        <div v-if="exhibitionMode" class="exhibition-overlay" @click.self="exitExhibitionMode">
          <div class="exhibition-container">
            <button class="exit-btn" @click="exitExhibitionMode">
              <el-icon :size="24"><Close /></el-icon>
            </button>
            
            <div class="exhibition-content">
              <el-carousel 
                ref="exhibitionCarouselRef"
                height="100vh" 
                :interval="5000" 
                arrow="never"
                :autoplay="exhibitionAutoplay"
                loop
                indicator-position="none"
                @change="onExhibitionSlideChange"
              >
                <el-carousel-item v-for="(car, index) in recommendations" :key="index">
                  <div class="exhibition-slide">
                    <div class="exhibition-left">
                      <div class="exhibition-main-image">
                        <el-image
                          v-if="car.images && car.images.length > 0"
                          :src="car.images[exhibitionImageIndex]"
                          fit="contain"
                          class="main-car-image"
                        />
                        <div class="image-count" v-if="car.images && car.images.length > 1">
                          {{ exhibitionImageIndex + 1 }} / {{ car.images.length }}
                        </div>
                      </div>
                      <div class="exhibition-thumbnails" v-if="car.images && car.images.length > 1">
                        <div 
                          v-for="(img, imgIdx) in car.images" 
                          :key="imgIdx"
                          class="thumbnail-item"
                          :class="{ active: exhibitionImageIndex === imgIdx }"
                          @click="exhibitionImageIndex = imgIdx"
                        >
                          <el-image :src="img" fit="cover" />
                        </div>
                      </div>
                    </div>
                    
                    <div class="exhibition-right">
                      <div class="exhibition-header">
                        <div class="exhibition-badge">🚗 推荐好车</div>
                        <h1 class="exhibition-title">{{ car.brand }} {{ car.model }}</h1>
                      </div>
                      
                      <div class="exhibition-price-box">
                        <div class="price-main">
                          <span class="price-label">售价</span>
                          <span class="price-value">￥{{ car.price }}万</span>
                        </div>
                      </div>
                      
                      <div class="exhibition-specs-grid">
                        <div class="spec-card">
                          <div class="spec-icon">📅</div>
                          <div class="spec-info">
                            <span class="spec-label">上牌年份</span>
                            <span class="spec-value">{{ car.year }}年</span>
                          </div>
                        </div>
                        <div class="spec-card">
                          <div class="spec-icon">🛣️</div>
                          <div class="spec-info">
                            <span class="spec-label">表显里程</span>
                            <span class="spec-value">{{ car.mileage }}万公里</span>
                          </div>
                        </div>
                      </div>

                      <div class="exhibition-section" v-if="car.description">
                        <h3>📝 车辆描述</h3>
                        <p>{{ car.description }}</p>
                      </div>

                      <div class="exhibition-actions">
                        <el-button type="primary" size="large" class="action-btn" @click="viewCar(car.carId)">
                          <el-icon><View /></el-icon>
                          查看完整详情
                        </el-button>
                        <el-button type="success" size="large" class="action-btn">
                          <el-icon><Phone /></el-icon>
                          联系卖家
                        </el-button>
                        <el-button type="warning" size="large" class="action-btn">
                          <el-icon><Star /></el-icon>
                          收藏
                        </el-button>
                      </div>
                    </div>
                  </div>
                </el-carousel-item>
              </el-carousel>
            </div>

            <div class="exhibition-controls">
              <button class="control-btn" @click="prevSlide">
                <el-icon :size="28"><ArrowLeft /></el-icon>
              </button>
              <div class="slide-indicator">
                {{ currentSlide + 1 }} / {{ recommendations.length }}
              </div>
              <button class="control-btn" @click="nextSlide">
                <el-icon :size="28"><ArrowRight /></el-icon>
              </button>
              <button class="control-btn play-btn" @click="toggleAutoplay">
                <el-icon :size="24">
                  <VideoPause v-if="exhibitionAutoplay" />
                  <VideoPlay v-else />
                </el-icon>
              </button>
              <button class="control-btn fullscreen-btn" @click="toggleFullscreen">
                <el-icon :size="24"><FullScreen /></el-icon>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <div class="banner-empty" v-if="recommendations.length === 0">
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
          <div class="stat-icon">🤝</div>
          <div class="stat-content">
            <div class="stat-number">{{ totalDeals }}</div>
            <div class="stat-label">成功交易</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <div class="stat-number">{{ avgRating }}</div>
            <div class="stat-label">服务评分</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { FullScreen, Close, ArrowLeft, ArrowRight, VideoPlay, VideoPause, View, Phone, Star } from '@element-plus/icons-vue'
import CarCard from '../components/CarCard.vue'
import { carAPI, recommendationAPI, popularAPI } from '../utils/api'

const router = useRouter()

const recommendations = ref([])
const popularCars = ref([])
const totalCars = ref(156)
const totalDeals = ref(328)
const avgRating = ref('4.9分')

const exhibitionMode = ref(false)
const isFullscreen = ref(false)
const exhibitionAutoplay = ref(true)
const currentSlide = ref(0)
const exhibitionCarouselRef = ref(null)
const exhibitionImageIndex = ref(0)

watch(currentSlide, () => {
  exhibitionImageIndex.value = 0
})

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

const enterExhibitionMode = () => {
  exhibitionMode.value = true
  exhibitionAutoplay.value = true
  document.body.style.overflow = 'hidden'
  setTimeout(() => {
    if (exhibitionCarouselRef.value) {
      exhibitionCarouselRef.value.setActiveItem(0)
    }
  }, 100)
}

const exitExhibitionMode = () => {
  exhibitionMode.value = false
  document.body.style.overflow = ''
}

const prevSlide = () => {
  if (exhibitionCarouselRef.value) {
    exhibitionCarouselRef.value.prev()
  }
}

const nextSlide = () => {
  if (exhibitionCarouselRef.value) {
    exhibitionCarouselRef.value.next()
  }
}

const toggleAutoplay = () => {
  exhibitionAutoplay.value = !exhibitionAutoplay.value
}

const toggleFullscreen = () => {
  const elem = document.documentElement
  
  if (!document.fullscreenElement) {
    elem.requestFullscreen().then(() => {
      isFullscreen.value = true
    }).catch(err => {
      console.error('全屏失败:', err)
    })
  } else {
    document.exitFullscreen().then(() => {
      isFullscreen.value = false
    })
  }
}

const onFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

const onExhibitionSlideChange = (currentIndex) => {
  currentSlide.value = currentIndex
}

const handleKeyDown = (e) => {
  if (!exhibitionMode.value) return
  
  switch (e.key) {
    case 'Escape':
      exitExhibitionMode()
      break
    case 'ArrowLeft':
      prevSlide()
      break
    case 'ArrowRight':
      nextSlide()
      break
    case ' ':
      e.preventDefault()
      toggleAutoplay()
      break
  }
}

onMounted(() => {
  loadRecommendations()
  loadPopularCars()
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('fullscreenchange', onFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  document.body.style.overflow = ''
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

.carousel-buttons {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.exhibition-fade-enter-active,
.exhibition-fade-leave-active {
  transition: opacity 0.3s ease;
}

.exhibition-fade-enter-from,
.exhibition-fade-leave-to {
  opacity: 0;
}

.exhibition-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.exhibition-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

.exit-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
}

.exit-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.exhibition-content {
  flex: 1;
  overflow: hidden;
}

.exhibition-slide {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 60px;
  box-sizing: border-box;
  gap: 40px;
}

.exhibition-left {
  flex: 1;
  max-width: 50%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.exhibition-main-image {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  overflow: hidden;
  height: 65vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-car-image {
  width: 100%;
  height: 100%;
}

.image-count {
  position: absolute;
  bottom: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.exhibition-thumbnails {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.thumbnail-item {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
  opacity: 0.6;
}

.thumbnail-item:hover {
  opacity: 0.9;
}

.thumbnail-item.active {
  border-color: #409eff;
  opacity: 1;
}

.thumbnail-item .el-image {
  width: 100%;
  height: 100%;
}

.exhibition-right {
  flex: 1;
  max-width: 45%;
  color: white;
  max-height: 90vh;
  overflow-y: auto;
  padding-right: 10px;
}

.exhibition-right::-webkit-scrollbar {
  width: 6px;
}

.exhibition-right::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.exhibition-right::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.exhibition-header {
  margin-bottom: 25px;
}

.exhibition-badge {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 15px;
}

.exhibition-title {
  font-size: 42px;
  font-weight: bold;
  margin: 0;
  background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.exhibition-price-box {
  margin-bottom: 30px;
  padding: 25px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 193, 7, 0.15) 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.price-main {
  display: flex;
  align-items: baseline;
  gap: 15px;
  margin-bottom: 10px;
}

.price-label {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
}

.price-value {
  font-size: 48px;
  font-weight: bold;
  color: #ffd700;
}

.price-original {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 8px;
}

.original-value {
  text-decoration: line-through;
}

.price-discount {
  display: inline-block;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
}

.exhibition-specs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.spec-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 18px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s;
}

.spec-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(5px);
}

.spec-card .spec-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.spec-info {
  display: flex;
  flex-direction: column;
}

.spec-card .spec-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
}

.spec-card .spec-value {
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.exhibition-section {
  margin-bottom: 25px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.exhibition-section h3 {
  font-size: 18px;
  margin: 0 0 12px 0;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
}

.exhibition-section p {
  font-size: 15px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
}

.exhibition-actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  min-width: 140px;
  font-size: 15px;
  padding: 14px 20px;
  border-radius: 10px;
  font-weight: 600;
}

.exhibition-controls {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 20px;
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 25px;
  border-radius: 50px;
  backdrop-filter: blur(10px);
}

.control-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.slide-indicator {
  color: white;
  font-size: 16px;
  font-weight: bold;
  min-width: 70px;
  text-align: center;
}

.play-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.play-btn:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

@media (max-width: 1400px) {
  .exhibition-slide {
    padding: 30px 40px;
    gap: 30px;
  }

  .exhibition-title {
    font-size: 36px;
  }

  .price-value {
    font-size: 40px;
  }
}

@media (max-width: 1200px) {
  .exhibition-slide {
    flex-direction: column;
    padding: 20px;
    gap: 25px;
    overflow-y: auto;
  }

  .exhibition-left {
    max-width: 100%;
    width: 100%;
  }

  .exhibition-main-image {
    height: 35vh;
  }

  .exhibition-right {
    max-width: 100%;
    max-height: none;
    overflow-y: visible;
  }

  .exhibition-specs-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .exhibition-specs-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .spec-card {
    padding: 12px 15px;
  }

  .spec-card .spec-icon {
    font-size: 22px;
  }

  .spec-card .spec-value {
    font-size: 15px;
  }

  .exhibition-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .exhibition-controls {
    padding: 10px 20px;
    gap: 15px;
  }

  .control-btn {
    width: 40px;
    height: 40px;
  }

  .slide-indicator {
    font-size: 14px;
    min-width: 60px;
  }
}
</style>
