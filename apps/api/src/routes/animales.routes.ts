import { Router } from 'express'
import { getAnimales, getAnimal, createAnimal, updateAnimal, deleteAnimal, getEstadisticas } from '../controllers/animales.controller'
import { authenticate, requireAdmin } from '../middleware/auth.middleware'

export const animalesRoutes = Router()
animalesRoutes.use(authenticate)
animalesRoutes.get('/', getAnimales)
animalesRoutes.get('/estadisticas', getEstadisticas)
animalesRoutes.get('/:id', getAnimal)
animalesRoutes.post('/', createAnimal)
animalesRoutes.patch('/:id', updateAnimal)
animalesRoutes.delete('/:id', requireAdmin, deleteAnimal)