import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/stations'
    },
    {
      path: '/',
      name: 'root',
      component: () => import('views/MainLayout.vue'),
      children: [
        // {
        //   path: '/',
        //   name: 'home',
        //   component: () => import('views/HomeView.vue')
        // },
        {
          path: '/stations',
          name: 'stations',
          component: () => import('views/StationsView.vue')
        },
        {
          path: '/analytics',
          name: 'analytics',
          component: () => import('views/Analytics.vue')
        }
      ]
    }
  ]
})

export default router
