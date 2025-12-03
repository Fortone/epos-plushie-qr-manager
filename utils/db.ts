import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Inventory items now track quantity in stock. "category" and "cost" are optional fields
// because the live site only requires name, quantity and price. We keep category and cost
// for backwards compatibility but they may not be used in the UI. Quantity is required.
export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  cost?: number;
  // number of units in stock for this item
  quantity: number;
};

interface SaleRecord {
  saleId?: number;
  itemId: string;
  name: string;
  price: number;
  cost: number;
  timestamp: string;
}

interface PlushieDB extends DBSchema {
  inventory: {
    key: string;
    value: InventoryItem;
  };
  sales: {
    key: number;
    value: SaleRecord;
    indexes: { [key: string]: string };
  };
}

const DB_NAME = 'plushie-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<PlushieDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<PlushieDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('inventory')) {
          db.createObjectStore('inventory', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sales')) {
          db.createObjectStore('sales', { keyPath: 'saleId', autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
}

export async function addInventoryItems(items: InventoryItem[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('inventory', 'readwrite');
  for (const item of items) {
    const normalized: InventoryItem = {
      ...item,
      category: item.category ?? 'Uncategorized',
    };
    await tx.store.put(normalized);
  }
  await tx.done;
}

// Update a single inventory item by merging new fields into the existing record
export async function updateInventoryItem(id: string, updated: Partial<InventoryItem>): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('inventory', 'readwrite');
  const current = await tx.store.get(id);
  if (current) {
    const updatedItem: InventoryItem = {
      ...current,
      ...updated,
      category: updated.category ?? current.category ?? 'Uncategorized',
    } as InventoryItem;
    await tx.store.put(updatedItem);
  }
  await tx.done;
}

export async function getInventoryItems(): Promise<InventoryItem[]> {
  const db = await getDb();
  const items = await db.getAll('inventory');
  return items.map((item) => ({
    ...item,
    category: item.category ?? 'Uncategorized',
  }));
}

export async function clearInventory(): Promise<void> {
  const db = await getDb();
  await db.clear('inventory');
}

export async function addSale(record: Omit<SaleRecord, 'saleId'>): Promise<void> {
  const db = await getDb();
  await db.add('sales', record as SaleRecord);
}

export async function getSales(): Promise<SaleRecord[]> {
  const db = await getDb();
  return await db.getAll('sales');
}

export async function clearSales(): Promise<void> {
  const db = await getDb();
  await db.clear('sales');
}

// Compute aggregated stats: total items (in-stock + sold), total sold, total revenue,
// current in-stock count and per-product breakdown. This mirrors the live site's
// dashboard metrics and enables a bar chart of sold vs. in-stock quantities.
export async function computeStats() {
  // Fetch both inventory and sales to compute sold and in-stock quantities
  const sales = await getSales();
  const inventoryItems = await getInventoryItems();
  // total number of sale records (each record represents one item sold)
  const totalSold = sales.length;
  // sum revenue from sales
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.price, 0);
  // total items currently in stock (sum of quantities of all items)
  const totalInStock = inventoryItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
  // original total items is the sum of current in-stock items plus sold count
  const totalItems = totalInStock + totalSold;
  // Build per-product breakdown: sold and in-stock counts and revenue per product
  const byProduct: Record<string, { sold: number; inStock: number; revenue: number }> = {};
  sales.forEach((sale) => {
    const key = sale.name;
    if (!byProduct[key]) {
      byProduct[key] = { sold: 0, inStock: 0, revenue: 0 };
    }
    byProduct[key].sold += 1;
    byProduct[key].revenue += sale.price;
  });
  inventoryItems.forEach((item) => {
    const key = item.name;
    if (!byProduct[key]) {
      byProduct[key] = { sold: 0, inStock: 0, revenue: 0 };
    }
    byProduct[key].inStock += item.quantity;
  });
  return { totalItems, totalSold, totalRevenue, totalInStock, byProduct };
}
