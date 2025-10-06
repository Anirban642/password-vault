import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../../lib/db';
import VaultItem from '../../../../models/VaultItem';
import { authMiddleware } from '../../../../lib/authMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectDB();

  const { id } = req.query;
  const { encryptedData } = req.body;

  if (!id || !encryptedData) {
    return res.status(400).json({ message: 'ID and encrypted data are required' });
  }

  if (!req.userId) {
    return res.status(401).json({ message: 'User ID not found' });
  }

  try {
    const updatedItem = await VaultItem.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { encryptedData },
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).json({ message: 'Vault item not found' });
    }
    console.log('Updated vault item:', updatedItem); // Debug log
    return res.status(200).json({ message: 'Vault item updated successfully' });
  } catch (error: any) {
    console.error('Vault edit error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export default authMiddleware(handler);