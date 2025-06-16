import { notFound } from 'next/navigation';
import { getGolfCourseBySubdomain } from '@/lib/golf-course-mapping';
import { CheckInReportView } from './components/checkin-report-view';
import { ReportsNavigation } from '@/components/ui/reports-navigation';
import type { Metadata } from 'next';

export async function generateMetadata({
  params
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const golfCourseMapping = await getGolfCourseBySubdomain(subdomain);

  if (!golfCourseMapping) {
    return {
      title: 'Check-in Report - Golf Course'
    };
  }

  return {
    title: `Check-in Report - ${golfCourseMapping.name}`,
    description: `View check-in reports and order details for ${golfCourseMapping.name}`
  };
}

export default async function CheckInReportPage({
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
    <div className="min-h-screen bg-gray-50">
      <ReportsNavigation golfCourseName={golfCourseMapping.name} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Check-in Report
            </h1>
            <p className="text-gray-500 mt-2">
              View and manage check-in orders and transaction history
            </p>
          </div>

          <CheckInReportView 
            golfCourseId={golfCourseMapping.id}
            golfCourseName={golfCourseMapping.name}
          />
        </div>
      </div>
    </div>
  );
} 