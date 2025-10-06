import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/db';
import VaultItem from '../../../models/VaultItem';
import { authMiddleware } from '../../../lib/authMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectDB();

  const { encryptedData } = req.body;

  if (!encryptedData) {
    return res.status(400).json({ message: 'Encrypted data is required' });
  }

  if (!req.userId) {
    return res.status(401).json({ message: 'User ID not found' });
  }

  try {
    const vaultItem = new VaultItem({
      userId: req.userId,
      encryptedData,
    });
    await vaultItem.save();
    console.log('Vault item created:', vaultItem); // Debug log
    return res.status(201).json({ message: 'Vault item created successfully' });
  } catch (error: any) {
    console.error('Vault creation error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export default authMiddleware(handler);