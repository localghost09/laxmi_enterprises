import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const loginAdmin = (req: Request, res: Response) => {
  const { username, password } = req.body;

  const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
  const expectedPassword = process.env.ADMIN_PASSWORD || 'adminpassword';

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // Sign token
  const secret = process.env.JWT_SECRET || 'fallback_secret_key_laxmi_hardware';
  const token = jwt.sign(
    { username: username, role: 'admin' },
    secret,
    { expiresIn: '24h' }
  );

  res.status(200).json({
    message: 'Login successful',
    token,
    user: {
      username,
      role: 'admin',
    },
  });
};
