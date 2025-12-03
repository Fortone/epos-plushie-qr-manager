"use client";

import { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { addInventoryItems, clearInventory } from '@/utils/db';

export default function UploadPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function parseCSV(file: File) {
    return new Promise<any[]>((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult<any>) => {
          resolve(results.data);
        },
        error: (err) => reject(err),
      });
    });
  }

  async function parseXLSX(file: File) {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      // clear previous inventory so we don't duplicate items
      await clearInventory();
      const ext = file.name.split('.').pop()?.toLowerCase();
      let rows: any[] = [];
      if (ext === 'csv') {
        rows = await parseCSV(file);
      } else if (ext === 'xls' || ext === 'xlsx') {
        rows = await parseXLSX(file);
      } else {
        throw new Error('Unsupported file type');
      }
      // Transform raw rows into inventory items. We support CSV/Excel where
      // columns may be named "name", "quantity", "price" (case-insensitive) or
      // alternative names such as productName, qty, sellingPrice, etc. If no ID is
      // provided, generate one using crypto.randomUUID(). Category and cost are
      // ignored in the new spec.
      const items = rows
        .filter((row) => row)
        .map((row) => {
          // Determine the name column
          const name = String(
            row.name ||
              row.Name ||
              row.productName ||
              row.ProductName ||
              row.description ||
              row.Description ||
              row[Object.keys(row)[0]]
          ).trim();
          // Determine the quantity column
          const quantityVal =
            row.quantity ||
            row.Quantity ||
            row.qty ||
            row.Qty ||
            row['quantityInStock'] ||
            row['QuantityInStock'] ||
            row[Object.keys(row)[1]];
          const quantity = quantityVal ? parseInt(quantityVal) : 1;
          // Determine the price column. Use sellingPrice if present, else price
          const priceVal =
            row.price ||
            row.Price ||
            row.sellingPrice ||
            row.SellingPrice ||
            row.sell ||
            row.Sell ||
            row[Object.keys(row)[2]];
          const price = priceVal ? parseFloat(priceVal) : 0;
          // Generate or use existing ID
          const idRaw =
            row.id ||
            row.ID ||
            row.Id ||
            row.productId ||
            row.ProductId ||
            row[Object.keys(row)[3]];
          let id: string;
          if (idRaw) {
            id = String(idRaw).trim();
          } else if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) {
            id = (crypto as any).randomUUID();
          } else {
            // fallback: use timestamp + random
            id = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
          }
          return {
            id,
            name,
            quantity,
            price,
            // optional fields retained for compatibility
            category: 'Uncategorized',
            cost: undefined,
          };
        });
      await addInventoryItems(items);
      setMessage(`Successfully uploaded ${items.length} items.`);
    } catch (err: any) {
      console.error(err);
      setMessage('Failed to parse file: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-primary-dark mb-4 text-center">Upload Inventory</h2>
      <p className="mb-4 text-center text-gray-700">
        Import products from CSV or Excel. Your file should contain <strong>name</strong>, <strong>quantity</strong> and <strong>price</strong> columns. For multi-sheet Excel files, each sheet with columns like size, description, selling price and quantity will also be supported.
      </p>
      <input
        type="file"
        accept=".csv,.xls,.xlsx"
        onChange={handleFileChange}
        className="block w-full px-3 py-2 border rounded-md border-gray-300 mb-4"
      />
      {loading && <p className="text-center text-gray-600">Processing file…</p>}
      {message && <p className="text-center text-primary-dark font-medium mt-2">{message}</p>}
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>You can create a simple CSV or Excel with the following columns:</p>
        <p className="font-mono bg-gray-100 p-2 rounded inline-block mt-2">name, quantity, price</p>
      </div>
    </div>
  );
}
