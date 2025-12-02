import { promises as fs } from 'fs';
import path from 'path';

export async function POST() {
  const filePath = path.join(process.cwd(), 'data', 'sales.json');
  try {
    await fs.writeFile(filePath, JSON.stringify([], null, 2));
    return Response.json({ ok: true });
  } catch (err) {
    return new Response('Failed to clear data', { status: 500 });
  }
}