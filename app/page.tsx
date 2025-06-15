import { redirect } from 'next/navigation';

export default async function HomePage() {
  // Redirect to admin login by default
  redirect('/admin/login');
}
