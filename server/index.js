import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './db.js';
import authRoutes from './routes/auth.js';
import billsRoutes from './routes/bills.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'BillCraft API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/bills', billsRoutes);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`BillCraft API server running on http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
