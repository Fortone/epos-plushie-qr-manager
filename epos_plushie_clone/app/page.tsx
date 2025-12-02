import Link from 'next/link';

export default function Home() {
  return (
    <div className="text-center py-10">
      <h1 className="text-5xl font-extrabold text-primary-dark mb-4">Fuzzy QR</h1>
      <p className="text-lg text-gray-700 mb-6">Scan, track, manage</p>
      <div className="flex justify-center space-x-4 mb-10">
        <Link href="/upload" className="bg-primary-dark hover:bg-primary-light text-white px-6 py-3 rounded-lg">Get Started</Link>
        <Link href="/dashboard" className="bg-secondary-dark hover:bg-secondary text-primary-dark px-6 py-3 rounded-lg">View Dashboard</Link>
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg bg-white shadow-md text-left">
          <h3 className="text-xl font-semibold mb-2 text-primary-dark">Upload</h3>
          <p className="text-gray-700">Import inventory from CSV or XLSX files with name, quantity and price.</p>
        </div>
        <div className="p-6 rounded-lg bg-white shadow-md text-left">
          <h3 className="text-xl font-semibold mb-2 text-primary-dark">Print</h3>
          <p className="text-gray-700">Generate and print QR codes for each product in your inventory.</p>
        </div>
        <div className="p-6 rounded-lg bg-white shadow-md text-left">
          <h3 className="text-xl font-semibold mb-2 text-primary-dark">Scan</h3>
          <p className="text-gray-700">Register sales by scanning product QR codes with your camera.</p>
        </div>
        <div className="p-6 rounded-lg bg-white shadow-md text-left">
          <h3 className="text-xl font-semibold mb-2 text-primary-dark">Dashboard</h3>
          <p className="text-gray-700">View analytics such as total items, sales and revenue with a bar chart of sold vs. in-stock quantities.</p>
        </div>
      </div>
    </div>
  );
}