<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3>关于我们</h3>
        <p>专业二手车销售平台，为您提供优质的二手车服务</p>
      </div>
      <div class="footer-section">
        <h3>联系方式</h3>
        <p>📞 电话/微信：13431562911</p>
        <p>📍 地址：珠海市金湾区美满车城698号</p>
      </div>
      <div class="footer-section">
        <h3>营业时间</h3>
        <p>周一至周日：9:00 - 18:00</p>
        <p>节假日不休</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2024 锦海车行 - 专业二手车销售平台</p>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.footer {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 40px 0 20px;
  margin-top: 40px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
}

.footer-section h3 {
  margin-bottom: 15px;
  color: #3498db;
}

.footer-section p {
  margin: 8px 0;
  line-height: 1.6;
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid #34495e;
}
</style>
