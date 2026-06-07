import { Router } from 'express'
import { getTareas, getTareasPendientes, createTarea, updateTarea, deleteTarea } from '../controllers/tareas.controller'
import { authenticate } from '../middleware/auth.middleware'

export const tareasRoutes = Router()
tareasRoutes.use(authenticate)
tareasRoutes.get('/', getTareas)
tareasRoutes.get('/pendientes', getTareasPendientes)
tareasRoutes.post('/', createTarea)
tareasRoutes.patch('/:id', updateTarea)
tareasRoutes.delete('/:id', deleteTarea)
