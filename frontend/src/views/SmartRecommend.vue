<template>
  <div class="smart-recommend">
    <!-- 顶部搜索栏 -->
    <div class="search-section">
      <h2>🎯 智能找车</h2>
      <p class="subtitle">告诉我你的需求，我帮你找到合适的车</p>

      <div class="search-form">
        <!-- 客户信息 -->
        <div class="customer-info">
          <el-input
            v-model="searchParams.phone"
            placeholder="输入手机号（可选，用于记录需求）"
            clearable
            style="width: 100%; max-width: 300px"
          >
            <template #prefix>
              <el-icon><Phone /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- 快速筛选 -->
        <div class="quick-filters">
          <div class="filter-group">
            <label>价格范围</label>
            <el-radio-group v-model="priceRange" @change="handlePriceRangeChange">
              <el-radio-button label="">全部</el-radio-button>
              <el-radio-button label="low">10万以下</el-radio-button>
              <el-radio-button label="mid">10-20万</el-radio-button>
              <el-radio-button label="high">20-30万</el-radio-button>
              <el-radio-button label="luxury">30万以上</el-radio-button>
            </el-radio-group>
          </div>

          <div class="filter-group">
            <label>品牌</label>
            <el-select
              v-model="searchParams.brand"
              placeholder="选择品牌"
              filterable
              allow-create
              style="width: 200px"
              clearable
            >
              <el-option
                v-for="brand in brands"
                :key="brand"
                :label="brand"
                :value="brand"
              />
            </el-select>
          </div>

          <div class="filter-group">
            <label>车型</label>
            <el-select
              v-model="searchParams.vehicleType"
              placeholder="选择车型"
              style="width: 150px"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option label="轿车" value="轿车" />
              <el-option label="SUV" value="SUV" />
              <el-option label="MPV" value="MPV" />
              <el-option label="跑车" value="跑车" />
              <el-option label="皮卡" value="皮卡" />
            </el-select>
          </div>

          <div class="filter-group">
            <label>燃油类型</label>
            <el-select
              v-model="searchParams.fuelType"
              placeholder="燃油类型"
              style="width: 150px"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option label="汽油" value="汽油" />
              <el-option label="柴油" value="柴油" />
              <el-option label="电动" value="电动" />
              <el-option label="混合动力" value="混合动力" />
            </el-select>
          </div>

          <div class="filter-group">
            <label>年份</label>
            <el-select
              v-model="searchParams.minYear"
              placeholder="年份以上"
              style="width: 150px"
              clearable
            >
              <el-option
                v-for="year in recentYears"
                :key="year"
                :label="year + '年'"
                :value="year"
              />
            </el-select>
          </div>

          <el-button type="primary" size="large" @click="handleSearch" class="search-btn">
            🔍 搜索
          </el-button>
          <el-button size="large" @click="handleReset" class="reset-btn">
            🔄 重置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div class="results-section" v-loading="loading">
      <!-- 搜索结果统计 -->
      <div class="result-summary" v-if="searchResults.total > 0">
        <div class="summary-item own">
          <div class="summary-icon">🏠</div>
          <div class="summary-content">
            <div class="summary-number">{{ searchResults.ownCars.length }}</div>
            <div class="summary-label">本店车辆</div>
          </div>
        </div>
        <div class="summary-item nearby">
          <div class="summary-icon">🚗</div>
          <div class="summary-content">
            <div class="summary-number">{{ searchResults.nearbyCars.length }}</div>
            <div class="summary-label">周边车行</div>
          </div>
        </div>
      </div>

      <!-- 本店车辆 -->
      <div class="car-group" v-if="searchResults.ownCars.length > 0">
        <h3>🏠 本店车辆</h3>
        <div class="cars-grid">
          <CarCard
            v-for="car in searchResults.ownCars"
            :key="car.id"
            :car="car"
            @click="viewCar(car.id)"
          />
        </div>
      </div>

      <!-- 周边车行车辆 -->
      <div class="car-group nearby-section" v-if="searchResults.nearbyCars.length > 0">
        <h3>🚗 周边车行车辆</h3>
        <p class="section-tip">以下车辆来自周边合作车行，我可以带您去看</p>

        <!-- 按车行分组 -->
        <div
          v-for="group in groupedNearbyCars"
          :key="group.name"
          class="dealership-group"
        >
          <div class="dealership-header">
            <div class="dealership-info">
              <h4>{{ group.name }}</h4>
              <p class="address">{{ group.address }}</p>
            </div>
            <div class="distance-badge">
              {{ (group.distance / 1000).toFixed(1) }}km
            </div>
          </div>

          <div class="cars-grid">
            <CarCard
              v-for="car in group.cars"
              :key="car.id"
              :car="car"
              @click="viewCar(car.id)"
            />
          </div>
        </div>
      </div>

      <!-- 无结果 -->
      <div class="no-results" v-if="searchResults.total === 0 && !loading">
        <div class="no-results-icon">🔍</div>
        <h3>没有找到符合条件的车辆</h3>
        <p>试试调整搜索条件</p>
        <el-button type="primary" @click="showRecordRequirement = true">
          📝 记录需求，有车通知我
        </el-button>
      </div>
    </div>

    <!-- 需求记录对话框 -->
    <el-dialog
      v-model="showRecordRequirement"
      title="📝 记录客户需求"
      width="90%"
      :max-width="600px"
    >
      <el-form :model="requirementForm" label-position="top">
        <el-form-item label="客户电话">
          <el-input v-model="requirementForm.customerPhone" />
        </el-form-item>
        <el-form-item label="客户姓名">
          <el-input v-model="requirementForm.customerName" />
        </el-form-item>
        <el-form-item label="品牌偏好">
          <el-input v-model="requirementForm.brandPreference" placeholder="多个品牌用逗号分隔" />
        </el-form-item>
        <el-form-item label="预算范围">
          <el-input-number v-model="requirementForm.priceMin" :min="0" :max="1000" placeholder="最低" />
          <span style="margin: 0 10px">-</span>
          <el-input-number v-model="requirementForm.priceMax" :min="0" :max="1000" placeholder="最高" />
        </el-form-item>
        <el-form-item label="年份范围">
          <el-input-number v-model="requirementForm.yearMin" :min="2000" :max="2030" placeholder="最早" />
          <span style="margin: 0 10px">-</span>
          <el-input-number v-model="requirementForm.yearMax" :min="2000" :max="2030" placeholder="最晚" />
        </el-form-item>
        <el-form-item label="其他要求">
          <el-input
            v-model="requirementForm.notes"
            type="textarea"
            :rows="3"
            placeholder="其他特殊要求"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRecordRequirement = false">取消</el-button>
        <el-button type="primary" @click="handleRecordRequirement">记录需求</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Phone } from '@element-plus/icons-vue'
import CarCard from '../components/CarCard.vue'
import { enhancedCarAPI } from '../utils/api'

const router = useRouter()

// 搜索参数
const searchParams = ref({
  phone: '',
  brand: '',
  vehicleType: '',
  fuelType: '',
  minYear: '',
  priceRangeCategory: ''
})

// 价格范围
const priceRange = ref('')

// 搜索结果
const searchResults = ref({
  total: 0,
  ownCars: [],
  nearbyCars: [],
  all: []
})

const loading = ref(false)

// 常用品牌
const brands = [
  '奔驰', '宝马', '奥迪', '大众', '丰田', '本田', '日产', '马自达',
  '福特', '雪佛兰', '别克', '现代', '起亚', '斯柯达', '标致',
  '保时捷', '路虎', '捷豹', '沃尔沃', '凯迪拉克', '雷克萨斯',
  '特斯拉', '比亚迪', '吉利', '长城', '长安', '奇瑞'
]

// 最近几年
const recentYears = computed(() => {
  const years = []
  const currentYear = new Date().getFullYear()
  for (let i = currentYear; i >= currentYear - 10; i--) {
    years.push(i)
  }
  return years
})

// 分组显示周边车行
const groupedNearbyCars = computed(() => {
  const groups = {}
  searchResults.value.nearbyCars.forEach(car => {
    const key = car.dealership_name || '未知车行'
    if (!groups[key]) {
      groups[key] = {
        name: key,
        address: car.dealership_address,
        phone: car.dealership_phone,
        distance: car.distance_from_shop,
        cars: []
      }
    }
    groups[key].cars.push(car)
  })
  return Object.values(groups).sort((a, b) => a.distance - b.distance)
})

// 需求记录
const showRecordRequirement = ref(false)
const requirementForm = ref({
  customerPhone: '',
  customerName: '',
  brandPreference: '',
  priceMin: 0,
  priceMax: 0,
  yearMin: 0,
  yearMax: 0,
  notes: ''
})

// 价格范围变化
const handlePriceRangeChange = (value) => {
  const ranges = {
    '': { min: 0, max: 9999999 },
    low: { min: 0, max: 10 },
    mid: { min: 10, max: 20 },
    high: { min: 20, max: 30 },
    luxury: { min: 30, max: 9999999 }
  }
  const range = ranges[value]
  if (range) {
    searchParams.value.minPrice = range.min
    searchParams.value.maxPrice = range.max
    searchParams.value.priceRangeCategory = value
  }
}

// 执行搜索
const handleSearch = async () => {
  try {
    loading.value = true
    const params = { ...searchParams.value }
    // 移除空值
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === undefined || params[key] === null) {
        delete params[key]
      }
    })

    const data = await enhancedCarAPI.smartRecommend(params)
    searchResults.value = {
      total: data.total || 0,
      ownCars: data.ownCars || [],
      nearbyCars: data.nearbyCars || [],
      all: data.all || []
    }

    if (searchResults.value.total === 0) {
      ElMessage.info('没有找到符合条件的车辆')
    } else {
      ElMessage.success(`找到 ${searchResults.value.total} 辆车`)
    }
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败')
  } finally {
    loading.value = false
  }
}

// 重置搜索
const handleReset = () => {
  searchParams.value = {
    phone: '',
    brand: '',
    vehicleType: '',
    fuelType: '',
    minYear: '',
    priceRangeCategory: ''
  }
  priceRange.value = ''
  searchResults.value = {
    total: 0,
    ownCars: [],
    nearbyCars: [],
    all: []
  }
}

// 查看车辆详情
const viewCar = (carId) => {
  router.push(`/cars/${carId}`)
}

// 记录客户需求
const handleRecordRequirement = async () => {
  try {
    await enhancedCarAPI.recordRequirement({
      ...requirementForm.value
    })
    ElMessage.success('需求记录成功，有合适车辆会通知您')
    showRecordRequirement.value = false
  } catch (error) {
    console.error('记录需求失败:', error)
    ElMessage.error('记录需求失败')
  }
}
</script>

<style scoped>
.smart-recommend {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.search-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 30px;
  color: white;
}

.search-section h2 {
  margin: 0 0 10px 0;
  font-size: 32px;
  font-weight: bold;
}

.subtitle {
  margin: 0 0 30px 0;
  font-size: 18px;
  opacity: 0.9;
}

.search-form {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 8px;
}

.customer-info {
  margin-bottom: 20px;
}

.quick-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group label {
  font-size: 12px;
  opacity: 0.8;
}

.search-btn,
.reset-btn {
  height: 40px;
}

.results-section {
  padding: 20px 0;
}

.result-summary {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.summary-item {
  flex: 1;
  background: white;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.summary-item.own {
  border-left: 4px solid #67c23a;
}

.summary-item.nearby {
  border-left: 4px solid #409eff;
}

.summary-icon {
  font-size: 36px;
}

.summary-number {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.summary-label {
  font-size: 14px;
  color: #999;
}

.car-group {
  margin-bottom: 40px;
}

.car-group h3 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.cars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.nearby-section {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
}

.section-tip {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 14px;
}

.dealership-group {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.dealership-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.dealership-info h4 {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #333;
}

.dealership-info .address {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.distance-badge {
  background: #e6f7ff;
  color: #1890ff;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: bold;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.no-results-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.no-results h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #333;
}

.no-results p {
  margin: 0 0 30px 0;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .smart-recommend {
    padding: 15px;
  }

  .search-section {
    padding: 20px;
  }

  .search-section h2 {
    font-size: 24px;
  }

  .subtitle {
    font-size: 16px;
  }

  .quick-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    width: 100%;
  }

  .search-btn,
  .reset-btn {
    width: 100%;
  }

  .result-summary {
    flex-direction: column;
  }

  .cars-grid {
    grid-template-columns: 1fr;
  }
}
</style>
