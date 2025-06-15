import { notFound } from 'next/navigation';
import { getGolfCourseBySubdomain } from '@/lib/golf-course-mapping';
import { GolfCourseAdminDashboard } from '../components/golf-course-admin-dashboard';

export default async function SubdomainAdminDashboardPage({
  params
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const golfCourseMapping = await getGolfCourseBySubdomain(subdomain);

  if (!golfCourseMapping) {
    notFound();
  }

  return (
    <GolfCourseAdminDashboard 
      golfCourseId={golfCourseMapping.id}
      golfCourseName={golfCourseMapping.name}
      subdomain={subdomain}
    />
  );
} 