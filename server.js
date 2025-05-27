// Load environment variables from .env.local
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Import dependencies
import express from 'express';
import cors from 'cors';

// Import your route handlers
import authRoutes from './src/routes/auth.js';
import importRoutes from './src/routes/import.js';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for frontend access
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Enable JSON parsing for incoming requests
app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/import', importRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log("🔐 TURSO_DB_URL:", process.env.TURSO_DB_URL ? "Loaded" : "❌ Missing");
});
