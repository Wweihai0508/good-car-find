<template>
  <div class="sales-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>销售管理</span>
          <el-button type="primary" size="small" @click="openAddDialog">添加销售</el-button>
        </div>
      </template>

      <el-table :data="sales" style="width: 100%" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="carId" label="车辆ID" width="120" />
        <el-table-column prop="carBrand" label="品牌" width="150" />
        <el-table-column prop="carModel" label="型号" width="200" />
        <el-table-column prop="price" label="价格" width="120" />
        <el-table-column prop="buyerName" label="买家" width="120" />
        <el-table-column prop="buyerPhone" label="联系方式" width="150" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 'completed' ? 'success' : row.status === 'pending' ? 'warning' : 'info'">
              {{ row.status === 'completed' ? '已完成' : row.status === 'pending' ? '待处理' : '已取消' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editSales(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="deleteSales(row)">删除</el-button>
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
          @current-change="loadSales"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑销售' : '添加销售'"
      width="50%"
    >
      <el-form ref="salesFormRef" :model="salesForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="车辆ID">
              <el-input v-model="salesForm.carId" placeholder="请输入车辆ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="价格">
              <el input-number
                v-model="salesForm.price"
                :min="0"
                :precision="0"
                :step="1000"
                placeholder="请输入价格"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="买家">
              <el-input v-model="salesForm.buyerName" placeholder="请输入买家姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系方式">
              <el-input v-model="salesForm.buyerPhone" placeholder="请输入联系方式" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="状态">
          <el-select v-model="salesForm.status" placeholder="请选择状态">
            <el-option label="待处理" value="pending" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="salesForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveSales">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { salesAPI } from '../../utils/api'

const sales = ref([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

const dialogVisible = ref(false)
const isEdit = ref(false)
const salesForm = ref({
  carId: '',
  price: 0,
  buyerName: '',
  buyerPhone: '',
  status: 'pending',
  notes: '',
})

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

const openAddDialog = () => {
  isEdit.value = false
  salesForm.value = {
    carId: '',
    price: 0,
    buyerName: '',
    buyerPhone: '',
    status: 'pending',
    notes: '',
  }
  dialogVisible.value = true
}

const editSales = (row) => {
  isEdit.value = true
  salesForm.value = {
    id: row.id,
    carId: row.carId,
    price: row.price,
    buyerName: row.buyerName,
    buyerPhone: row.buyerPhone,
    status: row.status,
    notes: row.notes,
  }
  dialogVisible.value = true
}

const saveSales = async () => {
  try {
    if (isEdit.value) {
      await salesAPI.updateSales(salesForm.value.id, {
        carId: salesForm.value.carId,
        price: salesForm.value.price,
        buyerName: salesForm.value.buyerName,
        buyerPhone: salesForm.value.buyerPhone,
        status: salesForm.value.status,
        notes: salesForm.value.notes,
      })
      ElMessage.success('更新销售记录成功')
    } else {
      await salesAPI.addSales({
        carId: salesForm.value.carId,
        price: salesForm.value.price,
        buyerName: salesForm.value.buyerName,
        buyerPhone: salesForm.value.buyerPhone,
        status: salesForm.value.status,
        notes: salesForm.value.notes,
      })
      ElMessage.success('添加销售记录成功')
    }
    dialogVisible.value = false
    loadSales()
  } catch (error) {
    console.error('保存销售记录失败:', error)
    ElMessage.error('保存销售记录失败')
  }
}

const deleteSales = async (row) => {
  try {
    await salesAPI.deleteSales(row.id)
    ElMessage.success('删除销售记录成功')
    loadSales()
  } catch (error) {
    console.error('删除销售记录失败:', error)
    ElMessage.error('删除销售记录失败')
  }
}

onMounted(() => {
  loadSales()
})
</script>

<style scoped>
.sales-management {
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
