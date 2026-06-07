import { Router } from 'express'
import { getPotreros, getPotrero, createPotrero, updatePotrero, deletePotrero } from '../controllers/potreros.controller'
import { authenticate, requireAdmin } from '../middleware/auth.middleware'

export const potrerosRoutes = Router()
potrerosRoutes.use(authenticate)
potrerosRoutes.get('/', getPotreros)
potrerosRoutes.get('/:id', getPotrero)
potrerosRoutes.post('/', createPotrero)
potrerosRoutes.patch('/:id', updatePotrero)
potrerosRoutes.delete('/:id', requireAdmin, deletePotrero)
