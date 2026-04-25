import { Router } from 'express'
import { login, logout, me } from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth.middleware'

export const authRoutes = Router()
authRoutes.post('/login', login)
authRoutes.post('/logout', logout)
authRoutes.get('/me', authenticate, me)