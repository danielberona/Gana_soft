import { Router } from 'express'
import { getEventos, createEvento, updateEvento, deleteEvento } from '../controllers/reproduccion.controller'
import { authenticate } from '../middleware/auth.middleware'

export const reproduccionRoutes = Router()
reproduccionRoutes.use(authenticate)
reproduccionRoutes.get('/', getEventos)
reproduccionRoutes.post('/', createEvento)
reproduccionRoutes.patch('/:id', updateEvento)
reproduccionRoutes.delete('/:id', deleteEvento)
