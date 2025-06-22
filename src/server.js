import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import mainRouter from './routers/main_router.js';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

/// Middleware
app.use(express.json());
app.use(cors());

/// Routes
app.use(mainRouter);

// Static files
app.use('/media/v1', express.static(path.join(__dirname, '../assets')));
app.use(express.static(path.join(__dirname, '../public/')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/'));
});



// Database connection
mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log("Database connected!"))
  .catch(e => console.log("Database connection failed:", e));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});