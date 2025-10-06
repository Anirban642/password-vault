import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export function authMiddleware(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void | NextApiResponse>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
      req.userId = decoded.userId;
      await handler(req, res);
    } catch (error: unknown) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}