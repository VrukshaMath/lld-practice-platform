import dotenv from 'dotenv';
import { createApp } from './app.js';
import { connectDatabase } from './infrastructure/database/connection.js';
import { seedProblems } from './seed/seedProblems.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await connectDatabase();
    await seedProblems();

    const { app } = createApp();

    app.listen(PORT, () => {
      console.log(`⚡ LLD Practice Platform API listening on http://localhost:${PORT}`);
      console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();
