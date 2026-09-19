import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDatabase, disconnectDatabase } from '../infrastructure/database/connection.js';
import { MongoProblemRepository } from '../infrastructure/database/repositories/MongoProblemRepository.js';
import { Problem } from '../domain/entities/Problem.js';
import { INITIAL_PROBLEMS } from './problemData.js';

dotenv.config();

export async function seedProblems(): Promise<void> {
  console.log('Seeding initial problems...');
  await connectDatabase();

  const problemRepo = new MongoProblemRepository();

  for (const item of INITIAL_PROBLEMS) {
    const existing = await problemRepo.findBySlug(item.slug);
    if (existing) {
      console.log(`Problem '${item.title}' (${item.slug}) already exists. Skipping.`);
    } else {
      await problemRepo.create(new Problem(item));
      console.log(`Created problem: '${item.title}' (${item.slug})`);
    }
  }

  console.log('Problem seeding completed successfully.');
}

// Auto-run if executed directly
const isDirectRun = process.argv[1] && process.argv[1].includes('seedProblems');
if (isDirectRun) {
  seedProblems()
    .then(async () => {
      await disconnectDatabase();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Seed failed:', err);
      await disconnectDatabase();
      process.exit(1);
    });
}
