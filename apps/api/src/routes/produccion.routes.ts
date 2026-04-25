import { Router } from 'express'
import { getProduccion, createProduccion, getRegistrosSalud, createRegistroSalud } from '../controllers/produccion.controller'
import { authenticate } from '../middleware/auth.middleware'

export const produccionRoutes = Router()
produccionRoutes.use(authenticate)
produccionRoutes.get('/', getProduccion)
produccionRoutes.post('/', createProduccion)
produccionRoutes.get('/salud', getRegistrosSalud)
produccionRoutes.post('/salud', createRegistroSalud)