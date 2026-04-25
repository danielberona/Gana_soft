import { Router } from 'express'
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../controllers/usuarios.controller'
import { authenticate, requireAdmin } from '../middleware/auth.middleware'

export const usuariosRoutes = Router()
usuariosRoutes.use(authenticate, requireAdmin)
usuariosRoutes.get('/', getUsuarios)
usuariosRoutes.post('/', createUsuario)
usuariosRoutes.patch('/:id', updateUsuario)
usuariosRoutes.delete('/:id', deleteUsuario)