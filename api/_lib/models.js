import mongoose from 'mongoose';

// --- User Model ---
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// --- Bill Item (embedded subdocument) ---
const billItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
  },
  { _id: true }
);

// --- Bill Model ---
const billSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    invoiceNumber: { type: String, required: true },
    invoiceDate: { type: String, required: true },
    clientName: { type: String, required: true, trim: true },
    clientEmail: { type: String, default: '', trim: true },
    clientPhone: { type: String, default: '', trim: true },
    clientAddress: { type: String, default: '', trim: true },
    subtotal: { type: Number, required: true },
    discountRate: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    items: [billItemSchema],
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Bill = mongoose.models.Bill || mongoose.model('Bill', billSchema);
