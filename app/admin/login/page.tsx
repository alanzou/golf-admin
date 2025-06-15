import LoginPage from '../login';
import type { Metadata } from 'next';
import { rootDomain } from '@/lib/utils';

export const metadata: Metadata = {
  title: `Admin Login | ${rootDomain}`,
  description: `Admin login for ${rootDomain}`
};

export default function AdminLoginPage() {
  return <LoginPage />;
} 