import { createRouter, createWebHistory } from 'vue-router'
import { authState } from '../store/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/',
    component: () => import('../layouts/AppShell.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'resumen' } },
      { path: 'resumen', name: 'resumen', component: () => import('../views/ResumenView.vue') },
      { path: 'presupuesto', name: 'presupuesto', component: () => import('../views/PresupuestoView.vue') },
      { path: 'deudas', name: 'deudas', component: () => import('../views/DeudasView.vue') },
      { path: 'metas', name: 'metas', component: () => import('../views/MetasView.vue') },
      { path: 'gastos', name: 'gastos', component: () => import('../views/GastosView.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !authState.isAuthenticated) {
    return { name: 'login' }
  }
  if (to.name === 'login' && authState.isAuthenticated) {
    return { name: 'resumen' }
  }
  return true
})

export default router
