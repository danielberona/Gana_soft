import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(err)
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Datos inválidos', details: err.errors })
    return
  }
  res.status(500).json({ error: 'Error interno del servidor' })
}