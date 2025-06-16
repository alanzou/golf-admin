import { notFound } from 'next/navigation';
import { getGolfCourseBySubdomain } from '@/lib/golf-course-mapping';
import { TeeTimeSheetView } from './components/tee-time-sheet-view';
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
      title: 'Tee Time Sheet - Golf Course'
    };
  }

  return {
    title: `Tee Time Sheet - ${golfCourseMapping.name}`,
    description: `Manage check-in tee time slots for ${golfCourseMapping.name}`
  };
}

export default async function TeeTimeSheetPage({
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
              Check-in Tee Time Sheet
            </h1>
            <p className="text-gray-500 mt-2">
              View and manage tee time slots and player check-ins
            </p>
          </div>

          <TeeTimeSheetView 
            golfCourseId={golfCourseMapping.id}
            golfCourseName={golfCourseMapping.name}
          />
        </div>
      </div>
    </div>
  );
} 