import mongoose from 'mongoose';
import connectDB from '../_lib/db.js';
import { User, Bill } from '../_lib/models.js';

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

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!isValidId(userId)) {
    return res.status(400).json({ error: 'Invalid user ID. Please log out and register again.' });
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      const bills = await Bill.find({ userId }).sort({ createdAt: -1 });
      return res.json(bills.map(formatBill));
    }

    if (req.method === 'POST') {
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

      return res.status(201).json(formatBill(bill));
    }

    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    console.error('Bills error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
