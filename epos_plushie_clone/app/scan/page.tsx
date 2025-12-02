"use client";

import { useEffect, useRef, useState } from 'react';
import { addSale, getInventoryItems, updateInventoryItem } from '@/utils/db';

interface ScannedItem {
  id: string;
  name: string;
  timestamp: string;
}

export default function ScanPage() {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [scanned, setScanned] = useState<ScannedItem[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Lazily import html5-qrcode because it only works in the browser
    let html5Qrcode: any;
    let qrScanner: any;
    async function initScanner() {
      const lib = await import('html5-qrcode');
      html5Qrcode = lib.Html5Qrcode;
      qrScanner = new html5Qrcode(scannerRef.current?.id || 'qr-reader');
      try {
        await qrScanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: 250 },
          async (decodedText: string) => {
            handleDecode(decodedText);
          },
          () => {
            // ignore errors
          }
        );
        setInitialized(true);
      } catch (err) {
        console.error('Unable to start scanner', err);
      }
    }
    initScanner();
    return () => {
      if (qrScanner) {
        qrScanner.stop().catch(() => {});
      }
    };
  }, []);

  async function handleDecode(decodedText: string) {
    try {
      const data = JSON.parse(decodedText);
      if (!data.id) return;
      // find item details from inventory
      const inventory = await getInventoryItems();
      const item = inventory.find((it) => it.id === data.id);
      if (!item) {
        console.warn('Item not found in inventory');
      } else {
        // ensure there is available stock
        if (!item.quantity || item.quantity <= 0) {
          console.warn('Item out of stock');
          return;
        }
        // record sale in indexedDB
        const sale = {
          itemId: item.id,
          name: item.name,
          price: item.price,
          cost: item.cost,
          timestamp: new Date().toISOString(),
        };
        await addSale(sale);
        // decrement inventory quantity
        await updateInventoryItem(item.id, { quantity: (item.quantity || 0) - 1 });
        // also persist to server-side JSON file via API endpoint
        try {
          await fetch('/api/record-sale', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sale),
          });
        } catch (err) {
          // ignore errors when offline
        }
        setScanned((prev) => [
          { id: item.id, name: item.name, timestamp: sale.timestamp },
          ...prev,
        ]);
        // beep and vibrate using Web Audio API
        try {
          const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
          if (AudioContext) {
            const ctx = new AudioContext();
            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, ctx.currentTime);
            oscillator.connect(gain);
            gain.connect(ctx.destination);
            oscillator.start();
            gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.1);
            oscillator.stop(ctx.currentTime + 0.1);
          }
        } catch (err) {
          // ignore audio errors
        }
        if (navigator.vibrate) {
          navigator.vibrate(150);
        }
      }
    } catch (err) {
      console.error('Failed to parse QR code', err);
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-primary-dark mb-4 text-center">Scan Products</h2>
      <div className="flex flex-col items-center">
        <div
          id="qr-reader"
          ref={scannerRef}
          className="w-64 h-64 border-2 border-primary-dark rounded-md mb-4"
        ></div>
        {!initialized && <p className="text-gray-700">Initializing camera… allow permission if prompted.</p>}
        {initialized && scanned.length === 0 && (
          <p className="text-gray-700">Point your camera at a QR code to record a sale.</p>
        )}
        {scanned.length > 0 && (
          <div className="w-full mt-4">
            <h3 className="text-xl font-semibold text-primary-dark mb-2">Recent Scans</h3>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {scanned.map((item, idx) => (
                <li key={idx} className="p-2 bg-white rounded shadow flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                  <span className="text-sm text-gray-700">ID: {item.id}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}