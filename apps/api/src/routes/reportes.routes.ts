import { Router } from 'express'
import { getDashboard, getReporteProduccion } from '../controllers/reportes.controller'
import { authenticate } from '../middleware/auth.middleware'

export const reportesRoutes = Router()
reportesRoutes.use(authenticate)
reportesRoutes.get('/dashboard', getDashboard)
reportesRoutes.get('/produccion', getReporteProduccion)