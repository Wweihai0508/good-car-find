<template>
  <div class="car-card" @click="handleClick">
    <div class="car-image">
      <img :src="car.images[0] || '/placeholder-car.jpg'" :alt="car.model">
      <div class="car-badge" v-if="car.isRecommended">推荐</div>
    </div>
    <div class="car-info">
      <div class="car-title">
        <h3>{{ car.brand }} {{ car.model }}</h3>
        <span class="car-year">{{ car.year }}年</span>
      </div>
      <div class="car-meta">
        <span>🚗 {{ car.mileage }}万公里</span>
        <span>⛽ {{ car.fuel_type }}</span>
        <span>⚙️ {{ car.transmission }}</span>
      </div>
      <div class="car-price">
        <span class="price">￥{{ car.price.toLocaleString() }}</span>
        <span class="original-price" v-if="car.original_price">原价 {{ car.original_price.toLocaleString() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  car: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click', props.car)
}
</script>

<style scoped>
.car-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: all 0.3s;
  cursor: pointer;
}

.car-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.car-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.car-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.car-card:hover .car-image img {
  transform: scale(1.05);
}

.car-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.car-info {
  padding: 20px;
}

.car-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.car-title h3 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.car-year {
  background: #ecf0f1;
  color: #7f8c8d;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 14px;
}

.car-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #7f8c8d;
}

.car-price {
  display: flex;
  align-items: center;
  gap: 15px;
}

.price {
  font-size: 24px;
  font-weight: bold;
  color: #e74c3c;
}

.original-price {
  font-size: 14px;
  color: #95a5a6;
  text-decoration: line-through;
}
</style>
