import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../../lib/db';
import VaultItem from '../../../../models/VaultItem';
import { authMiddleware } from '../../../../lib/authMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectDB();

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid item ID' });
  }

  try {
    const deletedItem = await VaultItem.findOneAndDelete({
      _id: id,
      userId: req.userId, // Ensure user can only delete their own items
    });

    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    return res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error: unknown) {
    console.error('Delete error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ message: 'Server error', error: errorMessage });
  }
}

export default authMiddleware(handler);