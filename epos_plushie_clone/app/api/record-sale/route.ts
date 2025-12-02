import { promises as fs } from 'fs';
import path from 'path';

interface SaleRecord {
  itemId: string;
  name: string;
  price: number;
  cost: number;
  timestamp: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sale: SaleRecord = body;
    const filePath = path.join(process.cwd(), 'data', 'sales.json');
    let sales: SaleRecord[] = [];
    try {
      const existing = await fs.readFile(filePath, 'utf8');
      sales = JSON.parse(existing);
    } catch (err) {
      // file may not exist yet
    }
    sales.push(sale);
    await fs.writeFile(filePath, JSON.stringify(sales, null, 2));
    return Response.json({ ok: true });
  } catch (err) {
    return new Response('Invalid body', { status: 400 });
  }
}