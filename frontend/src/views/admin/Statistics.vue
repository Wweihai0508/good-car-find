<template>
  <div class="statistics">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>数据统计</span>
          <el-button type="primary" size="small" @click="loadStatistics">刷新</el-button>
        </div>
      </template>

      <div class="stats-grid">
        <el-statistic title="总车辆数" :value="statistics.totalCars" />
        <el-statistic title="在售车辆" :value="statistics.availableCars" />
        <el-statistic title="已售车辆" :value="statistics.soldCars" />
        <el-statistic title="总销售额" :value="statistics.totalRevenue" />
        <el-statistic title="本月销售" :value="statistics.monthlySales" />
        <el-statistic title="客户数" :value="statistics.totalCustomers" />
      </div>
    </el-card>

    <el-card class="box-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>销售趋势</span>
        </div>
      </template>

      <div class="chart">
        <el-chart
          v-if="salesTrend.data && salesTrend.data.length > 0"
          :data="salesTrend.data"
          style="height: 400px;"
        >
          <el-axis-x data-key="month" />
          <el-axis-y />
          <el-area :data-key="['sales', 'revenue']" name="销售趋势" />
        </el-chart>
        <div v-else class="no-data">
          暂无数据
        </div>
      </div>
    </el-card>

    <el-card class="box-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>热门品牌</span>
        </div>
      </template>

      <div class="brand-chart">
        <el-chart
          v-if="topBrands.data && topBrands.data.length > 0"
          :data="topBrands.data"
          style="height: 400px;"
        >
          <el-axis-x data-key="brand" />
          <el-axis-y />
          <el-bar :data-key="['count', 'revenue']" name="品牌" />
        </el-chart>
        <div v-else class="no-data">
          暂无数据
        </div>
      </div>
    </el-card>

    <el-card class="box-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>销售记录</span>
        </div>
      </template>

      <el-table :data="sales" style="width: 100%" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="carId" label="车辆ID" width="120" />
        <el-table-column prop="carBrand" label="品牌" width="150" />
        <el-table-column prop="carModel" label="型号" width="200" />
        <el-table-column prop="price" label="价格" width="120" />
        <el-table-column prop="buyerName" label="买家" width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 'completed' ? 'success' : row.status === 'pending' ? 'warning' : 'info'">
              {{ row.status === 'completed' ? '已完成' : row.status === 'pending' ? '待处理' : '已取消' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
      </el-table>

      <div class="pagination" style="margin-top: 20px;">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page.sync="currentPage"
          @current-change="loadSales"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { statisticsAPI, salesAPI } from '../../utils/api'

const statistics = ref({
  totalCars: 0,
  availableCars: 0,
  soldCars: 0,
  totalRevenue: 0,
  monthlySales: 0,
  totalCustomers: 0,
})

const salesTrend = ref({
  data: [],
})

const topBrands = ref({
  data: [],
})

const sales = ref([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

const loadStatistics = async () => {
  try {
    const data = await statisticsAPI.getStatistics()
    statistics.value = data
    loadSalesTrend()
    loadTopBrands()
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  }
}

const loadSalesTrend = async () => {
  try {
    const data = await statisticsAPI.getSalesTrend({
      period: 'month',
      range: '12',
    })
    salesTrend.value = data
  } catch (error) {
    console.error('加载销售趋势失败:', error)
    ElMessage.error('加载销售趋势失败')
  }
}

const loadTopBrands = async () => {
  try {
    const data = await statisticsAPI.getTopBrands({
      top: 10,
    })
    topBrands.value = data
  } catch (error) {
    console.error('加载热门品牌失败:', error)
    ElMessage.error('加载热门品牌失败')
  }
}

const loadSales = async () => {
  try {
    const data = await salesAPI.getSales({
      page: currentPage.value,
      pageSize: pageSize.value,
    })
    sales.value = data.list || data
    total.value = data.total || data.length
  } catch (error) {
    console.error('加载销售记录失败:', error)
    ElMessage.error('加载销售记录失败')
  }
}

onMounted(() => {
  loadStatistics()
  loadSales()
})
</script>

<style scoped>
.statistics {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.chart {
  margin-top: 20px;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #999;
}

.pagination {
  text-align: right;
}
</style>
