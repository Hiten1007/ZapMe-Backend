import dotenv from 'dotenv';
import app from './app'; // Import the configured app

dotenv.config(); // Load environment variables

const PORT = process.env.PORT || 3000;

// Start the server
const startServer = async () => {
  try {
    console.log('Connected to the database');  // This will need to be connected to the database before running

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start the server:', err);
    process.exit(1);
  }
};

startServer();