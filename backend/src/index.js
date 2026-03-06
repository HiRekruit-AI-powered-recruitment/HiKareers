import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './db/index.js';

const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;

connectDB(mongoUri)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
