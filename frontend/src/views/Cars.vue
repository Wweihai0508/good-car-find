<template>
  <div class="cars-page">
    <div class="container">
      <div class="page-header">
        <h1>全部车辆</h1>
        <p>精选优质二手车，总有一款适合您</p>
      </div>

      <div class="filter-section">
        <div class="filter-form">
          <el-select v-model="filters.brand" placeholder="选择品牌" clearable style="width: 150px;">
            <el-option v-for="brand in brands" :key="brand" :label="brand" :value="brand" />
          </el-select>
          
          <el-select v-model="filters.year" placeholder="选择年份" clearable style="width: 120px;">
            <el-option v-for="year in years" :key="year" :label="year + '年'" :value="year" />
          </el-select>
          
          <div class="price-filter">
            <span>价格区间：</span>
            <el-slider 
              v-model="priceRange" 
              :min="0" 
              :max="100" 
              :step="5"
              range
              style="width: 200px; margin: 0 15px;"
            />
            <span>￥{{ priceRange[0] }}万 - ￥{{ priceRange[1] }}万</span>
          </div>

          <el-button type="primary" @click="applyFilters">
            <el-icon-search /> 查询
          </el-button>
          <el-button @click="resetFilters">重置</el-button>
        </div>
      </div>

      <div class="cars-list">
        <CarCard 
          v-for="car in cars" 
          :key="car.id" 
          :car="car"
          @click="viewCar(car.id)"
        />
      </div>

      <div class="pagination" v-if="totalPages > 1">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[12, 24, 36, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>

      <div class="loading" v-if="loading">
        <el-icon :size="48" :style="{ color: '#409ef' }">
          <loading />
        </el-icon>
        <p>加载中...</p>
      </div>

      <div class="empty" v-if="!loading && cars.length === 0">
        <el-icon :size="64" :style="{ color: '#909399' }">
          <warning />
        </el-icon>
        <p>暂无符合条件的车辆</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import CarCard from '../components/CarCard.vue'
import { carAPI } from '../utils/api'

const router = useRouter()

const cars = ref([])
const loading = ref(false)
const brands = ref(['奔驰', '宝马', '奥迪', '大众', '丰田', '本田', '日产', '别克', '雪佛兰', '福特'])
const years = ref(Array.from({length: 15}, (_, i) => new Date().getFullYear() - i))
const priceRange = ref([0, 100])

const filters = ref({
  brand: '',
  year: '',
  minPrice: 0,
  maxPrice: 100
})

const pagination = ref({
  page: 1,
  pageSize: 12
})

const total = ref(0)
const totalPages = ref(0)

const loadCars = async () => {
  loading.value = true
  try {
    const params = {
      ...pagination.value,
      ...filters.value,
      minPrice: priceRange.value[0],
      maxPrice: priceRange.value[1]
    }
    
    const data = await carAPI.getCars(params)
    cars.value = data.list || data
    total.value = data.total || cars.value.length
    totalPages.value = Math.ceil(total.value / pagination.value.pageSize)
  } catch (error) {
    console.error('加载车辆失败:', error)
    ElMessage.error('加载车辆失败')
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  pagination.value.page = 1
  loadCars()
}

const resetFilters = () => {
  filters.value = {
    brand: '',
    year: '',
    minPrice: 0,
    maxPrice: 100
  }
  priceRange.value = [0, 100]
  pagination.value.page = 1
  loadCars()
}

const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.page = 1
  loadCars()
}

const handlePageChange = (page) => {
  pagination.value.page = page
  loadCars()
}

const viewCar = (carId) => {
  router.push(`/cars/${carId}`)
}

onMounted(() => {
  loadCars()
})
</script>

<style scoped>
.cars-page {
  background: #f5f7fa;
  min-height: 100vh;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  margin: 0 0 10px 0;
  font-size: 36px;
  color: #2c3e50;
}

.page-header p {
  margin: 0;
  color: #7f8c8d;
  font-size: 16px;
}

.filter-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.filter-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.price-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cars-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.loading, .empty {
  text-align: center;
  padding: 60px 0;
}

.loading p, .empty p {
  margin-top: 15px;
  color: #909399;
  font-size: 16px;
}
</style>
