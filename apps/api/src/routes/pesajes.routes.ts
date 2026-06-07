import { Router } from 'express'
import { getPesajes, createPesaje, deletePesaje } from '../controllers/pesajes.controller'
import { authenticate } from '../middleware/auth.middleware'

export const pesajesRoutes = Router()
pesajesRoutes.use(authenticate)
pesajesRoutes.get('/', getPesajes)
pesajesRoutes.post('/', createPesaje)
pesajesRoutes.delete('/:id', deletePesaje)
