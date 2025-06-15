import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: number, name: string, role: string): string {
  return jwt.sign(
    { userId, name, role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string): { userId: number; name: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; name: string; role: string };
    return decoded;
  } catch (error) {
    return null;
  }
} 