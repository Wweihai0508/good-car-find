import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000
})

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const carAPI = {
  getCars(params) {
    return api.get('/cars', { params })
  },
  getCar(id) {
    return api.get(`/cars/${id}`)
  },
  addCar(data) {
    return api.post('/cars', data)
  },
  updateCar(id, data) {
    return api.put(`/cars/${id}`, data)
  },
  deleteCar(id) {
    return api.delete(`/cars/${id}`)
  },
  uploadImage(formData) {
    return api.post('/cars/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  aiRecognizeImage(imageUrl) {
    return api.post('/cars/ai/recognize', { imageUrl })
  }
}

export const recommendationAPI = {
  getRecommendations(params) {
    return api.get('/recommendations', { params })
  },
  addRecommendation(data) {
    return api.post('/recommendations', data)
  },
  updateRecommendation(id, data) {
    return api.put(`/recommendations/${id}`, data)
  },
  deleteRecommendation(id) {
    return api.delete(`/recommendations/${id}`)
  }
}

export const popularAPI = {
  getPopularCars(params) {
    return api.get('/popular', { params })
  },
  addPopularCar(data) {
    return api.post('/popular', data)
  },
  updatePopularCar(id, data) {
    return api.put(`/popular/${id}`, data)
  },
  deletePopularCar(id) {
    return api.delete(`/popular/${id}`)
  }
}

export const salesAPI = {
  getSales(params) {
    return api.get('/sales', { params })
  },
  addSale(data) {
    return api.post('/sales', data)
  },
  updateSale(id, data) {
    return api.put(`/sales/${id}`, data)
  },
  deleteSale(id) {
    return api.delete(`/sales/${id}`)
  }
}

export const statisticsAPI = {
  getOverview() {
    return api.get('/statistics/overview')
  },
  getSalesTrend() {
    return api.get('/statistics/sales-trend')
  },
  getBrandDistribution() {
    return api.get('/statistics/brand-distribution')
  }
}

export default api
