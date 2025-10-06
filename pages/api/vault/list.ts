import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/db';
import VaultItem from '../../../models/VaultItem';
import { authMiddleware } from '../../../lib/authMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectDB();

  if (!req.userId) {
    return res.status(401).json({ message: 'User ID not found' });
  }

  try {
    const vaultItems = await VaultItem.find({ userId: req.userId }).select('_id encryptedData createdAt');
    console.log('Fetched vault items:', vaultItems);
    return res.status(200).json(vaultItems);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Vault fetch error:', error);
    return res.status(500).json({ message: 'Server error', error: errorMessage });
  }
}

export default authMiddleware(handler);