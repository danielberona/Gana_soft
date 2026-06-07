import { Router } from 'express'
import { getVacunaciones, getProximasVacunas, createVacunacion, updateVacunacion, deleteVacunacion } from '../controllers/vacunaciones.controller'
import { authenticate } from '../middleware/auth.middleware'

export const vacunacionesRoutes = Router()
vacunacionesRoutes.use(authenticate)
vacunacionesRoutes.get('/', getVacunaciones)
vacunacionesRoutes.get('/proximas', getProximasVacunas)
vacunacionesRoutes.post('/', createVacunacion)
vacunacionesRoutes.patch('/:id', updateVacunacion)
vacunacionesRoutes.delete('/:id', deleteVacunacion)
