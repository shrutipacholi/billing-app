import mongoose from 'mongoose';

const billItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    qty: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    lineTotal: {
      type: Number,
      required: true,
    },
  },
  {
    _id: true,
  }
);

const billSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
    },
    invoiceDate: {
      type: String,
      required: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientEmail: {
      type: String,
      default: '',
      trim: true,
    },
    clientPhone: {
      type: String,
      default: '',
      trim: true,
    },
    clientAddress: {
      type: String,
      default: '',
      trim: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    discountRate: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    taxRate: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
    items: [billItemSchema],
  },
  {
    timestamps: true,
  }
);

const Bill = mongoose.model('Bill', billSchema);

export default Bill;
