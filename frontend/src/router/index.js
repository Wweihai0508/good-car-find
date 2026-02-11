import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/cars',
    name: 'Cars',
    component: () => import('../views/Cars.vue')
  },
  {
    path: '/cars/:id',
    name: 'CarDetail',
    component: () => import('../views/CarDetail.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/admin/AdminIndex.vue'),
    redirect: '/admin/cars',
    children: [
      {
        path: 'cars',
        name: 'AdminCars',
        component: () => import('../views/admin/CarManagement.vue')
      },
      {
        path: 'add-car',
        name: 'AddCar',
        component: () => import('../views/admin/AddCar.vue')
      },
      {
        path: 'edit-car/:id',
        name: 'EditCar',
        component: () => import('../views/admin/EditCar.vue')
      },
      {
        path: 'recommendations',
        name: 'Recommendations',
        component: () => import('../views/admin/RecommendationManagement.vue')
      },
      {
        path: 'popular',
        name: 'Popular',
        component: () => import('../views/admin/PopularManagement.vue')
      },
      {
        path: 'sales',
        name: 'Sales',
        component: () => import('../views/admin/SalesManagement.vue')
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('../views/admin/Statistics.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
