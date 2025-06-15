import { notFound, redirect } from 'next/navigation';
import { getSubdomainData } from '@/lib/subdomains';
import { getGolfCourseBySubdomain } from '@/lib/golf-course-mapping';
import { rootDomain } from '@/lib/utils';
import Link from 'next/link';

export default async function SubdomainAdminPage({
  params
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const subdomainData = await getSubdomainData(subdomain);

  if (!subdomainData) {
    notFound();
  }

  // Check if this subdomain has a golf course mapping
  const golfCourseMapping = await getGolfCourseBySubdomain(subdomain);
  
  // If there's a golf course mapping, redirect to the new dashboard
  if (golfCourseMapping) {
    redirect(`/admin/dashboard`);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{subdomainData.emoji}</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {subdomain} Admin
              </h1>
              <p className="text-gray-600">
                Admin panel for {subdomain}.{rootDomain}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Link
              href={`/login`}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Staff Login
            </Link>
            <Link
              href={`/`}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to site
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Site Statistics</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span>{new Date(subdomainData.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subdomain:</span>
                <span className="font-mono">{subdomain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Emoji:</span>
                <span className="text-2xl">{subdomainData.emoji}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                Update Settings
              </button>
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                View Analytics
              </button>
              <button className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors">
                Manage Content
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Features</h2>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 text-sm">✅ Subdomain routing works</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-blue-800 text-sm">ℹ️ Admin page accessible</p>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 text-sm">⚠️ Database connection: Testing</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <div className="bg-gray-50 p-4 rounded font-mono text-sm">
            <div>Subdomain: {subdomain}</div>
            <div>Emoji: {subdomainData.emoji}</div>
            <div>Created: {new Date(subdomainData.createdAt).toISOString()}</div>
            <div>Root Domain: {rootDomain}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
