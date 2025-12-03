"use client";

import { useEffect, useState } from 'react';
import { computeStats, clearSales } from '@/utils/db';
import StatsCard from '@/components/StatsCard';

interface ProductStat {
  sold: number;
  inStock: number;
  revenue: number;
}

export default function DashboardPage() {
  const [totalItems, setTotalItems] = useState(0);
  const [totalSold, setTotalSold] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalInStock, setTotalInStock] = useState(0);
  const [byProduct, setByProduct] = useState<Record<string, ProductStat>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function loadStats() {
    setLoading(true);
    const stats = await computeStats();
    setTotalItems(stats.totalItems);
    setTotalSold(stats.totalSold);
    setTotalRevenue(stats.totalRevenue);
    setTotalInStock(stats.totalInStock);
    setByProduct(stats.byProduct);
    setLoading(false);
  }

  useEffect(() => {
    loadStats();
  }, []);

  async function handleClear() {
    await clearSales();
    // clear server-side sales file
    try {
      await fetch('/api/clear-data', { method: 'POST' });
    } catch (err) {
      // ignore
    }
    setMessage('Sales data cleared.');
    await loadStats();
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-primary-dark mb-6 text-center">Dashboard</h2>
      {loading && <p className="text-center">Loading statistics…</p>}
      {!loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatsCard title="Total Items" value={totalItems} />
            <StatsCard title="Total Sold" value={totalSold} />
            <StatsCard title="Revenue" value={`$${totalRevenue.toFixed(2)}`} />
          </div>
          {/* Bar chart showing sold vs in-stock quantities */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-primary-dark mb-2 text-center">Sold vs. In Stock</h3>
            <div className="flex h-6 w-full overflow-hidden rounded bg-gray-200">
              {totalItems > 0 && (
                <>
                  <div
                    className="bg-primary-dark h-full"
                    style={{ width: `${(totalSold / totalItems) * 100}%` }}
                  ></div>
                  <div
                    className="bg-secondary-dark h-full"
                    style={{ width: `${(totalInStock / totalItems) * 100}%` }}
                  ></div>
                </>
              )}
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span>Sold: {totalSold}</span>
              <span>In Stock: {totalInStock}</span>
            </div>
          </div>
          <div className="mb-4 flex justify-end">
            <button
              className="bg-primary-dark hover:bg-primary-light text-white px-4 py-2 rounded"
              onClick={handleClear}
            >
              Clear Sales Data
            </button>
          </div>
          {message && <p className="text-primary-dark text-center mb-4">{message}</p>}
          {/* Product table showing sold and in-stock counts and revenue per product */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded-lg">
              <thead>
                <tr className="bg-primary-light text-left">
                  <th className="py-2 px-3">Product</th>
                  <th className="py-2 px-3">Sold</th>
                  <th className="py-2 px-3">In Stock</th>
                  <th className="py-2 px-3">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(byProduct).map(([name, stat]) => (
                  <tr key={name} className="border-t">
                    <td className="py-2 px-3 whitespace-nowrap">{name}</td>
                    <td className="py-2 px-3">{stat.sold}</td>
                    <td className="py-2 px-3">{stat.inStock}</td>
                    <td className="py-2 px-3">${stat.revenue.toFixed(2)}</td>
                  </tr>
                ))}
                {Object.keys(byProduct).length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 px-3 text-center text-gray-500">
                      No sales recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}