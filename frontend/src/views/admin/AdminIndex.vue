<template>
  <div class="admin-container">
    <div class="admin-sidebar">
      <div class="sidebar-header">
        <h2>管理后台</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        router
      >
        <el-menu-item index="/admin/cars">
          <el-icon><Van /></el-icon>
          <span>车辆管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/recommendations">
          <el-icon><Star /></el-icon>
          <span>推荐管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/popular">
          <el-icon><Trophy /></el-icon>
          <span>热门管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/sales">
          <el-icon><Money /></el-icon>
          <span>销售记录</span>
        </el-menu-item>
        <el-menu-item index="/admin/statistics">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据统计</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="admin-main">
      <div class="main-header">
        <h1>{{ pageTitle }}</h1>
        <div class="header-actions">
          <el-button type="primary" @click="goToAddCar" v-if="activeMenu === '/admin/cars'">
            <el-icon><Plus /></el-icon>
            添加车辆
          </el-button>
        </div>
      </div>
      <div class="main-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => route.path)

const pageTitle = computed(() => {
  const path = route.path
  if (path.startsWith('/admin/add-car')) {
    return '添加车辆'
  } else if (path.startsWith('/admin/edit-car')) {
    return '编辑车辆'
  } else {
    const titles = {
      '/admin/cars': '车辆管理',
      '/admin/recommendations': '推荐管理',
      '/admin/popular': '热门管理',
      '/admin/sales': '销售记录',
      '/admin/statistics': '数据统计'
    }
    return titles[path] || '管理后台'
  }
})

const goToAddCar = () => {
  router.push('/admin/add-car')
}
</script>

<style scoped>
.admin-container {
  display: flex;
  min-height: 100vh;
  background: #f0f2f5;
}

.admin-sidebar {
  width: 240px;
  background: #001529;
  color: white;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 20px;
  background: #002140;
  border-bottom: 1px solid #001529;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 18px;
  text-align: center;
}

.sidebar-menu {
  border-right: none;
  height: calc(100vh - 64px);
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-header {
  background: white;
  padding: 20px 30px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 30px;
}
</style>
