import { Router } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Bill from '../models/Bill.js';

const router = Router();

const isValidId = (id) => mongoose.isValidObjectId(id);

const formatBill = (bill) => ({
  id: bill._id,
  userId: bill.userId,
  invoiceNumber: bill.invoiceNumber,
  invoiceDate: bill.invoiceDate,
  clientName: bill.clientName,
  clientEmail: bill.clientEmail || '',
  clientPhone: bill.clientPhone || '',
  clientAddress: bill.clientAddress || '',
  subtotal: bill.subtotal,
  discountRate: bill.discountRate,
  discountAmount: bill.discountAmount,
  taxRate: bill.taxRate,
  taxAmount: bill.taxAmount,
  grandTotal: bill.grandTotal,
  createdAt: bill.createdAt,
  items: bill.items.map((item) => ({
    id: item._id,
    name: item.name,
    qty: item.qty,
    price: item.price,
    lineTotal: item.lineTotal,
  })),
});

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidId(userId)) {
      return res.status(400).json({ error: 'Invalid user ID. Please log out and register again.' });
    }

    const bills = await Bill.find({ userId }).sort({ createdAt: -1 });
    res.json(bills.map(formatBill));
  } catch (error) {
    console.error('Get bills error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      invoiceNumber,
      invoiceDate,
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      items,
      subtotal,
      discountRate,
      discountAmount,
      taxRate,
      taxAmount,
      grandTotal,
    } = req.body;

    if (!isValidId(userId)) {
      return res.status(400).json({ error: 'Invalid user ID. Please log out and register again.' });
    }

    if (!clientName?.trim()) {
      return res.status(400).json({ error: 'Client name is required.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one bill item is required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const bill = await Bill.create({
      userId,
      invoiceNumber,
      invoiceDate,
      clientName: clientName.trim(),
      clientEmail: clientEmail?.trim() || '',
      clientPhone: clientPhone?.trim() || '',
      clientAddress: clientAddress?.trim() || '',
      subtotal,
      discountRate: discountRate ?? 0,
      discountAmount: discountAmount ?? 0,
      taxRate: taxRate ?? 0,
      taxAmount: taxAmount ?? 0,
      grandTotal,
      items: items.map((item) => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
        lineTotal: item.qty * item.price,
      })),
    });

    res.status(201).json(formatBill(bill));
  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.delete('/:userId/:billId', async (req, res) => {
  try {
    const { userId, billId } = req.params;

    if (!isValidId(userId) || !isValidId(billId)) {
      return res.status(400).json({ error: 'Invalid ID. Please log out and register again.' });
    }

    const bill = await Bill.findOneAndDelete({ _id: billId, userId });

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found.' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete bill error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
