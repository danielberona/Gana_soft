import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phone } = req.body;

    if (!email || !password || !fullName) {
      res.status(400).json({ error: 'Email, contraseña y nombre completo son requeridos' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'El email ya está registrado' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone: phone || null,
      },
    });

    // Assign default role (admin for first user, encargado for rest)
    const userCount = await prisma.user.count();
    const roleName = userCount === 1 ? 'admin' : 'encargado';
    const role = await prisma.role.findUnique({ where: { name: roleName } });

    if (role) {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: role.id },
      });
    }

    // Create default farm for new user
    const farm = await prisma.farm.create({
      data: {
        name: `Finca de ${fullName}`,
        ownerId: user.id,
      },
    });

    // Add user as farm member
    if (role) {
      await prisma.farmMember.create({
        data: { farmId: farm.id, userId: user.id, roleId: role.id },
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        preferredLang: user.preferredLang,
        preferredTheme: user.preferredTheme,
      },
      farmId: farm.id,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Error creando cuenta' });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña son requeridos' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email, isActive: true },
      include: {
        userRoles: { include: { role: true } },
        farms: true,
        farmMembers: { include: { farm: true } },
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const allFarms = [
      ...user.farms,
      ...user.farmMembers.map((fm) => fm.farm),
    ];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        preferredLang: user.preferredLang,
        preferredTheme: user.preferredTheme,
        roles: user.userRoles.map((ur) => ur.role.name),
      },
      farms: allFarms,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Error en el login' });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Sesión cerrada' });
});

// GET /api/auth/me
authRouter.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        userRoles: { include: { role: true } },
        farms: true,
        farmMembers: { include: { farm: true } },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const allFarms = [
      ...user.farms,
      ...user.farmMembers.map((fm) => fm.farm),
    ];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        preferredLang: user.preferredLang,
        preferredTheme: user.preferredTheme,
        roles: user.userRoles.map((ur) => ur.role.name),
      },
      farms: allFarms,
    });
  } catch {
    res.status(500).json({ error: 'Error obteniendo usuario' });
  }
});
