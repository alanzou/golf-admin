import { getAllSubdomains } from '@/lib/subdomains';
import type { Metadata } from 'next';
import { AdminWrapper } from './admin-wrapper';
import { rootDomain } from '@/lib/utils';

export const metadata: Metadata = {
  title: `Admin Dashboard | ${rootDomain}`,
  description: `Manage subdomains for ${rootDomain}`
};

export default async function AdminPage() {
  const tenants = await getAllSubdomains();

  return <AdminWrapper tenants={tenants} />;
}
