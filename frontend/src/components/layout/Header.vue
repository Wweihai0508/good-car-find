<template>
  <header class="header">
    <div class="header-content">
      <div class="logo">
        <h1>🚗 锦海车行</h1>
      </div>
      <nav class="nav">
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/cars" class="nav-item">全部车辆</router-link>
        <router-link to="/admin" class="nav-item admin-btn">管理后台</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo h1 {
  margin: 0;
  font-size: 24px;
}

.nav {
  display: flex;
  gap: 30px;
}

.nav-item {
  color: white;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s;
  position: relative;
}

.nav-item:hover {
  color: #ffd700;
}

.nav-item::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: #ffd700;
  transition: width 0.3s;
}

.nav-item:hover::after {
  width: 100%;
}

.admin-btn {
  background: #ffd700;
  color: #333 !important;
  padding: 8px 20px;
  border-radius: 20px;
}

.admin-btn:hover {
  background: #ffed4e;
  transform: translateY(-2px);
}
</style>
