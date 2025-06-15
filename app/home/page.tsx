import Link from 'next/link';
import { rootDomain } from '@/lib/utils';

export default async function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4 relative">
      <div className="absolute top-4 right-4 flex gap-4">
        <Link
          href="/admin/login"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Login
        </Link>
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Admin
        </Link>
      </div>

      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Welcome to {rootDomain}
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Multi-tenant platform for golf course management
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Create Subdomain</h2>
            <p className="text-gray-600 mb-4">
              Create your own subdomain with a custom emoji and start building your presence.
            </p>
            <Link
              href="/create-subdomain"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Create Subdomain
            </Link>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Golf Course Management</h2>
            <p className="text-gray-600 mb-4">
              Manage your golf course operations, staff, and bookings with our comprehensive admin system.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Already have a subdomain? Visit <span className="font-mono">your-name.{rootDomain}</span>
          </p>
        </div>
      </div>
    </div>
  );
} 