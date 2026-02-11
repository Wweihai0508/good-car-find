<template>
  <div class="car-management">
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索品牌、型号..."
        clearable
        style="width: 300px"
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 120px;">
        <el-option label="在售" value="available" />
        <el-option label="已售" value="sold" />
        <el-option label="预订" value="reserved" />
      </el-select>
    </div>

    <el-table :data="cars" style="width: 100%" stripe v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="车辆图片" width="120">
        <template #default="{ row }">
          <img :src="row.images[0] || '/placeholder-car.jpg'" alt="车辆图片" class="car-image" />
        </template>
      </el-table-column>
      <el-table-column prop="brand" label="品牌" width="120" />
      <el-table-column prop="model" label="型号" width="180" />
      <el-table-column prop="year" label="年份" width="100" />
      <el-table-column prop="mileage" label="里程(万km)" width="120" />
      <el-table-column prop="fuelType" label="燃料类型" width="120" />
      <el-table-column prop="transmission" label="变速箱" width="120" />
      <el-table-column prop="price" label="价格(万)" width="120">
        <template #default="{ row }">
          <span class="price">￥{{ row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="isRecommended" label="推荐" width="100">
        <template #default="{ row }">
          <el-tag :type="row.isRecommended ? 'success' : 'info'" size="small">
            {{ row.isRecommended ? '已推荐' : '未推荐' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="isPopular" label="热门" width="100">
        <template #default="{ row }">
          <el-tag :type="row.isPopular ? 'warning' : 'info'" size="small">
            {{ row.isPopular ? '已热门' : '未热门' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="editCar(row.id)">
            编辑
          </el-button>
          <el-button type="success" size="small" @click="toggleRecommendation(row.id)" v-if="!row.isRecommended">
            推荐
          </el-button>
          <el-button type="warning" size="small" @click="toggleRecommendation(row.id)" v-else>
            取消推荐
          </el-button>
          <el-button type="warning" size="small" @click="togglePopular(row.id)" v-if="!row.isPopular">
            热门
          </el-button>
          <el-button type="info" size="small" @click="togglePopular(row.id)" v-else>
            取消热门
          </el-button>
          <el-button type="danger" size="small" @click="deleteCar(row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination" v-if="total > pagination.pageSize">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { carAPI, recommendationAPI, popularAPI } from '../../utils/api'

const router = useRouter()

const cars = ref([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const pagination = ref({
  page: 1,
  pageSize: 20
})
const total = ref(0)

const loadCars = async () => {
  loading.value = true
  try {
    const params = {
      ...pagination.value,
      search: searchQuery.value,
      status: statusFilter.value
    }
    const data = await carAPI.getCars(params)
    cars.value = data.list || data
    total.value = data.total || cars.value.length
  } catch (error) {
    console.error('加载车辆列表失败:', error)
    ElMessage.error('加载车辆列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
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

const editCar = (id) => {
  router.push(`/admin/edit-car/${id}`)
}

const toggleRecommendation = async (carId) => {
  try {
    const car = cars.value.find(c => c.id === carId)
    if (car.isRecommended) {
      const recommendations = await recommendationAPI.getRecommendations()
      const rec = recommendations.find(r => r.carId === carId)
      if (rec) {
        await recommendationAPI.deleteRecommendation(rec.id)
      }
    } else {
      await recommendationAPI.addRecommendation({ carId, priority: 1, status: 'active' })
    }
    ElMessage.success('操作成功')
    loadCars()
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  }
}

const togglePopular = async (carId) => {
  try {
    const car = cars.value.find(c => c.id === carId)
    if (car.isPopular) {
      const popularCars = await popularAPI.getPopularCars()
      const pop = popularCars.find(p => p.carId === carId)
      if (pop) {
        await popularAPI.deletePopularCar(pop.id)
      }
    } else {
      await popularAPI.addPopularCar({ carId, priority: 1, status: 'active' })
    }
    ElMessage.success('操作成功')
    loadCars()
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  }
}

const deleteCar = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这辆车吗？此操作不可恢复。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await carAPI.deleteCar(id)
    ElMessage.success('删除成功')
    loadCars()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const getStatusType = (status) => {
  const types = {
    available: 'success',
    sold: 'info',
    reserved: 'warning'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    available: '在售',
    sold: '已售',
    reserved: '预订'
  }
  return texts[status] || status
}

onMounted(() => {
  loadCars()
})
</script>

<style scoped>
.car-management {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.search-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.car-image {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.price {
  font-weight: bold;
  color: #e74c3c;
  font-size: 16px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
