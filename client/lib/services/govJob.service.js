import { connectDB } from '../db/connectDB';

export async function findByTitle(title) {
  await connectDB();
  // placeholder: return empty array
  return [];
}

export async function listBySection(section) {
  await connectDB();
  return [];
}
