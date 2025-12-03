"use client";

import { useEffect, useState } from 'react';
import { getInventoryItems } from '@/utils/db';
import { QRCode } from 'qrcode.react';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
}

export default function QrSheetPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await getInventoryItems();
      setItems(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Group items by category
  const grouped = items.reduce<Record<string, InventoryItem[]>>((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div>
      <h2 className="text-3xl font-bold text-primary-dark mb-6 text-center">Printable QR Codes</h2>
      {loading && <p className="text-center">Loading inventory…</p>}
      {!loading && items.length === 0 && (
        <p className="text-center text-gray-700">No inventory items found. Please upload your inventory first.</p>
      )}
      {Object.keys(grouped).map((cat) => (
        <div key={cat} className="mb-8 break-inside-avoid">
          <h3 className="text-2xl font-semibold text-primary-dark mb-4 border-b border-primary-light pb-2">
            {cat}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {grouped[cat].map((item) => (
              <div key={item.id} className="p-4 border rounded-lg shadow bg-white flex flex-col items-center">
                <QRCode
                  value={JSON.stringify({ id: item.id, name: item.name })}
                  size={128}
                  className="mb-2"
                />
                <h4 className="font-semibold text-lg text-center">{item.name}</h4>
                <p className="text-sm text-gray-600 text-center">Price: ${item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
      <style jsx>{`
        @media print {
          nav,
          footer,
          .no-print {
            display: none !important;
          }
          main {
            padding: 0;
            margin: 0;
          }
          div.break-inside-avoid {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}