import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { authRoutes } from './routes/auth.routes'
import { animalesRoutes } from './routes/animales.routes'
import { usuariosRoutes } from './routes/usuarios.routes'
import { produccionRoutes } from './routes/produccion.routes'
import { reportesRoutes } from './routes/reportes.routes'
import { potrerosRoutes } from './routes/potreros.routes'
import { vacunacionesRoutes } from './routes/vacunaciones.routes'
import { reproduccionRoutes } from './routes/reproduccion.routes'
import { tareasRoutes } from './routes/tareas.routes'
import { pesajesRoutes } from './routes/pesajes.routes'
import { errorHandler } from './middleware/error.middleware'

const app = express()
const PORT = process.env.API_PORT || 4000

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/animales', animalesRoutes)
app.use('/api/usuarios', usuariosRoutes)
app.use('/api/produccion', produccionRoutes)
app.use('/api/reportes', reportesRoutes)
app.use('/api/potreros', potrerosRoutes)
app.use('/api/vacunaciones', vacunacionesRoutes)
app.use('/api/reproduccion', reproduccionRoutes)
app.use('/api/tareas', tareasRoutes)
app.use('/api/pesajes', pesajesRoutes)

app.get('/api/health', (_req, res) => res.json({ status: 'ok', version: '2.0' }))
app.use(errorHandler)

// Solo inicia el servidor en local, no en Vercel (serverless)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => console.log(`🐄 Ganasoft API v2.0 corriendo en http://localhost:${PORT}`))
}

export default app
