import { promises as fs } from 'fs';
import path from 'path';

interface SaleRecord {
  itemId: string;
  name: string;
  price: number;
  cost: number;
  timestamp: string;
}

function computeStats(sales: SaleRecord[]) {
  let totalSold = 0;
  let totalRevenue = 0;
  let totalCost = 0;
  const byProduct: Record<string, { quantity: number; revenue: number; cost: number }> = {};
  sales.forEach((sale) => {
    totalSold += 1;
    totalRevenue += sale.price;
    totalCost += sale.cost;
    const key = sale.name;
    if (!byProduct[key]) {
      byProduct[key] = { quantity: 0, revenue: 0, cost: 0 };
    }
    byProduct[key].quantity += 1;
    byProduct[key].revenue += sale.price;
    byProduct[key].cost += sale.cost;
  });
  const totalProfit = totalRevenue - totalCost;
  return { totalSold, totalRevenue, totalCost, totalProfit, byProduct };
}

export async function GET() {
  const filePath = path.join(process.cwd(), 'data', 'sales.json');
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const sales: SaleRecord[] = JSON.parse(raw);
    const stats = computeStats(sales);
    return Response.json(stats);
  } catch (err) {
    return new Response('Failed to read sales data', { status: 500 });
  }
}