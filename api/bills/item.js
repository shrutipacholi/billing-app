import mongoose from 'mongoose';
import connectDB from '../_lib/db.js';
import { Bill } from '../_lib/models.js';

const isValidId = (id) => mongoose.isValidObjectId(id);

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { userId, billId } = req.query;

  if (!isValidId(userId) || !isValidId(billId)) {
    return res.status(400).json({ error: 'Invalid ID. Please log out and register again.' });
  }

  try {
    await connectDB();

    const bill = await Bill.findOneAndDelete({ _id: billId, userId });

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found.' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete bill error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}
