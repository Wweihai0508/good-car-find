<template>
  <div class="popular-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>热门车辆管理</span>
          <el-button type="primary" size="small" @click="openAddDialog">添加热门</el-button>
        </div>
      </template>

      <el-table :data="popularCars" style="width: 100%" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="carId" label="车辆ID" width="120" />
        <el-table-column prop="carBrand" label="品牌" width="150" />
        <el-table-column prop="carModel" label="型号" width="200" />
        <el-table-column prop="priority" label="优先级" width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '激活' : '未激活' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editPopular(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="deletePopular(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination" style="margin-top: 20px;">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page.sync="currentPage"
          @current-change="loadPopularCars"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑热门' : '添加热门'"
      width="50%"
    >
      <el-form ref="popularFormRef" :model="popularForm" label-width="120px">
        <el-form-item label="车辆ID">
          <el-input v-model="popularForm.carId" placeholder="请输入车辆ID" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-input-number
            v-model="popularForm.priority"
            :min="1"
            :max="100"
            :precision="0"
            :step="1"
            placeholder="请输入优先级"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="popularForm.status" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="savePopular">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { popularAPI } from '../../utils/api'

const popularCars = ref([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)
const loading = ref(false)

const dialogVisible = ref(false)
const isEdit = ref(false)
const popularForm = ref({
  carId: '',
  priority: 1,
  status: true,
})

const loadPopularCars = async () => {
  loading.value = true
  try {
    const data = await popularAPI.getPopularCars({
      page: currentPage.value,
      pageSize: pageSize.value,
    })
    popularCars.value = data.list || data
    total.value = data.total || data.length
  } catch (error) {
    console.error('加载热门车辆失败:', error)
    ElMessage.error('加载热门车辆失败')
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  isEdit.value = false
  popularForm.value = {
    carId: '',
    priority: 1,
    status: true,
  }
  dialogVisible.value = true
}

const editPopular = (row) => {
  isEdit.value = true
  popularForm.value = {
    id: row.id,
    carId: row.carId,
    priority: row.priority,
    status: row.status === 'active',
  }
  dialogVisible.value = true
}

const savePopular = async () => {
  try {
    if (isEdit.value) {
      await popularAPI.updatePopularCar(popularForm.value.id, {
        carId: popularForm.value.carId,
        priority: popularForm.value.priority,
        status: popularForm.value.status ? 'active' : 'inactive',
      })
      ElMessage.success('更新热门成功')
    } else {
      await popularAPI.addPopularCar({
        carId: popularForm.value.carId,
        priority: popularForm.value.priority,
        status: popularForm.value.status ? 'active' : 'inactive',
      })
      ElMessage.success('添加热门成功')
    }
    dialogVisible.value = false
    loadPopularCars()
  } catch (error) {
    console.error('保存热门失败:', error)
    ElMessage.error('保存热门失败')
  }
}

const deletePopular = async (row) => {
  try {
    await popularAPI.deletePopularCar(row.id)
    ElMessage.success('删除热门成功')
    loadPopularCars()
  } catch (error) {
    console.error('删除热门失败:', error)
    ElMessage.error('删除热门失败')
  }
}

onMounted(() => {
  loadPopularCars()
})
</script>

<style scoped>
.popular-management {
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

.pagination {
  text-align: right;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
}
</style>
