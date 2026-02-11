<template>
  <div class="recommendation-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>推荐车辆管理</span>
          <el-button type="primary" size="small" @click="openAddDialog">添加推荐</el-button>
        </div>
      </template>

      <el-table :data="recommendations" style="width: 100%" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="carId" label="车辆ID" width="120" />
        <el-table-column prop="carBrand" label="品牌" width="150" />
        <el-table-column prop="carModel" label="型号" width="200" />
        <el-table-column prop="priority" label="优先级" width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '激活' : '未激活' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editRecommendation(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="deleteRecommendation(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && recommendations.length === 0" description="暂无推荐车辆" />

      <div class="pagination" style="margin-top: 20px;">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page.sync="currentPage"
          @current-change="loadRecommendations"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑推荐' : '添加推荐'"
      width="50%"
    >
      <el-form ref="recommendationFormRef" :model="recommendationForm" label-width="120px">
        <el-form-item label="车辆ID">
          <el-input v-model="recommendationForm.carId" placeholder="请输入车辆ID" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-input-number
            v-model="recommendationForm.priority"
            :min="1"
            :max="100"
            :precision="0"
            :step="1"
            placeholder="请输入优先级"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="recommendationForm.status" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRecommendation">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { recommendationAPI } from '../../utils/api'

const recommendations = ref([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)
const loading = ref(false)

const dialogVisible = ref(false)
const isEdit = ref(false)
const recommendationForm = ref({
  carId: '',
  priority: 1,
  status: true,
})

const loadRecommendations = async () => {
  loading.value = true
  try {
    const data = await recommendationAPI.getRecommendations({
      page: currentPage.value,
      pageSize: pageSize.value,
    })
    recommendations.value = data.list || data
    total.value = data.total || data.length
  } catch (error) {
    console.error('加载推荐车辆失败:', error)
    ElMessage.error('加载推荐车辆失败')
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  isEdit.value = false
  recommendationForm.value = {
    carId: '',
    priority: 1,
    status: true,
  }
  dialogVisible.value = true
}

const editRecommendation = (row) => {
  isEdit.value = true
  recommendationForm.value = {
    id: row.id,
    carId: row.carId,
    priority: row.priority,
    status: row.status === 'active',
  }
  dialogVisible.value = true
}

const saveRecommendation = async () => {
  try {
    if (isEdit.value) {
      await recommendationAPI.updateRecommendation(recommendationForm.value.id, {
        carId: recommendationForm.value.carId,
        priority: recommendationForm.value.priority,
        status: recommendationForm.value.status ? 'active' : 'inactive',
      })
      ElMessage.success('更新推荐成功')
    } else {
      await recommendationAPI.addRecommendation({
        carId: recommendationForm.value.carId,
        priority: recommendationForm.value.priority,
        status: recommendationForm.value.status ? 'active' : 'inactive',
      })
      ElMessage.success('添加推荐成功')
    }
    dialogVisible.value = false
    loadRecommendations()
  } catch (error) {
    console.error('保存推荐失败:', error)
    ElMessage.error('保存推荐失败')
  }
}

const deleteRecommendation = async (row) => {
  try {
    await recommendationAPI.deleteRecommendation(row.id)
    ElMessage.success('删除推荐成功')
    loadRecommendations()
  } catch (error) {
    console.error('删除推荐失败:', error)
    ElMessage.error('删除推荐失败')
  }
}

onMounted(() => {
  loadRecommendations()
})
</script>

<style scoped>
.recommendation-management {
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
</style>
