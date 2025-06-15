import Link from 'next/link';
import { SubdomainForm } from '../subdomain-form';
import { rootDomain } from '@/lib/utils';

export default async function CreateSubdomainPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4 relative">
      <div className="absolute top-4 right-4 flex gap-4">
        <Link
          href="/home"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Home
        </Link>
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

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Create Subdomain
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Create your own subdomain on {rootDomain}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Choose a unique name and emoji for your subdomain
          </p>
        </div>

        <div className="mt-8 bg-white shadow-md rounded-lg p-6">
          <SubdomainForm />
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Your subdomain will be available at: <br />
            <span className="font-mono">your-name.{rootDomain}</span>
          </p>
        </div>
      </div>
    </div>
  );
} 