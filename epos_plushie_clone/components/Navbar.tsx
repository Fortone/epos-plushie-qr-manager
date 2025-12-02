import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="w-full bg-primary-light shadow-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/llama-logo.svg" alt="Fuzzy QR Logo" width={40} height={40} />
          <span className="font-bold text-xl text-primary-dark">Fuzzy QR</span>
        </Link>
        <div className="hidden md:flex space-x-4">
          <Link href="/upload" className="hover:text-primary-dark">Upload</Link>
          <Link href="/qr-codes" className="hover:text-primary-dark">QR Codes</Link>
          <Link href="/scan" className="hover:text-primary-dark">Scan</Link>
          <Link href="/dashboard" className="hover:text-primary-dark">Dashboard</Link>
        </div>
      </div>
    </nav>
  );
}